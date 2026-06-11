import type { SkillDefinition } from "@mini-agent-kit/core";

export function exportIndexJs(skill: SkillDefinition): string {
  const imports = skill.apis
    .map((api) => `const ${api.name} = require('./apis/${api.name}')`)
    .join("\n");
  const registrations = skill.apis.map((api) => `  ${api.name}`).join(",\n");

  return `${imports}

module.exports = {
${registrations}
}
`;
}
