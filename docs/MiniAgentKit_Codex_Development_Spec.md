# MiniAgentKit：微信小程序 AI 开发模式基建框架开发任务书

> 版本：v0.2  
> 日期：2026-06-11  
> 目标读者：Codex / Claude Code / Cursor / 具备 TypeScript + 微信小程序 + Node.js 经验的开发者  
> 项目目标：开源一个面向微信小程序 AI 开发模式的基建框架，帮助开发者在 AICoding 辅助下，把已有小程序快速改造成可被微信 AI 调用的 SKILL 工程。  
> 重要说明：本项目不是微信官方 SDK，不调用任何未公开接口。项目只基于微信开放文档中已经公开的小程序 AI 开发模式 beta 文档和官方 demo 进行工程化封装、模板生成、规则校验和评测准备。当前微信官方文档明确说明开发模式处于 beta/内测阶段，暂未开放代码提审，项目不得承诺正式版可上线。

---

## 0. 背景判断

微信小程序 AI 开发模式提供了一套面向小程序业务能力的 AI 调用框架。官方文档中，开发者需要把小程序功能抽象为原子接口和原子组件，并封装成 SKILL，供小程序 AI 通过小程序 MCP 进行推理、调用和展示。

官方体系中的关键概念包括：

- 小程序 MCP：微信小程序 AI 与开发者 SKILL 之间的能力调用协议。
- 原子接口：最小业务执行单元，具有标准化输入和输出。
- 原子组件：原子接口返回数据的 GUI 卡片展示单元。
- SKILL：一个完整业务场景能力包，包含 `SKILL.md`、`mcp.json`、原子接口和原子组件。
- 全局提示词：通常是 `AGENTS.md`，用于说明整体服务范围和多个 SKILL 之间的关系。
- 评测工具：官方提供 `wxa-skills-eval` 用于开发者自测，后续会有正式评测提审工具和通过标准。

官方 demo `wechat-miniprogram/ai-mode-demo` 展示了一个点单 SKILL 的完整工程形态，包括：

- `app.json` 中的 `agent.skills` 配置
- 独立分包 `skills/drink-skill`
- `SKILL.md`
- `mcp.json`
- `index.js`
- `apis/`
- `components/`
- 半屏页面
- `page-meta.json`

这说明 MiniAgentKit 的机会点不是再做一个 demo，而是做一个开发者和 Coding Agent 都能依赖的工程化基建：

> 把已有小程序改造成微信 AI SKILL，需要一套稳定的定义、生成、校验、评测和迁移流程。

---

## 1. 项目定位

**MiniAgentKit 是一个面向微信小程序 AI 开发模式的开源基建框架，帮助开发者用 AICoding 快速识别业务能力、定义原子接口、生成 SKILL 工程、导出官方 `mcp.json` / `SKILL.md` / `app.json` 配置片段，并完成本地校验和评测准备。**

更适合对外传播的版本：

> 用 AICoding 把已有小程序快速改造成微信 AI 可调用的 SKILL。

项目不是：

- 不是微信官方 SDK。
- 不是替代微信小程序 AI 后台的运行时。
- 不是通用聊天机器人框架。
- 不是 SaaS 管理后台。
- 不是多智能体编排平台。

项目应该成为：

- 微信小程序 AI 开发模式的工程脚手架。
- 小程序业务能力 Action 化、原子接口化的约定层。
- Coding Agent 改造已有小程序时的结构化工作台。
- 官方 SKILL 工程文件的生成器和校验器。
- 自定义评测集和本地 mock 评测的辅助工具。

---

## 2. 官方概念与 MiniAgentKit 概念映射

MiniAgentKit 可以保留更通用的 Action / Skill DSL，但导出目标必须对齐微信官方 AI 开发模式。

| MiniAgentKit 概念 | 微信官方概念 | 说明 |
|---|---|---|
| `defineSkill()` | SKILL | 定义一个完整业务场景能力包 |
| `defineAction()` / `defineAtomicApi()` | 原子接口 | 定义最小业务执行单元 |
| `defineAtomicComponent()` | 原子组件 | 定义对话流中的 GUI 卡片 |
| `riskPolicy` | 业务约束 / 确认流程 | 描述下单、支付、取消、地址修改等高风险动作 |
| `flow` | `SKILL.md` 中的业务流程 | 描述用户意图到接口调用的编排关系 |
| `exportWechatSkill()` | `mcp.json` / `SKILL.md` / `app.json` 片段 | 生成官方工程文件 |
| `evalCases` | 官方自定义评测集 | 导出给 `wxa-skills-eval` 或本地 eval 使用 |
| `localIntentRouter` | 本地模拟器 | 仅用于非微信环境模拟，不是官方主链路 |

重要设计原则：

- 在微信 AI 开发模式中，模型路由主要由微信 AI 基于 `AGENTS.md`、`SKILL.md`、`mcp.json`、接口描述、字段描述和接口返回 `content` 决策。
- MiniAgentKit 的 Intent Router 不应作为官方主链路，而应作为本地开发、CI、非微信环境 demo 和 mock eval 的辅助能力。
- MiniAgentKit 的核心价值是让开发者更容易产出高质量 SKILL，而不是替代微信 AI 的推理层。

---

## 3. AICoding 主工作流

MiniAgentKit 的第一等用户不是最终 C 端用户，而是开发者和 Coding Agent。

标准改造流程：

```txt
已有小程序代码
→ mak scan
→ 生成业务能力候选清单
→ 开发者确认 SKILL 范围
→ mak create-skill booking
→ 生成原子接口 / 原子组件 / SKILL.md / mcp.json
→ mak lint
→ mak eval
→ 微信开发者工具调试
→ 使用官方 wxa-skills-eval 自测
```

### 3.1 `mak scan`

目标：扫描已有小程序，帮助 Coding Agent 找到适合 AI 化的业务能力。

输入：

- 小程序项目目录
- 可选行业类型，例如 `booking`、`rental`、`local-service`、`commerce`

扫描对象：

- `app.json`
- 页面路径
- 云函数目录
- API 请求封装
- 业务 service 层
- 表单页面
- 订单、预约、地址、支付、售后等关键流程

输出：

```json
{
  "candidateSkills": [
    {
      "name": "booking",
      "description": "预约服务能力",
      "candidateApis": [
        {
          "name": "searchServices",
          "source": "pages/services/index",
          "riskLevel": "low",
          "reason": "服务查询适合直接做原子接口"
        },
        {
          "name": "createBooking",
          "source": "cloudfunctions/createBooking",
          "riskLevel": "medium",
          "reason": "创建预约需要用户确认后执行"
        }
      ]
    }
  ]
}
```

v0.1 可以先做轻量扫描：

- 文件结构扫描
- 页面和云函数命名启发式识别
- 输出 Markdown 诊断报告

不要求 v0.1 精准静态分析全部业务调用链。

### 3.2 `mak create-skill`

目标：根据模板生成一个官方风格的 SKILL 工程骨架。

示例：

```bash
mak create-skill booking --name booking-skill --output skills/booking-skill
```

生成：

```txt
skills/booking-skill/
├─ SKILL.md
├─ mcp.json
├─ index.js
├─ apis/
│  ├─ searchServices.js
│  ├─ getAvailableSlots.js
│  └─ createBooking.js
├─ components/
│  ├─ service-list/
│  ├─ slot-list/
│  └─ booking-confirm/
└─ pages/
   └─ booking-detail/
```

### 3.3 `mak export wechat`

目标：从 MiniAgentKit DSL 或模板配置导出微信官方 AI 开发模式文件。

生成或更新：

- `mcp.json`
- `SKILL.md`
- `index.js`
- `app.json` 的 `agent.skills` 片段
- `page-meta.json`
- 官方评测集 JSON

### 3.4 `mak lint`

目标：对 SKILL 工程进行静态规则校验。

检查项：

- `app.json` 是否开启 `lazyCodeLoading: "requiredComponents"`。
- SKILL 是否位于独立分包。
- `agent.skills[].path` 是否指向存在的分包。
- `mcp.json` 中的 API 名称是否与 `index.js` 注册一致。
- `inputSchema` / `outputSchema` 是否是合法 JSON Schema。
- `_meta.ui.componentPath` 指向的组件是否存在。
- 高风险接口是否有明确确认卡片或确认流程。
- API description 是否过短、过泛或互相重叠。
- 字段 description 是否说明取值来源、缺省处理和禁止编造。
- 接口返回是否区分 `content`、`structuredContent`、`_meta`。
- 是否包含手机号、身份证、地址等敏感信息明文展示风险。

### 3.5 `mak eval`

目标：生成或运行评测。

v0.1 支持两种能力：

1. 导出官方自定义评测集 JSON，给 `wxa-skills-eval` 使用。
2. 本地 mock eval，验证 MiniAgentKit DSL 到 `mcp.json` / `SKILL.md` 的基础质量。

---

## 4. MVP 目标

第一版只做一个可演示、可复用、可开源的基建闭环。

### 4.1 v0.1 必须完成

1. 初始化 pnpm workspace monorepo。
2. 实现 `packages/core`，提供 Skill / AtomicApi / Component / RiskPolicy 的类型和定义函数。
3. 实现 `packages/wechat-exporter`，能生成官方风格的 `mcp.json`、`SKILL.md`、`index.js` 和 `app.json` 配置片段。
4. 实现 `packages/cli`，至少支持：
   - `mak init`
   - `mak create-skill booking`
   - `mak export wechat`
   - `mak lint`
5. 实现 `packages/eval`，至少支持官方自定义评测集 JSON 生成。
6. 提供 `templates/booking-skill`。
7. 提供 `examples/booking-skill`，对齐官方 demo 的目录形态。
8. 提供 README 和 AICoding 改造指南。
9. 保证 `pnpm build` 和 `pnpm test` 可执行。

### 4.2 v0.1 不做

- 不做复杂 SaaS 后台。
- 不做可视化 Agent 编排器。
- 不做多智能体协作。
- 不接入任何未公开的微信内部接口。
- 不承诺开发模式代码可正式提审。
- 不做真实支付和真实下单。
- 不要求自动扫描能完全理解所有小程序业务。
- 不要求复刻官方 `wxa-skills-eval`。
- 不要求三个行业模板全部完成。

### 4.3 v0.1 Demo 场景

只做预约服务 SKILL：

```txt
用户：帮我预约明天下午 3 点的颈部理疗体验
小程序 AI：根据服务和档期生成预约确认卡片
用户：确认预约
原子接口：createBooking
结果：展示预约成功卡片
```

注意：康养、理疗、设备相关内容只能用于服务介绍、预约、使用说明和售后指引，不能做疾病诊断、治疗承诺、处方建议或替代医生意见。

---

## 5. 推荐仓库结构

```txt
mini-agent-kit/
├─ packages/
│  ├─ core/
│  ├─ wechat-exporter/
│  ├─ scanner/
│  ├─ lint/
│  ├─ eval/
│  └─ cli/
│
├─ templates/
│  ├─ booking-skill/
│  ├─ rental-skill/
│  └─ finder-skill/
│
├─ examples/
│  └─ booking-skill/
│
├─ docs/
│  ├─ getting-started.md
│  ├─ aicoding-guide.md
│  ├─ wechat-ai-skill-guide.md
│  ├─ skill-dsl.md
│  ├─ mcp-json-export.md
│  ├─ skill-md-best-practices.md
│  ├─ lint-rules.md
│  ├─ eval-guide.md
│  └─ roadmap.md
│
├─ tests/
│  ├─ booking.eval.json
│  └─ fixtures/
│
├─ README.md
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ LICENSE
```

---

## 6. 核心 DSL 设计

### 6.1 defineSkill

```ts
import { defineSkill } from "@mini-agent-kit/core";
import { searchServices, createBooking } from "./apis";
import { serviceListCard, bookingConfirmCard } from "./components";

export const bookingSkill = defineSkill({
  name: "booking-skill",
  title: "预约服务",
  description: "帮助用户查询服务、选择档期并创建预约。",
  instruction: {
    serviceScope: [
      "查询服务项目",
      "查询可预约时间",
      "创建预约",
      "查询预约记录",
      "提供售后指引"
    ],
    constraints: [
      "创建预约前必须展示确认卡片",
      "不得承诺疗效",
      "不得替代医生建议"
    ]
  },
  apis: [searchServices, createBooking],
  components: [serviceListCard, bookingConfirmCard],
  flows: [
    {
      intent: "用户想预约某个服务",
      steps: ["searchServices", "getAvailableSlots", "createBooking"]
    }
  ]
});
```

### 6.2 defineAtomicApi

```ts
import { defineAtomicApi } from "@mini-agent-kit/core";
import { z } from "zod";

export const createBooking = defineAtomicApi({
  name: "createBooking",
  title: "创建预约",
  description: "创建服务预约。仅当用户已确认服务、日期、时间后使用。",
  inputSchema: z.object({
    serviceId: z.string().describe("服务 ID，取自 searchServices 返回的 serviceId 原值。不要从用户自然语言推断。"),
    date: z.string().describe("预约日期，格式 YYYY-MM-DD。用户未明确日期时不要填写。"),
    time: z.string().describe("预约时间，格式 HH:mm。用户未明确时间时不要填写。")
  }),
  outputSchema: z.object({
    bookingId: z.string(),
    serviceName: z.string(),
    date: z.string(),
    time: z.string(),
    status: z.enum(["pending", "confirmed"])
  }),
  riskLevel: "medium",
  requireUserConfirm: true,
  ui: {
    componentPath: "components/booking-confirm/index"
  },
  handlerTemplate: "cloudfunction"
});
```

### 6.3 原子接口返回规范

MiniAgentKit 模板生成的原子接口应默认采用官方风格返回结构：

```ts
export interface AtomicApiResult<TStructured = unknown, TMeta = unknown> {
  isError?: boolean;
  content: Array<{
    type: "text";
    text: string;
  }>;
  structuredContent?: TStructured;
  _meta?: TMeta;
}
```

规则：

- `content` 面向小程序 AI，写事实和下一步动作。
- `structuredContent` 面向模型和组件，放结构化业务数据。
- `_meta` 面向组件渲染，放图片、价格、展示辅助数据和不需要模型理解的字段。
- 错误分支也必须给出明确事实、下一步出口和禁止动作。

---

## 7. 微信导出器

### 7.1 exportWechatMcpJson

输入：MiniAgentKit Skill DSL。  
输出：官方风格 `mcp.json`。

必须支持：

- `apis`
- `components`
- `inputSchema`
- `outputSchema`
- `_meta.ui.componentPath`
- `relatedPage`
- 组件权限声明

### 7.2 exportSkillMarkdown

输入：Skill DSL。  
输出：`SKILL.md`。

必须包含：

- SKILL 目标
- 服务范围
- 不做什么
- 用户意图分流
- 业务流程
- 接口依赖关系
- 高风险动作约束
- 数据来源约束
- 错误处理约束
- 隐私和合规边界

### 7.3 exportAppAgentSnippet

输出 `app.json` 配置片段：

```json
{
  "lazyCodeLoading": "requiredComponents",
  "agent": {
    "skills": [
      {
        "name": "booking-skill",
        "description": "帮助用户查询服务、选择档期并创建预约。",
        "path": "/skills/booking-skill"
      }
    ],
    "instruction": "AGENTS.md",
    "pageMetadata": "page-meta.json"
  }
}
```

### 7.4 exportEvalCases

输出官方自定义评测集 JSON：

```json
{
  "cases": [
    {
      "intent": "帮我预约明天下午 3 点的颈部理疗体验",
      "checklist": [
        {
          "evidence": "是否先查询服务和档期，并在创建预约前展示确认卡片",
          "scoring_criteria": {
            "1.0": "完整查询服务和档期，展示确认卡片，确认后创建预约。",
            "0.5": "能完成部分流程，但确认或字段校验不完整。",
            "0.0": "未调用正确能力，或未确认就宣称预约成功。"
          }
        }
      ]
    }
  ]
}
```

---

## 8. CLI 设计

CLI 包名建议：`@mini-agent-kit/cli`  
命令名建议：`mak`

### 8.1 mak init

初始化 MiniAgentKit 配置。

```bash
mak init
```

生成：

```txt
mini-agent.config.ts
AGENTS.md
```

### 8.2 mak scan

扫描已有小程序。

```bash
mak scan --project ./miniprogram --out ./mini-agent-report.md
```

v0.1 输出 Markdown 报告即可。

### 8.3 mak create-skill

生成行业模板。

```bash
mak create-skill booking --name booking-skill
```

### 8.4 mak export wechat

导出官方文件。

```bash
mak export wechat --skill booking-skill
```

### 8.5 mak lint

校验 SKILL 工程。

```bash
mak lint skills/booking-skill
```

### 8.6 mak eval

生成或运行评测。

```bash
mak eval generate --skill booking-skill --out tests/booking.eval.json
mak eval mock tests/booking.eval.json
```

---

## 9. Lint 规则

### 9.1 工程结构规则

- SKILL 必须位于独立分包。
- `mcp.json`、`SKILL.md`、`index.js` 必须存在。
- `app.json` 必须包含 `agent.skills`。
- 建议开启 `lazyCodeLoading: "requiredComponents"`。

### 9.2 原子接口规则

- API 名称必须语义明确，不允许 `search`、`submit`、`handle` 这类过泛名称。
- API description 首句必须说明业务对象。
- API 之间职责不能明显重叠。
- 输入字段必须有 description。
- ID 字段必须说明取值来源接口，禁止模型从自然语言编造。
- 高风险 API 必须声明 `riskLevel` 和确认策略。

### 9.3 返回内容规则

- 必须返回 `content`。
- 有卡片时必须返回 `structuredContent`。
- 仅用于渲染的字段应放入 `_meta`。
- 失败和空结果必须给出下一步出口。

### 9.4 合规规则

- 医疗、康养、理疗场景不得诊断疾病。
- 不得承诺治疗效果。
- 不得替代医生建议。
- 手机号、身份证、详细地址等隐私信息不得明文展示在上行消息或卡片摘要中。
- 下单、支付、取消、修改地址、提交售后必须有确认或二次校验。

---

## 10. Booking Skill 模板

v0.1 只实现预约服务模板。

### 10.1 原子接口清单

```txt
searchServices
getAvailableSlots
createBooking
getBookings
contactSupport
safeHealthReply
```

### 10.2 原子组件清单

```txt
service-list
slot-list
booking-confirm
booking-result
support-card
```

### 10.3 流程

```txt
用户表达预约意图
→ searchServices
→ getAvailableSlots
→ booking-confirm 组件展示
→ 用户确认
→ createBooking
→ booking-result 组件展示
```

### 10.4 安全话术

```text
我可以提供服务介绍、预约和售后指引，但不能进行疾病诊断或替代医生建议。如果你有明确不适或既往病史，请先咨询专业医生或线下机构工作人员。
```

---

## 11. 开发阶段拆分

### Phase 1：仓库初始化

验收标准：

- pnpm workspace 可用
- TypeScript 配置完成
- vitest 可运行
- README 初稿存在

任务：

- 初始化 `package.json`
- 初始化 `pnpm-workspace.yaml`
- 初始化 `tsconfig.base.json`
- 初始化 `packages/core`
- 初始化 `packages/cli`
- 配置 vitest、eslint、prettier

### Phase 2：核心 DSL

验收标准：

- 可以 `defineSkill`
- 可以 `defineAtomicApi`
- 可以 `defineAtomicComponent`
- 可以定义 risk policy 和 flow
- 单元测试通过

任务：

- 实现核心类型
- 实现 zod 到 JSON Schema 的转换封装
- 实现 DSL 校验错误
- 添加基础测试

### Phase 3：微信导出器

验收标准：

- 可以导出 `mcp.json`
- 可以导出 `SKILL.md`
- 可以导出 `app.json` 片段
- 可以导出 `index.js` 注册模板

任务：

- 实现 `exportWechatMcpJson`
- 实现 `exportSkillMarkdown`
- 实现 `exportAppAgentSnippet`
- 实现模板文件生成

### Phase 4：CLI

验收标准：

- `mak init` 可用
- `mak create-skill booking` 可用
- `mak export wechat` 可用
- `mak lint` 可用

任务：

- 实现 CLI 入口
- 实现模板复制
- 实现配置读取
- 实现错误输出和 exit code

### Phase 5：Lint 与 Eval

验收标准：

- 能检查 Booking Skill 基础问题
- 能生成官方自定义评测集 JSON
- 能输出 lint report

任务：

- 实现基础 lint 规则
- 实现 eval case schema
- 实现 booking eval 模板

### Phase 6：Booking Example

验收标准：

- `examples/booking-skill` 结构对齐官方 demo
- 能生成 `mcp.json` 和 `SKILL.md`
- README 能说明如何放入微信小程序项目调试

任务：

- 创建预约模板
- 创建组件模板
- 创建模拟接口
- 创建文档

---

## 12. README 结构

README 是开源项目的获客入口，必须围绕基建价值而不是单个 demo 展开。

建议结构：

```md
# MiniAgentKit

用 AICoding 把已有小程序快速改造成微信 AI 可调用的 SKILL。

## 它解决什么问题
## 与微信官方 AI 开发模式的关系
## 快速开始
## 从已有小程序扫描能力
## 创建第一个 Booking Skill
## 导出 mcp.json 和 SKILL.md
## 运行 lint
## 生成评测集
## 当前限制
## Roadmap
```

必须明确：

- 本项目不是微信官方 SDK。
- 当前基于微信小程序 AI 开发模式 beta 文档。
- 官方文档提示当前暂未开放开发模式代码提审。
- MiniAgentKit 生成的工程仍需要开发者在微信开发者工具和官方评测工具中验证。

---

## 13. Roadmap

### v0.1

- Core DSL
- WeChat exporter
- CLI init / create-skill / export / lint
- Booking Skill template
- Eval case export
- README
- AICoding guide

### v0.2

- `mak scan` 增强
- Rental Skill template
- Finder Skill template
- 更完整 lint 规则
- 官方 demo 对齐检查器

### v0.3

- 小程序项目自动 patch 建议
- CloudBase 示例
- page-meta 生成器
- 原子组件交互模板
- 半屏页面模板

### v0.4

- 文档站
- 多行业模板库
- 评测报告可视化
- 与 Coding Agent 的工作流提示词集成

### v1.0

- 稳定 DSL API
- 完整微信 AI SKILL 工程生成
- 完整 lint/eval 工具链
- 可复制的已有小程序 AI 化改造流程

---

## 14. 参考资料

1. 微信小程序 AI 开发模式接入指南  
   https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html

2. 微信小程序 AI 开发模式接入方式  
   https://developers.weixin.qq.com/miniprogram/dev/ai/integration.html

3. 微信小程序 AI 开发模式运行机制  
   https://developers.weixin.qq.com/miniprogram/dev/ai/operating-mechanism.html

4. 微信小程序 AI 开发模式评测指南  
   https://developers.weixin.qq.com/miniprogram/dev/ai/evaluation-guide.html

5. 微信小程序 AI 开发模式最佳实践  
   https://developers.weixin.qq.com/miniprogram/dev/ai/best-practices.html

6. 微信官方 AI 模式 demo  
   https://github.com/wechat-miniprogram/ai-mode-demo

7. 腾讯云开发 CloudBase AI 简介  
   https://docs.cloudbase.net/ai/introduce

---

## 15. 给开发者和 Coding Agent 的最终提示

MiniAgentKit 第一版要证明的是：

> 一个已有小程序，可以通过清晰的 DSL、模板、导出器、lint 和 eval 流程，被快速改造成微信 AI 开发模式需要的 SKILL 工程。

第一版最重要的链路不是聊天，而是：

```txt
业务能力识别
→ 原子接口定义
→ 原子组件模板
→ SKILL.md 业务流程
→ mcp.json 接口声明
→ app.json agent 配置
→ lint 校验
→ eval 准备
→ 微信开发者工具调试
```

只要这条链路跑通，MiniAgentKit 就具备作为小程序 AI 化基建框架的价值。
