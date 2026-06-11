import type { SkillDefinition } from "@mini-agent-kit/core";
import { toJsonSchema } from "./schema.js";
import type { WechatMcpJson } from "./types.js";

export function exportWechatMcpJson(skill: SkillDefinition): WechatMcpJson {
  return {
    apis: skill.apis.map((api) => ({
      name: api.name,
      description: api.description,
      inputSchema: toJsonSchema(api.inputSchema, `${api.name}Input`),
      outputSchema: api.outputSchema ? toJsonSchema(api.outputSchema, `${api.name}Output`) : undefined,
      _meta: {
        ui: api.ui?.componentPath
          ? {
              componentPath: api.ui.componentPath
            }
          : undefined,
        riskLevel: api.riskLevel,
        requireUserConfirm: api.requireUserConfirm ?? false
      }
    })),
    components: (skill.components ?? []).map((component) => ({
      name: component.name,
      path: component.path,
      description: component.description,
      permissions: component.permissions
    }))
  };
}
