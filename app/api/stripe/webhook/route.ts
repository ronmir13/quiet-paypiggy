import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Stripe or Supabase webhook environment variables.");
}

const stripe = new Stripe(stripeSecretKey);
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, status: "not_paid" });
  }

  const { data: existingOrder, error: existingError } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existingError) {
    console.error("Order lookup failed:", existingError);
    return NextResponse.json({ error: "Order lookup failed." }, { status: 500 });
  }

  if (existingOrder) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      customer_email: session.customer_details?.email ?? session.customer_email ?? null,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "paid",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    return NextResponse.json({ error: "Order creation failed." }, { status: 500 });
  }

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });

    const items = lineItems.data.map((item) => ({
      order_id: order.id,
      product_id: item.price?.metadata?.product_id ?? item.description ?? "unknown",
      product_name: item.description ?? item.price?.nickname ?? "Quiet PayPiggy item",
      quantity: item.quantity ?? 1,
      unit_amount: item.price?.unit_amount ?? 0,
    }));

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(items);

      if (itemsError) {
        console.error("Order item creation failed:", itemsError);
        return NextResponse.json({ error: "Order item creation failed." }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Stripe line item retrieval failed:", error);
    return NextResponse.json({ error: "Unable to retrieve checkout items." }, { status: 500 });
  }

  return NextResponse.json({ received: true, order_id: order.id });
}
