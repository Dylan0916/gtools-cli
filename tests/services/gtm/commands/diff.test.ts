import { describe, it, expect, mock } from 'bun:test';
import type { GtmVersionDetail } from '../../../../src/services/gtm/types';

function makeVersion(overrides: Partial<GtmVersionDetail> = {}): GtmVersionDetail {
  return {
    containerVersionId: '1',
    name: '',
    deleted: false,
    tag: [],
    trigger: [],
    variable: [],
    template: [],
    builtInVariable: [],
    ...overrides,
  };
}

const leftVersion = makeVersion({
  containerVersionId: '28',
  name: 'Pre v29',
  tag: [
    {
      tagId: '10',
      name: 'Old Tag',
      type: 'html',
      paused: false,
      firingTriggerId: [],
      blockingTriggerId: [],
      parameter: [],
    },
  ],
});

const rightVersion = makeVersion({
  containerVersionId: '31',
  name: 'Post v31',
  tag: [
    {
      tagId: '10',
      name: 'Old Tag',
      type: 'html',
      paused: false,
      firingTriggerId: [],
      blockingTriggerId: [],
      parameter: [],
    },
    {
      tagId: '11',
      name: 'Search Query Sent',
      type: 'html',
      paused: false,
      firingTriggerId: [],
      blockingTriggerId: [],
      parameter: [],
    },
  ],
});

const liveA = makeVersion({ containerVersionId: '10', name: 'A live', tag: leftVersion.tag });
const liveB = makeVersion({ containerVersionId: '20', name: 'B live', tag: rightVersion.tag });

const mockGetVersion = mock(async (_auth: unknown, _acc: string, _container: string, versionId: string) => {
  if (versionId === '28') {
    return leftVersion;
  }
  if (versionId === '31') {
    return rightVersion;
  }
  throw new Error(`Unexpected versionId: ${versionId}`);
});

const mockGetLiveVersion = mock(async (_auth: unknown, _acc: string, containerId: string) => {
  if (containerId === 'A') {
    return liveA;
  }
  if (containerId === 'B') {
    return liveB;
  }
  throw new Error(`Unexpected containerId: ${containerId}`);
});

mock.module('../../../../src/services/gtm/client', () => ({
  getVersion: mockGetVersion,
  getLiveVersion: mockGetLiveVersion,
}));

const { runDiffVersions, runDiffContainers } = await import('../../../../src/services/gtm/commands/diff');

describe('runDiffVersions', () => {
  it('fetches both versions in the same container and returns diff matched by id', async () => {
    const result = await runDiffVersions({} as any, '111', '222', '28', '31');

    expect(mockGetVersion).toHaveBeenCalledWith({}, '111', '222', '28');
    expect(mockGetVersion).toHaveBeenCalledWith({}, '111', '222', '31');
    if ('diff' in result) {
      expect(result.diff.added).toHaveLength(1);
      expect(result.diff.added[0]).toMatchObject({ kind: 'tag', identity: '11', name: 'Search Query Sent' });
      expect(result.diff.removed).toEqual([]);
      expect(result.diff.modified).toEqual([]);
    } else {
      throw new Error(`Expected diff result, got ${JSON.stringify(result)}`);
    }
  });
});

describe('runDiffContainers', () => {
  it('fetches live versions of both containers and returns diff matched by name', async () => {
    const result = await runDiffContainers({} as any, '111', 'A', '222', 'B');

    expect(mockGetLiveVersion).toHaveBeenCalledWith({}, '111', 'A');
    expect(mockGetLiveVersion).toHaveBeenCalledWith({}, '222', 'B');
    if ('diff' in result) {
      expect(result.diff.added).toHaveLength(1);
      expect(result.diff.added[0]).toMatchObject({ kind: 'tag', identity: 'Search Query Sent' });
      expect(result.diff.removed).toEqual([]);
      expect(result.diff.modified).toEqual([]);
    } else {
      throw new Error(`Expected diff result, got ${JSON.stringify(result)}`);
    }
  });
});
