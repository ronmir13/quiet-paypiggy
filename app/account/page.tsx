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

type OrderItem = {
  id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_amount: number;
};

type Order = {
  id: string;
  amount_total: number;
  currency: string;
  status: "paid" | "fulfilled" | "cancelled" | "refunded";
  created_at: string;
  order_items: OrderItem[];
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

function formatOrderTotal(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function orderStatusLabel(status: Order["status"]) {
  return status.toUpperCase();
}

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<CollectionStats>(emptyStats);
  const [orders, setOrders] = useState<Order[]>([]);
  const [syncing, setSyncing] = useState(false);

  async function loadProfile() {
    setSyncing(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setUserEmail(null);
      setStats(emptyStats);
      setOrders([]);
      setSyncing(false);
      return;
    }

    setUserEmail(session.user.email ?? null);

    const [{ data: collectionData, error: collectionError }, { data: orderData, error: orderError }] =
      await Promise.all([
        supabase
          .from("collections")
          .select("card_id")
          .eq("user_id", session.user.id)
          .order("card_id"),
        supabase
          .from("orders")
          .select("id, amount_total, currency, status, created_at, order_items(id, product_id, product_name, quantity, unit_amount)")
          .order("created_at", { ascending: false }),
      ]);

    if (collectionError) {
      console.error("Collector profile load failed", collectionError);
      setMessage("Your account is connected, but collection stats could not be loaded.");
    } else {
      const ids = (collectionData ?? [])
        .map((row) => row.card_id)
        .filter((id): id is number => Number.isInteger(id));

      setStats(buildStats(ids));
    }

    if (orderError) {
      console.error("Order history load failed", orderError);
      setMessage("Your collection is synced, but order history could not be loaded.");
      setOrders([]);
    } else {
      setOrders((orderData ?? []) as Order[]);
    }

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
      else {
        setStats(emptyStats);
        setOrders([]);
      }
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

  const milestones = [
    { label: "FIRST FORM", target: 1 },
    { label: "COLLECTOR", target: 5 },
    { label: "FORM HUNTER", target: 10 },
    { label: "VAULT KEEPER", target: 25 },
    { label: "MYTHIC SEEKER", target: 40 },
    { label: "ULTIMATE", target: 50 },
  ];

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

            <div style={{ marginTop: 32 }}>
              <p className="eyebrow">COLLECTOR MILESTONES</p>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {milestones.map((milestone, index) => {
                  const unlocked = stats.owned >= milestone.target;
                  const previousTarget = index === 0 ? 0 : milestones[index - 1].target;
                  const range = milestone.target - previousTarget;
                  const progress = unlocked ? 100 : Math.max(0, Math.min(100, ((stats.owned - previousTarget) / range) * 100));
                  return (
                    <div key={milestone.target} className="panel" style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <strong>{unlocked ? "✓" : "○"} {milestone.label}</strong>
                        <span className="muted">{Math.min(stats.owned, milestone.target)}/{milestone.target}</span>
                      </div>
                      <div className="meter-track"><i style={{ width: `${progress}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
                <div>
                  <p className="eyebrow">ORDER HISTORY</p>
                  <h2 style={{ marginBottom: 6 }}>YOUR ORDERS.</h2>
                  <p className="muted">Purchases connected to your collector account.</p>
                </div>
                <Link className="btn" href="/shop">Continue shopping →</Link>
              </div>

              {orders.length === 0 ? (
                <div className="panel" style={{ marginTop: 16 }}>
                  <p className="eyebrow">NO ORDERS YET</p>
                  <p className="muted">Your completed Quiet PayPiggy™ purchases will appear here.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  {orders.map((order) => {
                    const itemCount = order.order_items.reduce((total, item) => total + item.quantity, 0);
                    return (
                      <div key={order.id} className="panel" style={{ display: "grid", gap: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                          <div>
                            <p className="eyebrow">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                            <strong>{formatOrderDate(order.created_at)}</strong>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p className="eyebrow">STATUS</p>
                            <strong>{orderStatusLabel(order.status)}</strong>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                          <span className="muted">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                          <strong style={{ fontSize: 20 }}>{formatOrderTotal(order.amount_total, order.currency)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
