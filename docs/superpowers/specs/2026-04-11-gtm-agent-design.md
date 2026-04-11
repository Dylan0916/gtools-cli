# GTM Agent Design

**Date:** 2026-04-11  
**Status:** Approved

## Overview

A Claude Code skill that lets the user query Google Tag Manager (GTM) data through natural language. When the user asks GTM-related questions, the skill triggers a Bun script to fetch data from the GTM API and returns it for Claude Code to interpret and answer.

No separate Claude API key is required — Claude Code itself acts as the AI layer.

## Architecture

```
User asks GTM question
  → Claude Code skill activates
  → Claude Code runs Bun script with appropriate command + args
  → Script calls GTM API using service account credentials
  → Script returns minimal JSON
  → Claude Code interprets JSON and answers in Traditional Chinese
```

## Tech Stack

| Item | Decision |
|------|----------|
| Runtime | Bun + TypeScript |
| Auth | Google Service Account (`GOOGLE_APPLICATION_CREDENTIALS` env var) |
| GTM API | `googleapis` npm package |
| Trigger | Claude Code skill (`~/.claude/skills/gtm.md`) |
| AI Layer | Claude Code (no separate Claude API needed) |
| Token Strategy | Fetch on demand, output minimal JSON |

## File Structure

```
gtm-agent/
├── src/
│   ├── gtm.ts              # Entry point: parse CLI args, dispatch command
│   ├── auth.ts             # Google service account auth setup
│   ├── gtm-client.ts       # GTM API wrapper (list/get resources)
│   └── commands/
│       ├── list.ts         # list-accounts, list-containers, list-tags, list-triggers, list-variables
│       ├── search.ts       # Cross-type keyword search within a container
│       └── get.ts          # get-tag, get-trigger, get-variable (full detail)
├── .env.example
├── package.json
└── tsconfig.json
```

## CLI Commands

The script is invoked by Claude Code with subcommands.

**ID note:** GTM has two container ID formats:
- Public ID shown in GTM UI: `GTM-XXXXXX`
- Internal numeric ID used by the API: `123456789`

`list-containers` returns both. All subsequent commands use the **internal numeric ID** via `--container`. Claude Code passes the correct ID after resolving from `list-containers` output.

```bash
# List all GTM accounts (returns numeric accountId)
bun run src/gtm.ts list-accounts

# List containers in an account (returns both publicId GTM-XXXXX and numeric containerId)
bun run src/gtm.ts list-containers --account <accountId>

# List resources in a container (uses default/first workspace)
bun run src/gtm.ts list-tags       --container <containerId>
bun run src/gtm.ts list-triggers   --container <containerId>
bun run src/gtm.ts list-variables  --container <containerId>

# Search across all resource types by keyword
bun run src/gtm.ts search --container <containerId> --query <keyword>

# Get full detail of a single resource
bun run src/gtm.ts get-tag      --container <containerId> --id <tagId>
bun run src/gtm.ts get-trigger  --container <containerId> --id <triggerId>
bun run src/gtm.ts get-variable --container <containerId> --id <variableId>
```

## Output Format

All commands output minimal JSON to stdout. Only the fields needed for answering questions are included:

```json
{
  "tags": [
    { "id": "123", "name": "GA4 - Purchase Event", "type": "gaawe", "status": "ENABLED" }
  ]
}
```

Errors also output JSON so Claude Code can interpret and explain them:

```json
{ "error": "Container GTM-XXXXX not found. Available containers: ..." }
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS` not set | Print setup instructions and exit |
| Credentials file not found | Print file path error and exit |
| GTM API permission denied | Indicate which OAuth scope is missing |
| Container ID not found | List available container IDs |
| Network error | Print error message with status code |

## Skill Design (`~/.claude/skills/gtm.md`)

**Trigger conditions:** User mentions GTM, Google Tag Manager, tag, trigger, variable, container, or workspace in a GTM context.

**Behavior:**
1. Identify which command is needed based on the question
2. If no container is specified, run `list-containers` first and ask user to choose
3. Run the appropriate command and parse the JSON output
4. Answer the user's question in Traditional Chinese using the data

**Memory:** The skill notes the credentials path and frequently used container IDs to avoid re-asking.

## Credentials Setup

```bash
# Add to ~/.zshrc
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Downloads/my-first-94428-56c47e21842e.json"
```

The script reads this environment variable at startup. If not set, it prints clear setup instructions.
