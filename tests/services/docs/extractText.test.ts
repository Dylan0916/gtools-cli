import { describe, it, expect } from 'bun:test';
import { extractPlainText } from '../../../src/services/docs/extractText';
import type { docs_v1 } from 'googleapis';

describe('extractPlainText', () => {
  it('extracts text from simple paragraphs', () => {
    const doc: docs_v1.Schema$Document = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                { textRun: { content: 'Hello ' } },
                { textRun: { content: 'World\n' } },
              ],
            },
          },
          {
            paragraph: {
              elements: [
                { textRun: { content: 'Second paragraph\n' } },
              ],
            },
          },
        ],
      },
    };

    const result = extractPlainText(doc);
    expect(result).toBe('Hello World\nSecond paragraph\n');
  });

  it('extracts text from tables', () => {
    const doc: docs_v1.Schema$Document = {
      body: {
        content: [
          {
            table: {
              tableRows: [
                {
                  tableCells: [
                    {
                      content: [
                        { paragraph: { elements: [{ textRun: { content: 'Cell A\n' } }] } },
                      ],
                    },
                    {
                      content: [
                        { paragraph: { elements: [{ textRun: { content: 'Cell B\n' } }] } },
                      ],
                    },
                  ],
                },
                {
                  tableCells: [
                    {
                      content: [
                        { paragraph: { elements: [{ textRun: { content: 'Cell C\n' } }] } },
                      ],
                    },
                    {
                      content: [
                        { paragraph: { elements: [{ textRun: { content: 'Cell D\n' } }] } },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    };

    const result = extractPlainText(doc);
    expect(result).toBe('Cell A\n\tCell B\n\nCell C\n\tCell D\n');
  });

  it('returns empty string for empty document', () => {
    const doc: docs_v1.Schema$Document = {
      body: { content: [] },
    };

    const result = extractPlainText(doc);
    expect(result).toBe('');
  });

  it('returns empty string when body is undefined', () => {
    const doc: docs_v1.Schema$Document = {};

    const result = extractPlainText(doc);
    expect(result).toBe('');
  });

  it('handles elements without textRun', () => {
    const doc: docs_v1.Schema$Document = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                { inlineObjectElement: { inlineObjectId: 'img1' } } as any,
                { textRun: { content: 'After image\n' } },
              ],
            },
          },
        ],
      },
    };

    const result = extractPlainText(doc);
    expect(result).toBe('After image\n');
  });

  it('skips section breaks', () => {
    const doc: docs_v1.Schema$Document = {
      body: {
        content: [
          { sectionBreak: {} },
          {
            paragraph: {
              elements: [{ textRun: { content: 'After break\n' } }],
            },
          },
        ],
      },
    };

    const result = extractPlainText(doc);
    expect(result).toBe('After break\n');
  });

  it('handles mixed content (paragraphs + tables)', () => {
    const doc: docs_v1.Schema$Document = {
      body: {
        content: [
          {
            paragraph: {
              elements: [{ textRun: { content: 'Title\n' } }],
            },
          },
          {
            table: {
              tableRows: [
                {
                  tableCells: [
                    {
                      content: [
                        { paragraph: { elements: [{ textRun: { content: 'Data\n' } }] } },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          {
            paragraph: {
              elements: [{ textRun: { content: 'Footer\n' } }],
            },
          },
        ],
      },
    };

    const result = extractPlainText(doc);
    expect(result).toBe('Title\nData\nFooter\n');
  });
});
