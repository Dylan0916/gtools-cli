import type { AuthClient } from '../../auth';
import type { CommandResult } from '../../types';
import type { ParsedArgs } from '../../cli';

import { runGetTag, runGetTrigger, runGetVariable } from './commands/get';
import { runListAccounts, runListContainers, runListTags, runListTriggers, runListVariables } from './commands/list';
import { runSearch } from './commands/search';
import { runGetTemplate, runListTemplates } from './commands/template';
import { runUpdateTagHtml } from './commands/update';

// Commands that need only --account
const ACCOUNT_COMMANDS = ['list-containers'];
// Commands that need --account + --container
const CONTAINER_COMMANDS = ['list-tags', 'list-triggers', 'list-variables', 'list-templates', 'search'];
// Commands that need --account + --container + --id
const ID_COMMANDS = ['get-tag', 'get-trigger', 'get-variable', 'get-template'];
// Commands that need --account + --container + --id + --html-file
const HTML_FILE_COMMANDS = ['update-tag-html'];

const ALL_COMMANDS = [
  'list-accounts',
  ...ACCOUNT_COMMANDS,
  ...CONTAINER_COMMANDS,
  ...ID_COMMANDS,
  ...HTML_FILE_COMMANDS,
];

export function validateGtmArgs(args: ParsedArgs): string | null {
  if (!args.command) {
    return `No GTM command provided. Available: ${ALL_COMMANDS.join(', ')}`;
  }

  if (!ALL_COMMANDS.includes(args.command)) {
    return `Unknown GTM command: "${args.command}". Available: ${ALL_COMMANDS.join(', ')}`;
  }

  if (ACCOUNT_COMMANDS.includes(args.command) && !args.account) {
    return `Command "gtm ${args.command}" requires --account <accountId>`;
  }

  if (CONTAINER_COMMANDS.includes(args.command)) {
    if (!args.account) {
      return `Command "gtm ${args.command}" requires --account <accountId>`;
    }
    if (!args.container) {
      return `Command "gtm ${args.command}" requires --container <containerId>`;
    }
  }

  if (ID_COMMANDS.includes(args.command) || HTML_FILE_COMMANDS.includes(args.command)) {
    if (!args.account) {
      return `Command "gtm ${args.command}" requires --account <accountId>`;
    }
    if (!args.container) {
      return `Command "gtm ${args.command}" requires --container <containerId>`;
    }
    if (!args.id) {
      return `Command "gtm ${args.command}" requires --id <resourceId>`;
    }
  }

  if (HTML_FILE_COMMANDS.includes(args.command) && !args.htmlFile) {
    return `Command "gtm ${args.command}" requires --html-file <path>`;
  }

  return null;
}

export async function routeGtm(auth: AuthClient, args: ParsedArgs): Promise<CommandResult> {
  switch (args.command) {
    case 'list-accounts':
      return runListAccounts(auth);
    case 'list-containers':
      return runListContainers(auth, args.account!);
    case 'list-tags':
      return runListTags(auth, args.account!, args.container!);
    case 'list-triggers':
      return runListTriggers(auth, args.account!, args.container!);
    case 'list-variables':
      return runListVariables(auth, args.account!, args.container!);
    case 'get-tag':
      return runGetTag(auth, args.account!, args.container!, args.id!);
    case 'get-trigger':
      return runGetTrigger(auth, args.account!, args.container!, args.id!);
    case 'get-variable':
      return runGetVariable(auth, args.account!, args.container!, args.id!);
    case 'list-templates':
      return runListTemplates(auth, args.account!, args.container!);
    case 'get-template':
      return runGetTemplate(auth, args.account!, args.container!, args.id!);
    case 'search':
      if (!args.query) {
        return { error: 'Command "gtm search" requires --query <keyword>' };
      }
      return runSearch(auth, args.account!, args.container!, args.query);
    case 'update-tag-html':
      return runUpdateTagHtml(auth, args.account!, args.container!, args.id!, args.htmlFile!);
    default:
      return { error: `Unknown GTM command: "${args.command}"` };
  }
}
