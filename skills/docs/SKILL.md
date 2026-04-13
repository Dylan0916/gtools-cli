---
name: docs
description: Read Google Docs content via a Bun CLI script. Use this skill whenever the user mentions Google Docs, shares a Google Docs URL (docs.google.com/document/...), asks about a document's content, or asks questions like "這份文件寫了什麼", "這份文件有提到 xxx 嗎", "幫我找文件裡有沒有 yyy", "文件的 zzz 是什麼". Also use when the user provides a document ID or URL and asks any question that requires reading the document content.
---

# Google Docs Query Skill

Run a Bun script to fetch Google Docs content and answer the user's question.

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
gtools-cli docs <command> [flags]
```

## Available Commands

| Command | Flags | Purpose |
|---------|-------|---------|
| `docs get` | `--id <documentId>` | Read full document content as plain text |

## Extracting Document ID from URL

From a Google Docs URL like:
```
https://docs.google.com/document/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
```
The document ID is the part between `/d/` and `/edit`: `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`

## Workflow

1. If the user provides a Google Docs URL, extract the document ID from the URL.
2. Run `gtools-cli docs get --id <documentId>` to fetch the document content.
3. The output is JSON: `{ "document": { "documentId": "...", "title": "...", "content": "..." } }`
4. Use the `content` field (plain text) to answer the user's question.
5. Answer in Traditional Chinese.

### Example Questions and How to Handle Them

- "這份文件的 xxx 是什麼？" → Fetch content, search for xxx, explain what the document says.
- "這份文件有提到 yyy 嗎？" → Fetch content, check if yyy appears, quote the relevant section.
- "幫我找是否有 zzz" → Fetch content, search for zzz, report findings.
- "幫我整理這份文件的重點" → Fetch content, summarize the key points.

## Error Handling

If the script outputs `{ "error": "..." }`, explain the error to the user in Traditional Chinese and suggest the fix.

Common errors:
- **"Not logged in"**: Tell the user to run `gtools-cli login`.
- **403 / permission error**: The token may lack the `documents.readonly` scope. Tell the user to re-run `gtools-cli login` to refresh the token with updated scopes.
- **404 / not found**: The document ID is incorrect, or the user doesn't have access to the document.
