# Repository Instructions

## Default workflow for Chinese requests

For every substantive user turn in this repository, use the following clarification workflow unless the user explicitly opts out or the turn is only a simple greeting, acknowledgement, or one-line confirmation.

### Mandatory behavior

- Reply to the user in Chinese.
- When the user writes in Chinese, mixed Chinese-English, or with unclear logic, first clarify the intent before executing.
- List high-impact key decisions before doing any internal English normalization.
- Keep the normalized English task brief hidden by default; only show it if the user explicitly asks.
- Ask the user only about decisions that materially affect scope, approach, risk, cost, time, destructive actions, or visible output.
- For low-risk gaps, choose a reasonable default, state the assumption briefly if needed, and continue.
- Keep the clarification lightweight when the request is already clear.

### Clarification workflow

1. Briefly restate the request in Chinese.
2. List only the key decisions that require the user's choice.
3. Internally normalize the clarified request into concise English for reasoning.
4. Execute the task and reply to the user in Chinese.

Do not show the internal English normalization unless the user explicitly asks to see it.

### Key decision rules

Only ask about decisions that materially change one of these:

- Scope or deliverables
- Technical approach or architecture
- Risky or irreversible actions
- Time or effort level
- External dependencies or tools
- User-visible style, tone, or interaction model

Do not ask about trivial defaults such as formatting, minor naming, or obvious local conventions unless they have visible product impact.

### Priority rule

If these instructions conflict with generic repo habits, follow this clarification workflow first and then continue with the task.

## Git Workflow

Use the following standardized Git flow for this repository.

### Branching

- Never commit directly to `main` unless the user explicitly asks for a direct hotfix.
- Create feature/fix branches using:
  - `feat/<short-topic>`
  - `fix/<short-topic>`
  - `chore/<short-topic>`
- Keep one logical change per branch.

### Commit Rules

- Commit in small, reviewable increments.
- Use Conventional Commit style:
  - `feat: ...`
  - `fix: ...`
  - `chore: ...`
  - `refactor: ...`
  - `docs: ...`
  - `test: ...`
- Write commit messages in clear Chinese or English, but keep prefix format consistent.
- Do not include unrelated file changes in the same commit.

### Local Quality Gate (Before Push)

- Run relevant checks before pushing:
  - build
  - tests (if available)
  - lint/format (if configured)
- If checks fail, fix issues before push unless user asks to push as-is.

### Remote Sync and Push

- Before starting work on a branch:
  - sync latest `main`
  - rebase/merge onto latest `main` as needed
- Push with upstream tracking on first push:
  - `git push -u origin <branch>`

### Pull Request Rules

- Open PR from feature branch into `main`.
- PR description should include:
  - purpose/background
  - key changes
  - validation steps and results
  - risk/rollback notes (if applicable)
- Merge after checks pass and review is done.

### Safety and Destructive Operations

- Avoid destructive commands unless explicitly requested:
  - `git reset --hard`
  - `git clean -fd`
  - force push to shared branches
- If destructive action is required, explain impact first and request user confirmation.

### Agent Execution Rules

- Unless explicitly requested, the agent must not:
  - create tags
  - rewrite shared branch history
  - force push
  - auto-merge PRs
  - commit secrets or environment files
