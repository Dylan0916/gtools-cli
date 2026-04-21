import type { AuthClient } from '../../auth';
import type { CommandResult } from '../../types';
import type { ParsedArgs } from '../../cli';

import { runGetTag, runGetTrigger, runGetVariable } from './commands/get';
import { runListAccounts, runListContainers, runListTags, runListTriggers, runListVariables } from './commands/list';
import { runSearch } from './commands/search';
import { runGetTemplate, runListTemplates } from './commands/template';
import { runUpdateTagHtml, runUpdateVariable } from './commands/update';
import { runGetLiveVersion, runGetVersion, runListVersions } from './commands/version';
import { runDiffContainers, runDiffVersions } from './commands/diff';
import { runCreateTag, runCreateTrigger, runCreateVariable } from './commands/create';

// Commands that need only --account
const ACCOUNT_COMMANDS = ['list-containers'];
// Commands that need --account + --container
const CONTAINER_COMMANDS = [
  'list-tags',
  'list-triggers',
  'list-variables',
  'list-templates',
  'search',
  'list-versions',
  'get-live-version',
];
// Commands that need --account + --container + --id
const ID_COMMANDS = ['get-tag', 'get-trigger', 'get-variable', 'get-template', 'get-version'];
// Commands that need --account + --container + --id + --html-file
const HTML_FILE_COMMANDS = ['update-tag-html'];
// Commands that need --account + --container + --from-version + --to-version
const VERSION_DIFF_COMMANDS = ['diff-versions'];
// Commands that need (--from-account | --account) + --from-container + (--to-account | --account) + --to-container
const CONTAINER_DIFF_COMMANDS = ['diff-containers'];
// Commands that need --account + --container + --from-file
const CREATE_COMMANDS = ['create-tag', 'create-trigger', 'create-variable'];
// Commands that need --account + --container + --id + --from-file
const UPDATE_FROM_FILE_COMMANDS = ['update-variable'];

const ALL_COMMANDS = [
  'list-accounts',
  ...ACCOUNT_COMMANDS,
  ...CONTAINER_COMMANDS,
  ...ID_COMMANDS,
  ...HTML_FILE_COMMANDS,
  ...VERSION_DIFF_COMMANDS,
  ...CONTAINER_DIFF_COMMANDS,
  ...CREATE_COMMANDS,
  ...UPDATE_FROM_FILE_COMMANDS,
];

function resolveDiffContainerAccounts(args: ParsedArgs): { fromAccount?: string; toAccount?: string } {
  return {
    fromAccount: args.fromAccount ?? args.account,
    toAccount: args.toAccount ?? args.account,
  };
}

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

  if (VERSION_DIFF_COMMANDS.includes(args.command)) {
    if (!args.account) {
      return `Command "gtm ${args.command}" requires --account <accountId>`;
    }
    if (!args.container) {
      return `Command "gtm ${args.command}" requires --container <containerId>`;
    }
    if (!args.fromVersion) {
      return `Command "gtm ${args.command}" requires --from-version <versionId>`;
    }
    if (!args.toVersion) {
      return `Command "gtm ${args.command}" requires --to-version <versionId>`;
    }
  }

  if (CONTAINER_DIFF_COMMANDS.includes(args.command)) {
    const { fromAccount, toAccount } = resolveDiffContainerAccounts(args);
    if (!fromAccount) {
      return `Command "gtm ${args.command}" requires --from-account <accountId> (or --account as shared default)`;
    }
    if (!args.fromContainer) {
      return `Command "gtm ${args.command}" requires --from-container <containerId>`;
    }
    if (!toAccount) {
      return `Command "gtm ${args.command}" requires --to-account <accountId> (or --account as shared default)`;
    }
    if (!args.toContainer) {
      return `Command "gtm ${args.command}" requires --to-container <containerId>`;
    }
  }

  if (CREATE_COMMANDS.includes(args.command)) {
    if (!args.account) {
      return `Command "gtm ${args.command}" requires --account <accountId>`;
    }
    if (!args.container) {
      return `Command "gtm ${args.command}" requires --container <containerId>`;
    }
    if (!args.fromFile) {
      return `Command "gtm ${args.command}" requires --from-file <path>`;
    }
  }

  if (UPDATE_FROM_FILE_COMMANDS.includes(args.command)) {
    if (!args.account) {
      return `Command "gtm ${args.command}" requires --account <accountId>`;
    }
    if (!args.container) {
      return `Command "gtm ${args.command}" requires --container <containerId>`;
    }
    if (!args.id) {
      return `Command "gtm ${args.command}" requires --id <resourceId>`;
    }
    if (!args.fromFile) {
      return `Command "gtm ${args.command}" requires --from-file <path>`;
    }
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
    case 'list-versions':
      return runListVersions(auth, args.account!, args.container!);
    case 'get-version':
      return runGetVersion(auth, args.account!, args.container!, args.id!);
    case 'get-live-version':
      return runGetLiveVersion(auth, args.account!, args.container!);
    case 'diff-versions':
      return runDiffVersions(auth, args.account!, args.container!, args.fromVersion!, args.toVersion!);
    case 'diff-containers': {
      const { fromAccount, toAccount } = resolveDiffContainerAccounts(args);
      return runDiffContainers(auth, fromAccount!, args.fromContainer!, toAccount!, args.toContainer!);
    }
    case 'create-tag':
      return runCreateTag(auth, args.account!, args.container!, args.fromFile!);
    case 'create-trigger':
      return runCreateTrigger(auth, args.account!, args.container!, args.fromFile!);
    case 'create-variable':
      return runCreateVariable(auth, args.account!, args.container!, args.fromFile!);
    case 'update-variable':
      return runUpdateVariable(auth, args.account!, args.container!, args.id!, args.fromFile!);
    default:
      return { error: `Unknown GTM command: "${args.command}"` };
  }
}
