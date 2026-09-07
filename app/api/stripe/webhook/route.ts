import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getClients() {
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

  return { stripe, webhookSecret, supabase };
}

async function getOrderItems(stripe: Stripe, sessionId: string) {
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ["data.price.product"],
  });

  return lineItems.data.map((item) => {
    const product = item.price?.product;
    const productMetadata = product && typeof product !== "string" ? product.metadata : undefined;

    return {
      product_id: productMetadata?.product_id ?? item.price?.id ?? "unknown",
      product_name: item.description ?? item.price?.nickname ?? "Quiet PayPiggy item",
      quantity: item.quantity ?? 1,
      unit_amount: item.price?.unit_amount ?? 0,
    };
  });
}

export async function POST(request: Request) {
  try {
    const { stripe, webhookSecret, supabase } = getClients();
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

    let orderId: string;

    if (existingOrder) {
      orderId = existingOrder.id;

      const { count, error: itemCountError } = await supabase
        .from("order_items")
        .select("id", { count: "exact", head: true })
        .eq("order_id", orderId);

      if (itemCountError) {
        console.error("Order item lookup failed:", itemCountError);
        return NextResponse.json({ error: "Order item lookup failed." }, { status: 500 });
      }

      if ((count ?? 0) > 0) {
        return NextResponse.json({ received: true, duplicate: true });
      }
    } else {
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

      orderId = order.id;
    }

    const items = await getOrderItems(stripe, session.id);

    if (items.length === 0) {
      return NextResponse.json({ error: "No checkout items found." }, { status: 500 });
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: orderId,
        ...item,
      }))
    );

    if (itemsError) {
      console.error("Order item creation failed:", itemsError);
      return NextResponse.json({ error: "Order item creation failed." }, { status: 500 });
    }

    return NextResponse.json({ received: true, order_id: orderId });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
