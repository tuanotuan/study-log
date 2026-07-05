# LogStudy Docs Index

Read these files after a context reset to understand the current project without rereading the whole repo.

Recommended order:

1. `docs/PROJECT_CONTEXT.md` - product, current state, important decisions.
2. `docs/ARCHITECTURE.md` - app structure, routes, auth, data model, file upload.
3. `docs/OPERATIONS.md` - local commands, Render deploy, env vars, Git workflow.
4. `docs/TASK_LOG.md` - chronological task history and latest known state.
5. `docs/DOC_MAINTENANCE.md` - required doc update rules for future tasks.

Maintenance rule:

- After every completed task, update the relevant docs in this folder.
- If behavior, env vars, deployment, data model, routes, or workflow change, update docs in the same commit.
- Every task should end with checks, commit, and push to `origin/main` unless the user explicitly says otherwise.
