"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUserEmail(data.session?.user.email ?? null);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUserEmail(session?.user.email ?? null);
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
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });

    setSending(false);
    setMessage(error ? error.message : "Check your email for your secure sign-in link.");
  }

  async function signOut() {
    setMessage("");
    const { error } = await supabase.auth.signOut();
    setMessage(error ? error.message : "Signed out.");
  }

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
        <h1>{userEmail ? "WELCOME BACK." : "MAKE YOUR COLLECTION YOURS."}</h1>
        <p className="lede">
          {userEmail
            ? "Your collector identity is connected. Cloud collection sync comes next."
            : "Sign in with a magic link to establish your Quiet PayPiggy™ collector identity."}
        </p>
      </section>

      <section className="panel" style={{ maxWidth: 680, margin: "48px auto" }}>
        {userEmail ? (
          <div>
            <p className="eyebrow">SIGNED IN</p>
            <h2>{userEmail}</h2>
            <p className="muted">Your account is ready for the V21 cloud collection layer.</p>
            <div className="profile-actions" style={{ marginTop: 24 }}>
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
