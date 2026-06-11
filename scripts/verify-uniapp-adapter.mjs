import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const tempRoot = mkdtempSync(join(tmpdir(), "mak-uniapp-"));
const dist = join(tempRoot, "dist/build/mp-weixin");
const cli = join(root, "packages/cli/dist/index.js");
const skill = join(root, "examples/booking-skill");

mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "app.json"), JSON.stringify({ pages: ["pages/index/index"] }, null, 2) + "\n");

execFileSync("node", [cli, "uniapp", "prepare", "--project", tempRoot, "--skill", skill, "--name", "booking-skill"], {
  stdio: "inherit"
});
execFileSync(
  "node",
  [cli, "uniapp", "patch", "--project", tempRoot, "--dist", dist, "--skill", "booking-skill"],
  {
    stdio: "inherit"
  }
);

const appJson = JSON.parse(readFileSync(join(dist, "app.json"), "utf8"));
const skillDir = join(dist, "skills/booking-skill");

const failures = [];
if (appJson.lazyCodeLoading !== "requiredComponents") failures.push("lazyCodeLoading not patched");
if (!appJson.agent?.skills?.some((item) => item.name === "booking-skill")) failures.push("agent.skills missing");
if (!appJson.subPackages?.some((item) => item.root === "skills/booking-skill")) failures.push("subPackages missing");
if (!existsSync(join(skillDir, "SKILL.md"))) failures.push("dist SKILL.md missing");
if (!existsSync(join(skillDir, "mcp.json"))) failures.push("dist mcp.json missing");

if (failures.length > 0) {
  console.error("uni-app adapter verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("uni-app adapter verification passed.");
