import Link from "next/link";

const pillars = [
  ["50", "Characters", "/characters"],
  ["4", "Realms", "/lore"],
  ["8", "Archetypes", "/lore"],
  ["∞", "Possibilities", "/lore"],
];

const highlights = [
  ["01", "The Master Roster", "Meet the 50 forms that make up the Quiet PayPiggy™ universe.", "/characters", "EXPLORE CHARACTERS", "grand-master-poster.png"],
  ["02", "The Collector Vault", "Discover cards, rarity, special editions, and the road to #50.", "/cards", "ENTER THE VAULT", "collector-system.png"],
  ["03", "The Ultimate", "The definitive #50 form—the crown jewel of the collection.", "/shop", "VIEW ULTIMATE", "/characters/50.svg"],
];

export default function Home() {
  return (
    <main className="home">
      <header className="nav shell">
        <Link className="brand" href="/">
          <span className="brand-mark">RGP</span>
          <span className="brand-name">QUIET PAYPIGGY™</span>
        </Link>
        <nav>
          <Link href="/characters">Characters</Link>
          <Link href="/cards">Vault</Link>
          <Link href="/lore">Lore</Link>
          <Link href="/shop">Shop</Link>
        </nav>
        <Link className="nav-cta" href="/characters">Explore</Link>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> RESPLENDENT GIRLYPOP™ · THE OFFICIAL UNIVERSE</div>
          <h1>50 FORMS.<br/><em>ONE LEGEND.</em></h1>
          <p className="hero-lead">
            Enter a premium collectible universe of characters, realms, stories, rarity, and endless possibility.
            Quiet PayPiggy™ is the flagship world of Resplendent GirlyPop™.
          </p>
          <div className="actions">
            <Link className="btn primary" href="/characters">Explore the 50 <span>→</span></Link>
            <Link className="btn" href="/cards">Open the Vault</Link>
          </div>
          <div className="hero-proof">
            <span><b>50</b> forms</span><i>·</i><span><b>4</b> realms</span><i>·</i><span><b>8</b> paths</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-glow" />
          <img src="/quiet_paypiggy-royal.png" alt="Quiet PayPiggy™ in royal RGP styling" />
          <div className="hero-badge"><span>THE</span><strong>LEGEND</strong><small>BEGINS HERE</small></div>
        </div>
      </section>

      <section className="stats shell">
        {pillars.map(([n, label, href]) => (
          <Link href={href} className="stat" key={label}>
            <strong>{n}</strong><span>{label}</span>
          </Link>
        ))}
      </section>

      <section className="section shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">THE UNIVERSE</div>
            <h2>Built to be <em>collected.</em></h2>
          </div>
          <Link href="/characters" className="text-link">View the full universe <span>→</span></Link>
        </div>

        <div className="feature-grid">
          {highlights.map(([num, title, desc, href, cta, image], i) => (
            <article className={`feature-card ${i === 0 ? "large" : ""}`} key={title}>
              <Link href={href} className="feature-image">
                <img
  	src={image.startsWith("/") ? image : `/images/${image}`}
  	alt={title}
		/>
                <span className="feature-number">{num}</span>
              </Link>
              <div className="feature-body">
                <span className="tag">{i === 0 ? "50 FORMS" : i === 1 ? "COLLECTOR" : "MYTHIC"}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <Link className="card-link" href={href}>{cta} <span>↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="realm-strip">
        <div className="shell realm-strip-inner">
          <div><div className="eyebrow">FOUR REALMS</div><h2>Four worlds.<br/><em>One connected mythos.</em></h2></div>
          <div className="realm-mini">
            <span>☀</span><b>LIGHT</b><small>Hope & creation</small>
          </div>
          <div className="realm-mini">
            <span>☾</span><b>SHADOW</b><small>Mystery & secrets</small>
          </div>
          <div className="realm-mini">
            <span>⌁</span><b>TECH</b><small>Innovation & knowledge</small>
          </div>
          <div className="realm-mini">
            <span>✦</span><b>CHAOS</b><small>Power & transformation</small>
          </div>
        </div>
      </section>

      <section className="manifesto">
        <div className="shell manifesto-inner">
          <div className="eyebrow">THE PAYPIGGY™ CODE</div>
          <blockquote>“Protect the balance. Inspire possibility. Honour every story. Build a legacy.”</blockquote>
          <div className="manifesto-actions">
            <Link className="btn primary" href="/lore">Enter the lore</Link>
            <Link className="btn" href="/shop">Visit the shop</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
