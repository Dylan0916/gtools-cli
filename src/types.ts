import type { GtmCommandResult } from './services/gtm/types';
import type { DocsCommandResult } from './services/docs/types';

export type CommandResult =
  | GtmCommandResult
  | DocsCommandResult
  | { error: string };
