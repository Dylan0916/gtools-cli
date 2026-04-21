import type { GtmCommandResult } from './services/gtm/types';
import type { DocsCommandResult } from './services/docs/types';
import type { SheetsCommandResult } from './services/sheets/types';

export type CommandResult =
  | GtmCommandResult
  | DocsCommandResult
  | SheetsCommandResult
  | { error: string };
