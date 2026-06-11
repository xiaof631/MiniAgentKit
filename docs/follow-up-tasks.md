# MiniAgentKit 后续任务记录

> 更新日期：2026-06-11  
> 当前状态：demo 工程已可本地验证，但微信 AI 开发模式真实链路测试需要等待对应 appid 的开发模式审核/提审能力可用后继续。

## 当前已完成

- 已创建公开仓库：`xiaof631/MiniAgentKit`
- 已创建原生微信小程序 demo：`apps/demo-booking-miniprogram`
- demo 名称：`约小帮`
- appid：`wx828e93770aa632f4`
- 已接入方形满版图标：`apps/demo-booking-miniprogram/assets/icon.png`
- 已配置：
  - `app.json`
  - `agent.skills`
  - `AGENTS.md`
  - `page-meta.json`
  - `skills/booking-skill/SKILL.md`
  - `skills/booking-skill/mcp.json`
  - 原子接口和原子组件占位文件
- 已通过本地验证：

```bash
pnpm demo:verify
pnpm build
pnpm test
node packages/cli/dist/index.js lint apps/demo-booking-miniprogram/skills/booking-skill
```

## 当前阻塞

真实微信 AI 开发模式测试需要满足以下条件：

- `wx828e93770aa632f4` 已开通微信小程序 AI 开发模式。
- 微信开发者工具支持 AI 开发模式调试。
- 如官方要求审核或提审通过后才能测试，则需等待审核通过或官方开放相应测试入口。

在这些条件满足前，本项目只能验证：

- 小程序工程结构正确。
- SKILL 文件结构正确。
- `mcp.json` 基础结构正确。
- MiniAgentKit CLI / lint / eval case 生成流程正确。

不能验证：

- 微信 AI 是否真实识别 `booking-skill`。
- 微信 AI 是否真实读取 `SKILL.md` 和 `mcp.json`。
- 微信 AI 是否真实调用原子接口。
- 原子组件是否真实出现在 AI 对话流中。
- 官方 `wxa-skills-eval` 的完整评测报告。

## 下次继续任务节点

### 1. 确认微信 AI 开发模式状态

检查 `wx828e93770aa632f4` 是否已经具备 AI 开发模式调试条件。

需要确认：

- 微信公众平台是否已开启 AI 能力开发模式。
- 是否允许当前版本代码进行 AI 开发模式调试。
- 是否需要先完成审核/提审。
- 是否必须使用微信开发者工具 Nightly Electron Build。

### 2. 打开 demo 工程

用微信开发者工具导入：

```text
apps/demo-booking-miniprogram
```

确认：

- 首页显示 `约小帮`
- 图标正常显示
- 控制台没有 `app.json`、分包、路径相关错误
- `skills/booking-skill` 能作为独立分包存在

### 3. 测试 AI 话术

测试输入：

```text
帮我预约明天下午 3 点的颈部理疗体验
```

期望：

- 命中 `booking-skill`
- 先调用或意图上选择 `searchServices`
- 再进入 `getAvailableSlots`
- 创建预约前要求用户确认
- 不直接宣称预约成功
- 不出现医疗诊断或疗效承诺

### 4. 跑官方评测

如果官方 `wxa-skills-eval` 可用，使用项目路径：

```text
/Users/user/workSpec/html/MiniAgentKit/apps/demo-booking-miniprogram
```

自定义评测集：

```text
/Users/user/workSpec/html/MiniAgentKit/tests/booking.eval.json
```

重点观察：

- SKILL 识别是否成功
- 原子接口覆盖率
- `createBooking` 是否被判定为需要确认
- `SKILL.md` 文档质量
- `mcp.json` 字段描述质量
- 是否出现未执行就宣称成功的问题

### 5. 根据结果回改 MiniAgentKit

如果测试失败，优先按以下顺序修：

1. `mcp.json` API description 是否太泛。
2. 字段 description 是否没有说明取值来源。
3. `SKILL.md` 是否没有写清流程依赖。
4. 原子接口返回 `content` 是否缺少事实和下一步动作。
5. 原子组件路径是否和 `_meta.ui.componentPath` 不一致。
6. `app.json agent.skills[].path` 是否与分包路径不一致。

## 近期工程任务

- 增强 `scripts/verify-demo.mjs`，增加更多官方结构检查。
- 给 `apps/demo-booking-miniprogram` 增加更真实的原子组件交互。
- 增加 `apps/demo-booking-uniapp` 或 `packages/uniapp-adapter` 方案验证。
- 增强 `mak lint`，检查 `app.json` 与 SKILL 分包路径的一致性。
- 增强 `mak eval generate`，生成更多预约服务场景的评测用例。
- 在 README 中增加“微信 AI 开发模式审核前只能本地验证”的说明。

## 快速恢复命令

```bash
cd /Users/user/workSpec/html/MiniAgentKit
pnpm install
pnpm demo:verify
pnpm build
pnpm test
node packages/cli/dist/index.js lint apps/demo-booking-miniprogram/skills/booking-skill
```
