import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Quiet PayPiggy™ — 50 Forms. One Legend.",
    template: "%s · Quiet PayPiggy™",
  },
  description: "The Quiet PayPiggy™ collectible universe by Resplendent GirlyPop™.",
  keywords: ["Quiet PayPiggy", "Resplendent GirlyPop", "collectibles", "character universe", "collector vault"],
  openGraph: {
    title: "Quiet PayPiggy™ — 50 Forms. One Legend.",
    description: "Enter the official Quiet PayPiggy™ collectible universe.",
    type: "website",
  },
};

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand" href="/">
            <span className="brand-mark">RGP</span>
            <span className="brand-name">QUIET PAYPIGGY™</span>
          </Link>
          <p className="footer-copy">50 forms. Four realms. One connected mythos.</p>
        </div>
        <div className="footer-links">
          <div><span>EXPLORE</span><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link></div>
          <div><span>UNIVERSE</span><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></div>
          <div><span>BRAND</span><Link href="/">Home</Link><Link href="/characters/50">The Ultimate</Link><Link href="/account">Account</Link></div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Resplendent GirlyPop™</span>
        <span>THE QUIET PAYPIGGY™ UNIVERSE</span>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
