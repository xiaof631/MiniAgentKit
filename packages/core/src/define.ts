import { DefinitionError, DuplicateNameError } from "./errors.js";
import type {
  AtomicApiConfig,
  AtomicApiDefinition,
  AtomicComponentConfig,
  AtomicComponentDefinition,
  SkillConfig,
  SkillDefinition
} from "./types.js";

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

function assertName(name: string, field: string): void {
  if (!NAME_PATTERN.test(name)) {
    throw new DefinitionError(`${field} must start with a letter and contain only letters, numbers, "_" or "-".`, {
      name
    });
  }
}

function assertDescription(description: string, field: string): void {
  if (!description || description.trim().length < 8) {
    throw new DefinitionError(`${field} description is too short.`);
  }
}

function assertUnique(names: string[]): void {
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(name)) {
      throw new DuplicateNameError(name);
    }
    seen.add(name);
  }
}

export function defineAtomicApi<T extends AtomicApiConfig>(definition: T): T & AtomicApiDefinition {
  assertName(definition.name, "Atomic API");
  assertDescription(definition.description, "Atomic API");

  if ((definition.riskLevel === "medium" || definition.riskLevel === "high") && !definition.requireUserConfirm) {
    throw new DefinitionError("Medium and high risk atomic APIs must require user confirmation.", {
      name: definition.name,
      riskLevel: definition.riskLevel
    });
  }

  return {
    ...definition,
    kind: "atomicApi"
  };
}

export const defineAction = defineAtomicApi;

export function defineAtomicComponent<T extends AtomicComponentConfig>(definition: T): T & AtomicComponentDefinition {
  assertName(definition.name, "Atomic component");

  if (!definition.path) {
    throw new DefinitionError("Atomic component path is required.", { name: definition.name });
  }

  return {
    ...definition,
    kind: "atomicComponent"
  };
}

export function defineSkill<T extends SkillConfig>(definition: T): T & SkillDefinition {
  assertName(definition.name, "Skill");
  assertDescription(definition.description, "Skill");
  assertUnique(definition.apis.map((api) => api.name));
  assertUnique((definition.components ?? []).map((component) => component.name));

  for (const flow of definition.flows ?? []) {
    for (const step of flow.steps) {
      if (!definition.apis.some((api) => api.name === step)) {
        throw new DefinitionError(`Flow references unknown atomic API: ${step}`, {
          skill: definition.name,
          intent: flow.intent,
          step
        });
      }
    }
  }

  return {
    ...definition,
    kind: "skill"
  };
}
