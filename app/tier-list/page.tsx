// app/tier-list/page.tsx — Server component
import fs from "fs";
import path from "path";
import TierListClient from "./TierListClient";

const DATA_DIR = path.join(process.cwd(), "data");

function loadAllCharacters() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const characters: any[] = [];

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
      if (raw.slug && Array.isArray(raw.costumes)) {
        characters.push(raw);
      }
    } catch {
      // skip invalid files
    }
  }

  return characters;
}

export const metadata = {
  title: "Tier List — BD2Hub",
  description: "Full Brown Dust 2 tier list — ranked by character or individual costume across every game mode.",
};

export default function TierListPage() {
  const characters = loadAllCharacters();
  return <TierListClient characters={characters} />;
}