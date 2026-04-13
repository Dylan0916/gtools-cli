---
name: gtm
description: Query Google Tag Manager (GTM) data — containers, tags, triggers, variables, and custom templates — via a Bun CLI script. Use this skill whenever the user mentions GTM, Google Tag Manager, tag manager, or asks about GTM tags, triggers, variables, containers, workspaces, or custom templates. Also use when the user asks things like "有哪些 tag", "這個 trigger 是什麼", "搜尋購買相關的代碼", "範本的程式碼是什麼", or any question about their GTM setup, even if they don't say "GTM" explicitly but are clearly asking about tracking tags, marketing pixels, or tag templates.
---

# GTM Query Skill

Run a Bun script to fetch GTM data and answer the user's question.

## Prerequisites

This skill requires OAuth login. If the command returns an auth error, tell the user to:

1. Set environment variables in `~/.zshrc`:
   ```bash
   export GOOGLE_CLIENT_ID="your-client-id"
   export GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
2. Run `gtools-cli login` to authenticate.

If `gtools-cli` is not found, run `bun link` inside the gtools-cli repo directory first.

## How to Run

```bash
gtools-cli gtm <command> [flags]
```

## Available Commands

| Command | Flags | Purpose |
|---------|-------|---------|
| `gtm list-accounts` | (none) | List all GTM accounts |
| `gtm list-containers` | `--account <accountId>` | List containers in an account |
| `gtm list-tags` | `--account <id> --container <id>` | List tags in a container |
| `gtm list-triggers` | `--account <id> --container <id>` | List triggers in a container |
| `gtm list-variables` | `--account <id> --container <id>` | List variables in a container |
| `gtm get-tag` | `--account <id> --container <id> --id <tagId>` | Full tag details |
| `gtm get-trigger` | `--account <id> --container <id> --id <triggerId>` | Full trigger details |
| `gtm get-variable` | `--account <id> --container <id> --id <variableId>` | Full variable details |
| `gtm list-templates` | `--account <id> --container <id>` | List custom templates in a container |
| `gtm get-template` | `--account <id> --container <id> --id <templateId>` | Full template details including source code (`templateData`) |
| `gtm search` | `--account <id> --container <id> --query <keyword>` | Search by keyword |

**Important:** `--account` takes the numeric accountId (not the name). `--container` takes the numeric containerId (not the GTM-XXXXXX public ID). Always run `gtm list-accounts` → `gtm list-containers` first to get these IDs if unknown.

## Workflow

1. If the user mentions a container by name (e.g., "我的網站"), run `gtools-cli gtm list-accounts` then `gtools-cli gtm list-containers --account <id>` to find the accountId and containerId.
2. For listing questions ("有哪些 tag?"), run the appropriate `gtm list-*` command.
3. For detail questions ("這個 tag 的設定?"), run `gtm list-*` first to get the ID, then `gtm get-*`.
4. For keyword questions ("有沒有關於購買的 tag?"), use `gtm search`.
5. Parse the JSON output and answer in Traditional Chinese.

## Error Handling

If the script outputs `{ "error": "..." }`, explain the error to the user in Traditional Chinese and suggest the fix.
