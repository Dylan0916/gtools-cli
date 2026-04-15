# gtools-cli

A command-line tool for interacting with Google services. Currently supports:

- **Google Tag Manager (GTM)** — containers, tags, triggers, variables, and custom templates
- **Google Docs** — read document content as plain text

Built with [Bun](https://bun.sh) and the Google APIs.

## Requirements

- [Bun](https://bun.sh) v1.0+
- A Google OAuth 2.0 client (Desktop app type)
- Access to the Google services you want to query (GTM, Docs)

## Setup

**1. Clone and install dependencies**

```bash
git clone https://github.com/Dylan0916/gtools-cli.git
cd gtools-cli
bun install
```

**2. Set up Google OAuth credentials**

Create a Google OAuth 2.0 client (Desktop app) in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), then add to `~/.zshrc`:

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
source ~/.zshrc
```

Required OAuth scopes (requested automatically on login):
- `tagmanager.edit.containers` — edit GTM containers (but not publish)
- `documents.readonly` — read Google Docs

**3. Register as a global command**

Run this inside the `gtools-cli` directory (from step 1):

```bash
bun link
```

After this, `gtools-cli` is available anywhere in your terminal.

**4. Log in**

```bash
gtools-cli login
```

This opens a browser for Google OAuth consent. Tokens are stored at `~/.config/gtools-cli/token.json`.

## Usage

```bash
gtools-cli <service> <command> [flags]
```

All output is JSON. Top-level commands (`login`) don't require a service prefix.

### GTM Commands

`--account` takes the numeric accountId and `--container` takes the numeric containerId (not the `GTM-XXXXXX` public ID). Run `gtm list-accounts` → `gtm list-containers` first to get these IDs.

| Command | Flags | Description |
|---------|-------|-------------|
| `gtm list-accounts` | — | List all GTM accounts |
| `gtm list-containers` | `--account <id>` | List containers in an account |
| `gtm list-tags` | `--account <id> --container <id>` | List tags in a container |
| `gtm list-triggers` | `--account <id> --container <id>` | List triggers in a container |
| `gtm list-variables` | `--account <id> --container <id>` | List variables in a container |
| `gtm list-templates` | `--account <id> --container <id>` | List custom templates in a container |
| `gtm get-tag` | `--account <id> --container <id> --id <tagId>` | Full tag details |
| `gtm get-trigger` | `--account <id> --container <id> --id <triggerId>` | Full trigger details |
| `gtm get-variable` | `--account <id> --container <id> --id <variableId>` | Full variable details |
| `gtm get-template` | `--account <id> --container <id> --id <templateId>` | Full template details including source code |
| `gtm search` | `--account <id> --container <id> --query <keyword>` | Search tags, triggers, and variables by keyword |
| `gtm update-tag-html` | `--account <id> --container <id> --id <tagId> --html-file <path>` | Update an HTML tag's `html` parameter from a file |

### Docs Commands

| Command | Flags | Description |
|---------|-------|-------------|
| `docs get` | `--id <documentId>` | Read document as plain text (title + content) |

The document ID is the part between `/d/` and `/edit` in a Google Docs URL:
```
https://docs.google.com/document/d/1aBcDeFg.../edit
                                  ^^^^^^^^^^
                                  document ID
```

### Examples

```bash
# --- GTM ---

# Find your account and container IDs
gtools-cli gtm list-accounts
gtools-cli gtm list-containers --account 123456789

# List all tags
gtools-cli gtm list-tags --account 123456789 --container 987654321

# Get full tag details
gtools-cli gtm get-tag --account 123456789 --container 987654321 --id 42

# Search for purchase-related items
gtools-cli gtm search --account 123456789 --container 987654321 --query purchase

# Get custom template source code
gtools-cli gtm get-template --account 123456789 --container 987654321 --id 26

# Update an HTML tag's html content (the file's content is uploaded as-is)
gtools-cli gtm update-tag-html --account 123456789 --container 987654321 --id 42 --html-file ./new-tag.html

# --- Docs ---

# Read a Google Doc's content
gtools-cli docs get --id 1aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

## Development

```bash
bun test       # Run tests
bun run start  # Run directly without linking
```

## Project Structure

```
src/
  cli.ts                 # Entry point, subcommand routing
  auth.ts                # OAuth client initialization
  oauth.ts               # OAuth login flow
  tokenStore.ts          # Token persistence
  config.ts              # Scopes, paths, OAuth config
  types.ts               # Shared CommandResult union
  commands/login.ts      # Top-level login command
  commands/install.ts    # Install skills command
  services/
    gtm/                 # Google Tag Manager service
      router.ts, client.ts, types.ts, commands/
    docs/                # Google Docs service
      router.ts, client.ts, extractText.ts, types.ts, commands/
```

Adding a new Google service means adding a new directory under `src/services/` with `router.ts`, `client.ts`, `types.ts`, and `commands/`, then registering it in `src/cli.ts`.

## Claude Code Skills

Two skills are included for natural-language querying in Claude Code sessions:

- `skills/gtm/SKILL.md` — query GTM data
- `skills/google-docs/SKILL.md` — query Google Docs content

To install, run the interactive installer:

```bash
gtools-cli install --skills
```

It will ask you:
1. **Scope** — current project or global (`~/`)
2. **Target** — `.claude/skills`, `.agents/skills`, or a custom path
