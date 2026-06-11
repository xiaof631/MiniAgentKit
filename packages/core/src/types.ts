import type { ZodTypeAny } from "zod";

export type RiskLevel = "low" | "medium" | "high";

export type HandlerTemplate = "mock" | "cloudfunction" | "request" | "custom";

export interface AtomicApiUi {
  componentPath?: string;
  relatedPage?: string;
}

export interface AtomicApiDefinition<
  TInputSchema extends ZodTypeAny = ZodTypeAny,
  TOutputSchema extends ZodTypeAny = ZodTypeAny
> {
  kind: "atomicApi";
  name: string;
  title?: string;
  description: string;
  inputSchema: TInputSchema;
  outputSchema?: TOutputSchema;
  riskLevel: RiskLevel;
  requireUserConfirm?: boolean;
  ui?: AtomicApiUi;
  handlerTemplate?: HandlerTemplate;
}

export type AtomicApiConfig<
  TInputSchema extends ZodTypeAny = ZodTypeAny,
  TOutputSchema extends ZodTypeAny = ZodTypeAny
> = Omit<AtomicApiDefinition<TInputSchema, TOutputSchema>, "kind">;

export interface AtomicComponentDefinition {
  kind: "atomicComponent";
  name: string;
  title?: string;
  description?: string;
  path: string;
  permissions?: string[];
}

export type AtomicComponentConfig = Omit<AtomicComponentDefinition, "kind">;

export interface SkillInstruction {
  serviceScope?: string[];
  constraints?: string[];
  notAllowed?: string[];
}

export interface SkillFlow {
  intent: string;
  steps: string[];
}

export interface EvalChecklistItem {
  evidence: string;
  scoring_criteria: Record<string, string>;
}

export interface EvalCaseDefinition {
  intent: string;
  checklist?: EvalChecklistItem[];
}

export interface SkillDefinition {
  kind: "skill";
  name: string;
  title?: string;
  description: string;
  instruction?: SkillInstruction;
  apis: AtomicApiDefinition[];
  components?: AtomicComponentDefinition[];
  flows?: SkillFlow[];
  evalCases?: EvalCaseDefinition[];
}

export type SkillConfig = Omit<SkillDefinition, "kind">;

export interface AtomicApiResult<TStructured = unknown, TMeta = unknown> {
  isError?: boolean;
  content: Array<{
    type: "text";
    text: string;
  }>;
  structuredContent?: TStructured;
  _meta?: TMeta;
}
