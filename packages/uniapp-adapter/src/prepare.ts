import { join } from "node:path";
import { copyDirectory, writeJsonFile, writeTextFile } from "./fs-utils.js";
import { resolveSkillConfig } from "./skill-config.js";
import type { PrepareUniappSkillOptions, UniappAdapterResult } from "./types.js";

export function prepareUniappSkill(options: PrepareUniappSkillOptions): UniappAdapterResult {
  const config = resolveSkillConfig({
    uniappRoot: options.uniappRoot,
    skillDir: options.skillDir,
    skillName: options.skillName,
    description: options.description,
    sourceSkillsDir: options.sourceSkillsDir
  });
  const inputDir = (config as typeof config & { sourceSkillInputDir: string }).sourceSkillInputDir;

  copyDirectory(inputDir, config.sourceSkillDir);

  const adapterConfigPath = join(options.uniappRoot, "mini-agent.uniapp.json");
  writeJsonFile(adapterConfigPath, {
    skills: [
      {
        name: config.name,
        description: config.description,
        source: config.sourceTargetDir,
        dist: config.distTargetDir
      }
    ],
    mpWeixin: {
      instruction: options.instructionPath ?? "AGENTS.md",
      pageMetadata: options.pageMetadataPath ?? "page-meta.json"
    }
  });

  const readmePath = join(options.uniappRoot, "MINI_AGENT_UNIAPP.md");
  writeTextFile(
    readmePath,
    `# MiniAgentKit uni-app 接入说明

已准备 SKILL：\`${config.name}\`

源码目录：

\`\`\`text
${config.sourceTargetDir}
\`\`\`

构建微信小程序后运行：

\`\`\`bash
mak uniapp patch --project <uniapp-root> --dist <uniapp-root>/dist/build/mp-weixin --skill ${config.name}
\`\`\`
`
  );

  return {
    skillName: config.name,
    sourceSkillDir: config.sourceSkillDir,
    configPath: adapterConfigPath
  };
}
