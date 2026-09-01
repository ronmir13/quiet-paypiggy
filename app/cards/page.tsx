"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { characters } from "../data/characters";
import { collectorCards } from "../data/collector";

const filters = ["ALL","COMMON","RARE","EPIC","LEGENDARY","MYTHIC"];

export default function Cards() {
  const [filter,setFilter] = useState("ALL");
  const [showOwned,setShowOwned] = useState(false);
  const [selected,setSelected] = useState<number | null>(null);

  const visible = useMemo(() => collectorCards.filter(c =>
    (filter==="ALL" || c.rarity===filter) &&
    (!showOwned || c.status==="OWNED")
  ),[filter,showOwned]);

  const selectedCard = selected ? collectorCards.find(c=>c.id===selected) : null;
  const selectedCharacter = selectedCard ? characters.find(c=>c.id===selectedCard.id) : null;
  const owned = collectorCards.filter(c=>c.status==="OWNED").length;

  return <main>
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
      <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
      <Link className="nav-cta" href="/characters">Roster</Link>
    </header>

    <section className="page-hero shell vault-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> COLLECTOR VAULT</div>
      <h1>Build your<br/><em>collection.</em></h1>
      <p>Every canon form is a collectible. Track your progress, inspect each card, and chase the Mythic finale.</p>
      <div className="collection-meter">
        <div className="meter-copy"><span>COLLECTION PROGRESS</span><strong>{owned}/50</strong></div>
        <div className="meter-track"><i style={{width:`${owned*2}%`}} /></div>
        <small>{owned*2}% COMPLETE · {50-owned} CARDS REMAINING</small>
      </div>
    </section>

    <section className="shell collector-controls">
      <div className="rarity-filters">{filters.map(r=><button key={r} onClick={()=>setFilter(r)} className={r===filter?"active":""}>{r}</button>)}</div>
      <button className={`owned-toggle ${showOwned?"active":""}`} onClick={()=>setShowOwned(v=>!v)}>✓ OWNED ONLY</button>
    </section>

    <section className="shell vault-archive">
      <div className="vault-toolbar"><div><span className="eyebrow">THE ARCHIVE</span><h2>{filter==="ALL"?"All cards":`${filter} cards`}</h2></div><div className="vault-result-count">{visible.length} DISPLAYED</div></div>
      <div className="card-grid">
        {visible.map(c=>{
          const ch=characters.find(x=>x.id===c.id)!;
          return <button className={`collector-card ${c.rarity.toLowerCase()} ${c.status.toLowerCase()}`} key={c.id} onClick={()=>setSelected(c.id)}>
            <div className="card-art"><img src={`/characters/${c.id}.svg`} alt=""/><span>#{ch.number}</span>{c.status==="LOCKED"&&<b className="lock-badge">LOCKED</b>}</div>
            <div className="card-body"><small>{c.rarity} · {c.edition}</small><h3>{ch.name}</h3><p>{ch.realm} · {c.serial}</p><strong>{c.status==="OWNED"?"OWNED":"INSPECT CARD →"}</strong></div>
          </button>
        })}
      </div>
    </section>

    {selectedCard && selectedCharacter && <div className="card-modal-backdrop" onClick={()=>setSelected(null)}>
      <div className={`card-modal ${selectedCard.rarity.toLowerCase()}`} onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>setSelected(null)}>×</button>
        <div className="modal-art"><img src={`/characters/${selectedCard.id}.svg`} alt=""/></div>
        <div className="modal-copy">
          <span className="canon-badge">{selectedCard.rarity} · {selectedCard.edition}</span>
          <h2>#{selectedCharacter.number} {selectedCharacter.name}</h2>
          <p>{selectedCharacter.tagline}</p>
          <div className="modal-stats"><span><small>STATUS</small><b>{selectedCard.status}</b></span><span><small>SERIAL</small><b>{selectedCard.serial}</b></span><span><small>REALM</small><b>{selectedCharacter.realm}</b></span></div>
          <Link className="btn primary" href={`/characters/${selectedCard.id}`}>Open full profile →</Link>
        </div>
      </div>
    </div>}
  </main>;
}
