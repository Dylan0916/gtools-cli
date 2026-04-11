#!/usr/bin/env bun
import { getAuthClient } from './auth';
import type { CommandResult } from './types';

import { runGetTag, runGetTrigger, runGetVariable } from './commands/get';
import { runLogin } from './commands/login';
import { runListAccounts, runListContainers, runListTags, runListTriggers, runListVariables } from './commands/list';
import { runSearch } from './commands/search';
import { runGetTemplate, runListTemplates } from './commands/template';

// Commands that need only --account
const ACCOUNT_COMMANDS = ['list-containers'];
// Commands that need --account + --container
const CONTAINER_COMMANDS = ['list-tags', 'list-triggers', 'list-variables', 'list-templates', 'search'];
// Commands that need --account + --container + --id
const ID_COMMANDS = ['get-tag', 'get-trigger', 'get-variable', 'get-template'];

export interface ParsedArgs {
  command: string;
  account?: string;
  container?: string;
  id?: string;
  query?: string;
  error?: string;
}

export function parseCliArgs(argv: string[]): ParsedArgs {
  const command = argv[0] ?? '';
  const result: ParsedArgs = { command };

  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--account' && argv[i + 1]) {
      result.account = argv[++i];
    } else if (argv[i] === '--container' && argv[i + 1]) {
      result.container = argv[++i];
    } else if (argv[i] === '--id' && argv[i + 1]) {
      result.id = argv[++i];
    } else if (argv[i] === '--query' && argv[i + 1]) {
      result.query = argv[++i];
    }
  }

  if (ACCOUNT_COMMANDS.includes(command) && !result.account) {
    result.error = `Command "${command}" requires --account <accountId>`;
  }

  if (CONTAINER_COMMANDS.includes(command)) {
    if (!result.account) {
      result.error = `Command "${command}" requires --account <accountId>`;
    } else if (!result.container) {
      result.error = `Command "${command}" requires --container <containerId>`;
    }
  }

  if (ID_COMMANDS.includes(command)) {
    if (!result.account) {
      result.error = `Command "${command}" requires --account <accountId>`;
    } else if (!result.container) {
      result.error = `Command "${command}" requires --container <containerId>`;
    } else if (!result.id) {
      result.error = `Command "${command}" requires --id <resourceId>`;
    }
  }

  return result;
}

async function run(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.error) {
    console.log(JSON.stringify({ error: args.error }));
    process.exit(1);
  }

  if (!args.command) {
    console.log(JSON.stringify({
      error: 'No command provided. Available: login, list-accounts, list-containers, list-tags, list-triggers, list-variables, list-templates, get-tag, get-trigger, get-variable, get-template, search',
    }));
    process.exit(1);
  }

  // login doesn't require existing credentials
  if (args.command === 'login') {
    await runLogin();
    return;
  }

  const auth = getAuthClient();
  let result: CommandResult;

  try {
    switch (args.command) {
      case 'list-accounts':
        result = await runListAccounts(auth);
        break;
      case 'list-containers':
        result = await runListContainers(auth, args.account!);
        break;
      case 'list-tags':
        result = await runListTags(auth, args.account!, args.container!);
        break;
      case 'list-triggers':
        result = await runListTriggers(auth, args.account!, args.container!);
        break;
      case 'list-variables':
        result = await runListVariables(auth, args.account!, args.container!);
        break;
      case 'get-tag':
        result = await runGetTag(auth, args.account!, args.container!, args.id!);
        break;
      case 'get-trigger':
        result = await runGetTrigger(auth, args.account!, args.container!, args.id!);
        break;
      case 'get-variable':
        result = await runGetVariable(auth, args.account!, args.container!, args.id!);
        break;
      case 'list-templates':
        result = await runListTemplates(auth, args.account!, args.container!);
        break;
      case 'get-template':
        result = await runGetTemplate(auth, args.account!, args.container!, args.id!);
        break;
      case 'search':
        if (!args.query) {
          result = { error: 'Command "search" requires --query <keyword>' };
        } else {
          result = await runSearch(auth, args.account!, args.container!, args.query);
        }
        break;
      default:
        result = { error: `Unknown command: "${args.command}"` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result = { error: message };
  }

  console.log(JSON.stringify(result, null, 2));
}

// Only run when executed directly, not when imported in tests
if (import.meta.main) {
  run();
}
