import assert from "node:assert/strict";
import test from "node:test";
import { buildSquareCheckoutLineItem } from "../lib/square-checkout-items.ts";

const checkoutItem = {
  productId: "product-id",
  productName: "Diesel Fuel Filter",
  shortDescription: "High-efficiency replacement filter",
  variantId: "variant-id",
  variantName: "Standard",
  sku: "FILTER-100",
  priceCents: 2499,
  quantity: 2
};

test("uses the Square variation ID for catalog-backed checkout", () => {
  const lineItem = buildSquareCheckoutLineItem(
    checkoutItem,
    "SQUARE-VARIATION-ID"
  );

  assert.equal(lineItem.catalogObjectId, "SQUARE-VARIATION-ID");
  assert.equal(lineItem.quantity, "2");
  assert.equal(lineItem.basePriceMoney.amount, BigInt(2499));
  assert.equal(lineItem.note, checkoutItem.shortDescription);
  assert.equal(lineItem.metadata.variant_id, checkoutItem.variantId);
  assert.equal("name" in lineItem, false);
});

test("falls back to an ad-hoc line item when no catalog mapping exists", () => {
  const lineItem = buildSquareCheckoutLineItem(checkoutItem);

  assert.equal("catalogObjectId" in lineItem, false);
  assert.equal(lineItem.name, checkoutItem.productName);
  assert.equal(lineItem.variationName, checkoutItem.variantName);
});
