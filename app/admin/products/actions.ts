"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminEmails } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase";

const defaultProductImageUrl = "/product-oil-filter.svg";

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

  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return supabase;
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

function textValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function integerValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? Math.trunc(numberValue) : 0;
}

function numberValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function errorPath(path: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : "The admin action could not be saved.";

  return `${path}?error=${encodeURIComponent(message)}`;
}

function revalidateProductAdminPaths(productId?: string, slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/products");

  if (productId) {
    revalidatePath(`/admin/products/${productId}`);
  }

  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

async function uploadProductImage(
  supabase: Awaited<ReturnType<typeof assertAdmin>>,
  file: File
) {
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

function getImageFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((file): file is File => file instanceof File && file.size > 0);
}

async function addProductGalleryImages(
  supabase: Awaited<ReturnType<typeof assertAdmin>>,
  productId: string,
  files: File[],
  altText: string
) {
  if (!files.length) {
    return;
  }

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  const startPosition = count ?? 0;
  const uploadedImages = await Promise.all(
    files.map(async (file, index) => ({
      product_id: productId,
      image_url: await uploadProductImage(supabase, file),
      image_alt: altText,
      position: startPosition + index
    }))
  );
  const { error } = await supabase.from("product_images").insert(uploadedImages);

  if (error) {
    throw error;
  }
}

async function deleteProductGalleryImages(
  supabase: Awaited<ReturnType<typeof assertAdmin>>,
  productId: string,
  imageIds: string[]
) {
  if (!imageIds.length) {
    return;
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId)
    .in("id", imageIds);

  if (error) {
    throw error;
  }
}

async function getProductSlug(
  supabase: Awaited<ReturnType<typeof assertAdmin>>,
  productId: string
) {
  if (!productId) {
    return undefined;
  }

  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  return data?.slug;
}

export async function upsertProductAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = textValue(formData, "product_id");
  const existingImageUrl = textValue(formData, "existing_image_url");
  const requestedImageUrl = textValue(formData, "image_url");
  const imageFile = formData.get("image_file");
  const galleryFiles = getImageFiles(formData, "image_files");
  const removePrimaryImage = formData.get("remove_primary_image") === "on";
  const galleryImageIdsToRemove = textValues(formData, "remove_gallery_image_ids");
  let imageUrl =
    requestedImageUrl || existingImageUrl || defaultProductImageUrl;

  if (removePrimaryImage) {
    imageUrl =
      requestedImageUrl && requestedImageUrl !== existingImageUrl
        ? requestedImageUrl
        : defaultProductImageUrl;
  }

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await uploadProductImage(supabase, imageFile);
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
    slug: normalizeSlug(textValue(formData, "slug")),
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
    const existingSlug = await getProductSlug(supabase, productId);
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId);

    if (error) {
      redirect(errorPath(`/admin/products/${productId}`, error));
    }

    try {
      await deleteProductGalleryImages(
        supabase,
        productId,
        galleryImageIdsToRemove
      );
      await addProductGalleryImages(
        supabase,
        productId,
        galleryFiles,
        payload.image_alt
      );
    } catch (error) {
      redirect(errorPath(`/admin/products/${productId}`, error));
    }

    revalidateProductAdminPaths(productId, payload.slug);
    if (existingSlug && existingSlug !== payload.slug) {
      revalidatePath(`/products/${existingSlug}`);
    }
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

  try {
    await addProductGalleryImages(
      supabase,
      data.id,
      galleryFiles,
      payload.image_alt
    );
  } catch (galleryError) {
    redirect(errorPath(`/admin/products/${data.id}`, galleryError));
  }

  revalidateProductAdminPaths(data.id, payload.slug);
  redirect(`/admin/products/${data.id}`);
}

export async function deleteProductAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = textValue(formData, "product_id");
  const confirmation = textValue(formData, "delete_confirmation");

  if (confirmation !== "DELETE") {
    redirect(
      errorPath(
        `/admin/products/${productId}`,
        new Error("Type DELETE to confirm product deletion.")
      )
    );
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    redirect(errorPath(`/admin/products/${productId}`, productError));
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    redirect(errorPath(`/admin/products/${productId}`, error));
  }

  revalidateProductAdminPaths(productId, product?.slug);

  if (product?.slug) {
    revalidatePath(`/products/${product.slug}`);
  }

  redirect("/admin/products");
}

export async function upsertVariantAction(formData: FormData) {
  const supabase = await assertAdmin();
  const productId = textValue(formData, "product_id");
  const variantId = textValue(formData, "variant_id");
  const productSlug = await getProductSlug(supabase, productId);

  const payload = {
    product_id: productId,
    name: textValue(formData, "name"),
    sku: textValue(formData, "sku"),
    price_cents: centsFromDollars(formData.get("price")),
    cost_cents: centsFromDollars(formData.get("cost")),
    stock_quantity: integerValue(formData, "stock_quantity"),
    backorder_allowed: formData.get("backorder_allowed") === "on",
    weight_oz: numberValue(formData, "weight_oz"),
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

  revalidateProductAdminPaths(productId, productSlug);
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
  const productSlug = await getProductSlug(supabase, productId);

  const { error } = await supabase.rpc("adjust_inventory", {
    variant_id_input: textValue(formData, "variant_id"),
    quantity_delta_input: integerValue(formData, "quantity_delta"),
    reason_input: textValue(formData, "reason") || "admin_adjustment"
  });

  if (error) {
    redirect(errorPath(productId ? `/admin/products/${productId}` : "/admin/inventory", error));
  }

  revalidateProductAdminPaths(productId, productSlug);
  redirect(productId ? `/admin/products/${productId}` : "/admin/inventory");
}
