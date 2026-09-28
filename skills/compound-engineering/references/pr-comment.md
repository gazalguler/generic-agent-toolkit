# Posting the proposal on the pull request

A keep is posted **before** anything is written. Reviewers are the check on genericness.

## When to post

- **Keep.** Post one comment. Required.
- **Skip.** Post nothing. Skipping is the common outcome.
- **Already posted for this head.** Do not post again. Reply in that thread.

Post a top-level comment, not an inline line comment. The proposal is about repo context, not a line of the diff.

```bash
gh pr comment <number> --body-file <file>
```

Do **not** submit a review with Approve or Request Changes. This skill has no opinion on whether the pull request should merge.

## Required content

1. Label it as an automated context proposal.
2. Say that nothing has been written.
3. Report the gate. If the run was forced past a pending gate, say that.
4. Name what was skipped and which test it failed.
5. One section per keep, with evidence.
6. The exact draft in a fenced block.
7. How to respond: disagree and it drops, reword and that wording is used verbatim, "too restrictive" drops or narrows it, approve and it lands in a separate pull request.

## Template

```markdown
## Compound engineering — context proposal (no files changed)

Automated pass from the `compound-engineering` skill. It looks for anything in this
pull request worth saving as durable context for the next agent, and defaults to
saving nothing.

**Nothing has been written.** This comment is the proposal. Please improve or
disprove it.

### Gate status

<approved, or exactly what was still pending if the run was forced>

### Skipped (working as intended)

<what was rejected and which keep test it failed>

### Proposed keep 1 — <short claim>

<evidence: counts, file paths, command output, review findings>

### Draft addition to <destination>

~~~~
<exact text>
~~~~

### How to respond

- **Disagree with a finding?** Say which number and why. It gets dropped.
- **Want different wording?** Reply with the edit. It will be used verbatim.
- **Think this is too specific or too restrictive?** Say so. That objection drops or narrows it.
- **Approve?** Say which keeps. The change lands in a separate pull request.
```

## Handling replies

Reviewer pushback wins.

- **Disputed.** Drop the item. Do not argue it back.
- **Reworded.** Use the reviewer's wording verbatim.
- **"Too restrictive."** Drop or narrow it.
- **Approved.** Write only the approved items, in their own pull request. Do not push context onto the branch already under review unless the author asks.
