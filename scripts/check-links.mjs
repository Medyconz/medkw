import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = "public";
const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
const localTargets = new Set([...htmlFiles, "assets/styles.css", "assets/script.js", "assets/medkw-logo.jpg"]);
const failures = [];

for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), "utf8");
  const refs = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const ref of refs) {
    if (ref.startsWith("http") || ref.startsWith("mailto:") || ref.startsWith("tel:") || ref.startsWith("#")) continue;
    const clean = ref.replace(/^\.\//, "").split("#")[0].split("?")[0];
    if (!localTargets.has(clean) && !clean.startsWith("assets/media/")) {
      failures.push(`${file}: missing local reference ${ref}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files. Local links look good.`);
