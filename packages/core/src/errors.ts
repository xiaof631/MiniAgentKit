export class MiniAgentKitError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "MiniAgentKitError";
  }
}

export class DefinitionError extends MiniAgentKitError {
  constructor(message: string, details?: unknown) {
    super(message, "DEFINITION_ERROR", details);
    this.name = "DefinitionError";
  }
}

export class DuplicateNameError extends MiniAgentKitError {
  constructor(name: string) {
    super(`Duplicate definition name: ${name}`, "DUPLICATE_NAME", { name });
    this.name = "DuplicateNameError";
  }
}
