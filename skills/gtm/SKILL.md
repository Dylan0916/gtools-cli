---
name: gtm
description: Query Google Tag Manager (GTM) data — containers, tags, triggers, variables, and custom templates — via a Bun CLI script. Use this skill whenever the user mentions GTM, Google Tag Manager, tag manager, or asks about GTM tags, triggers, variables, containers, workspaces, or custom templates. Also use when the user asks things like "有哪些 tag", "這個 trigger 是什麼", "搜尋購買相關的代碼", "範本的程式碼是什麼", or any question about their GTM setup, even if they don't say "GTM" explicitly but are clearly asking about tracking tags, marketing pixels, or tag templates.
---

# GTM Query Skill

Run a Bun script to fetch GTM data and answer the user's question.

## Prerequisites

This skill requires `GOOGLE_APPLICATION_CREDENTIALS` to be set. If the command returns an auth error, tell the user to add this to `~/.zshrc` and reload:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Downloads/my-first-94428-56c47e21842e.json"
source ~/.zshrc
```

## How to Run

```bash
gtm-cli <command> [flags]
```

This relies on `GOOGLE_APPLICATION_CREDENTIALS` being set in the environment (see Prerequisites above). If `gtm-cli` is not found, run `bun link` inside the repo directory first.

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
| `list-templates` | `--account <id> --container <id>` | List custom templates in a container |
| `get-template` | `--account <id> --container <id> --id <templateId>` | Full template details including source code (`templateData`) |
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
