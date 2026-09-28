# Agent notes

## Install

Requires Node 22 or newer. From this repo:

```bash
npm run setup
```

That installs dependencies and registers this server in the global MCP config of every detected harness (Cursor, Claude Code, Claude Desktop, Codex CLI, Windsurf, Gemini CLI, VS Code). Restart the harness afterward.

Use `node scripts/setup.mjs --dry-run` to preview, `--harness cursor,codex` to pick harnesses, or `--remove` to unregister. Do not hand-edit harness MCP configs when the script can write them. Details are in the README.

## Routing

This repo is a **router MCP**. Before writing to an external platform, call `list_skills`, then `get_skill` for the matching workflow.

Do not invent requirements or tool inputs. Inspect the codebase and PRD, then ask the user when material context is missing.

Layers:

- Behavior: how to ask and confirm (`grill-me`) — invocable on its own, not only from other workflows
- Workflow: phases and handoffs (`create-agent-tasks`, `implement-agent-task`, `review-agent-task`, …)

The core lifecycle is PRD → agent tasks → implementation → review.

New skills: follow `create-skill` and `create-skill/references/composition.md`.
