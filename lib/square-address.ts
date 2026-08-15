export type SquareAddressLike = {
  firstName?: string | null;
  lastName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  locality?: string | null;
  administrativeDistrictLevel1?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

export type NormalizedShippingAddress = {
  name: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeSquareShippingAddress(
  addresses: Array<SquareAddressLike | undefined>,
  displayName?: string | null
): NormalizedShippingAddress | null {
  const value = (key: keyof SquareAddressLike) =>
    addresses.map((address) => text(address?.[key])).find(Boolean) ?? null;
  const addressName = addresses
    .map((address) =>
      [text(address?.firstName), text(address?.lastName)]
        .filter(Boolean)
        .join(" ")
    )
    .find(Boolean);

  if (!addresses.some(Boolean) && !text(displayName)) {
    return null;
  }

  return {
    name: text(displayName) ?? addressName ?? null,
    line1: value("addressLine1"),
    line2: value("addressLine2"),
    city: value("locality"),
    state: value("administrativeDistrictLevel1"),
    postal_code: value("postalCode"),
    country: value("country")
  };
}

export function mergeStoredShippingAddress(
  incoming: NormalizedShippingAddress | null,
  stored: Record<string, unknown> | null
) {
  if (!incoming && !stored) {
    return null;
  }

  return {
    name: incoming?.name ?? text(stored?.name),
    line1: incoming?.line1 ?? text(stored?.line1),
    line2: incoming?.line2 ?? text(stored?.line2),
    city: incoming?.city ?? text(stored?.city),
    state: incoming?.state ?? text(stored?.state),
    postal_code: incoming?.postal_code ?? text(stored?.postal_code),
    country: incoming?.country ?? text(stored?.country)
  };
}
