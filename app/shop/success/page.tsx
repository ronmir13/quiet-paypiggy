import Link from "next/link";

export default function ShopSuccess() {
  return <main>
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
      <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
      <Link className="nav-cart" href="/shop">RETURN TO SHOP</Link>
    </header>

    <section className="page-hero shell shop-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> CHECKOUT COMPLETE</div>
      <h1>Welcome to the<br/><em>collection.</em></h1>
      <p>Your Stripe Checkout session returned successfully. This test checkout is now connected to the Quiet PayPiggy™ storefront.</p>
      <div className="hero-actions">
        <Link className="btn primary" href="/shop">Back to the Shop →</Link>
        <Link className="btn" href="/cards">Open the Vault →</Link>
      </div>
    </section>
  </main>;
}
