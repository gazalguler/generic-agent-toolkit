#!/usr/bin/env node
/**
 * Fail-open stop hook. Prints {} unless the current-branch pull request has
 * every matching reviewer-agent check successful, and this head has not
 * already been offered.
 *
 * Change REVIEWER_AGENT_MARKER to the check name your reviewer agents publish.
 * Match `name`, not `context`.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const REVIEWER_AGENT_MARKER = 'Cursor Approval Agent'

function emitEmpty() {
  process.stdout.write('{}\n')
  process.exit(0)
}

process.on('uncaughtException', emitEmpty)
process.on('unhandledRejection', emitEmpty)

function tool(name) {
  return process.platform === 'win32' ? `${name}.cmd` : name
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { encoding: 'utf8' })
  if (result.error || result.status !== 0) return null
  return result.stdout
}

function isSuccess(item) {
  const conclusion = String(item.conclusion || '').toUpperCase()
  if (conclusion === 'SUCCESS' || conclusion === 'PASS') return true
  const state = String(item.state || '').toUpperCase()
  return state === 'SUCCESS' || state === 'PASS'
}

try {
  const raw = fs.readFileSync(0, 'utf8')
  const data = JSON.parse(raw || '{}')
  const loopCount = Number(data.loop_count ?? 0)
  if (data.status !== 'completed' || loopCount !== 0) emitEmpty()

  const prOut = run(tool('gh'), [
    'pr',
    'view',
    '--json',
    'number,url,headRefOid,statusCheckRollup'
  ])
  if (!prOut) emitEmpty()

  const pr = JSON.parse(prOut)
  const number = pr.number
  const oid = pr.headRefOid || ''
  if (!number || !oid) emitEmpty()

  const checks = Array.isArray(pr.statusCheckRollup) ? pr.statusCheckRollup : []
  const approval = checks.filter(
    item =>
      item &&
      typeof item === 'object' &&
      String(item.name || '').includes(REVIEWER_AGENT_MARKER)
  )
  if (approval.length === 0 || !approval.every(isSuccess)) emitEmpty()

  const gitDirOut = run(tool('git'), ['rev-parse', '--git-dir'])
  if (!gitDirOut) emitEmpty()
  const marker = path.join(
    path.normalize(gitDirOut.trim()),
    `compound-engineering-offered-${number}-${oid}`
  )
  if (fs.existsSync(marker)) emitEmpty()
  try {
    fs.writeFileSync(marker, '')
  } catch {
    // Still offer once. The marker is best-effort.
  }

  const followup_message =
    'Reviewer-agent checks on this branch PR look approved. ' +
    'Load the compound-engineering skill and start at the approval gate. ' +
    'Default is skip. On a keep, post the proposal as a PR comment first. ' +
    'Write nothing unless confirmed.'
  process.stdout.write(JSON.stringify({ followup_message }) + '\n')
} catch {
  emitEmpty()
}
