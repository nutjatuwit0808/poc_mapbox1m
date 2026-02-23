# Commit Message Convention (Conventional Commits)

Use this format for all commit messages: **`type(scope?): description`**

## Types

| Type       | Use for |
| ---------- | ------- |
| **feat**   | New feature or user-facing change |
| **fix**    | Bug fix |
| **chore**  | Maintenance, tooling, config (no app behavior change) |
| **docs**   | Documentation only |
| **refactor** | Code change that neither fixes a bug nor adds a feature |
| **style**  | Formatting, whitespace (no code logic change) |
| **test**   | Adding or updating tests |
| **perf**   | Performance improvement |

## Scope (optional)

Use when the change is scoped to a part of the app, e.g. `map`, `sidebar`, `api`, `store`, `filters`, `deps`.

## Rules

- Use **imperative mood** after the colon (e.g. "add", "fix", "update" — not "added", "fixed", "updated").
- Keep the subject line short and clear; add a body only when needed.

## Examples

| Category        | Example |
| --------------- | ------- |
| feature        | `feat(sidebar): load properties from API` |
| bugfix         | `fix(map): correct tile URL for zoom level` |
| maintenance    | `chore: add COMMIT_CONVENTION.md` |
| documentation  | `docs: document commit prefix convention` |
| refactor       | `refactor(store): simplify filter state` |
