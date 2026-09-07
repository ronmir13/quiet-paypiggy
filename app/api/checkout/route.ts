import { NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "../../data/products";

type CheckoutItem = {
  id: string;
  quantity: number;
};

function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  return new Stripe(stripeSecretKey);
}

function getAppOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const body = (await request.json()) as { items?: CheckoutItem[] };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
    }

    if (body.items.length > 20) {
      return NextResponse.json({ error: "Too many unique products in one checkout." }, { status: 400 });
    }

    const lineItems = body.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.id);

      if (!product) {
        throw new Error(`Invalid product: ${item.id}`);
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        throw new Error(`Invalid quantity for product: ${item.id}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
            metadata: {
              product_id: product.id,
            },
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    const origin = getAppOrigin();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?checkout=cancelled`,
      billing_address_collection: "auto",
      metadata: {
        source: "quiet-paypiggy-shop",
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unable to create checkout session.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
