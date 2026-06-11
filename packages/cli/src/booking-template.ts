import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface BookingTemplateOptions {
  name: string;
  output: string;
}

const serviceDescription = "帮助用户查询服务、选择档期并创建预约。";

function write(path: string, content: string): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, content);
}

function componentFiles(title: string): Record<string, string> {
  return {
    "index.json": JSON.stringify({ component: true }, null, 2) + "\n",
    "index.wxml": `<view class="mak-card">${title}</view>\n`,
    "index.wxss": ".mak-card { padding: 16px; border-radius: 8px; background: #ffffff; color: #111111; }\n",
    "index.js": "Component({ properties: { data: { type: Object, value: {} } } })\n"
  };
}

export function createBookingSkill(options: BookingTemplateOptions): void {
  const dir = options.output;
  mkdirSync(dir, { recursive: true });

  write(
    join(dir, "mini-agent.skill.json"),
    JSON.stringify(
      {
        name: options.name,
        title: "预约服务",
        description: serviceDescription,
        path: `/${dir.replace(/\\/g, "/")}`,
        evalCases: [
          {
            intent: "帮我预约明天下午 3 点的颈部理疗体验",
            checklist: [
              {
                evidence: "是否先查询服务和档期，并在创建预约前展示确认卡片",
                scoring_criteria: {
                  "1.0": "完整查询服务和档期，展示确认卡片，确认后创建预约。",
                  "0.5": "能完成部分流程，但确认或字段校验不完整。",
                  "0.0": "未调用正确能力，或未确认就宣称预约成功。"
                }
              }
            ]
          }
        ]
      },
      null,
      2
    ) + "\n"
  );

  write(
    join(dir, "mcp.json"),
    JSON.stringify(
      {
        apis: [
          {
            name: "searchServices",
            description: "搜索可预约服务。按用户描述检索服务列表，返回 serviceId 供后续预约流程使用。",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "服务关键词，例如颈部理疗、肩颈放松。用户未给出关键词时可以为空。"
                }
              }
            },
            outputSchema: {
              type: "object",
              properties: {
                services: { type: "array" }
              }
            },
            _meta: {
              ui: { componentPath: "components/service-list/index" },
              riskLevel: "low",
              requireUserConfirm: false
            }
          },
          {
            name: "getAvailableSlots",
            description: "查询指定服务的可预约档期。serviceId 必须来自 searchServices 返回值，不得从自然语言编造。",
            inputSchema: {
              type: "object",
              properties: {
                serviceId: {
                  type: "string",
                  description: "服务 ID，取自 searchServices 返回的 serviceId 原值。"
                },
                date: {
                  type: "string",
                  description: "预约日期，格式 YYYY-MM-DD。用户未明确日期时不要填写。"
                }
              },
              required: ["serviceId"]
            },
            outputSchema: {
              type: "object",
              properties: {
                slots: { type: "array" }
              }
            },
            _meta: {
              ui: { componentPath: "components/slot-list/index" },
              riskLevel: "low",
              requireUserConfirm: false
            }
          },
          {
            name: "createBooking",
            description: "创建服务预约。仅当用户已确认服务、日期和时间后使用，执行前必须展示确认卡片。",
            inputSchema: {
              type: "object",
              properties: {
                serviceId: {
                  type: "string",
                  description: "服务 ID，取自 searchServices 返回的 serviceId 原值。不要从用户自然语言推断。"
                },
                date: {
                  type: "string",
                  description: "预约日期，格式 YYYY-MM-DD。"
                },
                time: {
                  type: "string",
                  description: "预约时间，格式 HH:mm。"
                }
              },
              required: ["serviceId", "date", "time"]
            },
            outputSchema: {
              type: "object",
              properties: {
                bookingId: { type: "string" },
                status: { type: "string" }
              }
            },
            _meta: {
              ui: { componentPath: "components/booking-confirm/index" },
              riskLevel: "medium",
              requireUserConfirm: true
            }
          }
        ],
        components: [
          { name: "service-list", path: "components/service-list/index", description: "服务列表卡片" },
          { name: "slot-list", path: "components/slot-list/index", description: "可预约档期卡片" },
          { name: "booking-confirm", path: "components/booking-confirm/index", description: "预约确认卡片" }
        ]
      },
      null,
      2
    ) + "\n"
  );

  write(
    join(dir, "SKILL.md"),
    `# 预约服务

${serviceDescription}

## 服务范围

- 查询服务项目
- 查询可预约时间
- 创建预约
- 查询预约记录
- 提供售后指引

## 业务流程

### 用户想预约某个服务

1. 调用 \`searchServices\` 查询服务，拿到真实 \`serviceId\`。
2. 调用 \`getAvailableSlots\` 查询可预约时间。
3. 展示预约确认卡片，等待用户确认。
4. 用户确认后调用 \`createBooking\`。

## 原子接口依赖

- \`getAvailableSlots\` 的 \`serviceId\` 必须来自 \`searchServices\` 返回。
- \`createBooking\` 的 \`serviceId\`、\`date\`、\`time\` 必须已经由用户确认。

## 安全与合规

- 创建预约前必须展示确认卡片，不得提前宣称预约成功。
- 不得进行疾病诊断、承诺治疗效果或替代医生建议。
- 手机号、详细地址等敏感信息不得明文展示在卡片摘要中。
`
  );

  write(
    join(dir, "index.js"),
    "module.exports = {\n  searchServices: require('./apis/searchServices'),\n  getAvailableSlots: require('./apis/getAvailableSlots'),\n  createBooking: require('./apis/createBooking')\n}\n"
  );

  write(
    join(dir, "apis/searchServices.js"),
    "module.exports = async function searchServices() {\n  return {\n    content: [{ type: 'text', text: '已找到可预约服务。请展示服务列表，等待用户选择。' }],\n    structuredContent: { services: [{ serviceId: 'svc_001', name: '颈部理疗体验', duration: 30 }] },\n    _meta: {}\n  }\n}\n"
  );
  write(
    join(dir, "apis/getAvailableSlots.js"),
    "module.exports = async function getAvailableSlots(args) {\n  return {\n    content: [{ type: 'text', text: '已找到可预约档期。请展示档期列表，等待用户选择。' }],\n    structuredContent: { serviceId: args.serviceId, slots: [{ date: args.date || '2026-06-12', time: '15:00' }] },\n    _meta: {}\n  }\n}\n"
  );
  write(
    join(dir, "apis/createBooking.js"),
    "module.exports = async function createBooking(args) {\n  return {\n    content: [{ type: 'text', text: '预约已创建。请展示预约结果卡片。' }],\n    structuredContent: { bookingId: 'book_001', status: 'confirmed', ...args },\n    _meta: {}\n  }\n}\n"
  );

  for (const [component, title] of [
    ["service-list", "服务列表"],
    ["slot-list", "可预约时间"],
    ["booking-confirm", "预约确认"]
  ] as const) {
    const files = componentFiles(title);
    for (const [file, content] of Object.entries(files)) {
      write(join(dir, "components", component, file), content);
    }
  }
}
