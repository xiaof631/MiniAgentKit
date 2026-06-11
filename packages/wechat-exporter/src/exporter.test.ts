import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineAtomicApi, defineSkill } from "@mini-agent-kit/core";
import { exportAppAgentSnippet, exportSkillMarkdown, exportWechatMcpJson } from "./index.js";

describe("wechat exporter", () => {
  const createBooking = defineAtomicApi({
    name: "createBooking",
    description: "Create a booking after the user confirms service and time.",
    inputSchema: z.object({
      serviceId: z.string().describe("Service ID from searchServices.")
    }),
    riskLevel: "medium",
    requireUserConfirm: true,
    ui: { componentPath: "components/booking-confirm/index" }
  });

  const skill = defineSkill({
    name: "booking-skill",
    description: "Help users create service bookings.",
    apis: [createBooking]
  });

  it("exports mcp json", () => {
    const mcp = exportWechatMcpJson(skill);
    expect(mcp.apis[0]?.name).toBe("createBooking");
    expect(mcp.apis[0]?._meta?.ui?.componentPath).toBe("components/booking-confirm/index");
  });

  it("exports skill markdown", () => {
    expect(exportSkillMarkdown(skill)).toContain("原子接口依赖");
  });

  it("exports app agent snippet", () => {
    expect(exportAppAgentSnippet(skill).agent.skills[0]?.path).toBe("/skills/booking-skill");
  });
});
