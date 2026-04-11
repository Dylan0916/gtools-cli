import { describe, it, expect, mock } from 'bun:test';

mock.module('../src/auth', () => ({ getAuth: mock(() => ({})) }));
mock.module('../src/commands/list', () => ({
  runListAccounts: mock(async () => ({ accounts: [] })),
  runListContainers: mock(async () => ({ containers: [] })),
  runListTags: mock(async () => ({ tags: [] })),
  runListTriggers: mock(async () => ({ triggers: [] })),
  runListVariables: mock(async () => ({ variables: [] })),
}));
mock.module('../src/commands/get', () => ({
  runGetTag: mock(async () => ({ tag: {} })),
  runGetTrigger: mock(async () => ({ trigger: {} })),
  runGetVariable: mock(async () => ({ variable: {} })),
}));
mock.module('../src/commands/search', () => ({
  runSearch: mock(async () => ({ results: [] })),
}));

const { parseCliArgs } = await import('../src/gtm');

describe('parseCliArgs', () => {
  it('parses --account and --container flags', () => {
    const args = parseCliArgs(['list-tags', '--account', '111', '--container', '222']);
    expect(args.command).toBe('list-tags');
    expect(args.account).toBe('111');
    expect(args.container).toBe('222');
  });

  it('parses --query flag', () => {
    const args = parseCliArgs(['search', '--account', '111', '--container', '222', '--query', 'purchase']);
    expect(args.command).toBe('search');
    expect(args.query).toBe('purchase');
  });

  it('returns error when --account missing for container command', () => {
    const args = parseCliArgs(['list-tags', '--container', '222']);
    expect(args.error).toContain('--account');
  });
});
