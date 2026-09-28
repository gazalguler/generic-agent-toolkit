import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { loadCatalog } from './catalog/load.js'
import { attachPrompts } from './prompts/register.js'
import { attachTools } from './tools/register.js'

const VERSION = '0.1.0'

const ROUTER_INSTRUCTIONS = `\
This MCP is a skill and MCP router. The host harness may also expose other \
MCP servers and tools used by coding agents.

REQUIRED: Before using another MCP to write or make a consequential change, \
call list_skills, then get_skill for the matching workflow.

Routing hints:
  - Turn a PRD into work      → create-agent-tasks
  - Execute one task          → implement-agent-task
  - Validate completed work   → review-agent-task
  - Pull request feedback     → address-review-feedback
  - Product docs              → create-prd / clarify-prd
  - Ask the user one decision at a time → grill-me
  - Which skill to pick       → help

This catalog ships portable workflows. Do not invent missing requirements \
or tool inputs — inspect available context, then ask the user when needed.`

export function createRouterServer(): McpServer {
  const catalog = loadCatalog()
  const server = new McpServer(
    {
      name: 'generic-agent-toolkit',
      version: VERSION
    },
    { instructions: ROUTER_INSTRUCTIONS }
  )

  attachTools(server, catalog)
  attachPrompts(server, catalog)
  return server
}
