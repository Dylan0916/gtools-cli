---
name: gtm
description: Query Google Tag Manager (GTM) data — containers, tags, triggers, variables, and custom templates — via a Bun CLI script. Use this skill whenever the user mentions GTM, Google Tag Manager, tag manager, or asks about GTM tags, triggers, variables, containers, workspaces, or custom templates. Also use when the user asks things like "有哪些 tag", "這個 trigger 是什麼", "搜尋購買相關的代碼", "範本的程式碼是什麼", or any question about their GTM setup, even if they don't say "GTM" explicitly but are clearly asking about tracking tags, marketing pixels, or tag templates.
---

# GTM Query Skill

Run a Bun CLI to fetch GTM data and answer the user's question.

## Prerequisites

This skill requires OAuth login. If a command returns an auth error, tell the user to:

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
| `search` | `--account <id> --container <id> --query <keyword>` | Search tags, triggers, and variables by keyword |

**Important:** `--account` takes the numeric accountId (not the name). `--container` takes the numeric containerId (not the `GTM-XXXXXX` public ID). Run `list-accounts` → `list-containers` first to resolve names to IDs.

## Workflow

1. If the user mentions a container by name (e.g., "我的網站"), run `gtools-cli gtm list-accounts` then `gtools-cli gtm list-containers --account <id>` to find the accountId and containerId.
2. For listing questions ("有哪些 tag?"), run the appropriate `list-*` command.
3. For detail questions ("這個 tag 的設定?"), run `list-*` first to get the ID, then `get-*`.
4. For keyword questions ("有沒有關於購買的 tag?"), use `search`.
5. Parse the JSON output and answer in Traditional Chinese.

## Example: Full Flow

User: "FunNow 這個 container 有哪些跟 purchase 相關的 tag？"

Step 1 — find the account:
```bash
gtools-cli gtm list-accounts
```
Output:
```json
{ "accounts": [{ "accountId": "6002028658", "name": "FunNow" }, ...] }
```

Step 2 — find the container:
```bash
gtools-cli gtm list-containers --account 6002028658
```
Output:
```json
{ "containers": [{ "containerId": "45544327", "publicId": "GTM-TVN467G", "name": "1. FunNow Web" }, ...] }
```

Step 3 — search:
```bash
gtools-cli gtm search --account 6002028658 --container 45544327 --query purchase
```
Output:
```json
{ "results": [{ "kind": "tag", "id": "10", "name": "GA4 Purchase Event", "type": "gaawe" }, ...] }
```

Answer the user in Traditional Chinese based on the results.

## Error Handling

If the script outputs `{ "error": "..." }`, read the message and suggest the fix in Traditional Chinese.

Common errors:
- **"Not logged in"** → run `gtools-cli login`
- **"GOOGLE_CLIENT_ID ... not set"** → user needs to configure env vars in `~/.zshrc` (see Prerequisites)
- **403 / insufficient permission** → the token scope changed since last login. Tell the user to re-run `gtools-cli login`.
- **404 / not found** → the account/container/id is wrong. Run `list-*` to get the correct IDs.
- **"No workspaces found"** → the container has no workspaces; this is unusual — verify the container ID.
