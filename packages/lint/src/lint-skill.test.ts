import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { lintSkillDirectory } from "./lint-skill.js";

describe("lintSkillDirectory", () => {
  it("reports a valid minimal skill", () => {
    const dir = join(tmpdir(), `mak-lint-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), "# Test\n\n## 安全与合规\n");
    writeFileSync(join(dir, "index.js"), "module.exports = {}\n");
    writeFileSync(
      join(dir, "mcp.json"),
      JSON.stringify({
        apis: [
          {
            name: "searchServices",
            description: "Search services for booking use cases.",
            inputSchema: { type: "object" },
            _meta: { riskLevel: "low", requireUserConfirm: false }
          }
        ]
      })
    );

    expect(lintSkillDirectory(dir).ok).toBe(true);
  });
});
