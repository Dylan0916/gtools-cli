import type { AuthClient } from '../../auth';
import type { CommandResult } from '../../types';
import type { ParsedArgs } from '../../cli';

import { runGetSpreadsheet } from './commands/get';

// Commands that need --id (spreadsheet ID)
const ID_COMMANDS = ['get'];

const ALL_COMMANDS = [...ID_COMMANDS];

export function validateSheetsArgs(args: ParsedArgs): string | null {
  if (!args.command) {
    return `No Sheets command provided. Available: ${ALL_COMMANDS.join(', ')}`;
  }

  if (!ALL_COMMANDS.includes(args.command)) {
    return `Unknown Sheets command: "${args.command}". Available: ${ALL_COMMANDS.join(', ')}`;
  }

  if (ID_COMMANDS.includes(args.command) && !args.id) {
    return `Command "sheets ${args.command}" requires --id <spreadsheetId>`;
  }

  return null;
}

export async function routeSheets(auth: AuthClient, args: ParsedArgs): Promise<CommandResult> {
  switch (args.command) {
    case 'get':
      return runGetSpreadsheet(auth, args.id!);
    default:
      return { error: `Unknown Sheets command: "${args.command}"` };
  }
}
