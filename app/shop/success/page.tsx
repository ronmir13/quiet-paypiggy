import Link from "next/link";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
}

const stripe = new Stripe(stripeSecretKey);

type ShopSuccessProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function ShopSuccess({ searchParams }: ShopSuccessProps) {
  const { session_id: sessionId } = await searchParams;
  let verified = false;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      verified = session.status === "complete" && session.payment_status === "paid";
    } catch (error) {
      console.error("Stripe success verification error:", error);
    }
  }

  return <main>
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
      <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
      <Link className="nav-cart" href="/shop">RETURN TO SHOP</Link>
    </header>

    <section className="page-hero shell shop-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> {verified ? "CHECKOUT COMPLETE" : "CHECKOUT STATUS"}</div>
      <h1>{verified ? <>Welcome to the<br/><em>collection.</em></> : <>We couldn't<br/><em>verify it yet.</em></>}</h1>
      <p>{verified
        ? "Your Stripe payment was verified successfully. This test checkout is now connected to the Quiet PayPiggy™ storefront."
        : "We couldn't verify a completed Stripe payment for this session. If you just paid, please check your Stripe receipt before trying again."
      }</p>
      <div className="hero-actions">
        <Link className="btn primary" href="/shop">Back to the Shop →</Link>
        <Link className="btn" href="/cards">Open the Vault →</Link>
      </div>
    </section>
  </main>;
}
