import { describe, it, expect, mock } from 'bun:test';

import type { GtmVersionDetail, GtmVersionHeader } from '@/services/gtm/types';

const sampleHeaders: GtmVersionHeader[] = [
  { containerVersionId: '31', name: 'Remove redundant log', deleted: false, numTags: '50' },
  { containerVersionId: '30', name: 'Add AI summary status', deleted: false, numTags: '50' },
];

const sampleVersionDetail: GtmVersionDetail = {
  containerVersionId: '31',
  name: 'Remove redundant log',
  description: undefined,
  deleted: false,
  tag: [
    {
      tagId: '10',
      name: 'GA4 Purchase',
      type: 'gaawe',
      paused: false,
      firingTriggerId: ['20'],
      blockingTriggerId: [],
      parameter: [{ type: 'template', key: 'measurementId', value: 'G-XXXXX' }],
    },
  ],
  trigger: [{ triggerId: '20', name: 'Click - Buy Button', type: 'CLICK', filter: [] }],
  variable: [{ variableId: '30', name: 'DL - userId', type: 'v', parameter: [] }],
  template: [{ templateId: '26', name: 'My Template', templateData: '___TERMS_OF_SERVICE___' }],
  builtInVariable: [{ name: 'Page URL', type: 'pageUrl' }],
};

const sampleLiveVersion: GtmVersionDetail = { ...sampleVersionDetail, containerVersionId: '31', name: 'Live' };

const mockListVersionHeaders = mock(async () => sampleHeaders);
const mockGetVersion = mock(async () => sampleVersionDetail);
const mockGetLiveVersion = mock(async () => sampleLiveVersion);

mock.module('@/services/gtm/client', () => ({
  listVersionHeaders: mockListVersionHeaders,
  getVersion: mockGetVersion,
  getLiveVersion: mockGetLiveVersion,
}));

const { runListVersions, runGetVersion, runGetLiveVersion } =
  await import('@/services/gtm/commands/version');

describe('runListVersions', () => {
  it('returns version headers array', async () => {
    const result = await runListVersions({} as any, '111', '222');

    expect(mockListVersionHeaders).toHaveBeenCalledWith({}, '111', '222');
    expect(result).toEqual({ versions: sampleHeaders });
  });
});

describe('runGetVersion', () => {
  it('returns full version detail by versionId', async () => {
    const result = await runGetVersion({} as any, '111', '222', '31');

    expect(mockGetVersion).toHaveBeenCalledWith({}, '111', '222', '31');
    expect(result).toEqual({ version: sampleVersionDetail });
  });
});

describe('runGetLiveVersion', () => {
  it('returns the currently published version', async () => {
    const result = await runGetLiveVersion({} as any, '111', '222');

    expect(mockGetLiveVersion).toHaveBeenCalledWith({}, '111', '222');
    expect(result).toEqual({ version: sampleLiveVersion });
  });
});
