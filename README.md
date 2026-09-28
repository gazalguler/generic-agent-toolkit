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

## Install

Requires Node 22 or newer.

```bash
git clone https://github.com/klemie/generic-agent-toolkit.git
cd generic-agent-toolkit
npm run setup
```

`npm run setup` installs dependencies, detects which dev harnesses are on this machine, registers the server in each one's **global** MCP config, and confirms the server starts. Restart the harness afterward.

Supported harnesses: Cursor, Claude Code, Claude Desktop, Codex CLI, Windsurf, Gemini CLI, VS Code.

Useful flags:

```bash
node scripts/setup.mjs --dry-run              # show what would change
node scripts/setup.mjs --all                  # write every supported harness
node scripts/setup.mjs --harness cursor,codex # pick specific harnesses
node scripts/setup.mjs --remove               # unregister
```

Existing config files are backed up to `<file>.bak` before writing. Other MCP servers in those files are left alone. If a config uses comments or trailing commas, the script skips it and prints the entry to paste by hand.

## Manual setup

If your harness is not listed, add this to its **global** MCP settings (not a project file inside this repo). The command does not depend on the folder you have open:

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

Use the real path on that machine. A copy of this snippet lives in `examples/mcp.client.json`. Codex CLI uses TOML (`[mcp_servers.generic-agent-toolkit]` with the same `command` and `args`), and VS Code uses a `servers` key with `"type": "stdio"`.

The harness starts this process when a session begins, including when the open project is somewhere else.

Slash commands are optional. Routing happens through tool calls, driven by this server’s instructions and skill descriptions.

## Skills

Packages live under `skills/`. Each one is an [agentskills.io](https://agentskills.io) folder with `SKILL.md`. The core route is `create-prd` → `create-agent-tasks` → `implement-agent-task` → `review-agent-task`.

## License

[MIT](LICENSE). Copyright (c) 2026 Kris Lemieux and Red Brick Media.
