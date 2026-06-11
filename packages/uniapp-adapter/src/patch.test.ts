import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { patchUniappMpWeixin } from "./patch.js";

function write(path: string, content: string): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, content);
}

describe("patchUniappMpWeixin", () => {
  it("copies prepared skill and patches app.json", () => {
    const root = join(tmpdir(), `mak-uniapp-${Date.now()}`);
    const dist = join(root, "dist/build/mp-weixin");

    write(join(root, "src/skills/booking-skill/SKILL.md"), "# Booking\n");
    write(join(root, "src/skills/booking-skill/mcp.json"), JSON.stringify({ apis: [] }));
    write(join(dist, "app.json"), JSON.stringify({ pages: ["pages/index/index"] }));

    const result = patchUniappMpWeixin({
      uniappRoot: root,
      distDir: dist,
      skillName: "booking-skill",
      description: "Booking skill"
    });

    expect(result.distSkillDir).toContain("skills/booking-skill");
    const appJson = JSON.parse(readFileSync(join(dist, "app.json"), "utf8"));
    expect(appJson.lazyCodeLoading).toBe("requiredComponents");
    expect(appJson.agent.skills[0].name).toBe("booking-skill");
  });
});
