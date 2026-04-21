import { describe, it, expect, mock } from 'bun:test';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import type { GtmTagDetail, GtmVariableDetail } from '@/services/gtm/types';

const mockUpdateTagHtml = mock(async (): Promise<GtmTagDetail> => ({
  tagId: '42',
  name: 'My HTML Tag',
  type: 'html',
  paused: false,
  firingTriggerId: ['10'],
  blockingTriggerId: [],
  parameter: [{ type: 'template', key: 'html', value: '<script>updated</script>' }],
}));
const mockUpdateVariable = mock(
  async (_auth: unknown, _acc: string, _container: string, _ws: string, _id: string, params: any[]): Promise<GtmVariableDetail> => ({
    variableId: '99',
    name: 'My Variable',
    type: 'jsm',
    parameter: params,
  }),
);
const mockGetFirstWorkspaceId = mock(async (): Promise<string> => '1');

mock.module('@/services/gtm/client', () => ({
  updateTagHtml: mockUpdateTagHtml,
  updateVariable: mockUpdateVariable,
  getFirstWorkspaceId: mockGetFirstWorkspaceId,
}));

const { runUpdateTagHtml, runUpdateVariable } = await import('@/services/gtm/commands/update');

describe('runUpdateTagHtml', () => {
  it('reads html from file and calls updateTagHtml', async () => {
    const tmpFile = join(tmpdir(), `gtools-test-${Date.now()}.html`);
    writeFileSync(tmpFile, '<script>updated</script>', 'utf-8');

    try {
      const result = await runUpdateTagHtml({} as any, '111', '222', '42', tmpFile);

      expect(result).toEqual({
        tag: {
          tagId: '42',
          name: 'My HTML Tag',
          type: 'html',
          paused: false,
          firingTriggerId: ['10'],
          blockingTriggerId: [],
          parameter: [{ type: 'template', key: 'html', value: '<script>updated</script>' }],
        },
      });
      expect(mockUpdateTagHtml).toHaveBeenCalledWith({}, '111', '222', '1', '42', '<script>updated</script>');
    } finally {
      unlinkSync(tmpFile);
    }
  });

  it('returns error when html file cannot be read', async () => {
    const result = await runUpdateTagHtml({} as any, '111', '222', '42', '/nonexistent/path.html');

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('Failed to read html file');
    }
  });
});

describe('runUpdateVariable', () => {
  it('reads JSON file and passes parameter array to updateVariable', async () => {
    const payload = { parameter: [{ type: 'template', key: 'javascript', value: 'function(){return 1}' }] };
    const tmpFile = join(tmpdir(), `gtools-update-var-${Date.now()}.json`);
    writeFileSync(tmpFile, JSON.stringify(payload), 'utf-8');

    try {
      const result = await runUpdateVariable({} as any, '111', '222', '99', tmpFile);

      expect(mockGetFirstWorkspaceId).toHaveBeenCalledWith({}, '111', '222');
      expect(mockUpdateVariable).toHaveBeenCalledWith({}, '111', '222', '1', '99', payload.parameter);
      if ('variable' in result) {
        expect(result.variable.parameter).toEqual(payload.parameter);
      } else {
        throw new Error('Expected variable in result');
      }
    } finally {
      unlinkSync(tmpFile);
    }
  });

  it('accepts a wrapped { variable: { parameter: [...] } } payload', async () => {
    const inner = { parameter: [{ type: 'template', key: 'javascript', value: 'fn()' }] };
    const payload = { variable: inner };
    const tmpFile = join(tmpdir(), `gtools-update-var-wrapped-${Date.now()}.json`);
    writeFileSync(tmpFile, JSON.stringify(payload), 'utf-8');

    try {
      await runUpdateVariable({} as any, '111', '222', '99', tmpFile);

      const call = mockUpdateVariable.mock.calls[mockUpdateVariable.mock.calls.length - 1];
      expect(call[5]).toEqual(inner.parameter);
    } finally {
      unlinkSync(tmpFile);
    }
  });

  it('returns error when file is missing', async () => {
    const result = await runUpdateVariable({} as any, '111', '222', '99', '/nope/missing.json');

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('Failed to read');
    }
  });
});
