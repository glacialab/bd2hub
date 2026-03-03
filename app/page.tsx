// app/page.tsx  — Server component wrapper
// Scans data/*.json for character files & boss data, passes to client.
import fs from "fs";
import path from "path";
import BD2HubClient from "./BD2HubClient";

const DATA_DIR = path.join(process.cwd(), "data");

function loadAllData() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const characters: any[] = [];
  let boss: any = null;

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));

      // Boss file detection
      if (raw.boss && raw.boss.hotTeams) {
        boss = raw.boss;
        continue;
      }

      // Character guide detection — must have slug + costumes array
      if (raw.slug && Array.isArray(raw.costumes)) {
        characters.push(raw);
      }
    } catch {
      // skip invalid files
    }
  }

  return { characters, boss };
}

export default function HomePage() {
  const { characters, boss } = loadAllData();
  return <BD2HubClient characters={characters} boss={boss} />;
}