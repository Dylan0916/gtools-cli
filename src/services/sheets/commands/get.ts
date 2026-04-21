import { getSpreadsheetMeta, batchGetValues } from '@/services/sheets/client';
import type { AuthClient } from '@/auth';
import type { CommandResult } from '@/types';
import type { SheetTab } from '@/services/sheets/types';

export async function runGetSpreadsheet(
  auth: AuthClient,
  spreadsheetId: string,
): Promise<CommandResult> {
  const meta = await getSpreadsheetMeta(auth, spreadsheetId);

  const sheetTitles = (meta.sheets ?? [])
    .map((s) => s.properties?.title)
    .filter((t): t is string => typeof t === 'string' && t.length > 0);

  let sheetsData: SheetTab[] = [];

  if (sheetTitles.length > 0) {
    // Quote each title so sheets with spaces or special chars resolve correctly
    const ranges = sheetTitles.map((t) => `'${t.replace(/'/g, "''")}'`);
    const valuesRes = await batchGetValues(auth, spreadsheetId, ranges);
    const valueRanges = valuesRes.valueRanges ?? [];

    sheetsData = sheetTitles.map((title, i) => ({
      title,
      rows: (valueRanges[i]?.values ?? []) as string[][],
    }));
  }

  return {
    spreadsheet: {
      spreadsheetId: meta.spreadsheetId ?? spreadsheetId,
      title: meta.properties?.title ?? '',
      sheets: sheetsData,
    },
  };
}
