export interface WechatMcpJson {
  apis: Array<{
    name: string;
    description: string;
    inputSchema: unknown;
    outputSchema?: unknown;
    _meta?: {
      ui?: {
        componentPath?: string;
      };
      riskLevel?: string;
      requireUserConfirm?: boolean;
    };
  }>;
  components?: Array<{
    name: string;
    path: string;
    description?: string;
    permissions?: string[];
  }>;
}

export interface AppAgentSkill {
  name: string;
  description: string;
  path: string;
}

export interface AppAgentSnippet {
  lazyCodeLoading: "requiredComponents";
  agent: {
    skills: AppAgentSkill[];
    instruction?: string;
    pageMetadata?: string;
  };
}

export interface WechatEvalCase {
  intent: string;
  checklist?: Array<{
    evidence: string;
    scoring_criteria: Record<string, string>;
  }>;
}

export interface WechatEvalCases {
  cases: WechatEvalCase[];
}
