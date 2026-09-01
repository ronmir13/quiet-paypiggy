"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { characters } from "../data/characters";
import { artDirection } from "../data/artDirection";

const filters = ["ALL","FOUNDATION","WARRIOR","MIND / TECH","SPECIAL","LEGENDARY"];

export default function Characters() {
  const [filter,setFilter] = useState("ALL");
  const [query,setQuery] = useState("");
  const visible = useMemo(() => {
    const q=query.trim().toLowerCase();
    return characters.filter(c =>
      (filter==="ALL" || c.type===filter) &&
      (!q || c.name.toLowerCase().includes(q) || c.realm.toLowerCase().includes(q) || c.rarity.toLowerCase().includes(q))
    );
  },[filter,query]);

  return <main>
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
      <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
      <Link className="nav-cta" href="/">Home</Link>
    </header>
    <section className="page-hero shell character-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> THE MASTER ROSTER</div>
      <h1>Meet the <em>50.</em></h1>
      <p>Every PayPiggy™ form is a distinct expression of the universe—designed for character, story, collection, and discovery.</p>
      <div className="roster-controls">
        <div className="filter-row">{filters.map(f=><button key={f} onClick={()=>setFilter(f)} className={f===filter?"active":""}>{f}</button>)}</div>
        <label className="roster-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the roster..." /></label>
      </div>
    </section>
    <section className="shell roster">
      <div className="roster-top"><span>{visible.length} FORMS</span><span>CANON ROSTER · 01—50 · ART-DIRECTED</span></div>
      {visible.length===0 ? <div className="empty-roster"><strong>No forms found.</strong><span>Try another name, realm, rarity, or category.</span><button onClick={()=>{setQuery("");setFilter("ALL")}}>Reset search</button></div> :
      <div className="character-grid">{visible.map(c=><Link href={`/characters/${c.id}`} className={`character-card ${c.id===50?"ultimate":""}`} key={c.id}>
        <div className="number">{c.number}</div>
        <div className="portrait"><img src={`/characters/${c.id}.svg`} alt={`${c.name} PayPiggy™ artwork`} /><i>{c.realm}</i></div>
        <div className="character-info"><span className="character-type">{c.type}</span><h3>{c.name} PayPiggy™</h3><p>{c.tagline}</p><div className="character-bottom"><span>{c.rarity}</span><span>VIEW PROFILE →</span></div></div>
      </Link>)}</div>}
    </section>
  </main>;
}
