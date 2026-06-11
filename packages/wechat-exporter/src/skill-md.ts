import type { AtomicApiDefinition, SkillDefinition } from "@mini-agent-kit/core";

function section(title: string, lines: string[]): string {
  if (lines.length === 0) return "";
  return [`## ${title}`, "", ...lines, ""].join("\n");
}

function list(lines: string[] | undefined, fallback: string): string[] {
  if (!lines || lines.length === 0) return [`- ${fallback}`];
  return lines.map((line) => `- ${line}`);
}

function apiDependencyLine(api: AtomicApiDefinition): string {
  const confirm = api.requireUserConfirm ? "需要用户确认" : "不需要用户确认";
  const component = api.ui?.componentPath ? `，展示组件：${api.ui.componentPath}` : "";
  return `- \`${api.name}\`：${api.description} 风险等级：${api.riskLevel}，${confirm}${component}`;
}

export function exportSkillMarkdown(skill: SkillDefinition): string {
  const lines: string[] = [
    `# ${skill.title ?? skill.name}`,
    "",
    skill.description,
    "",
    "> 本文件由 MiniAgentKit 生成，用于说明该 SKILL 的业务范围、接口依赖和执行约束。",
    ""
  ];

  lines.push(
    section("服务范围", list(skill.instruction?.serviceScope, "围绕本 SKILL 描述的业务场景提供服务。"))
  );

  lines.push(section("不做什么", list(skill.instruction?.notAllowed, "不处理超出本 SKILL 范围的请求。")));

  lines.push(section("业务约束", list(skill.instruction?.constraints, "动作类接口必须在确认后执行。")));

  lines.push(
    section(
      "业务流程",
      (skill.flows ?? []).length > 0
        ? skill.flows!.flatMap((flow) => [
            `### ${flow.intent}`,
            "",
            ...flow.steps.map((step, index) => `${index + 1}. 调用 \`${step}\``),
            ""
          ])
        : ["- 当前模板未声明具体流程。"]
    )
  );

  lines.push(section("原子接口依赖", skill.apis.map(apiDependencyLine)));

  lines.push(
    section("原子接口返回要求", [
      "- `content` 必须说明本次调用事实和下一步动作。",
      "- `structuredContent` 放模型和组件都需要理解的结构化业务数据。",
      "- `_meta` 放仅用于组件渲染的图片、价格、展示辅助数据。",
      "- 失败或空结果必须说明具体原因，并给出下一步出口。"
    ])
  );

  lines.push(
    section("安全与合规", [
      "- 中高风险接口不得在用户确认前宣称已经完成。",
      "- 业务 ID 必须来自上游接口真实返回，不得从用户自然语言编造。",
      "- 手机号、身份证、详细地址等敏感信息不得明文展示在上行消息或卡片摘要中。",
      "- 医疗、康养、理疗相关场景不得诊断疾病、承诺疗效或替代医生建议。"
    ])
  );

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
