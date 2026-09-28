---
name: help
description: Router map for this toolkit. Use when choosing which skill or external MCP to load next, or when the user asks what this catalog can do.
user-invocable: true
references:
  - references/routes.md
---

# Help — routing map

This toolkit routes agents from an idea to reviewed implementation. It tells the agent **which workflow to load and when to use connected tools or MCP servers**.

## Always

1. Call `list_skills`.
2. Call `get_skill` for the best match.
3. Call the other MCP only after the workflow says to. Do not invent org-specific IDs.

## Pick a lane

| Situation | Load | Then talk to |
| --- | --- | --- |
| User wants a product spec | `create-prd` or `clarify-prd` | docs / wiki MCP if needed |
| Break an approved PRD into work | `create-agent-tasks` | codebase and planning tools |
| Execute one task | `implement-agent-task` | code and connected MCPs |
| Validate one completed task | `review-agent-task` | code, diff, and test tools |
| PR feedback loop | `address-review-feedback` | git MCP |
| Confirm a risky plan | `grill-me` | none |
| Author a new skill | `create-skill` | none |

Follow [references/routes.md](references/routes.md) for load order and anti-patterns.
