import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';
import type { AuthClient } from '../../auth';

const sheets = google.sheets('v4');

export async function getSpreadsheetMeta(
  auth: AuthClient,
  spreadsheetId: string,
): Promise<sheets_v4.Schema$Spreadsheet> {
  const res = await sheets.spreadsheets.get({
    auth,
    spreadsheetId,
    includeGridData: false,
  });
  return res.data;
}

export async function batchGetValues(
  auth: AuthClient,
  spreadsheetId: string,
  ranges: string[],
): Promise<sheets_v4.Schema$BatchGetValuesResponse> {
  const res = await sheets.spreadsheets.values.batchGet({
    auth,
    spreadsheetId,
    ranges,
  });
  return res.data;
}
