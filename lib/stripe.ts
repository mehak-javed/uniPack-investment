import Stripe from "stripe";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

/** Returns the Pro price id — from env if set, otherwise finds/creates a
 *  $20/mo recurring price (keyed by lookup_key) in whatever mode the key is. */
export async function getProPriceId(): Promise<string> {
  if (process.env.STRIPE_PRICE_PRO) return process.env.STRIPE_PRICE_PRO;

  const stripe = getStripe();
  const existing = await stripe.prices.list({
    lookup_keys: ["unipack_pro_monthly"],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  const product = await stripe.products.create({
    name: "uniPACK Pro",
    description: "Save unlimited stocks to your watchlist",
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2000,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: "unipack_pro_monthly",
  });
  return price.id;
}
