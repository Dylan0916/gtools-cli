import { describe, it, expect } from 'bun:test';

const { parseCliArgs } = await import('../src/cli');

describe('parseCliArgs', () => {
  describe('GTM subcommands', () => {
    it('parses service + command + flags', () => {
      const args = parseCliArgs(['gtm', 'list-tags', '--account', '111', '--container', '222']);
      expect(args.service).toBe('gtm');
      expect(args.command).toBe('list-tags');
      expect(args.account).toBe('111');
      expect(args.container).toBe('222');
    });

    it('parses --query flag', () => {
      const args = parseCliArgs(['gtm', 'search', '--account', '111', '--container', '222', '--query', 'purchase']);
      expect(args.service).toBe('gtm');
      expect(args.command).toBe('search');
      expect(args.query).toBe('purchase');
    });

    it('parses --id flag', () => {
      const args = parseCliArgs(['gtm', 'get-tag', '--account', '111', '--container', '222', '--id', '10']);
      expect(args.service).toBe('gtm');
      expect(args.command).toBe('get-tag');
      expect(args.id).toBe('10');
    });
  });

  describe('Docs subcommands', () => {
    it('parses docs get with --id', () => {
      const args = parseCliArgs(['docs', 'get', '--id', 'abc123']);
      expect(args.service).toBe('docs');
      expect(args.command).toBe('get');
      expect(args.id).toBe('abc123');
    });
  });

  describe('Top-level commands', () => {
    it('parses login as top-level command', () => {
      const args = parseCliArgs(['login']);
      expect(args.service).toBeUndefined();
      expect(args.command).toBe('login');
    });

    it('handles empty args', () => {
      const args = parseCliArgs([]);
      expect(args.service).toBeUndefined();
      expect(args.command).toBe('');
    });
  });
});
