import type { SkillDefinition } from "@mini-agent-kit/core";
import type { WechatEvalCases } from "./types.js";

function defaultChecklist(skillName: string) {
  return [
    {
      evidence: `是否调用 ${skillName} 中合适的原子接口，并遵守确认和字段校验要求。`,
      scoring_criteria: {
        "1.0": "完整调用正确接口，字段来源清晰，中高风险动作有确认。",
        "0.5": "能完成主要流程，但字段、确认或错误处理不完整。",
        "0.0": "未调用正确能力，或未执行就宣称已经完成。"
      }
    }
  ];
}

export function exportEvalCases(skill: SkillDefinition): WechatEvalCases {
  const cases =
    skill.evalCases && skill.evalCases.length > 0
      ? skill.evalCases
      : [
          {
            intent: `使用 ${skill.title ?? skill.name} 完成一个典型业务流程。`,
            checklist: defaultChecklist(skill.name)
          }
        ];

  return {
    cases: cases.map((item) => ({
      intent: item.intent,
      checklist: item.checklist ?? defaultChecklist(skill.name)
    }))
  };
}
