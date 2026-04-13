import { describe, it, expect, mock } from 'bun:test';
import type { docs_v1 } from 'googleapis';

const mockGetDocument = mock(async (): Promise<docs_v1.Schema$Document> => ({
  documentId: 'doc-abc123',
  title: 'My Test Document',
  body: {
    content: [
      {
        paragraph: {
          elements: [{ textRun: { content: 'Hello World\n' } }],
        },
      },
      {
        paragraph: {
          elements: [{ textRun: { content: 'This is a test document.\n' } }],
        },
      },
    ],
  },
}));

mock.module('../../../../src/services/docs/client', () => ({
  getDocument: mockGetDocument,
}));

const { runGetDoc } = await import('../../../../src/services/docs/commands/get');

describe('runGetDoc', () => {
  it('returns document with extracted plain text', async () => {
    const result = await runGetDoc({} as any, 'doc-abc123');
    expect(result).toEqual({
      document: {
        documentId: 'doc-abc123',
        title: 'My Test Document',
        content: 'Hello World\nThis is a test document.\n',
      },
    });
  });

  it('passes documentId to client', async () => {
    await runGetDoc({} as any, 'doc-xyz789');
    expect(mockGetDocument).toHaveBeenCalledWith({}, 'doc-xyz789');
  });
});
