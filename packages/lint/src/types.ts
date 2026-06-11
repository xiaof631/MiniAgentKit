export type LintSeverity = "error" | "warning";

export interface LintIssue {
  severity: LintSeverity;
  code: string;
  message: string;
  file?: string;
}

export interface LintReport {
  ok: boolean;
  issues: LintIssue[];
}
