# Genericness bar

A keep draft must help the next agent on a different problem. If it only makes sense for this pull request, skip.

## Good (additive, reusable)

- After editing this package, run the format, typecheck, and test commands named in the agents file. Do not invent the command.
- Load repo-local skills before a general review. Do not assume this catalog lists them.
- Prefer relative markdown links inside a skill package, and declare those paths in frontmatter `references`.

These point at existing sources of truth. They do not freeze an implementation.

## Bad (too specific or restrictive)

- Always persist sidebar width the way ticket 12871 did.
- Never use that library in this module, when another library is a valid option.
- In `Sidebar.tsx` around line 80, restore width before switching accounts.
- Reviewer Alex wants longer test names.

Ticket ids, one function, one reviewer's taste, and "always use approach X" fail the durable and non-restrictive tests.

## Rewrite test

Read the draft with the pull request closed. If a new agent still knows when it applies, and is not blocked from a valid alternative, it is generic enough. If you had to keep the ticket number for it to make sense, skip.

A worked example: a pull request added a Node.js route on purpose so a static-site build would fail. Saving "never use the Node runtime" is a skip, because it would forbid the thing the pull request exists to show. A keep from the same session was elsewhere: the agents file told agents to run `pnpm run format`, `pnpm run typecheck`, and `pnpm run test:coverage`, and none of those scripts exist. Correcting command names restricts nobody.
