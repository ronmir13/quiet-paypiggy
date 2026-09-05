"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { collectorCards } from "../data/collector";

const rarities = ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"] as const;

type CollectionStats = {
  owned: number;
  completion: number;
  rarity: Record<(typeof rarities)[number], number>;
};

const emptyStats: CollectionStats = {
  owned: 0,
  completion: 0,
  rarity: { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0, MYTHIC: 0 },
};

function buildStats(ids: number[]): CollectionStats {
  const ownedSet = new Set(ids);
  const rarity = { ...emptyStats.rarity };

  collectorCards.forEach((card) => {
    if (ownedSet.has(card.id) && card.rarity in rarity) {
      rarity[card.rarity as (typeof rarities)[number]] += 1;
    }
  });

  const owned = ids.length;
  return { owned, completion: Math.round((owned / collectorCards.length) * 100), rarity };
}

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<CollectionStats>(emptyStats);
  const [syncing, setSyncing] = useState(false);

  async function loadProfile() {
    setSyncing(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setUserEmail(null);
      setStats(emptyStats);
      setSyncing(false);
      return;
    }

    setUserEmail(session.user.email ?? null);
    const { data, error } = await supabase
      .from("collections")
      .select("card_id")
      .eq("user_id", session.user.id)
      .order("card_id");

    if (error) {
      console.error("Collector profile load failed", error);
      setMessage("Your account is connected, but collection stats could not be loaded.");
      setSyncing(false);
      return;
    }

    const ids = (data ?? [])
      .map((row) => row.card_id)
      .filter((id): id is number => Number.isInteger(id));

    setStats(buildStats(ids));
    setSyncing(false);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.session?.user.email ?? null);
      setLoading(false);
      if (data.session?.user) loadProfile();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUserEmail(session?.user.email ?? null);
      if (session?.user) loadProfile();
      else setStats(emptyStats);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });

    setSending(false);
    setMessage(error ? error.message : "Check your email for your secure sign-in link.");
  }

  async function signOut() {
    setMessage("");
    const { error } = await supabase.auth.signOut();
    setMessage(error ? error.message : "Signed out.");
  }

  const rank = useMemo(() => {
    if (stats.owned >= 50) return "ULTIMATE COLLECTOR";
    if (stats.owned >= 40) return "MYTHIC SEEKER";
    if (stats.owned >= 25) return "VAULT KEEPER";
    if (stats.owned >= 10) return "FORM HUNTER";
    if (stats.owned >= 5) return "COLLECTOR";
    return "INITIATE";
  }, [stats.owned]);

  if (loading) {
    return (
      <main className="shell page-section">
        <p className="eyebrow">ACCOUNT</p>
        <h1>Loading your collector profile.</h1>
      </main>
    );
  }

  return (
    <main className="shell page-section">
      <section className="hero-copy">
        <p className="eyebrow">THE COLLECTOR ACCOUNT</p>
        <h1>{userEmail ? "YOUR COLLECTION. YOUR IDENTITY." : "MAKE YOUR COLLECTION YOURS."}</h1>
        <p className="lede">
          {userEmail
            ? "Your Quiet PayPiggy™ collector identity is connected to the Vault."
            : "Sign in with a magic link to establish your Quiet PayPiggy™ collector identity."}
        </p>
      </section>

      <section className="panel" style={{ maxWidth: 900, margin: "48px auto" }}>
        {userEmail ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <p className="eyebrow">COLLECTOR IDENTITY</p>
                <h2 style={{ marginBottom: 8 }}>{userEmail}</h2>
                <p className="muted">RANK · {rank}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="eyebrow">VAULT STATUS</p>
                <strong>{syncing ? "SYNCING…" : "☁ CLOUD COLLECTION SYNCED"}</strong>
              </div>
            </div>

            <div style={{ marginTop: 36 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="eyebrow">COLLECTION PROGRESS</span>
                <strong>{stats.owned}/50 · {stats.completion}%</strong>
              </div>
              <div className="meter-track"><i style={{ width: `${stats.completion}%` }} /></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginTop: 28 }}>
              <div className="panel"><span className="eyebrow">COLLECTED</span><h2>{stats.owned}</h2></div>
              <div className="panel"><span className="eyebrow">REMAINING</span><h2>{50 - stats.owned}</h2></div>
              <div className="panel"><span className="eyebrow">COMPLETION</span><h2>{stats.completion}%</h2></div>
            </div>

            <div style={{ marginTop: 32 }}>
              <p className="eyebrow">RARITY BREAKDOWN</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginTop: 12 }}>
                {rarities.map((rarity) => (
                  <div key={rarity} className="panel">
                    <span className="eyebrow">{rarity}</span>
                    <strong style={{ fontSize: 24 }}>{stats.rarity[rarity]}</strong>
                  </div>
                ))}
              </div>
            </div>

            {message && <p className="muted" style={{ marginTop: 20 }}>{message}</p>}

            <div className="profile-actions" style={{ marginTop: 32 }}>
              <Link className="btn primary" href="/cards">Open Collector Vault →</Link>
              <button className="btn" type="button" onClick={signOut}>Sign out</button>
            </div>
          </div>
        ) : (
          <form onSubmit={sendMagicLink}>
            <p className="eyebrow">SECURE SIGN-IN</p>
            <h2>ENTER YOUR EMAIL.</h2>
            <p className="muted">We’ll send a one-time magic link. No password required.</p>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              style={{ width: "100%", marginTop: 20 }}
            />
            <button className="btn primary" type="submit" disabled={sending} style={{ marginTop: 16 }}>
              {sending ? "Sending…" : "Send magic link →"}
            </button>
            {message && <p className="muted" style={{ marginTop: 16 }}>{message}</p>}
          </form>
        )}
      </section>
    </main>
  );
}
