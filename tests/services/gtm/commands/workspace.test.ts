import { describe, it, expect, mock } from 'bun:test';

import type { GtmWorkspace } from '@/services/gtm/types';

const mockListWorkspaces = mock(async (): Promise<GtmWorkspace[]> => [
  { workspaceId: '1', name: 'Default Workspace' },
  { workspaceId: '99', name: 'ZOEKIT-18164' },
]);
const mockCreateWorkspace = mock(
  async (_auth: unknown, _acc: string, _container: string, name: string, description?: string): Promise<GtmWorkspace> => ({
    workspaceId: '100',
    name,
    description,
  }),
);
const mockDeleteWorkspace = mock(async (): Promise<void> => {});

const noop = mock(async () => {
  throw new Error('unexpected call');
});

mock.module('@/services/gtm/client', () => ({
  listWorkspaces: mockListWorkspaces,
  createWorkspace: mockCreateWorkspace,
  deleteWorkspace: mockDeleteWorkspace,
  getFirstWorkspaceId: noop,
  resolveWorkspaceId: noop,
  createTag: noop,
  createTrigger: noop,
  createVariable: noop,
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

const { runListWorkspaces, runCreateWorkspace, runDeleteWorkspace } = await import('@/services/gtm/commands/workspace');

describe('runListWorkspaces', () => {
  it('returns workspaces from the client', async () => {
    const result = await runListWorkspaces({} as any, '111', '222');

    expect(mockListWorkspaces).toHaveBeenCalledWith({}, '111', '222');
    if ('workspaces' in result) {
      expect(result.workspaces).toHaveLength(2);
      expect(result.workspaces[1]).toEqual({ workspaceId: '99', name: 'ZOEKIT-18164' });
    } else {
      throw new Error('Expected workspaces in result');
    }
  });
});

describe('runCreateWorkspace', () => {
  it('creates a workspace with name and optional description', async () => {
    const result = await runCreateWorkspace({} as any, '111', '222', 'feature-X', 'tracking feature X');

    expect(mockCreateWorkspace).toHaveBeenCalledWith({}, '111', '222', 'feature-X', 'tracking feature X');
    if ('workspace' in result) {
      expect(result.workspace).toEqual({ workspaceId: '100', name: 'feature-X', description: 'tracking feature X' });
    } else {
      throw new Error('Expected workspace in result');
    }
  });

  it('omits description when not provided', async () => {
    await runCreateWorkspace({} as any, '111', '222', 'feature-Y');

    const lastCall = mockCreateWorkspace.mock.calls[mockCreateWorkspace.mock.calls.length - 1];
    expect(lastCall[3]).toBe('feature-Y');
    expect(lastCall[4]).toBeUndefined();
  });
});

describe('runDeleteWorkspace', () => {
  it('deletes the workspace and returns the deleted id', async () => {
    const result = await runDeleteWorkspace({} as any, '111', '222', '99');

    expect(mockDeleteWorkspace).toHaveBeenCalledWith({}, '111', '222', '99');
    if ('deletedWorkspaceId' in result) {
      expect(result.deletedWorkspaceId).toBe('99');
    } else {
      throw new Error('Expected deletedWorkspaceId in result');
    }
  });
});
