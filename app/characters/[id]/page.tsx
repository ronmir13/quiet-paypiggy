import Link from "next/link";
import { notFound } from "next/navigation";
import { characters } from "../../data/characters";
import { characterIdentities } from "../../data/characterIdentities";

export function generateStaticParams() {
  return characters.map((c) => ({ id: String(c.id) }));
}

export default async function CharacterProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = characters.find((c) => String(c.id) === id);
  if (!character) notFound();

  const identity = characterIdentities.find((x: any) => String(x.id) === String(character.id));
  const previous = character.id === 1 ? 50 : character.id - 1;
  const next = character.id === 50 ? 1 : character.id + 1;

  return (
    <main className="profile-page">
      <header className="nav shell">
        <Link className="brand" href="/"><span className="brand-mark">RGP</span><span className="brand-name">QUIET PAYPIGGY™</span></Link>
        <nav><Link href="/characters">Characters</Link><Link href="/cards">Vault</Link><Link href="/lore">Lore</Link><Link href="/shop">Shop</Link></nav>
        <Link className="nav-cta" href="/characters">Roster</Link>
      </header>

      <section className="profile shell">
        <div className="profile-art">
          <div className="profile-number">#{character.number}</div>
          <div className="profile-glow" />
          <img className="profile-character-art" src={`/characters/${character.id}.svg`} alt={`${character.name} PayPiggy™ artwork`} />
          <div className="profile-seal">{character.rarity}</div>
        </div>

        <div className="profile-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> {character.type} · {character.realm} REALM</div>
          <h1>{character.name}<br/><em>PayPiggy™</em></h1>
          <p className="profile-tagline">{identity?.tagline ?? character.tagline}</p>
          <div className="profile-meta">
            <span><small>FORM</small> #{character.number}</span>
            <span><small>RARITY</small> {character.rarity}</span>
            <span><small>REALM</small> {character.realm}</span>
          </div>
          <p className="profile-description">{identity?.description ?? character.description}</p>
          <div className="ability">
            <span className="ability-label">SIGNATURE ABILITY</span>
            <strong>{character.ability}</strong>
          </div>
          <div className="profile-actions">
            <Link className="btn primary" href={`/cards?card=${character.id}`}>View in Vault <span>→</span></Link>
            <Link className="btn" href={`/cards?card=${character.id}`}>Collect</Link>
          </div>
        </div>
      </section>

      <section className="profile-lore">
        <div className="shell profile-lore-inner">
          <div><div className="eyebrow">CHARACTER LORE</div><h2>The story behind <em>#{character.number}.</em></h2></div>
          <p>{character.lore}</p>
        </div>
      </section>

      <section className="shell profile-nav">
        <Link href={`/characters/${previous}`}>← Previous form</Link>
        <Link href="/characters">Back to all 50</Link>
        <Link href={`/characters/${next}`}>Next form →</Link>
      </section>
    </main>
  );
}
