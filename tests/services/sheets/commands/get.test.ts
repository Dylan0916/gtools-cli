import { describe, it, expect, mock } from 'bun:test';
import type { sheets_v4 } from 'googleapis';

const mockGetSpreadsheetMeta = mock(async (): Promise<sheets_v4.Schema$Spreadsheet> => ({
  spreadsheetId: 'sheet-abc123',
  properties: { title: 'My Test Spreadsheet' },
  sheets: [
    { properties: { title: 'Sheet1' } },
    { properties: { title: 'Prices' } },
  ],
}));

const mockBatchGetValues = mock(
  async (
    _auth: unknown,
    _id: string,
    ranges: string[],
  ): Promise<sheets_v4.Schema$BatchGetValuesResponse> => ({
    valueRanges: ranges.map((range) => ({
      range,
      values: range.includes('Prices')
        ? [
            ['Item', 'Price'],
            ['Apple', '10'],
          ]
        : [
            ['Col1', 'Col2'],
            ['a', 'b'],
          ],
    })),
  }),
);

mock.module('@/services/sheets/client', () => ({
  getSpreadsheetMeta: mockGetSpreadsheetMeta,
  batchGetValues: mockBatchGetValues,
}));

const { runGetSpreadsheet } = await import('@/services/sheets/commands/get');

describe('runGetSpreadsheet', () => {
  it('returns spreadsheet with all sheets and rows', async () => {
    const result = await runGetSpreadsheet({} as any, 'sheet-abc123');

    expect(result).toEqual({
      spreadsheet: {
        spreadsheetId: 'sheet-abc123',
        title: 'My Test Spreadsheet',
        sheets: [
          {
            title: 'Sheet1',
            rows: [
              ['Col1', 'Col2'],
              ['a', 'b'],
            ],
          },
          {
            title: 'Prices',
            rows: [
              ['Item', 'Price'],
              ['Apple', '10'],
            ],
          },
        ],
      },
    });
  });

  it('quotes sheet titles when requesting values', async () => {
    mockBatchGetValues.mockClear();

    await runGetSpreadsheet({} as any, 'sheet-abc123');

    expect(mockBatchGetValues).toHaveBeenCalledWith({}, 'sheet-abc123', ["'Sheet1'", "'Prices'"]);
  });

  it('returns empty sheets array when spreadsheet has no tabs', async () => {
    mockGetSpreadsheetMeta.mockImplementationOnce(async () => ({
      spreadsheetId: 'empty-sheet',
      properties: { title: 'Empty' },
      sheets: [],
    }));

    const result = await runGetSpreadsheet({} as any, 'empty-sheet');

    expect(result).toEqual({
      spreadsheet: {
        spreadsheetId: 'empty-sheet',
        title: 'Empty',
        sheets: [],
      },
    });
  });

  it('escapes single quotes in sheet titles', async () => {
    mockGetSpreadsheetMeta.mockImplementationOnce(async () => ({
      spreadsheetId: 'quoted-sheet',
      properties: { title: 'Quoted' },
      sheets: [{ properties: { title: "Bob's sheet" } }],
    }));
    mockBatchGetValues.mockClear();

    await runGetSpreadsheet({} as any, 'quoted-sheet');

    expect(mockBatchGetValues).toHaveBeenCalledWith({}, 'quoted-sheet', ["'Bob''s sheet'"]);
  });
});
