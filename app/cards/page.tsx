"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { characters } from "../data/characters";
import { collectorCards } from "../data/collector";
import { supabase } from "../../lib/supabase";

const filters = ["ALL","COMMON","RARE","EPIC","LEGENDARY","MYTHIC"];
const STORAGE_KEY = "quiet-paypiggy:collection:v1";

type SyncState = "local" | "syncing" | "cloud" | "signed-out" | "error";

export default function Cards() {
  const [filter,setFilter] = useState("ALL");
  const [showOwned,setShowOwned] = useState(false);
  const [selected,setSelected] = useState<number | null>(null);
  const [ownedIds,setOwnedIds] = useState<number[]>(() => collectorCards.filter(c => c.status === "OWNED").map(c => c.id));
  const [userId,setUserId] = useState<string | null>(null);
  const [syncState,setSyncState] = useState<SyncState>("local");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setOwnedIds(parsed.filter((id): id is number => Number.isInteger(id)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ownedIds)); } catch {}
  }, [ownedIds]);

  useEffect(() => {
    const requested = Number(new URLSearchParams(window.location.search).get("card"));
    if (Number.isInteger(requested) && collectorCards.some(c => c.id === requested)) setSelected(requested);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCloudCollection() {
      setSyncState("syncing");
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session?.user) {
        setUserId(null);
        setSyncState("signed-out");
        return;
      }

      setUserId(session.user.id);
      const { data, error } = await supabase
        .from("collections")
        .select("card_id")
        .eq("user_id", session.user.id)
        .order("card_id");

      if (!mounted) return;
      if (error) {
        console.error("Cloud collection load failed", error);
        setSyncState("error");
        return;
      }

      const cloudIds = (data ?? []).map(row => row.card_id).filter((id): id is number => Number.isInteger(id));

      if (cloudIds.length === 0) {
        let localIds: number[] = [];
        try {
          const saved = window.localStorage.getItem(STORAGE_KEY);
          const parsed = saved ? JSON.parse(saved) : [];
          if (Array.isArray(parsed)) localIds = parsed.filter((id): id is number => Number.isInteger(id));
        } catch {}

        if (localIds.length > 0) {
          const { error: insertError } = await supabase.from("collections").upsert(
            localIds.map(card_id => ({ user_id: session.user.id, card_id })),
            { onConflict: "user_id,card_id", ignoreDuplicates: true }
          );
          if (!mounted) return;
          if (insertError) {
            console.error("Cloud collection import failed", insertError);
            setSyncState("error");
            return;
          }
          setOwnedIds([...localIds].sort((a,b) => a-b));
          setSyncState("cloud");
          return;
        }
      }

      setOwnedIds(cloudIds);
      setSyncState("cloud");
    }

    loadCloudCollection();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadCloudCollection();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isOwned = (id:number) => ownedIds.includes(id);
  const visible = useMemo(() => collectorCards.filter(c =>
    (filter==="ALL" || c.rarity===filter) &&
    (!showOwned || isOwned(c.id))
  ),[filter,showOwned,ownedIds]);

  const selectedCard = selected ? collectorCards.find(c=>c.id===selected) : null;
  const selectedCharacter = selectedCard ? characters.find(c=>c.id===selectedCard.id) : null;
  const owned = ownedIds.length;

  async function toggleCollection(id:number) {
    const currentlyOwned = isOwned(id);
    const previous = ownedIds;
    const next = currentlyOwned
      ? ownedIds.filter(x => x !== id)
      : [...ownedIds, id].sort((a,b) => a-b);

    setOwnedIds(next);
    if (!userId) return;

    setSyncState("syncing");
    const result = currentlyOwned
      ? await supabase.from("collections").delete().eq("user_id", userId).eq("card_id", id)
      : await supabase.from("collections").upsert(
          { user_id: userId, card_id: id },
          { onConflict: "user_id,card_id" }
        );

    if (result.error) {
      console.error("Cloud collection update failed", result.error);
      setOwnedIds(previous);
      setSyncState("error");
      return;
    }

    setSyncState("cloud");
  }

  return <main>
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
      <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
      <Link className="nav-cta" href="/account">Account</Link>
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
      <small className="muted">{syncState === "cloud" ? "☁ CLOUD COLLECTION SYNCED" : syncState === "syncing" ? "SYNCING COLLECTION…" : syncState === "signed-out" ? "LOCAL COLLECTION · SIGN IN TO SYNC" : syncState === "error" ? "CLOUD SYNC ERROR · LOCAL COLLECTION ACTIVE" : "LOCAL COLLECTION"}</small>
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
          const status = isOwned(c.id) ? "OWNED" : "LOCKED";
          return <button className={`collector-card ${c.rarity.toLowerCase()} ${status.toLowerCase()}`} key={c.id} onClick={()=>setSelected(c.id)}>
            <div className="card-art"><img src={`/characters/${c.id}.svg`} alt=""/><span>#{ch.number}</span>{status==="LOCKED"&&<b className="lock-badge">LOCKED</b>}</div>
            <div className="card-body"><small>{c.rarity} · {c.edition}</small><h3>{ch.name}</h3><p>{ch.realm} · {c.serial}</p><strong>{status==="OWNED"?"OWNED":"INSPECT CARD →"}</strong></div>
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
          <div className="modal-stats"><span><small>STATUS</small><b>{isOwned(selectedCard.id)?"OWNED":"LOCKED"}</b></span><span><small>SERIAL</small><b>{selectedCard.serial}</b></span><span><small>REALM</small><b>{selectedCharacter.realm}</b></span></div>
          <div className="profile-actions">
            <button className="btn primary" onClick={()=>toggleCollection(selectedCard.id)}>{isOwned(selectedCard.id)?"Remove from collection":"Collect this card"}</button>
            <Link className="btn" href={`/characters/${selectedCard.id}`}>Open full profile →</Link>
          </div>
        </div>
      </div>
    </div>}
  </main>;
}
