"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";

async function assertAdmin() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Login required.");
  }

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    throw new Error("Admin access required.");
  }

  return supabase;
}

function centsFromDollars(value: FormDataEntryValue | null) {
  const numberValue = Number.parseFloat(String(value ?? "0"));
  return Math.round((Number.isFinite(numberValue) ? numberValue : 0) * 100);
}

async function uploadProductImage(
  supabase: Awaited<ReturnType<typeof assertAdmin>>,
  formData: FormData,
  existingUrl: string
) {
  const file = formData.get("image_file");

  if (!(file instanceof File) || file.size === 0) {
    return existingUrl;
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const path = `products/${globalThis.crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function upsertProductAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = String(formData.get("product_id") ?? "");
  const existingImageUrl = String(formData.get("existing_image_url") ?? "");
  const requestedImageUrl = String(formData.get("image_url") ?? "");
  const imageFile = formData.get("image_file");
  const imageUrl =
    imageFile instanceof File && imageFile.size > 0
      ? await uploadProductImage(supabase, formData, existingImageUrl)
      : requestedImageUrl || existingImageUrl;

  const payload = {
    category_id: String(formData.get("category_id") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    description: String(formData.get("description") ?? ""),
    image_url: imageUrl,
    image_alt: String(formData.get("image_alt") ?? ""),
    active: formData.get("active") === "on",
    inventory_behavior: String(
      formData.get("inventory_behavior") ?? "in_stock"
    ),
    shipping_notes: String(formData.get("shipping_notes") ?? "")
  };

  if (productId) {
    await supabase.from("products").update(payload).eq("id", productId);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/products/${payload.slug}`);
    redirect(`/admin/products/${productId}`);
  }

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}`);
}

export async function upsertVariantAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = String(formData.get("product_id") ?? "");
  const variantId = String(formData.get("variant_id") ?? "");

  const payload = {
    product_id: productId,
    name: String(formData.get("name") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    price_cents: centsFromDollars(formData.get("price")),
    cost_cents: centsFromDollars(formData.get("cost")),
    stock_quantity: Number(formData.get("stock_quantity") ?? 0),
    backorder_allowed: formData.get("backorder_allowed") === "on",
    weight_oz: Number(formData.get("weight_oz") ?? 0),
    dimensions_in: String(formData.get("dimensions_in") ?? ""),
    active: formData.get("active") === "on"
  };

  if (variantId) {
    await supabase.from("product_variants").update(payload).eq("id", variantId);
  } else {
    await supabase.from("product_variants").insert(payload);
  }

  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}

export async function createFitmentAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = String(formData.get("product_id") ?? "");

  await supabase.from("vehicle_fitment").insert({
    product_id: productId,
    year: Number(formData.get("year") ?? 0),
    make: String(formData.get("make") ?? ""),
    model: String(formData.get("model") ?? ""),
    engine: String(formData.get("engine") ?? ""),
    trim: String(formData.get("trim") ?? ""),
    notes: String(formData.get("notes") ?? "")
  });

  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}

export async function adjustInventoryAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = String(formData.get("product_id") ?? "");

  await supabase.rpc("adjust_inventory", {
    variant_id_input: String(formData.get("variant_id") ?? ""),
    quantity_delta_input: Number(formData.get("quantity_delta") ?? 0),
    reason_input: String(formData.get("reason") ?? "admin_adjustment")
  });

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/products/${productId}`);
  redirect(productId ? `/admin/products/${productId}` : "/admin/inventory");
}
