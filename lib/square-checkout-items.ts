export type SquareCheckoutItemInput = {
  productId: string;
  productName: string;
  shortDescription: string;
  variantId: string;
  variantName: string;
  sku: string;
  priceCents: number;
  quantity: number;
};

export function buildSquareCheckoutLineItem(
  item: SquareCheckoutItemInput,
  catalogVariationId?: string
) {
  const shared = {
    quantity: String(item.quantity),
    basePriceMoney: {
      amount: BigInt(item.priceCents),
      currency: "USD" as const
    },
    note: item.shortDescription,
    metadata: {
      product_id: item.productId,
      variant_id: item.variantId,
      sku: item.sku,
      product_name: item.productName,
      variant_name: item.variantName
    }
  };

  if (catalogVariationId) {
    return {
      ...shared,
      catalogObjectId: catalogVariationId
    };
  }

  return {
    ...shared,
    name: item.productName,
    variationName: item.variantName
  };
}
