# uni-app Adapter

MiniAgentKit 可以用于 uni-app 项目，但微信小程序 AI 开发模式最终需要的是微信小程序构建产物中的原生 SKILL 结构。

`@mini-agent-kit/uniapp-adapter` 采用两步：

1. `prepare`：把 MiniAgentKit 生成的 SKILL 放进 uni-app 源码目录。
2. `patch`：uni-app 构建 `mp-weixin` 后，把 SKILL 复制进构建产物并 patch `app.json`。

## 1. 准备 SKILL

```bash
node packages/cli/dist/index.js uniapp prepare \
  --project apps/demo-booking-uniapp \
  --skill examples/booking-skill \
  --name booking-skill
```

默认写入：

```text
apps/demo-booking-uniapp/src/skills/booking-skill
apps/demo-booking-uniapp/mini-agent.uniapp.json
apps/demo-booking-uniapp/MINI_AGENT_UNIAPP.md
```

## 2. 构建 uni-app 微信小程序

uni-app 构建后通常会生成：

```text
dist/build/mp-weixin
```

## 3. Patch 微信小程序构建产物

```bash
node packages/cli/dist/index.js uniapp patch \
  --project apps/demo-booking-uniapp \
  --dist apps/demo-booking-uniapp/dist/build/mp-weixin \
  --skill booking-skill
```

该命令会：

- 复制 `src/skills/booking-skill` 到 `dist/build/mp-weixin/skills/booking-skill`
- 在 `dist/build/mp-weixin/app.json` 注入 `lazyCodeLoading`
- 在 `app.json` 注入 `subPackages`
- 在 `app.json` 注入 `agent.skills`
- 设置 `agent.instruction` 和 `agent.pageMetadata`

## 当前限制

- 这是构建后 patch 方案，不是 uni-app 编译插件。
- 需要在每次 `mp-weixin` 构建后重新执行 `mak uniapp patch`。
- 真实微信 AI 开发模式测试仍取决于对应 appid 的官方能力状态。
