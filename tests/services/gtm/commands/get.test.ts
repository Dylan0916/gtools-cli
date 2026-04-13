import { describe, it, expect, mock } from 'bun:test';
import type { GtmTagDetail, GtmTriggerDetail, GtmVariableDetail } from '../../../../src/services/gtm/types';

const mockGetTag = mock(async (): Promise<GtmTagDetail> => ({
  tagId: '10',
  name: 'GA4 Purchase',
  type: 'gaawe',
  paused: false,
  firingTriggerId: ['20'],
  blockingTriggerId: [],
  parameter: [{ type: 'template', key: 'measurementId', value: 'G-XXXXX' }],
}));
const mockGetTrigger = mock(async (): Promise<GtmTriggerDetail> => ({
  triggerId: '20',
  name: 'Click - Buy Button',
  type: 'CLICK',
  filter: [],
}));
const mockGetVariable = mock(async (): Promise<GtmVariableDetail> => ({
  variableId: '30',
  name: 'DL - transactionId',
  type: 'v',
  parameter: [{ type: 'template', key: 'name', value: 'transactionId' }],
}));
const mockGetFirstWorkspaceId = mock(async (): Promise<string> => '1');

mock.module('../../../../src/services/gtm/client', () => ({
  getTag: mockGetTag,
  getTrigger: mockGetTrigger,
  getVariable: mockGetVariable,
  getFirstWorkspaceId: mockGetFirstWorkspaceId,
}));

const { runGetTag, runGetTrigger, runGetVariable } = await import('../../../../src/services/gtm/commands/get');

describe('runGetTag', () => {
  it('returns full tag detail', async () => {
    const result = await runGetTag({} as any, '111', '222', '10');
    expect(result).toEqual({
      tag: {
        tagId: '10',
        name: 'GA4 Purchase',
        type: 'gaawe',
        paused: false,
        firingTriggerId: ['20'],
        blockingTriggerId: [],
        parameter: [{ type: 'template', key: 'measurementId', value: 'G-XXXXX' }],
      },
    });
  });
});

describe('runGetTrigger', () => {
  it('returns full trigger detail', async () => {
    const result = await runGetTrigger({} as any, '111', '222', '20');
    expect(result).toEqual({
      trigger: { triggerId: '20', name: 'Click - Buy Button', type: 'CLICK', filter: [] },
    });
  });
});

describe('runGetVariable', () => {
  it('returns full variable detail', async () => {
    const result = await runGetVariable({} as any, '111', '222', '30');
    expect(result).toEqual({
      variable: {
        variableId: '30',
        name: 'DL - transactionId',
        type: 'v',
        parameter: [{ type: 'template', key: 'name', value: 'transactionId' }],
      },
    });
  });
});
