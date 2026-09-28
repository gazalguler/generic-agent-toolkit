#!/usr/bin/env node
/**
 * Install dependencies and register the Generic Agent Toolkit MCP server
 * in the global config of every supported dev harness on this machine.
 *
 *   node scripts/setup.mjs                 # detect installed harnesses
 *   node scripts/setup.mjs --all           # write every supported harness
 *   node scripts/setup.mjs --harness cursor,codex
 *   node scripts/setup.mjs --remove        # unregister from detected harnesses
 *   node scripts/setup.mjs --dry-run       # show changes without writing
 *
 * Plain Node, no dependencies, so it runs before `npm install`.
 */

import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LAUNCHER = join(ROOT, 'bin', 'generic-agent-toolkit.mjs')
const SERVER_NAME = 'generic-agent-toolkit'
const HOME = homedir()
const OS = platform()

// ---------------------------------------------------------------------------
// Harness registry
// ---------------------------------------------------------------------------

const appData = () => process.env.APPDATA ?? join(HOME, 'AppData', 'Roaming')
const xdgConfig = () => process.env.XDG_CONFIG_HOME ?? join(HOME, '.config')

function perOs(mac, win, linux) {
  if (OS === 'darwin') return mac
  if (OS === 'win32') return win
  return linux
}

const claudeDesktopFile = perOs(
  join(HOME, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
  join(appData(), 'Claude', 'claude_desktop_config.json'),
  join(xdgConfig(), 'Claude', 'claude_desktop_config.json')
)

const vscodeUserDir = perOs(
  join(HOME, 'Library', 'Application Support', 'Code', 'User'),
  join(appData(), 'Code', 'User'),
  join(xdgConfig(), 'Code', 'User')
)

/**
 * format:
 *   mcpServers  → { "mcpServers": { name: { command, args } } }
 *   vscode      → { "servers":    { name: { type: "stdio", command, args } } }
 *   toml        → [mcp_servers.name] command = "..." args = [...]
 */
const HARNESSES = {
  cursor: {
    label: 'Cursor',
    file: join(HOME, '.cursor', 'mcp.json'),
    detect: [join(HOME, '.cursor')],
    format: 'mcpServers'
  },
  'claude-code': {
    label: 'Claude Code',
    file: join(HOME, '.claude.json'),
    detect: [join(HOME, '.claude'), join(HOME, '.claude.json')],
    format: 'mcpServers'
  },
  'claude-desktop': {
    label: 'Claude Desktop',
    file: claudeDesktopFile,
    detect: [dirname(claudeDesktopFile)],
    format: 'mcpServers'
  },
  windsurf: {
    label: 'Windsurf',
    file: join(HOME, '.codeium', 'windsurf', 'mcp_config.json'),
    detect: [join(HOME, '.codeium', 'windsurf')],
    format: 'mcpServers'
  },
  gemini: {
    label: 'Gemini CLI',
    file: join(HOME, '.gemini', 'settings.json'),
    detect: [join(HOME, '.gemini')],
    format: 'mcpServers'
  },
  vscode: {
    label: 'VS Code',
    file: join(vscodeUserDir, 'mcp.json'),
    detect: [vscodeUserDir],
    format: 'vscode'
  },
  codex: {
    label: 'Codex CLI',
    file: join(HOME, '.codex', 'config.toml'),
    detect: [join(HOME, '.codex')],
    format: 'toml'
  }
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const flag = name => argv.includes(`--${name}`)
const value = name => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}

if (flag('help') || flag('h')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^\/\*\*?\n?/, '').replace(/^ \* ?/gm, ''))
  process.exit(0)
}

const DRY_RUN = flag('dry-run')
const REMOVE = flag('remove')
const SKIP_INSTALL = flag('skip-install') || REMOVE
const SKIP_CHECK = flag('skip-check') || REMOVE

function selectHarnesses() {
  if (flag('all')) return Object.keys(HARNESSES)
  const explicit = value('harness')
  if (explicit) {
    const wanted = explicit.split(',').map(s => s.trim()).filter(Boolean)
    const unknown = wanted.filter(w => !HARNESSES[w])
    if (unknown.length) {
      fail(`Unknown harness: ${unknown.join(', ')}. Known: ${Object.keys(HARNESSES).join(', ')}`)
    }
    return wanted
  }
  return Object.entries(HARNESSES)
    .filter(([, h]) => h.detect.some(p => existsSync(p)))
    .map(([id]) => id)
}

function fail(msg) {
  console.error(`\nerror: ${msg}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function checkNode() {
  const major = Number(process.versions.node.split('.')[0])
  if (major < 22) {
    console.warn(`warning: Node ${process.versions.node} detected; this toolkit targets Node >= 22.`)
  }
}

function installDeps() {
  if (SKIP_INSTALL) return
  console.log(`\n→ npm install in ${ROOT}`)
  if (DRY_RUN) return
  const npm = OS === 'win32' ? 'npm.cmd' : 'npm'
  const res = spawnSync(npm, ['install', '--no-fund', '--no-audit'], { cwd: ROOT, stdio: 'inherit' })
  if (res.status !== 0) fail('npm install failed')
}

function serverEntry() {
  return { command: 'node', args: [LAUNCHER] }
}

function backup(file) {
  if (!existsSync(file)) return null
  const bak = `${file}.bak`
  copyFileSync(file, bak)
  return bak
}

function writeJsonHarness(h) {
  let cfg = {}
  if (existsSync(h.file)) {
    const raw = readFileSync(h.file, 'utf8')
    if (raw.trim()) {
      try {
        cfg = JSON.parse(raw)
      } catch {
        return manualFallback(h, `existing file is not strict JSON (comments or trailing commas?)`)
      }
    }
  }

  const key = h.format === 'vscode' ? 'servers' : 'mcpServers'
  cfg[key] ??= {}

  if (REMOVE) {
    if (!(SERVER_NAME in cfg[key])) return report(h, 'nothing to remove')
    delete cfg[key][SERVER_NAME]
  } else {
    const entry = serverEntry()
    cfg[key][SERVER_NAME] = h.format === 'vscode' ? { type: 'stdio', ...entry } : entry
  }

  return commit(h, JSON.stringify(cfg, null, 2) + '\n')
}

function tomlString(s) {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function writeTomlHarness(h) {
  const header = `[mcp_servers.${SERVER_NAME}]`
  const lines = existsSync(h.file) ? readFileSync(h.file, 'utf8').split('\n') : []

  // Strip any existing block for our server.
  const start = lines.findIndex(l => l.trim() === header)
  if (start >= 0) {
    let end = start + 1
    while (end < lines.length && !/^\s*\[/.test(lines[end])) end++
    lines.splice(start, end - start)
  } else if (REMOVE) {
    return report(h, 'nothing to remove')
  }

  if (!REMOVE) {
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
    if (lines.length) lines.push('')
    lines.push(header, `command = "node"`, `args = [${tomlString(LAUNCHER)}]`)
  }

  let text = lines.join('\n')
  if (!text.endsWith('\n')) text += '\n'
  return commit(h, text)
}

function entrySnippet(h) {
  if (h.format === 'toml') {
    return `[mcp_servers.${SERVER_NAME}]\ncommand = "node"\nargs = [${tomlString(LAUNCHER)}]`
  }
  const key = h.format === 'vscode' ? 'servers' : 'mcpServers'
  const entry = h.format === 'vscode' ? { type: 'stdio', ...serverEntry() } : serverEntry()
  return JSON.stringify({ [key]: { [SERVER_NAME]: entry } }, null, 2)
}

function commit(h, content) {
  if (DRY_RUN) {
    const verb = REMOVE ? 'would remove entry from' : 'would merge into'
    console.log(`\n--- ${h.label}: ${verb} ${h.file}`)
    if (!REMOVE) console.log(entrySnippet(h))
    return true
  }
  mkdirSync(dirname(h.file), { recursive: true })
  const bak = backup(h.file)
  writeFileSync(h.file, content)
  report(h, `${REMOVE ? 'removed from' : 'wrote'} ${h.file}${bak ? ` (backup: ${bak})` : ''}`)
  return true
}

function report(h, msg) {
  console.log(`  ${h.label.padEnd(15)} ${msg}`)
  return true
}

function manualFallback(h, reason) {
  console.log(`  ${h.label.padEnd(15)} skipped — ${reason}`)
  if (REMOVE) {
    console.log(`                  remove the "${SERVER_NAME}" entry from ${h.file} by hand`)
    return false
  }
  console.log(`                  add this to ${h.file} by hand:`)
  console.log(entrySnippet(h).split('\n').map(l => `                  ${l}`).join('\n'))
  return false
}

function configure(ids) {
  console.log(`\n→ ${REMOVE ? 'Removing from' : 'Registering in'} harness configs`)
  for (const id of ids) {
    const h = HARNESSES[id]
    if (h.format === 'toml') writeTomlHarness(h)
    else writeJsonHarness(h)
  }
}

function smokeTest() {
  if (SKIP_CHECK || DRY_RUN) return Promise.resolve()
  console.log(`\n→ Verifying the server starts from another directory`)
  return new Promise(resolvePromise => {
    const child = spawn('node', [LAUNCHER], { cwd: HOME, stdio: ['pipe', 'pipe', 'pipe'] })
    let out = ''
    let done = false
    const finish = ok => {
      if (done) return
      done = true
      child.kill()
      if (ok) console.log('  server responded to initialize — setup looks good')
      else {
        console.log('  server did not respond in time; check that `npm install` completed')
        process.exitCode = 1
      }
      resolvePromise()
    }
    const timer = setTimeout(() => finish(false), 15_000)
    child.stdout.on('data', d => {
      out += d.toString()
      if (out.includes('"serverInfo"')) {
        clearTimeout(timer)
        finish(true)
      }
    })
    child.on('error', () => {
      clearTimeout(timer)
      finish(false)
    })
    child.stdin.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'setup', version: '0.0.0' }
        }
      }) + '\n'
    )
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`Generic Agent Toolkit setup${DRY_RUN ? ' (dry run)' : ''}`)
console.log(`  launcher: ${LAUNCHER}`)

if (!existsSync(LAUNCHER)) fail(`launcher not found at ${LAUNCHER}; run this from a full clone of the repo`)

checkNode()

const ids = selectHarnesses()
if (!ids.length) {
  console.log(`\nNo supported harness detected on this machine.`)
  console.log(`Known harnesses: ${Object.keys(HARNESSES).join(', ')}`)
  console.log(`Re-run with --all, or --harness <id,id> to choose explicitly.`)
  process.exit(0)
}

installDeps()
configure(ids)
await smokeTest()

if (!REMOVE) {
  console.log(`\nDone. Restart each harness so it picks up "${SERVER_NAME}".`)
}
