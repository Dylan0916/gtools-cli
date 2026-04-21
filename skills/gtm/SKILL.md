---
name: gtm
description: Query, update, and diff Google Tag Manager (GTM) data — containers, tags, triggers, variables, custom templates, and versions — via a Bun CLI script. Use this skill whenever the user mentions GTM, Google Tag Manager, tag manager, or asks about GTM tags, triggers, variables, containers, workspaces, custom templates, or versions. Also use when the user asks things like "有哪些 tag", "這個 trigger 是什麼", "搜尋購買相關的代碼", "範本的程式碼是什麼", "幫我改某個 tag 的 HTML", "這個版本改了什麼", "兩個 container 哪裡不一樣", or any question about their GTM setup, even if they don't say "GTM" explicitly but are clearly asking about tracking tags, marketing pixels, tag templates, or container versions.
---

# GTM Query, Update & Diff Skill

Run a Bun CLI to fetch, update, or diff GTM data and answer the user's question.

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
| `update-tag-html` | `--account <id> --container <id> --id <tagId> --html-file <path>` | Update an HTML tag's `html` parameter with the file's contents |
| `list-versions` | `--account <id> --container <id>` | List container versions with ids, names, and counts |
| `get-version` | `--account <id> --container <id> --id <versionId>` | Full snapshot of a version (tags/triggers/variables/templates/builtInVariables) |
| `get-live-version` | `--account <id> --container <id>` | Full snapshot of the currently published version |
| `diff-versions` | `--account <id> --container <id> --from-version <id> --to-version <id>` | Diff two versions in the same container (matched by resource ID) |
| `diff-containers` | `--from-account <id> --from-container <id> --to-account <id> --to-container <id>` | Diff the live versions of two containers (matched by resource name). `--account` may substitute when both containers share an account |
| `create-tag` | `--account <id> --container <id> --from-file <path>` | Create a tag from a JSON payload file (accepts raw tag object or `{tag: ...}` wrapper) |
| `create-trigger` | `--account <id> --container <id> --from-file <path>` | Create a trigger (accepts raw trigger object or `{trigger: ...}`) |
| `create-variable` | `--account <id> --container <id> --from-file <path>` | Create a variable (accepts raw variable object or `{variable: ...}`) |
| `update-variable` | `--account <id> --container <id> --id <variableId> --from-file <path>` | Replace an existing variable's `parameter` array with one from a JSON file |

**Important:** `--account` takes the numeric accountId (not the name). `--container` takes the numeric containerId (not the `GTM-XXXXXX` public ID). Run `list-accounts` → `list-containers` first to resolve names to IDs.

**Payload source for `create-*` / `update-variable`:** the typical flow is `get-*` from the source resource → save to a temp file → (optionally edit) → pass as `--from-file`. Writing a payload from scratch is rare and error-prone; prefer copying an existing resource and tweaking it. See the "Copy resources" example below.

### Updating an HTML tag's content

For `update-tag-html`:
1. Write the new HTML (including the `<script>` wrapper) to a temp file — e.g. `/tmp/new-tag.html`.
2. Run `gtools-cli gtm update-tag-html --account <id> --container <id> --id <tagId> --html-file /tmp/new-tag.html`.
3. The change goes into the default workspace and is NOT published — the user still needs to publish via the GTM UI.
4. Clean up the temp file once you're sure the update succeeded (keep it around if you might need to retry).

Before writing or reviewing the HTML body's JavaScript, read `references/gtm-html-sandbox.md` — GTM's Custom HTML tag runs in a restricted sandbox (no ES2018 object spread, `Object.assign` mutation gotchas) and several of the common mistakes come from assuming modern JS support.

## Container aliases

If `~/.config/gtools-cli/containers.json` exists, use it to resolve container aliases like "eatigo prod" or "funnow dev" directly to numeric `accountId` + `containerId`, skipping the `list-accounts` + `list-containers` round trips.

File schema:
```json
{
  "containers": {
    "<product>-<env>": {
      "publicId": "GTM-XXXXXX",
      "accountId": "<numeric>",
      "containerId": "<numeric>",
      "name": "<original GTM container name>"
    }
  }
}
```

Alias convention: lowercase `<product>-<env>`. Map the user's phrasing to the closest alias — `prod` covers production / live / 正式, `dev` covers staging / stg / test / 測試. If the user is ambiguous (e.g. just "eatigo" without an environment), ask which one before running anything.

If the file doesn't exist, or the alias isn't in it, fall back to `list-accounts` → `list-containers` and match by name. Never assume the file is present — this is a per-machine optional config, and a fresh clone of the CLI won't have it.

## Workflow

1. If the user mentions a container by alias (e.g., "eatigo prod") or name (e.g., "我的網站"), first try resolving via `~/.config/gtools-cli/containers.json` (see "Container aliases"). Otherwise run `gtools-cli gtm list-accounts` then `gtools-cli gtm list-containers --account <id>` to find the accountId and containerId.
2. For listing questions ("有哪些 tag?"), run the appropriate `list-*` command.
3. For detail questions ("這個 tag 的設定?"), run `list-*` first to get the ID, then `get-*`.
4. For keyword questions ("有沒有關於購買的 tag?"), use `search`. (`search` covers tags, triggers, and variables — custom templates are not included, so use `list-templates` for those.)
5. For custom template questions ("這個範本的程式碼是什麼?"), run `list-templates` to find the templateId, then `get-template` and inspect `templateData` for the sandboxed JS source.
6. For version questions ("這個版本改了什麼?"), run `list-versions` to find version IDs. The `containerVersionId` is a monotonically increasing number — to diff the target version against its predecessor, use `--from-version <target - 1>` and `--to-version <target>`. If `<target - 1>` is missing from the list (a version can be deleted), pick the largest id smaller than the target.
7. For cross-container sync questions ("兩個 container 哪裡不一樣?" / "把 A 的設定搬到 B"), use `diff-containers` with the live versions. IDs legitimately differ across containers, so matching is by name — results are safe to use as a human-reviewable action list.
8. Parse the JSON output and answer in Traditional Chinese.

## Example: Full Flow

User: "我的網站這個 container 有哪些跟 purchase 相關的 tag？"

Step 1 — find the account:
```bash
gtools-cli gtm list-accounts
```
Output:
```json
{ "accounts": [{ "accountId": "<accountId>", "name": "<account name>" }, ...] }
```

Step 2 — find the container:
```bash
gtools-cli gtm list-containers --account <accountId>
```
Output:
```json
{ "containers": [{ "containerId": "<containerId>", "publicId": "GTM-XXXXXX", "name": "<container name>" }, ...] }
```

Step 3 — search:
```bash
gtools-cli gtm search --account <accountId> --container <containerId> --query purchase
```
Output:
```json
{ "results": [{ "kind": "tag", "id": "10", "name": "GA4 Purchase Event", "type": "gaawe" }, ...] }
```

Answer the user in Traditional Chinese based on the results.

## Example: Diff two versions in a container

User: "v31 這個版本改了什麼？"

Step 1 — list versions to confirm ids and find the predecessor:
```bash
gtools-cli gtm list-versions --account <accountId> --container <containerId>
```

Step 2 — diff v30 → v31 (predecessor → target):
```bash
gtools-cli gtm diff-versions --account <accountId> --container <containerId> --from-version 30 --to-version 31
```

The `diff` result has three buckets — `added`, `removed`, `modified` — each entry tagged with `kind` (tag / trigger / variable / template / builtInVariable). `modified` entries include `changedFields` plus `before` / `after` for drill-down. Summarize in Traditional Chinese; drill into specific entries with `get-tag` / `get-trigger` etc. only if the user asks for more detail.

## Example: Diff two containers (sync plan)

User: "幫我比對 GTM-AAA 和 GTM-BBB，看差在哪"

Step 1 — resolve both `GTM-XXXX` public IDs to numeric container IDs via `list-accounts` + `list-containers`.

Step 2 — diff the live versions by name (IDs differ across containers, so matching is by name):
```bash
gtools-cli gtm diff-containers \
  --account <accountId> \
  --from-container <fromContainerId> \
  --to-container <toContainerId>
```
(Use `--from-account` / `--to-account` explicitly when the containers live in different accounts.)

Trigger ID references in tags (`firingTriggerId`) are resolved to trigger names before comparing, so tags don't appear as "modified" just because of id renumbering. Resource IDs (`tagId`, `triggerId`, `variableId`, `templateId`) are stripped from the comparison for the same reason.

Because GTM's trigger IDs don't match across containers, the CLI does not attempt automated sync — it produces a human-readable diff that the user applies via the GTM UI.

## Example: Copy resources from one container to another

User: "把 stg 這個新的 tag / trigger / variable 搬到 prod"

The CLI lets you write and create-from-file, but **trigger ID references cannot be copied verbatim** — they're container-local. Always create triggers first, capture the new IDs, then remap the tag JSON before creating the tag.

Step 1 — dump each source resource to a file:
```bash
gtools-cli gtm get-trigger --account <acc> --container <stg-container> --id <triggerId> > /tmp/trigger.json
gtools-cli gtm get-variable --account <acc> --container <stg-container> --id <variableId> > /tmp/variable.json
gtools-cli gtm get-tag --account <acc> --container <stg-container> --id <tagId> > /tmp/tag.json
```

Step 2 — create the trigger and variable in prod (order doesn't matter between them; capture the new trigger ID):
```bash
gtools-cli gtm create-trigger --account <acc> --container <prod-container> --from-file /tmp/trigger.json
# → note the "triggerId" in the returned JSON, e.g. "333"
gtools-cli gtm create-variable --account <acc> --container <prod-container> --from-file /tmp/variable.json
```

Step 3 — before creating the tag, remap its `firingTriggerId` (and `blockingTriggerId` if any) to reference the newly created trigger IDs. Use `jq` or Python to rewrite the JSON:
```bash
jq '.tag.firingTriggerId = ["333"]' /tmp/tag.json > /tmp/tag-remapped.json
gtools-cli gtm create-tag --account <acc> --container <prod-container> --from-file /tmp/tag-remapped.json
```

For resources that already exist in prod but have outdated content, prefer `update-tag-html` (HTML tags) or `update-variable` (any variable type) to modify in place rather than creating duplicates.

All create/update operations go into the default workspace and are **not published** — remind the user to publish via the GTM UI after review.

## Error Handling

If the script outputs `{ "error": "..." }`, read the message and suggest the fix in Traditional Chinese.

Common errors:
- **"Not logged in"** → run `gtools-cli login`
- **"GOOGLE_CLIENT_ID ... not set"** → user needs to configure env vars in `~/.zshrc` (see Prerequisites)
- **403 / insufficient permission** → the token scope changed since last login. Tell the user to re-run `gtools-cli login`.
- **404 / not found** → the account/container/id is wrong. Run `list-*` to get the correct IDs.
- **"No workspaces found"** → the container has no workspaces; this is unusual — verify the container ID.
