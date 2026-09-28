# Decision engine

Run this after the approval gate and evidence collection. **Skip is the default.** Keep only when every keep test passes.

## Keep tests (all required)

1. **Recurs.** The next agent in this repo would hit it without this ticket open. For a shared skill, most agents using this catalog would hit it.
2. **Missing.** Not already in the agents file, rules, or a skill agents already load.
3. **Durable.** Still true after you delete the ticket id, author, file, and line. If it needs those, skip.
4. **Additive.** It says where to look or what to verify. It does not ban a valid approach, freeze one implementation, or encode taste as a hard rule.

If any test fails, **skip**.

## Skip (typical)

- One-off debugging, a single bug, or this pull request's acceptance criteria.
- Already documented, even if this session rediscovered it.
- Style or naming preference without a shared convention.
- Speculative "might help later."
- Path- or line-level leftovers from the diff.
- Anything that would make the next agent refuse a reasonable alternative.
- Personal agent memory standing in for shared knowledge.

## Destination routing (pick one)

Do not write the same lesson into an agents file, a rule, and a skill.

| Destination | Use when |
| --- | --- |
| **Agents file** (prefer) | Commands, where docs live, and post-edit checks. |
| **Always-on rule** | A short constraint that is easy to violate on most edits in that area. |
| **Skill** | A multi-step workflow worth invoking by name. Shared workflows go in this catalog. Repo-only workflows stay in the repo. |

## Output shape before posting

On a keep, this becomes the pull-request comment (see `references/pr-comment.md`). On a skip, it stays in chat and nothing is posted.

```markdown
## Compound engineering

**Outcome:** skip | keep

**Why:** <one or two sentences tied to the keep tests>

**Destination:** <agents file path | rule path | skill name | none>

**Draft:**

<exact markdown, or "none">
```
