import { describe, it, expect, mock } from 'bun:test';

import type { GtmTemplate, GtmTemplateDetail } from '@/services/gtm/types';

const mockListTemplates = mock(async (): Promise<GtmTemplate[]> => [
  { templateId: '26', name: 'My Custom Template' },
]);
const mockGetTemplate = mock(async (): Promise<GtmTemplateDetail> => ({
  templateId: '26',
  name: 'My Custom Template',
  templateData: 'const data = require("getAllVariables")();\nlog(data);',
}));
const mockGetFirstWorkspaceId = mock(async (): Promise<string> => '1');

mock.module('@/services/gtm/client', () => ({
  listTemplates: mockListTemplates,
  getTemplate: mockGetTemplate,
  getFirstWorkspaceId: mockGetFirstWorkspaceId,
}));

const { runListTemplates, runGetTemplate } = await import('@/services/gtm/commands/template');

describe('runListTemplates', () => {
  it('returns list of templates', async () => {
    const result = await runListTemplates({} as any, '111', '222');
    expect(result).toEqual({
      templates: [{ templateId: '26', name: 'My Custom Template' }],
    });
  });
});

describe('runGetTemplate', () => {
  it('returns full template detail including templateData', async () => {
    const result = await runGetTemplate({} as any, '111', '222', '26');
    expect(result).toEqual({
      template: {
        templateId: '26',
        name: 'My Custom Template',
        templateData: 'const data = require("getAllVariables")();\nlog(data);',
      },
    });
  });
});
