import type { CatalogObject } from "square";
import { siteUrl, squareLocationId } from "@/lib/env";
import { getSquare } from "@/lib/square";
import { createServiceSupabaseClient } from "@/lib/supabase";

type SquareCatalogProductRow = {
  product_id: string;
  catalog_item_id: string;
  catalog_image_id: string | null;
  image_source_url: string | null;
};

type SquareCatalogVariantRow = {
  variant_id: string;
  catalog_variation_id: string;
};

type ProductSyncRow = {
  id: string;
  name: string;
  sku: string;
  short_description: string;
  description: string;
  image_url: string | null;
  image_alt: string | null;
  active: boolean;
  product_variants: Array<{
    id: string;
    name: string;
    sku: string;
    price_cents: number;
    active: boolean;
  }>;
};

export type SquareCatalogSyncResult = {
  productId: string;
  catalogItemId: string;
  variationCount: number;
  imageSynced: boolean;
  warning?: string;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Square Catalog synchronization failed.";
}

function isMissingMappingTable(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "42P01"
  );
}

function isSquareNotFound(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 404
  );
}

function absoluteImageUrl(value: string | null) {
  if (!value) {
    return null;
  }

  return value.startsWith("http") ? value : `${siteUrl}${value}`;
}

function imageFilename(url: string, contentType: string) {
  const pathname = new URL(url).pathname;
  const currentName = pathname.split("/").filter(Boolean).pop();
  const extension =
    contentType === "image/jpeg"
      ? "jpg"
      : contentType === "image/png"
        ? "png"
        : "gif";

  if (currentName && /\.(jpe?g|png|gif)$/i.test(currentName)) {
    return currentName;
  }

  return `product-image.${extension}`;
}

async function getImageFile(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Product image returned HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
  const allowedTypes = new Set(["image/jpeg", "image/pjpeg", "image/png", "image/gif"]);

  if (!allowedTypes.has(contentType)) {
    throw new Error(
      `Square supports JPEG, PNG, and GIF catalog images; received ${contentType || "an unknown format"}.`
    );
  }

  const bytes = await response.arrayBuffer();

  if (bytes.byteLength > 15 * 1024 * 1024) {
    throw new Error("Square catalog images must be 15 MB or smaller.");
  }

  return new File([bytes], imageFilename(url, contentType), { type: contentType });
}

async function getExistingCatalogItem(catalogItemId: string | undefined) {
  if (!catalogItemId) {
    return null;
  }

  try {
    const response = await getSquare().catalog.object.get({
      objectId: catalogItemId,
      includeRelatedObjects: true
    });
    return response.object?.type === "ITEM" ? response.object : null;
  } catch (error) {
    if (isSquareNotFound(error)) {
      return null;
    }

    throw error;
  }
}

function buildCatalogItem(
  product: ProductSyncRow,
  existingItem: CatalogObject.Item | null,
  variantMappings: SquareCatalogVariantRow[]
): CatalogObject.Item {
  const itemId = existingItem?.id ?? `#product-${product.id}`;
  const mappingsByVariantId = new Map(
    variantMappings.map((mapping) => [mapping.variant_id, mapping.catalog_variation_id])
  );
  const existingVariations =
    existingItem?.itemData?.variations?.filter(
      (variation): variation is CatalogObject.ItemVariation =>
        variation.type === "ITEM_VARIATION"
    ) ?? [];
  const existingById = new Map(
    existingVariations.map((variation) => [variation.id, variation])
  );
  const existingBySku = new Map(
    existingVariations
      .filter((variation) => variation.itemVariationData?.sku)
      .map((variation) => [variation.itemVariationData?.sku ?? "", variation])
  );
  const activeVariants = product.product_variants.filter((variant) => variant.active);

  return {
    ...(existingItem ?? {}),
    type: "ITEM",
    id: itemId,
    presentAtAllLocations: false,
    presentAtLocationIds: [squareLocationId],
    itemData: {
      ...(existingItem?.itemData ?? {}),
      name: product.name,
      buyerFacingName: product.name,
      description: product.description || product.short_description,
      productType: "REGULAR",
      isTaxable: false,
      variations: activeVariants.map((variant) => {
        const mappedId = mappingsByVariantId.get(variant.id);
        const existingVariation =
          (mappedId ? existingById.get(mappedId) : undefined) ??
          existingBySku.get(variant.sku);
        const variationId =
          existingVariation?.id ?? `#variant-${variant.id}`;

        return {
          ...(existingVariation ?? {}),
          type: "ITEM_VARIATION" as const,
          id: variationId,
          presentAtAllLocations: false,
          presentAtLocationIds: [squareLocationId],
          itemVariationData: {
            ...(existingVariation?.itemVariationData ?? {}),
            itemId,
            name: variant.name,
            sku: variant.sku,
            pricingType: "FIXED_PRICING",
            priceMoney: {
              amount: BigInt(variant.price_cents),
              currency: "USD"
            },
            trackInventory: false
          }
        };
      })
    }
  };
}

async function uploadPrimaryImage(input: {
  catalogItemId: string;
  imageUrl: string;
  imageAlt: string;
  productName: string;
}) {
  const imageFile = await getImageFile(input.imageUrl);
  const response = await getSquare().catalog.images.create({
    request: {
      idempotencyKey: globalThis.crypto.randomUUID(),
      objectId: input.catalogItemId,
      isPrimary: true,
      image: {
        type: "IMAGE",
        id: `#image-${globalThis.crypto.randomUUID()}`,
        imageData: {
          name: `${input.productName} primary image`,
          caption: input.imageAlt
        }
      }
    },
    imageFile
  });

  if (!response.image?.id) {
    throw new Error("Square did not return a catalog image ID.");
  }

  return response.image.id;
}

export async function getSquareCatalogVariationIds(variantIds: string[]) {
  const ids = Array.from(new Set(variantIds.filter(Boolean)));

  if (!ids.length) {
    return new Map<string, string>();
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("square_catalog_variants")
    .select("variant_id,catalog_variation_id")
    .in("variant_id", ids);

  if (isMissingMappingTable(error)) {
    return new Map<string, string>();
  }

  if (error) {
    throw error;
  }

  return new Map(
    ((data ?? []) as SquareCatalogVariantRow[]).map((mapping) => [
      mapping.variant_id,
      mapping.catalog_variation_id
    ])
  );
}

export async function syncSquareProduct(
  productId: string
): Promise<SquareCatalogSyncResult> {
  const supabase = createServiceSupabaseClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      "id,name,sku,short_description,description,image_url,image_alt,active,product_variants(id,name,sku,price_cents,active)"
    )
    .eq("id", productId)
    .single();

  if (productError) {
    throw productError;
  }

  const typedProduct = product as unknown as ProductSyncRow;
  const activeVariants = typedProduct.product_variants.filter(
    (variant) => variant.active
  );

  if (!activeVariants.length) {
    throw new Error("Add at least one active variant before syncing to Square.");
  }

  const [productMappingResult, variantMappingsResult] = await Promise.all([
    supabase
      .from("square_catalog_products")
      .select("product_id,catalog_item_id,catalog_image_id,image_source_url")
      .eq("product_id", productId)
      .maybeSingle(),
    supabase
      .from("square_catalog_variants")
      .select("variant_id,catalog_variation_id")
      .eq("product_id", productId)
  ]);

  if (
    isMissingMappingTable(productMappingResult.error) ||
    isMissingMappingTable(variantMappingsResult.error)
  ) {
    throw new Error("Run the Square Catalog mapping migration in Supabase first.");
  }

  if (productMappingResult.error) {
    throw productMappingResult.error;
  }

  if (variantMappingsResult.error) {
    throw variantMappingsResult.error;
  }

  const productMapping =
    productMappingResult.data as SquareCatalogProductRow | null;
  const variantMappings =
    (variantMappingsResult.data ?? []) as SquareCatalogVariantRow[];
  const existingItem = await getExistingCatalogItem(
    productMapping?.catalog_item_id
  );
  const catalogItem = buildCatalogItem(
    typedProduct,
    existingItem,
    variantMappings
  );
  const response = await getSquare().catalog.object.upsert({
    idempotencyKey: globalThis.crypto.randomUUID(),
    object: catalogItem
  });
  const savedItem = response.catalogObject;

  if (savedItem?.type !== "ITEM" || !savedItem.id) {
    throw new Error("Square did not return the synchronized catalog item.");
  }

  const savedVariations =
    savedItem.itemData?.variations?.filter(
      (variation): variation is CatalogObject.ItemVariation =>
        variation.type === "ITEM_VARIATION"
    ) ?? [];
  const savedBySku = new Map(
    savedVariations.map((variation) => [
      variation.itemVariationData?.sku ?? "",
      variation.id
    ])
  );
  const now = new Date().toISOString();
  const variationRows = activeVariants.map((variant) => {
    const catalogVariationId = savedBySku.get(variant.sku);

    if (!catalogVariationId) {
      throw new Error(`Square did not return catalog mapping for SKU ${variant.sku}.`);
    }

    return {
      variant_id: variant.id,
      product_id: productId,
      catalog_variation_id: catalogVariationId,
      synced_at: now
    };
  });

  const { error: productMappingError } = await supabase
    .from("square_catalog_products")
    .upsert(
      {
        product_id: productId,
        catalog_item_id: savedItem.id,
        catalog_image_id: productMapping?.catalog_image_id ?? null,
        image_source_url: productMapping?.image_source_url ?? null,
        sync_error: null,
        synced_at: now
      },
      { onConflict: "product_id" }
    );

  if (productMappingError) {
    throw productMappingError;
  }

  const { error: clearMappingsError } = await supabase
    .from("square_catalog_variants")
    .delete()
    .eq("product_id", productId);

  if (clearMappingsError) {
    throw clearMappingsError;
  }

  const { error: variationMappingError } = await supabase
    .from("square_catalog_variants")
    .insert(variationRows);

  if (variationMappingError) {
    throw variationMappingError;
  }

  const imageUrl = absoluteImageUrl(typedProduct.image_url);
  let imageSynced = Boolean(productMapping?.catalog_image_id);
  let warning: string | undefined;

  if (imageUrl && imageUrl !== productMapping?.image_source_url) {
    try {
      const catalogImageId = await uploadPrimaryImage({
        catalogItemId: savedItem.id,
        imageUrl,
        imageAlt: typedProduct.image_alt || typedProduct.name,
        productName: typedProduct.name
      });
      const { error: imageMappingError } = await supabase
        .from("square_catalog_products")
        .update({
          catalog_image_id: catalogImageId,
          image_source_url: imageUrl,
          sync_error: null,
          synced_at: now
        })
        .eq("product_id", productId);

      if (imageMappingError) {
        throw imageMappingError;
      }

      imageSynced = true;
    } catch (error) {
      warning = `Catalog item synced, but its image did not: ${errorMessage(error)}`;
      await supabase
        .from("square_catalog_products")
        .update({ sync_error: warning, synced_at: now })
        .eq("product_id", productId);
    }
  }

  return {
    productId,
    catalogItemId: savedItem.id,
    variationCount: variationRows.length,
    imageSynced,
    warning
  };
}

export async function syncSquareProductSafely(productId: string) {
  try {
    return await syncSquareProduct(productId);
  } catch (error) {
    console.error("Square Catalog product sync failed", {
      productId,
      error
    });
    return null;
  }
}
