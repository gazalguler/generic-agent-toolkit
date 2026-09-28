#!/usr/bin/env node
/**
 * Starts the stdio MCP server from this package, not from the harness
 * working directory. Any MCP client can point `command` at this file.
 */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const tsxApi = pathToFileURL(require.resolve('tsx/esm/api')).href
const { tsImport } = await import(tsxApi)

await tsImport(pathToFileURL(join(root, 'app', 'stdio.ts')).href, import.meta.url)
