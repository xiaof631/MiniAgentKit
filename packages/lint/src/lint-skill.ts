import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LintIssue, LintReport } from "./types.js";

function issue(severity: "error" | "warning", code: string, message: string, file?: string): LintIssue {
  return { severity, code, message, file };
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function hasObjectValue(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function lintSkillDirectory(skillDir: string): LintReport {
  const issues: LintIssue[] = [];
  const requiredFiles = ["SKILL.md", "mcp.json", "index.js"];

  for (const file of requiredFiles) {
    if (!existsSync(join(skillDir, file))) {
      issues.push(issue("error", "MISSING_REQUIRED_FILE", `Missing required file: ${file}`, file));
    }
  }

  const mcpPath = join(skillDir, "mcp.json");
  if (existsSync(mcpPath)) {
    try {
      const mcp = readJson(mcpPath);
      if (!hasObjectValue(mcp)) {
        issues.push(issue("error", "INVALID_MCP_JSON", "mcp.json must be a JSON object.", "mcp.json"));
      } else {
        const apis = mcp.apis;
        if (!Array.isArray(apis) || apis.length === 0) {
          issues.push(issue("error", "MISSING_APIS", "mcp.json must contain at least one API.", "mcp.json"));
        } else {
          for (const api of apis) {
            if (!hasObjectValue(api)) {
              issues.push(issue("error", "INVALID_API", "Each API entry must be an object.", "mcp.json"));
              continue;
            }

            const name = String(api.name ?? "");
            const description = String(api.description ?? "");

            if (!name) {
              issues.push(issue("error", "API_NAME_REQUIRED", "API name is required.", "mcp.json"));
            }
            if (["search", "submit", "handle"].includes(name)) {
              issues.push(issue("warning", "API_NAME_TOO_GENERIC", `API name is too generic: ${name}`, "mcp.json"));
            }
            if (description.length < 16) {
              issues.push(issue("warning", "API_DESCRIPTION_TOO_SHORT", `API description is too short: ${name}`, "mcp.json"));
            }
            if (!api.inputSchema) {
              issues.push(issue("error", "INPUT_SCHEMA_REQUIRED", `API inputSchema is required: ${name}`, "mcp.json"));
            }

            const meta = hasObjectValue(api._meta) ? api._meta : {};
            const riskLevel = meta.riskLevel;
            const requireUserConfirm = meta.requireUserConfirm;
            if ((riskLevel === "medium" || riskLevel === "high") && requireUserConfirm !== true) {
              issues.push(
                issue(
                  "error",
                  "CONFIRM_REQUIRED",
                  `Medium/high risk API must require user confirmation: ${name}`,
                  "mcp.json"
                )
              );
            }
          }
        }
      }
    } catch (error) {
      issues.push(issue("error", "MCP_JSON_PARSE_FAILED", `Failed to parse mcp.json: ${(error as Error).message}`, "mcp.json"));
    }
  }

  const skillMdPath = join(skillDir, "SKILL.md");
  if (existsSync(skillMdPath)) {
    const skillMd = readFileSync(skillMdPath, "utf8");
    if (!skillMd.includes("安全") && !skillMd.includes("合规")) {
      issues.push(issue("warning", "MISSING_SAFETY_SECTION", "SKILL.md should include safety or compliance constraints.", "SKILL.md"));
    }
  }

  return {
    ok: !issues.some((item) => item.severity === "error"),
    issues
  };
}
