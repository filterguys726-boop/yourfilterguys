import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeStoredShippingAddress,
  normalizeSquareShippingAddress
} from "../lib/square-address.ts";

test("fills missing webhook address fields from the Square order recipient", () => {
  const address = normalizeSquareShippingAddress(
    [
      { firstName: "Angel", lastName: "Lopez" },
      {
        addressLine1: "123 Main St",
        locality: "Los Angeles",
        administrativeDistrictLevel1: "CA",
        postalCode: "90623",
        country: "US"
      }
    ],
    "Angel Lopez"
  );

  assert.deepEqual(address, {
    name: "Angel Lopez",
    line1: "123 Main St",
    line2: null,
    city: "Los Angeles",
    state: "CA",
    postal_code: "90623",
    country: "US"
  });
});

test("keeps existing fields when a recovery payload is still partial", () => {
  const merged = mergeStoredShippingAddress(
    {
      name: "Angel Lopez",
      line1: null,
      line2: null,
      city: null,
      state: null,
      postal_code: null,
      country: null
    },
    {
      name: "Angel Lopez",
      line1: "123 Main St",
      city: "Los Angeles",
      state: "CA",
      postal_code: "90623",
      country: "US"
    }
  );

  assert.equal(merged?.line1, "123 Main St");
  assert.equal(merged?.postal_code, "90623");
});
