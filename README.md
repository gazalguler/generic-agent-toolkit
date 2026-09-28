# Generic Agent Toolkit

A local MCP server that **routes** an agent from an idea to reviewed implementation.

Any MCP-capable harness can spawn this process over stdio. The agent does not need native skill routing. It calls `list_skills` and `get_skill`, then follows those instructions when talking to whatever other MCPs are connected.

You do not keep a daemon running. The harness starts this process for the session and stops it afterward.

## What it is for

- Decide **when** to use another MCP (and which skill to load first).
- Turn a product requirements document (PRD) into dependency-aware tasks for coding agents.
- Guide each task through implementation and evidence-based review.
- Keep workflow and confirmation style in one catalog.
- Work in Cursor, Claude Desktop, Codex, or a custom MCP client.

## Run locally

```bash
npm install
```

Add this to the harness’s **global** MCP settings (not a project file inside this repo). The command does not depend on the folder you have open:

```json
{
  "mcpServers": {
    "generic-agent-toolkit": {
      "command": "node",
      "args": ["/absolute/path/to/generic-agent-toolkit/bin/generic-agent-toolkit.mjs"]
    }
  }
}
```

Use the real path on that machine. A copy of this snippet lives in `examples/mcp.client.json`.

The harness starts this process when a session begins, including when the open project is somewhere else. Cursor reads `~/.cursor/mcp.json`. Claude Desktop reads its app config. Other clients use the same `command` / `args` shape in their own global MCP config.

Slash commands are optional. Routing happens through tool calls, driven by this server’s instructions and skill descriptions.

## Skills

Packages live under `skills/`. Each one is an [agentskills.io](https://agentskills.io) folder with `SKILL.md`. The core route is `create-prd` → `create-agent-tasks` → `implement-agent-task` → `review-agent-task`.

## License

[MIT](LICENSE). Copyright (c) 2026 Kris Lemieux and Red Brick Media.
