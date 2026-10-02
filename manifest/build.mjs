// Builds manifest/out/sprint-poker.zip for upload to Teams.
// Usage: APP_URL=https://poker.example.com npm run manifest
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";

const appUrl = process.env.APP_URL?.replace(/\/$/, "");
if (!appUrl?.startsWith("https://")) {
  console.error("Set APP_URL to the https:// address the app is hosted at.");
  process.exit(1);
}

const dir = new URL("./", import.meta.url).pathname;
const out = `${dir}out/`;
rmSync(out, { recursive: true, force: true });
mkdirSync(out);

const manifest = readFileSync(`${dir}manifest.template.json`, "utf8")
  .replaceAll("{{APP_URL}}", appUrl)
  .replaceAll("{{APP_DOMAIN}}", new URL(appUrl).host);
writeFileSync(`${out}manifest.json`, manifest);
copyFileSync(`${dir}color.png`, `${out}color.png`);
copyFileSync(`${dir}outline.png`, `${out}outline.png`);

execFileSync("zip", ["-j", "sprint-poker.zip", "manifest.json", "color.png", "outline.png"], { cwd: out });
console.log(`Wrote ${out}sprint-poker.zip`);
