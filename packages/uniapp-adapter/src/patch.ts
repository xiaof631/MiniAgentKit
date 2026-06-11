import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { copyDirectory, readJsonFile, writeJsonFile } from "./fs-utils.js";
import { resolveSkillConfig } from "./skill-config.js";
import type { PatchUniappMpWeixinOptions, UniappAdapterResult } from "./types.js";

interface AppJson {
  lazyCodeLoading?: string;
  subPackages?: Array<Record<string, unknown>>;
  agent?: {
    skills?: Array<Record<string, unknown>>;
    instruction?: string;
    pageMetadata?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function upsertByKey<T extends Record<string, unknown>>(items: T[], key: string, value: string, next: T): T[] {
  const index = items.findIndex((item) => item[key] === value);
  if (index === -1) return [...items, next];
  return items.map((item, currentIndex) => (currentIndex === index ? { ...item, ...next } : item));
}

export function patchUniappMpWeixin(options: PatchUniappMpWeixinOptions): UniappAdapterResult {
  const config = resolveSkillConfig({
    uniappRoot: options.uniappRoot,
    skillDir: join(options.uniappRoot, options.sourceSkillsDir ?? "src/skills", options.skillName ?? ""),
    skillName: options.skillName,
    description: options.description,
    sourceSkillsDir: options.sourceSkillsDir
  });

  if (!config.name) {
    throw new Error("Missing skill name.");
  }

  const sourceSkillDir = join(options.uniappRoot, options.sourceSkillsDir ?? "src/skills", config.name);
  if (!existsSync(sourceSkillDir)) {
    throw new Error(`Prepared uni-app skill directory does not exist: ${sourceSkillDir}`);
  }

  const distSkillDir = join(options.distDir, "skills", config.name);
  copyDirectory(sourceSkillDir, distSkillDir);

  const appJsonPath = join(options.distDir, "app.json");
  const appJson = readJsonFile<AppJson>(appJsonPath, {});
  const subPackages = Array.isArray(appJson.subPackages) ? appJson.subPackages : [];
  const skills = Array.isArray(appJson.agent?.skills) ? appJson.agent!.skills! : [];

  const instruction = options.instructionPath ?? "AGENTS.md";
  const pageMetadata = options.pageMetadataPath ?? "page-meta.json";

  const nextAppJson: AppJson = {
    ...appJson,
    lazyCodeLoading: "requiredComponents",
    subPackages: upsertByKey(subPackages, "root", `skills/${config.name}`, {
      root: `skills/${config.name}`,
      independent: true,
      pages: []
    }),
    agent: {
      ...(appJson.agent ?? {}),
      skills: upsertByKey(skills, "name", config.name, {
        name: config.name,
        description: config.description,
        path: `/skills/${config.name}`
      }),
      instruction,
      pageMetadata
    }
  };

  mkdirSync(options.distDir, { recursive: true });
  writeJsonFile(appJsonPath, nextAppJson);

  return {
    skillName: config.name,
    sourceSkillDir,
    distSkillDir,
    appJsonPath
  };
}
