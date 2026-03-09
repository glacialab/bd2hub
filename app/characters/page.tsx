// app/characters/page.tsx  —  SERVER COMPONENT
import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";
import CharactersClient from "./CharactersClient";
import type { CharacterJSON } from "./CharactersClient";

export const metadata: Metadata = {
  title: "Characters | BD2Hub – Brown Dust 2",
  description: "Browse all Brown Dust 2 characters, costumes, and elements. Filter by element, class, rarity and tier.",
};

async function loadCharacters(): Promise<CharacterJSON[]> {
  const dataDir = path.join(process.cwd(), "data");
  let filenames: string[];
  try { filenames = await fs.readdir(dataDir); }
  catch { return []; }

  const results = await Promise.allSettled(
    filenames
      .filter((f) => f.endsWith(".json"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(dataDir, file), "utf-8");
        return JSON.parse(raw) as CharacterJSON;
      })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<CharacterJSON> =>
      r.status === "fulfilled" &&
      typeof r.value.slug === "string" &&
      Array.isArray(r.value.costumes)
    )
    .map((r) => r.value)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default async function CharactersPage() {
  const characters = await loadCharacters();
  return <CharactersClient characters={characters} />;
}