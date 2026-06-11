import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const demoDir = "apps/demo-booking-miniprogram";
const skillDir = join(demoDir, "skills/booking-skill");
const failures = [];

function fail(message) {
  failures.push(message);
}

function requireFile(path) {
  if (!existsSync(path)) {
    fail(`Missing file: ${path}`);
  }
}

function readJson(path) {
  requireFile(path);
  return JSON.parse(readFileSync(path, "utf8"));
}

const appJson = readJson(join(demoDir, "app.json"));
const mcpJson = readJson(join(skillDir, "mcp.json"));

requireFile(join(demoDir, "AGENTS.md"));
requireFile(join(demoDir, "page-meta.json"));
requireFile(join(skillDir, "SKILL.md"));
requireFile(join(skillDir, "index.js"));
requireFile(join(skillDir, "apis/searchServices.js"));
requireFile(join(skillDir, "apis/getAvailableSlots.js"));
requireFile(join(skillDir, "apis/createBooking.js"));

if (appJson.lazyCodeLoading !== "requiredComponents") {
  fail("app.json must set lazyCodeLoading to requiredComponents.");
}

const hasBookingSubpackage = appJson.subPackages?.some(
  (item) => item.root === "skills/booking-skill" && item.independent === true
);
if (!hasBookingSubpackage) {
  fail("app.json must declare skills/booking-skill as an independent subpackage.");
}

const bookingSkill = appJson.agent?.skills?.find((item) => item.name === "booking-skill");
if (!bookingSkill) {
  fail("app.json must declare agent.skills booking-skill.");
}
if (bookingSkill && bookingSkill.path !== "/skills/booking-skill") {
  fail("booking-skill path must be /skills/booking-skill.");
}

if (!Array.isArray(mcpJson.apis) || mcpJson.apis.length < 3) {
  fail("mcp.json must contain at least three APIs.");
}

const createBooking = mcpJson.apis?.find((api) => api.name === "createBooking");
if (!createBooking) {
  fail("mcp.json must contain createBooking API.");
}
if (createBooking?._meta?.riskLevel !== "medium" || createBooking?._meta?.requireUserConfirm !== true) {
  fail("createBooking must be medium risk and require user confirmation.");
}

if (failures.length > 0) {
  console.error("Demo verification failed:");
  for (const item of failures) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Demo verification passed.");
