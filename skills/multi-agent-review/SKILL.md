---
name: multi-agent-review
description: Trigger 3 parallel subagent to review the current work. If repository has reviewer agents configured, use them. Ask reviewers to also vote on whether changes are ready to ship. Address the blocking changes and keep iterating with the reviewer round until all reviewers vote on ready to ship. Any time you make a change you must trigger the reviewer round again.
user-invocable: true
---

Trigger 3 parallel subagent to review the current work. If repository has reviewer agents configured, use them. Ask reviewers to also vote on whether changes are ready to ship. Address the blocking changes and keep iterating with the reviewer round until all reviewers vote on ready to ship. Any time you make a change you must trigger the reviewer round again.
