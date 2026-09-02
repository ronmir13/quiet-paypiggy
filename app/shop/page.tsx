"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { products } from "../data/products";

const tabs = ["ALL", "COLLECTIBLES", "MERCH"];
const STORAGE_KEY = "quiet-paypiggy:bag:v1";

type Bag = Record<string, number>;

export default function Shop() {
  const [tab, setTab] = useState("ALL");
  const [bag, setBag] = useState<Bag>({});
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const clean: Bag = {};
          for (const [id, qty] of Object.entries(parsed)) {
            if (products.some(p => p.id === id) && Number.isInteger(qty) && Number(qty) > 0) clean[id] = Number(qty);
          }
          setBag(clean);
        }
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bag)); } catch {}
  }, [bag, ready]);

  const visible = useMemo(() => products.filter(p => tab === "ALL" || p.type === tab), [tab]);
  const bagItems = Object.entries(bag)
    .map(([id, quantity]) => ({ product: products.find(p => p.id === id), quantity }))
    .filter((item): item is { product: (typeof products)[number]; quantity: number } => Boolean(item.product));
  const itemCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = bagItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  function add(id: string) {
    setBag(current => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setOpen(true);
  }

  function remove(id: string) {
    setBag(current => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function decrease(id: string) {
    setBag(current => {
      const quantity = current[id] ?? 0;
      if (quantity <= 1) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: quantity - 1 };
    });
  }

  return <main>
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
      <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
      <button className="nav-cart" onClick={() => setOpen(true)}>BAG · {itemCount}</button>
    </header>

    <section className="page-hero shell shop-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> THE OFFICIAL STORE</div>
      <h1>Take a piece<br/>of the <em>universe.</em></h1>
      <p>Collect the canon. Wear the myth. Build your own corner of Quiet PayPiggy™.</p>
      <div className="shop-tabs">{tabs.map(t => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    </section>

    <section className="shell shop-feature">
      <div className="feature-orbit"><span>RGP</span><b>50</b><small>FORMS</small></div>
      <div><span className="eyebrow">THE COLLECTION</span><h2>Start with the <em>canon.</em></h2><p>From the first signal to the final convergence, the shop is designed around the same 50-form universe.</p><Link className="btn primary" href="/cards">View the Vault →</Link></div>
    </section>

    <section className="shell shop-grid-section">
      <div className="shop-section-head"><div><span className="eyebrow">SHOP</span><h2>{tab === "ALL" ? "Everything" : "The " + tab.toLowerCase()}</h2></div><span>{visible.length} PRODUCTS</span></div>
      <div className="product-grid">
        {visible.map(p => <article className={`product-tile ${p.featured ? "featured" : ""}`} key={p.id}>
          <div className="product-art"><div className="product-glow"/><span className="product-type">{p.type}</span><strong>{p.id === "collector-binder" ? "50" : p.id === "lore-book" ? "∞" : "QP"}</strong><small>{p.items}</small></div>
          <div className="product-copy"><div><span>{p.type}</span><h3>{p.name}</h3></div><b>${p.price}</b><p>{p.description}</p><button onClick={() => add(p.id)}>ADD TO BAG →</button></div>
        </article>)}
      </div>
    </section>

    <section className="shell shop-note"><div className="eyebrow">COLLECTOR PROMISE</div><h2>Every purchase should feel like opening a <em>piece of canon.</em></h2><p>V20 turns the storefront bag into a persistent cart foundation. Checkout and payment processing can be connected later without changing the cart architecture.</p></section>

    {open && <div className="bag-backdrop" onClick={() => setOpen(false)}>
      <aside className="bag-panel" onClick={e => e.stopPropagation()}>
        <button className="bag-close" onClick={() => setOpen(false)}>×</button>
        <span className="eyebrow">YOUR BAG</span><h2>Collector bag</h2>
        {bagItems.length === 0 ? <div className="bag-empty"><strong>Your bag is quiet.</strong><span>Add a product to begin.</span></div> :
          <div className="bag-items">{bagItems.map(({ product, quantity }) => <div className="bag-item" key={product.id}>
            <span>{product.type}</span><b>{product.name}</b><strong>${Number(product.price) * quantity}</strong>
            <div className="bag-qty"><button aria-label={`Decrease ${product.name}`} onClick={() => decrease(product.id)}>−</button><span>{quantity}</span><button aria-label={`Increase ${product.name}`} onClick={() => add(product.id)}>+</button></div>
            <button className="bag-remove" onClick={() => remove(product.id)}>REMOVE</button>
          </div>)}</div>}
        <div className="bag-total"><span>TOTAL</span><b>${total}</b></div>
        <button className="btn primary bag-checkout" disabled={bagItems.length === 0}>CHECKOUT →</button>
        <small className="checkout-note">Cart foundation complete — payment processing is not connected yet.</small>
      </aside>
    </div>}
  </main>;
}
