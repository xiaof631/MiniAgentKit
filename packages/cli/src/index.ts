#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { lintSkillDirectory } from "@mini-agent-kit/lint";
import { createBookingSkill } from "./booking-template.js";
import { readOption } from "./options.js";

function printHelp(): void {
  console.log(`MiniAgentKit CLI

Usage:
  mak init
  mak create-skill booking --name booking-skill --output skills/booking-skill
  mak export wechat --skill skills/booking-skill
  mak lint skills/booking-skill
  mak eval generate --skill skills/booking-skill --out tests/booking.eval.json
`);
}

function ensureParent(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
}

function commandInit(): void {
  if (!existsSync("mini-agent.config.json")) {
    writeFileSync(
      "mini-agent.config.json",
      JSON.stringify(
        {
          skillsDir: "skills",
          defaultTemplate: "booking"
        },
        null,
        2
      ) + "\n"
    );
  }

  if (!existsSync("AGENTS.md")) {
    writeFileSync(
      "AGENTS.md",
      "# 小程序 AI 全局提示词\n\n本小程序通过 MiniAgentKit 组织 SKILL。请优先根据 SKILL.md 和 mcp.json 选择合适的原子接口。\n"
    );
  }

  console.log("Initialized MiniAgentKit config.");
}

function commandCreateSkill(args: string[]): void {
  const template = args[1];
  if (template !== "booking") {
    throw new Error(`Unsupported template: ${template ?? "(missing)"}`);
  }

  const name = readOption(args, "--name", "booking-skill")!;
  const output = readOption(args, "--output", join("skills", name))!;
  createBookingSkill({ name, output });
  console.log(`Created booking skill at ${output}`);
}

function commandExportWechat(args: string[]): void {
  const skillDir = readOption(args, "--skill");
  if (!skillDir) throw new Error("Missing --skill <dir>");

  const configPath = join(skillDir, "mini-agent.skill.json");
  const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : {};
  const name = String(config.name ?? skillDir.split("/").pop() ?? "skill");
  const description = String(config.description ?? "MiniAgentKit generated SKILL.");
  const snippet = {
    lazyCodeLoading: "requiredComponents",
    agent: {
      skills: [
        {
          name,
          description,
          path: config.path ?? `/${skillDir.replace(/\\/g, "/")}`
        }
      ],
      instruction: "AGENTS.md",
      pageMetadata: "page-meta.json"
    }
  };

  const out = join(skillDir, "app-agent-snippet.json");
  writeFileSync(out, JSON.stringify(snippet, null, 2) + "\n");
  console.log(`Exported WeChat app agent snippet to ${out}`);
}

function commandLint(args: string[]): void {
  const skillDir = args[1];
  if (!skillDir) throw new Error("Missing skill directory.");

  const report = lintSkillDirectory(skillDir);
  for (const item of report.issues) {
    console.log(`${item.severity.toUpperCase()} ${item.code}: ${item.message}${item.file ? ` (${item.file})` : ""}`);
  }

  if (!report.ok) {
    process.exitCode = 1;
  } else {
    console.log("Lint passed.");
  }
}

function commandEval(args: string[]): void {
  const subcommand = args[1];
  if (subcommand !== "generate") {
    throw new Error(`Unsupported eval command: ${subcommand ?? "(missing)"}`);
  }

  const skillDir = readOption(args, "--skill");
  const out = readOption(args, "--out", "booking.eval.json")!;
  if (!skillDir) throw new Error("Missing --skill <dir>");

  const configPath = join(skillDir, "mini-agent.skill.json");
  const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : {};
  const cases = config.evalCases ?? [
    {
      intent: "完成一个典型预约服务流程",
      checklist: [
        {
          evidence: "是否调用正确原子接口，并在创建预约前确认。",
          scoring_criteria: {
            "1.0": "流程完整且确认清晰。",
            "0.5": "流程部分完成。",
            "0.0": "未完成核心流程。"
          }
        }
      ]
    }
  ];

  ensureParent(out);
  writeFileSync(out, JSON.stringify({ cases }, null, 2) + "\n");
  console.log(`Generated eval cases at ${out}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case undefined:
      case "--help":
      case "-h":
        printHelp();
        break;
      case "init":
        commandInit();
        break;
      case "create-skill":
        commandCreateSkill(args);
        break;
      case "export":
        if (args[1] !== "wechat") throw new Error("Only `mak export wechat` is supported.");
        commandExportWechat(args);
        break;
      case "lint":
        commandLint(args);
        break;
      case "eval":
        commandEval(args);
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 1;
  }
}

void main();
