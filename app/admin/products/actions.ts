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

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function errorPath(path: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : "The admin action could not be saved.";

  return `${path}?error=${encodeURIComponent(message)}`;
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
  const productId = textValue(formData, "product_id");
  const existingImageUrl = textValue(formData, "existing_image_url");
  const requestedImageUrl = textValue(formData, "image_url");
  const imageFile = formData.get("image_file");
  let imageUrl = requestedImageUrl || existingImageUrl || "/product-oil-filter.svg";

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await uploadProductImage(supabase, formData, existingImageUrl);
    } catch (error) {
      redirect(
        errorPath(
          productId ? `/admin/products/${productId}` : "/admin/products/new",
          error
        )
      );
    }
  }

  const payload = {
    category_id: textValue(formData, "category_id"),
    sku: textValue(formData, "sku"),
    name: textValue(formData, "name"),
    slug: textValue(formData, "slug"),
    brand: textValue(formData, "brand"),
    short_description: textValue(formData, "short_description"),
    description: textValue(formData, "description"),
    image_url: imageUrl,
    image_alt: textValue(formData, "image_alt") || textValue(formData, "name"),
    active: formData.get("active") === "on",
    inventory_behavior: String(
      formData.get("inventory_behavior") ?? "in_stock"
    ),
    shipping_notes: textValue(formData, "shipping_notes")
  };

  if (productId) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId);

    if (error) {
      redirect(errorPath(`/admin/products/${productId}`, error));
    }

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
    redirect(errorPath("/admin/products/new", error));
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}`);
}

export async function upsertVariantAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = textValue(formData, "product_id");
  const variantId = textValue(formData, "variant_id");

  const payload = {
    product_id: productId,
    name: textValue(formData, "name"),
    sku: textValue(formData, "sku"),
    price_cents: centsFromDollars(formData.get("price")),
    cost_cents: centsFromDollars(formData.get("cost")),
    stock_quantity: Number(formData.get("stock_quantity") ?? 0),
    backorder_allowed: formData.get("backorder_allowed") === "on",
    weight_oz: Number(formData.get("weight_oz") ?? 0),
    dimensions_in: textValue(formData, "dimensions_in"),
    active: formData.get("active") === "on"
  };

  const result = variantId
    ? await supabase.from("product_variants").update(payload).eq("id", variantId)
    : await supabase.from("product_variants").insert(payload);

  if (result.error) {
    redirect(errorPath(`/admin/products/${productId}`, result.error));
  }

  if (variantId) {
    revalidatePath("/products");
  }

  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}

export async function createFitmentAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = textValue(formData, "product_id");

  const { error } = await supabase.from("vehicle_fitment").insert({
    product_id: productId,
    year: Number(formData.get("year") ?? 0),
    make: textValue(formData, "make"),
    model: textValue(formData, "model"),
    engine: textValue(formData, "engine"),
    trim: textValue(formData, "trim"),
    notes: textValue(formData, "notes")
  });

  if (error) {
    redirect(errorPath(`/admin/products/${productId}`, error));
  }

  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}

export async function adjustInventoryAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = textValue(formData, "product_id");

  const { error } = await supabase.rpc("adjust_inventory", {
    variant_id_input: textValue(formData, "variant_id"),
    quantity_delta_input: Number(formData.get("quantity_delta") ?? 0),
    reason_input: textValue(formData, "reason") || "admin_adjustment"
  });

  if (error) {
    redirect(errorPath(productId ? `/admin/products/${productId}` : "/admin/inventory", error));
  }

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/products/${productId}`);
  redirect(productId ? `/admin/products/${productId}` : "/admin/inventory");
}
