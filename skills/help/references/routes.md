# Route order

1. Behavior skill if the user must confirm (usually `grill-me`).
2. Workflow skill for the job.
3. Call connected tools or MCP servers when the workflow requires them.

For build work, route in this order: `create-prd` → `create-agent-tasks` → `implement-agent-task` → `review-agent-task`.

`compound-engineering` is not part of that chain. Load it after reviewer agents approve a pull request, not when the pull request opens.

Do not invent requirements or tool inputs. Inspect available context, then ask the user when a material decision remains.
