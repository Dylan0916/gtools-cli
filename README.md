# gtools-cli

A command-line tool for interacting with Google services. Currently supports Google Tag Manager (GTM) — containers, tags, triggers, variables, and custom templates.

Built with [Bun](https://bun.sh) and the Google APIs.

## Requirements

- [Bun](https://bun.sh) v1.0+
- A Google service account with GTM read access
- `GOOGLE_APPLICATION_CREDENTIALS` set to the service account JSON key file path

## Setup

**1. Clone and install dependencies**

```bash
git clone https://github.com/Dylan0916/gtools-cli.git
cd gtools-cli
bun install
```

**2. Set up Google credentials**

Create a service account with the **Tag Manager Readonly** role, download the JSON key, then add to `~/.zshrc`:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account.json"
source ~/.zshrc
```

**3. Register as a global command**

```bash
bun link
```

After this, `gtools-cli` is available anywhere in your terminal.

## Usage

```bash
gtools-cli <command> [flags]
```

All output is JSON. `--account` takes the numeric accountId and `--container` takes the numeric containerId (not the `GTM-XXXXXX` public ID). Run `list-accounts` → `list-containers` first to get these IDs.

### Commands

| Command | Flags | Description |
|---------|-------|-------------|
| `list-accounts` | — | List all GTM accounts |
| `list-containers` | `--account <id>` | List containers in an account |
| `list-tags` | `--account <id> --container <id>` | List tags in a container |
| `list-triggers` | `--account <id> --container <id>` | List triggers in a container |
| `list-variables` | `--account <id> --container <id>` | List variables in a container |
| `list-templates` | `--account <id> --container <id>` | List custom templates in a container |
| `get-tag` | `--account <id> --container <id> --id <tagId>` | Full tag details |
| `get-trigger` | `--account <id> --container <id> --id <triggerId>` | Full trigger details |
| `get-variable` | `--account <id> --container <id> --id <variableId>` | Full variable details |
| `get-template` | `--account <id> --container <id> --id <templateId>` | Full template details including source code |
| `search` | `--account <id> --container <id> --query <keyword>` | Search tags, triggers, and variables by keyword |

### Examples

```bash
# Find your account and container IDs
gtools-cli list-accounts
gtools-cli list-containers --account 123456789

# List all tags
gtools-cli list-tags --account 123456789 --container 987654321

# Get full tag details
gtools-cli get-tag --account 123456789 --container 987654321 --id 42

# Search for purchase-related items
gtools-cli search --account 123456789 --container 987654321 --query purchase

# Get custom template source code
gtools-cli get-template --account 123456789 --container 987654321 --id 26
```

## Development

```bash
bun test       # Run tests
bun run start  # Run directly without linking
```

## Claude Code Skill

A Claude Code skill is included in `skills/gtm/SKILL.md`. It allows you to query GTM data using natural language in Claude Code sessions.

To install:

```bash
mkdir -p ~/.claude/skills/gtm
cp skills/gtm/SKILL.md ~/.claude/skills/gtm/SKILL.md
```
