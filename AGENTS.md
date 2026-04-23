# CLAUDE.md

## Keep README.md in sync with the code

When you add, rename, remove, or change the behavior of any user-facing feature, you **MUST** update `README.md` in the same change. Treat the README as part of the feature — not a follow-up.

### What counts as "user-facing"

Anything the user of `gtools-cli` can observe or has to type:

- A new service under `src/services/<name>/` (the root `SERVICES` list, the intro bullet list, OAuth scopes, Project Structure, examples)
- A new or renamed command / subcommand (the relevant `### XXX Commands` table + an example)
- A new or changed flag (`--account`, `--id`, `--from-file`, ...)
- A new OAuth scope in `src/config.ts` (the "Required OAuth scopes" list)
- A new top-level command in `src/cli.ts` (`TOP_LEVEL_COMMANDS`)
- A new skill under `skills/<name>/` (the "Claude Code Skills" section, and the `N skills are included` count)
- Output shape changes that callers would script against
- A new env var the user has to set

### What does NOT require a README change

- Internal refactors that don't change the CLI surface (e.g., renaming a private helper, moving a file)
- Test-only changes
- Bug fixes that restore documented behavior

### Checklist before marking work done

- [ ] Did the CLI surface (commands, flags, services, scopes, output) change? → README updated
- [ ] Did a skill get added/renamed/removed? → "Claude Code Skills" section + skill count updated
- [ ] Did `src/services/` gain or lose a folder? → "Project Structure" updated
- [ ] Any new example worth showing? → Added under the relevant `### Examples` block

If you're unsure whether a change is user-facing, err on the side of updating the README.
