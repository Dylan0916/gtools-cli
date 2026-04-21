export interface SheetTab {
  title: string;
  rows: string[][];
}

export interface Spreadsheet {
  spreadsheetId: string;
  title: string;
  sheets: SheetTab[];
}

export type SheetsCommandResult = { spreadsheet: Spreadsheet };
