import { describe, it, expect, mock } from 'bun:test';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { GtmTagDetail, GtmTriggerDetail, GtmVariableDetail } from '../../../../src/services/gtm/types';

const mockGetFirstWorkspaceId = mock(async (): Promise<string> => '1');
const mockCreateTag = mock(
  async (_auth: unknown, _acc: string, _container: string, _ws: string, payload: Record<string, unknown>): Promise<GtmTagDetail> => ({
    tagId: '999',
    name: (payload.name as string) ?? '',
    type: (payload.type as string) ?? '',
    paused: false,
    firingTriggerId: (payload.firingTriggerId as string[]) ?? [],
    blockingTriggerId: [],
    parameter: (payload.parameter as any[]) ?? [],
  }),
);
const mockCreateTrigger = mock(
  async (_auth: unknown, _acc: string, _container: string, _ws: string, payload: Record<string, unknown>): Promise<GtmTriggerDetail> => ({
    triggerId: '888',
    name: (payload.name as string) ?? '',
    type: (payload.type as string) ?? '',
    filter: (payload.filter as any[]) ?? [],
  }),
);
const mockCreateVariable = mock(
  async (_auth: unknown, _acc: string, _container: string, _ws: string, payload: Record<string, unknown>): Promise<GtmVariableDetail> => ({
    variableId: '777',
    name: (payload.name as string) ?? '',
    type: (payload.type as string) ?? '',
    parameter: (payload.parameter as any[]) ?? [],
  }),
);

// bun:test module mocks persist across files within a run. Declaring every export any command
// module might import keeps later test files (e.g. update.test.ts running in a reduced selection)
// from crashing with "export not found" on transitively-loaded commands. The stubs are never
// called by this file.
const noop = mock(async () => {
  throw new Error('unexpected call');
});

mock.module('../../../../src/services/gtm/client', () => ({
  getFirstWorkspaceId: mockGetFirstWorkspaceId,
  createTag: mockCreateTag,
  createTrigger: mockCreateTrigger,
  createVariable: mockCreateVariable,
  updateTagHtml: noop,
  updateVariable: noop,
  listAccounts: noop,
  listContainers: noop,
  listTags: noop,
  listTriggers: noop,
  listVariables: noop,
  getTag: noop,
  getTrigger: noop,
  getVariable: noop,
  listTemplates: noop,
  getTemplate: noop,
  listVersionHeaders: noop,
  getVersion: noop,
  getLiveVersion: noop,
}));

const { runCreateTag, runCreateTrigger, runCreateVariable } = await import('../../../../src/services/gtm/commands/create');

function withJsonFile<T>(payload: unknown, fn: (path: string) => Promise<T>): Promise<T> {
  const tmpFile = join(tmpdir(), `gtools-create-test-${Date.now()}-${Math.random()}.json`);
  writeFileSync(tmpFile, JSON.stringify(payload), 'utf-8');
  return fn(tmpFile).finally(() => unlinkSync(tmpFile));
}

describe('runCreateTag', () => {
  it('reads JSON payload from file and calls createTag', async () => {
    const payload = {
      name: 'Mixpanel - Search Query Sent',
      type: 'html',
      firingTriggerId: ['217'],
      parameter: [{ type: 'template', key: 'html', value: '<script>x</script>' }],
    };

    const result = await withJsonFile(payload, (path) =>
      runCreateTag({} as any, '111', '222', path),
    );

    expect(mockGetFirstWorkspaceId).toHaveBeenCalledWith({}, '111', '222');
    expect(mockCreateTag).toHaveBeenCalledWith({}, '111', '222', '1', payload);
    if ('tag' in result) {
      expect(result.tag.name).toBe('Mixpanel - Search Query Sent');
    } else {
      throw new Error('Expected tag in result');
    }
  });

  it('returns error when file is missing', async () => {
    const result = await runCreateTag({} as any, '111', '222', '/nonexistent/file.json');

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('Failed to read');
    }
  });

  it('returns error when file is not valid JSON', async () => {
    const tmpFile = join(tmpdir(), `gtools-create-test-${Date.now()}.json`);
    writeFileSync(tmpFile, 'not json', 'utf-8');

    try {
      const result = await runCreateTag({} as any, '111', '222', tmpFile);
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('parse');
      }
    } finally {
      unlinkSync(tmpFile);
    }
  });

  it('accepts a wrapped { tag: ... } payload as emitted by get-tag', async () => {
    const payload = {
      tag: {
        name: 'Wrapped Tag',
        type: 'html',
        parameter: [],
      },
    };

    await withJsonFile(payload, (path) => runCreateTag({} as any, '111', '222', path));

    // When wrapped, the CLI should unwrap .tag before passing to client
    const call = mockCreateTag.mock.calls[mockCreateTag.mock.calls.length - 1];
    expect(call[4]).toEqual(payload.tag);
  });
});

describe('runCreateTrigger', () => {
  it('reads JSON payload and calls createTrigger', async () => {
    const payload = { name: 'Event - Search Query Sent', type: 'customEvent', filter: [] };

    const result = await withJsonFile(payload, (path) =>
      runCreateTrigger({} as any, '111', '222', path),
    );

    expect(mockCreateTrigger).toHaveBeenCalledWith({}, '111', '222', '1', payload);
    if ('trigger' in result) {
      expect(result.trigger.name).toBe('Event - Search Query Sent');
    } else {
      throw new Error('Expected trigger in result');
    }
  });

  it('accepts a wrapped { trigger: ... } payload as emitted by get-trigger', async () => {
    const payload = { trigger: { name: 'Wrapped Trigger', type: 'customEvent' } };

    await withJsonFile(payload, (path) => runCreateTrigger({} as any, '111', '222', path));

    const call = mockCreateTrigger.mock.calls[mockCreateTrigger.mock.calls.length - 1];
    expect(call[4]).toEqual(payload.trigger);
  });
});

describe('runCreateVariable', () => {
  it('reads JSON payload and calls createVariable', async () => {
    const payload = { name: 'cjs - Region ID', type: 'jsm', parameter: [] };

    const result = await withJsonFile(payload, (path) =>
      runCreateVariable({} as any, '111', '222', path),
    );

    expect(mockCreateVariable).toHaveBeenCalledWith({}, '111', '222', '1', payload);
    if ('variable' in result) {
      expect(result.variable.name).toBe('cjs - Region ID');
    } else {
      throw new Error('Expected variable in result');
    }
  });

  it('accepts a wrapped { variable: ... } payload as emitted by get-variable', async () => {
    const payload = { variable: { name: 'Wrapped', type: 'jsm' } };

    await withJsonFile(payload, (path) => runCreateVariable({} as any, '111', '222', path));

    const call = mockCreateVariable.mock.calls[mockCreateVariable.mock.calls.length - 1];
    expect(call[4]).toEqual(payload.variable);
  });
});
