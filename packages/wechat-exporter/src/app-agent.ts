import type { SkillDefinition } from "@mini-agent-kit/core";
import type { AppAgentSnippet } from "./types.js";

export interface ExportAppAgentOptions {
  skillPath?: string;
  instruction?: string;
  pageMetadata?: string;
}

export function exportAppAgentSnippet(skill: SkillDefinition, options: ExportAppAgentOptions = {}): AppAgentSnippet {
  return {
    lazyCodeLoading: "requiredComponents",
    agent: {
      skills: [
        {
          name: skill.name,
          description: skill.description,
          path: options.skillPath ?? `/skills/${skill.name}`
        }
      ],
      instruction: options.instruction,
      pageMetadata: options.pageMetadata
    }
  };
}
