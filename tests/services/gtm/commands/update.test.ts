import { describe, it, expect, mock } from 'bun:test';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { GtmTagDetail } from '../../../../src/services/gtm/types';

const mockUpdateTagHtml = mock(async (): Promise<GtmTagDetail> => ({
  tagId: '42',
  name: 'My HTML Tag',
  type: 'html',
  paused: false,
  firingTriggerId: ['10'],
  blockingTriggerId: [],
  parameter: [{ type: 'template', key: 'html', value: '<script>updated</script>' }],
}));
const mockGetFirstWorkspaceId = mock(async (): Promise<string> => '1');

mock.module('../../../../src/services/gtm/client', () => ({
  updateTagHtml: mockUpdateTagHtml,
  getFirstWorkspaceId: mockGetFirstWorkspaceId,
}));

const { runUpdateTagHtml } = await import('../../../../src/services/gtm/commands/update');

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
