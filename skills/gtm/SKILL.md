---
name: gtm
description: Query Google Tag Manager containers, tags, triggers, and variables using natural language. Triggers when the user asks about GTM resources.
triggers:
  - GTM
  - Google Tag Manager
  - tag manager
  - "gtm tag"
  - "gtm trigger"
  - "gtm variable"
  - "gtm container"
---

# GTM Query Skill

Use this skill whenever the user asks about Google Tag Manager content — containers, tags, triggers, or variables.

## Script Location

```bash
/Users/dylan/projects/bun/gtm-agent/src/gtm.ts
```

Run with: `bun run /Users/dylan/projects/bun/gtm-agent/src/gtm.ts <command> [flags]`

## Available Commands

| Command | Flags | Purpose |
|---------|-------|---------|
| `list-accounts` | (none) | List all GTM accounts |
| `list-containers` | `--account <accountId>` | List containers in an account |
| `list-tags` | `--account <id> --container <id>` | List tags in a container |
| `list-triggers` | `--account <id> --container <id>` | List triggers in a container |
| `list-variables` | `--account <id> --container <id>` | List variables in a container |
| `get-tag` | `--account <id> --container <id> --id <tagId>` | Full tag details |
| `get-trigger` | `--account <id> --container <id> --id <triggerId>` | Full trigger details |
| `get-variable` | `--account <id> --container <id> --id <variableId>` | Full variable details |
| `search` | `--account <id> --container <id> --query <keyword>` | Search by keyword |

**Important:** `--account` takes the numeric accountId (not the name). `--container` takes the numeric containerId (not the GTM-XXXXXX public ID). Always run `list-accounts` → `list-containers` first to get these IDs if unknown.

## Workflow

1. If the user mentions a container by name (e.g., "我的網站"), run `list-accounts` then `list-containers` to find the accountId and containerId.
2. For listing questions ("有哪些 tag?"), run the appropriate `list-*` command.
3. For detail questions ("這個 tag 的設定?"), run `list-*` first to get the ID, then `get-*`.
4. For keyword questions ("有沒有關於購買的 tag?"), use `search`.
5. Parse the JSON output and answer in Traditional Chinese.

## Error Handling

If the script outputs `{ "error": "..." }`, explain the error to the user in Traditional Chinese and suggest the fix.

If `GOOGLE_APPLICATION_CREDENTIALS` is not set, tell the user to add this to `~/.zshrc`:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Downloads/my-first-94428-56c47e21842e.json"
```
Then reload with `source ~/.zshrc`.
