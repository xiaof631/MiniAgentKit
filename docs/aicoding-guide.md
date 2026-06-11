# AICoding Guide

MiniAgentKit is designed for developers working with Coding Agents.

Recommended workflow:

```txt
1. Ask the agent to inspect the existing mini program structure.
2. Run `mak scan` once scanner support is available.
3. Select one business flow as the first SKILL.
4. Run `mak create-skill booking`.
5. Adapt generated atomic APIs to real services or cloud functions.
6. Run `mak lint`.
7. Run `mak eval generate`.
8. Open the project in WeChat DevTools and use the official SKILL evaluation flow.
```

Rules for Coding Agents:

- Do not claim MiniAgentKit is a WeChat official SDK.
- Do not call or document unpublished WeChat internal APIs.
- Keep high-risk business actions behind a confirmation card or equivalent user confirmation.
- Keep business IDs sourced from upstream API results, not inferred from user text.
- Put model-facing facts and next steps in `content`.
- Put structured state in `structuredContent`.
- Put display-only details in `_meta`.
