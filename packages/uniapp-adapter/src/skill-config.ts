import { basename, join } from "node:path";
import { existsSync } from "node:fs";
import { readJsonFile } from "./fs-utils.js";
import type { UniappSkillConfig } from "./types.js";

interface MiniAgentSkillJson {
  name?: string;
  description?: string;
}

export interface ResolveSkillConfigOptions {
  uniappRoot: string;
  skillDir: string;
  skillName?: string;
  description?: string;
  sourceSkillsDir?: string;
}

export function resolveSkillConfig(options: ResolveSkillConfigOptions): UniappSkillConfig {
  const configPath = join(options.skillDir, "mini-agent.skill.json");
  const config = existsSync(configPath) ? readJsonFile<MiniAgentSkillJson>(configPath, {}) : {};
  const name = options.skillName ?? config.name ?? basename(options.skillDir);
  const description = options.description ?? config.description ?? "MiniAgentKit generated SKILL.";
  const sourceSkillsDir = options.sourceSkillsDir ?? "src/skills";

  return {
    name,
    description,
    sourceSkillDir: join(options.uniappRoot, sourceSkillsDir, name),
    sourceTargetDir: join(sourceSkillsDir, name),
    distTargetDir: join("skills", name),
    sourceSkillInputDir: options.skillDir
  } as UniappSkillConfig & { sourceSkillInputDir: string };
}
