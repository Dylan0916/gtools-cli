import { describe, it, expect, mock } from 'bun:test';
import type { GtmTag, GtmTrigger, GtmVariable } from '../../src/types';

const mockGetFirstWorkspaceId = mock(async (): Promise<string> => '1');
const mockListTags = mock(async (): Promise<GtmTag[]> => [
  { tagId: '10', name: 'GA4 Purchase Event', type: 'gaawe', paused: false },
  { tagId: '11', name: 'FB Pixel - PageView', type: 'html', paused: false },
]);
const mockListTriggers = mock(async (): Promise<GtmTrigger[]> => [
  { triggerId: '20', name: 'Click - Purchase Button', type: 'CLICK' },
]);
const mockListVariables = mock(async (): Promise<GtmVariable[]> => [
  { variableId: '30', name: 'DL - purchaseAmount', type: 'v' },
]);

mock.module('../../src/gtmClient', () => ({
  getFirstWorkspaceId: mockGetFirstWorkspaceId,
  listTags: mockListTags,
  listTriggers: mockListTriggers,
  listVariables: mockListVariables,
}));

const { runSearch } = await import('../../src/commands/search');

describe('runSearch', () => {
  it('returns matching tags, triggers, and variables case-insensitively', async () => {
    const result = await runSearch({} as any, '111', '222', 'purchase');
    expect(result).toEqual({
      results: [
        { kind: 'tag', id: '10', name: 'GA4 Purchase Event', type: 'gaawe' },
        { kind: 'trigger', id: '20', name: 'Click - Purchase Button', type: 'CLICK' },
        { kind: 'variable', id: '30', name: 'DL - purchaseAmount', type: 'v' },
      ],
    });
  });

  it('returns empty results when no match', async () => {
    const result = await runSearch({} as any, '111', '222', 'nonexistent');
    expect(result).toEqual({ results: [] });
  });
});
