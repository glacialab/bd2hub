// app/guides/[slug]/page.tsx
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import CharacterGuideClient from "./CharacterGuideClient";

/* ─────────────────────────────────────────────────────────────────────────────
   Load every [name].json sitting in root/data/ and build a slug → data map.
   Files that don't look like character guides (e.g. boss.json) are skipped.
───────────────────────────────────────────────────────────────────────────── */
const DATA_DIR = path.join(process.cwd(), "data");

function getAllCharacterGuides() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const guides: Record<string, any> = {};

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
      // A character guide must have at least a slug and costumes array
      if (raw.slug && Array.isArray(raw.costumes)) {
        guides[raw.slug] = raw;
      }
    } catch {
      // skip files that aren't valid JSON or don't match the schema
    }
  }
  return guides;
}

/* ── generateStaticParams — pre-render every guide at build time ── */
export async function generateStaticParams() {
  const guides = getAllCharacterGuides();
  return Object.keys(guides).map((slug) => ({ slug }));
}

/* ── generateMetadata — dynamic <title> per character ── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guides = getAllCharacterGuides();
  const char = guides[slug];
  if (!char) return { title: "Character Not Found — BD2Hub" };
  return {
    title: `${char.name} Guide — BD2Hub`,
    description: char.overview?.slice(0, 160) ?? `Full guide for ${char.name} in Brown Dust 2.`,
  };
}

/* ── Page component ── */
export default async function CharacterGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guides = getAllCharacterGuides();
  const char = guides[slug];
  if (!char) notFound();
  return <CharacterGuideClient char={char} />;
}