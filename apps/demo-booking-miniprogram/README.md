# 约小帮

约小帮是一个用于验证 MiniAgentKit 生成物的小程序 demo。它不是完整业务小程序，目标是检查生成的 SKILL 是否能放进微信小程序 AI 开发模式要求的工程结构中。

产品方向：用 AI 帮用户自然语言预约服务、查询档期并确认提交。未来可以扩展为真实的预约服务小程序。

## 验证目标

- `app.json` 包含 `agent.skills`
- `lazyCodeLoading` 已设置为 `requiredComponents`
- `skills/booking-skill` 是独立分包
- `skills/booking-skill/SKILL.md` 存在
- `skills/booking-skill/mcp.json` 存在
- `skills/booking-skill/apis` 和 `components` 存在
- 可以用微信开发者工具打开项目
- `assets/icon.png` 可作为小程序图标候选资产

## 使用方式

1. 打开微信开发者工具 Nightly Electron Build 最新版本。
2. 导入本目录：`apps/demo-booking-miniprogram`。
3. 将 `project.config.json` 中的 `appid` 替换成已申请微信 AI 开发模式的 appid。
4. 检查 `app.json` 中的 `agent.skills` 和 `subPackages`。
5. 使用官方文档中的调试和评测方式验证 SKILL。

当前微信 AI 开发模式仍以官方 beta 文档为准，本 demo 不承诺可正式提审。
