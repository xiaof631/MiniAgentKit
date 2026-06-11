# MiniAgentKit

用 AICoding 把已有小程序快速改造成微信 AI 可调用的 SKILL。

MiniAgentKit 是一个面向微信小程序 AI 开发模式的开源基建框架。它帮助开发者定义原子接口、原子组件和业务流程，并生成官方 AI 开发模式需要的 `mcp.json`、`SKILL.md`、`index.js` 和 `app.json` 配置片段。

## 当前状态

当前版本是 v0.1 开发骨架，目标是跑通：

```txt
Skill DSL -> WeChat SKILL files -> lint -> eval cases
```

本项目不是微信官方 SDK，不调用任何未公开接口。微信小程序 AI 开发模式仍以官方文档状态为准。

后续真实微信 AI 开发模式测试节点记录在 [docs/follow-up-tasks.md](docs/follow-up-tasks.md)。当前 demo 可本地验证，但真实 SKILL 调用链路需要等待对应 appid 的开发模式审核/提审能力可用后继续。

## 快速开始

```bash
pnpm install
pnpm build
pnpm test
```

创建预约服务 SKILL：

```bash
node packages/cli/dist/index.js create-skill booking --name booking-skill --output examples/booking-skill
node packages/cli/dist/index.js export wechat --skill examples/booking-skill
node packages/cli/dist/index.js lint examples/booking-skill
node packages/cli/dist/index.js eval generate --skill examples/booking-skill --out tests/booking.eval.json
```

## 参考

- 微信小程序 AI 开发模式：https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html
- 官方 demo：https://github.com/wechat-miniprogram/ai-mode-demo
