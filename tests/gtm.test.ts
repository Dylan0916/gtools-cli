import { describe, it, expect } from 'bun:test';

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
