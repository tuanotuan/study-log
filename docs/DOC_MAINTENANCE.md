# Documentation Maintenance Rule

Last updated: 2026-07-05

The user explicitly requested that markdown docs stay current so a future agent can read the docs and understand the whole project after context transfer.

## Required Rule

After every completed task:

1. Update relevant markdown files.
2. If no documentation changes are needed, mention that explicitly in the final response.
3. Commit and push the code plus docs together.

## Files To Consider

Always consider these docs:

- `README.md`
- `docs/README.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/OPERATIONS.md`
- `docs/TASK_LOG.md`
- `docs/DOC_MAINTENANCE.md`
- `AGENTS.md`

## What Requires A Docs Update

Update docs when any of these change:

- Product behavior.
- UI routes or user flows.
- Auth/session rules.
- Email behavior.
- Database schema.
- Prisma migrations or bootstrap script.
- Render config.
- Environment variables.
- Git/deploy workflow.
- Known caveats.
- Testing instructions.
- Any project convention requested by the user.

## Suggested Update Locations

- Product-level changes: `docs/PROJECT_CONTEXT.md`.
- Technical structure or code paths: `docs/ARCHITECTURE.md`.
- Commands/env/deploy/test steps: `docs/OPERATIONS.md`.
- Completed work summary: `docs/TASK_LOG.md`.
- Process changes: `docs/DOC_MAINTENANCE.md` and possibly `AGENTS.md`.

## Commit Rule

Every completed task should end with:

```bash
git status --short
git add <changed-files>
git commit -m "<clear message>"
git push
```

Run relevant checks first. For code changes, use:

```bash
npm run lint
npm run build
```

For docs-only changes, a build is usually not necessary unless docs reference code/config that changed.
