"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "../data/products";

const tabs = ["ALL","COLLECTIBLES","MERCH"];

export default function Shop() {
  const [tab,setTab] = useState("ALL");
  const [cart,setCart] = useState<string[]>([]);
  const [open,setOpen] = useState(false);

  const visible = useMemo(() => products.filter(p => tab==="ALL" || p.type===tab),[tab]);
  const total = cart.reduce((sum,id)=>sum + Number(products.find(p=>p.id===id)?.price ?? 0),0);

  function add(id:string){
    setCart(c=>[...c,id]);
    setOpen(true);
  }

  return <main>
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
      <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
      <button className="nav-cart" onClick={()=>setOpen(true)}>BAG · {cart.length}</button>
    </header>

    <section className="page-hero shell shop-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> THE OFFICIAL STORE</div>
      <h1>Take a piece<br/>of the <em>universe.</em></h1>
      <p>Collect the canon. Wear the myth. Build your own corner of Quiet PayPiggy™.</p>
      <div className="shop-tabs">{tabs.map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    </section>

    <section className="shell shop-feature">
      <div className="feature-orbit"><span>RGP</span><b>50</b><small>FORMS</small></div>
      <div><span className="eyebrow">THE COLLECTION</span><h2>Start with the <em>canon.</em></h2><p>From the first signal to the final convergence, the shop is designed around the same 50-form universe.</p><Link className="btn primary" href="/cards">View the Vault →</Link></div>
    </section>

    <section className="shell shop-grid-section">
      <div className="shop-section-head"><div><span className="eyebrow">SHOP</span><h2>{tab==="ALL"?"Everything":"The "+tab.toLowerCase()}</h2></div><span>{visible.length} PRODUCTS</span></div>
      <div className="product-grid">
        {visible.map(p=><article className={`product-tile ${p.featured?"featured":""}`} key={p.id}>
          <div className="product-art"><div className="product-glow"/><span className="product-type">{p.type}</span><strong>{p.id==="collector-binder"?"50":p.id==="lore-book"?"∞":"QP"}</strong><small>{p.items}</small></div>
          <div className="product-copy"><div><span>{p.type}</span><h3>{p.name}</h3></div><b>${p.price}</b><p>{p.description}</p><button onClick={()=>add(p.id)}>ADD TO BAG →</button></div>
        </article>)}
      </div>
    </section>

    <section className="shell shop-note"><div className="eyebrow">COLLECTOR PROMISE</div><h2>Every purchase should feel like opening a <em>piece of canon.</em></h2><p>V15 establishes the storefront experience. Checkout and payment processing can be connected later without changing the collection architecture.</p></section>

    {open && <div className="bag-backdrop" onClick={()=>setOpen(false)}>
      <aside className="bag-panel" onClick={e=>e.stopPropagation()}>
        <button className="bag-close" onClick={()=>setOpen(false)}>×</button>
        <span className="eyebrow">YOUR BAG</span><h2>Collector bag</h2>
        {cart.length===0?<div className="bag-empty"><strong>Your bag is quiet.</strong><span>Add a product to begin.</span></div>:
        <div className="bag-items">{cart.map((id,i)=>{const p=products.find(x=>x.id===id)!;return <div className="bag-item" key={i}><span>{p.type}</span><b>{p.name}</b><strong>${p.price}</strong></div>})}</div>}
        <div className="bag-total"><span>TOTAL</span><b>${total}</b></div>
        <button className="btn primary bag-checkout" disabled={cart.length===0}>CHECKOUT →</button>
        <small className="checkout-note">Demo checkout UI — payment processing is not connected yet.</small>
      </aside>
    </div>}
  </main>;
}
