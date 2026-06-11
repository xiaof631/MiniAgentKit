# 约小帮 uni-app Demo

这是用于验证 MiniAgentKit uni-app adapter 的最小目录。它不是完整可运行的 uni-app 应用，只提供 adapter 命令的目标结构示例。

## 准备 SKILL

```bash
node packages/cli/dist/index.js uniapp prepare \
  --project apps/demo-booking-uniapp \
  --skill examples/booking-skill \
  --name booking-skill
```

## 模拟构建产物并 patch

真实项目中，先执行 uni-app 的微信小程序构建，生成 `dist/build/mp-weixin`。

本 demo 可用以下命令模拟最小构建产物：

```bash
mkdir -p apps/demo-booking-uniapp/dist/build/mp-weixin
printf '{"pages":["pages/index/index"]}\n' > apps/demo-booking-uniapp/dist/build/mp-weixin/app.json
node packages/cli/dist/index.js uniapp patch \
  --project apps/demo-booking-uniapp \
  --dist apps/demo-booking-uniapp/dist/build/mp-weixin \
  --skill booking-skill
```

patch 后检查：

```text
apps/demo-booking-uniapp/dist/build/mp-weixin/app.json
apps/demo-booking-uniapp/dist/build/mp-weixin/skills/booking-skill
```
