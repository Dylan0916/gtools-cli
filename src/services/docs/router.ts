import type { AuthClient } from '@/auth';
import type { CommandResult } from '@/types';
import type { ParsedArgs } from '@/cli';

import { runGetDoc } from './commands/get';

// Commands that need --id (document ID)
const ID_COMMANDS = ['get'];

const ALL_COMMANDS = [...ID_COMMANDS];

export function validateDocsArgs(args: ParsedArgs): string | null {
  if (!args.command) {
    return `No Docs command provided. Available: ${ALL_COMMANDS.join(', ')}`;
  }

  if (!ALL_COMMANDS.includes(args.command)) {
    return `Unknown Docs command: "${args.command}". Available: ${ALL_COMMANDS.join(', ')}`;
  }

  if (ID_COMMANDS.includes(args.command) && !args.id) {
    return `Command "docs ${args.command}" requires --id <documentId>`;
  }

  return null;
}

export async function routeDocs(auth: AuthClient, args: ParsedArgs): Promise<CommandResult> {
  switch (args.command) {
    case 'get':
      return runGetDoc(auth, args.id!);
    default:
      return { error: `Unknown Docs command: "${args.command}"` };
  }
}
