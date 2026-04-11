import { describe, it, expect, mock } from 'bun:test';
import type { GtmAccount, GtmContainer, GtmTag, GtmTrigger, GtmVariable } from '../../src/types';

const mockListAccounts = mock(async (): Promise<GtmAccount[]> => [
  { accountId: '111', name: 'My Account' },
]);
const mockListContainers = mock(async (): Promise<GtmContainer[]> => [
  { accountId: '111', containerId: '222', publicId: 'GTM-ABCD', name: 'My Site' },
]);
const mockGetFirstWorkspaceId = mock(async (): Promise<string> => '1');
const mockListTags = mock(async (): Promise<GtmTag[]> => [
  { tagId: '10', name: 'GA4 Purchase', type: 'gaawe', paused: false },
]);
const mockListTriggers = mock(async (): Promise<GtmTrigger[]> => [
  { triggerId: '20', name: 'Click - Buy Button', type: 'CLICK' },
]);
const mockListVariables = mock(async (): Promise<GtmVariable[]> => [
  { variableId: '30', name: 'DL - transactionId', type: 'v' },
]);

mock.module('../../src/gtmClient', () => ({
  listAccounts: mockListAccounts,
  listContainers: mockListContainers,
  getFirstWorkspaceId: mockGetFirstWorkspaceId,
  listTags: mockListTags,
  listTriggers: mockListTriggers,
  listVariables: mockListVariables,
}));

const { runListAccounts, runListContainers, runListTags, runListTriggers, runListVariables } =
  await import('../../src/commands/list');

describe('runListAccounts', () => {
  it('returns accounts array', async () => {
    const result = await runListAccounts({} as any);
    expect(result).toEqual({ accounts: [{ accountId: '111', name: 'My Account' }] });
  });
});

describe('runListContainers', () => {
  it('returns containers with publicId', async () => {
    const result = await runListContainers({} as any, '111');
    expect(result).toEqual({
      containers: [{ accountId: '111', containerId: '222', publicId: 'GTM-ABCD', name: 'My Site' }],
    });
  });
});

describe('runListTags', () => {
  it('fetches workspace id and returns tags', async () => {
    const result = await runListTags({} as any, '111', '222');
    expect(mockGetFirstWorkspaceId).toHaveBeenCalledWith({}, '111', '222');
    expect(result).toEqual({ tags: [{ tagId: '10', name: 'GA4 Purchase', type: 'gaawe', paused: false }] });
  });
});

describe('runListTriggers', () => {
  it('returns triggers array', async () => {
    const result = await runListTriggers({} as any, '111', '222');
    expect(result).toEqual({ triggers: [{ triggerId: '20', name: 'Click - Buy Button', type: 'CLICK' }] });
  });
});

describe('runListVariables', () => {
  it('returns variables array', async () => {
    const result = await runListVariables({} as any, '111', '222');
    expect(result).toEqual({ variables: [{ variableId: '30', name: 'DL - transactionId', type: 'v' }] });
  });
});
