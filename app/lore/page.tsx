import Link from "next/link";
import { characters } from "../data/characters";
import { realms } from "../data/realms";

const eras = [
  { n:"01", title:"The Signal", copy:"A quiet idea becomes a symbol. The first PayPiggy™ form establishes the language of the universe." },
  { n:"02", title:"The Multiplication", copy:"The single form fractures into archetypes. Gold, Shadow, Royal, Ninja, and the others begin to emerge." },
  { n:"03", title:"The Expansion", copy:"Warriors, detectives, inventors, criminals, and cosmic entities push the canon beyond one world." },
  { n:"04", title:"The Convergence", copy:"The realms begin to overlap. The final forms reveal that the 50 were never separate—they were pieces of one system." },
];

export default function Lore() {
  return <main>
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
      <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
      <Link className="nav-cta" href="/characters">Enter Universe</Link>
    </header>

    <section className="page-hero shell lore-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> THE QUIET PAYPIGGY™ UNIVERSE</div>
      <h1>50 forms.<br/><em>One mythology.</em></h1>
      <p>Behind the collection is a connected universe of realms, archetypes, rivalries, transformations, and legends.</p>
    </section>

    <section className="shell lore-intro">
      <div className="lore-seal">RGP<br/><span>CANON</span></div>
      <div><div className="eyebrow">THE PREMISE</div><h2>The quietest signal can become the <em>loudest myth.</em></h2></div>
      <p>Quiet PayPiggy™ is a character universe built around transformation. Every form is a different answer to the same question: <strong>what happens when one identity is allowed to become 50?</strong> The roster is divided into five major families and four realms, but every form ultimately points back to the same origin.</p>
    </section>

    <section className="realm-section">
      <div className="shell">
        <div className="eyebrow">THE FOUR REALMS</div>
        <h2>Four forces shape the universe.</h2>
        <div className="realm-grid">
          {realms.map(r=><article className={`realm-card ${r.accent}`} key={r.name}><span>{r.name}</span><h3>{r.title}</h3><p>{r.description}</p><div className="realm-orbit"/></article>)}
        </div>
      </div>
    </section>

    <section className="shell eras-section">
      <div className="eyebrow">THE CANON TIMELINE</div>
      <h2>How the 50 came to be.</h2>
      <div className="era-list">{eras.map(e=><article key={e.n}><span>{e.n}</span><div><h3>{e.title}</h3><p>{e.copy}</p></div></article>)}</div>
    </section>

    <section className="shell families-section">
      <div className="eyebrow">THE FIVE FAMILIES</div>
      <h2>The architecture of the roster.</h2>
      <div className="family-grid">
        {[
          ["FOUNDATION","01—10","The original archetypes."],
          ["WARRIOR","11—20","Force, discipline, action."],
          ["MIND / TECH","21—30","Systems, knowledge, invention."],
          ["SPECIAL","31—40","Exceptions to the rules."],
          ["LEGENDARY","41—50","Myth, power, transcendence."]
        ].map(f=><Link href="/characters" className="family-card" key={f[0]}><small>{f[1]}</small><h3>{f[0]}</h3><p>{f[2]}</p><span>EXPLORE →</span></Link>)}
      </div>
    </section>

    <section className="shell canon-footer">
      <div><span className="eyebrow">CANON INDEX</span><h2>Start anywhere.<br/><em>The universe connects.</em></h2></div>
      <div className="canon-numbers">{characters.slice(0,10).map(c=><Link href={`/characters/${c.id}`} key={c.id}>{c.number}</Link>)}</div>
      <Link className="btn primary" href="/characters">Explore all 50 →</Link>
    </section>
  </main>;
}
