# WeChat AI Skill Guide

MiniAgentKit exports toward the public WeChat mini program AI development mode structure:

```txt
skills/<skill-name>/
├─ SKILL.md
├─ mcp.json
├─ index.js
├─ apis/
└─ components/
```

The generated files are intended to match the public beta documentation and the official AI mode demo shape.

Important constraints:

- The feature is currently documented as beta.
- Generated code still needs to be tested in WeChat DevTools.
- Official review and production availability are controlled by WeChat, not MiniAgentKit.

Useful commands:

```bash
node packages/cli/dist/index.js create-skill booking --name booking-skill --output examples/booking-skill
node packages/cli/dist/index.js export wechat --skill examples/booking-skill
node packages/cli/dist/index.js lint examples/booking-skill
node packages/cli/dist/index.js eval generate --skill examples/booking-skill --out tests/booking.eval.json
```
