import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineAtomicApi, defineSkill } from "./define.js";

describe("core definitions", () => {
  it("requires confirmation for medium risk APIs", () => {
    expect(() =>
      defineAtomicApi({
        name: "createBooking",
        description: "Create a booking after user confirmation.",
        inputSchema: z.object({}),
        riskLevel: "medium"
      })
    ).toThrow(/must require user confirmation/);
  });

  it("defines a valid skill", () => {
    const searchServices = defineAtomicApi({
      name: "searchServices",
      description: "Search services by user intent.",
      inputSchema: z.object({ keyword: z.string().optional() }),
      riskLevel: "low"
    });

    const skill = defineSkill({
      name: "booking-skill",
      description: "Help users search services and create bookings.",
      apis: [searchServices],
      flows: [{ intent: "book a service", steps: ["searchServices"] }]
    });

    expect(skill.name).toBe("booking-skill");
  });
});
