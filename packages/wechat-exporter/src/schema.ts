import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodTypeAny } from "zod";

export function toJsonSchema(schema: ZodTypeAny, name: string): unknown {
  return zodToJsonSchema(schema, {
    name,
    target: "jsonSchema7",
    $refStrategy: "none"
  });
}
