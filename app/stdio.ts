import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createRouterServer } from './mcp-server.js'

const server = createRouterServer()
const transport = new StdioServerTransport()
await server.connect(transport)
