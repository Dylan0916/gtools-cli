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

    it('parses --html-file flag', () => {
      const args = parseCliArgs([
        'gtm',
        'update-tag-html',
        '--account',
        '111',
        '--container',
        '222',
        '--id',
        '10',
        '--html-file',
        '/tmp/tag.html',
      ]);
      expect(args.service).toBe('gtm');
      expect(args.command).toBe('update-tag-html');
      expect(args.htmlFile).toBe('/tmp/tag.html');
    });

    it('parses --from-version and --to-version for diff-versions', () => {
      const args = parseCliArgs([
        'gtm',
        'diff-versions',
        '--account',
        '111',
        '--container',
        '222',
        '--from-version',
        '28',
        '--to-version',
        '31',
      ]);
      expect(args.command).toBe('diff-versions');
      expect(args.fromVersion).toBe('28');
      expect(args.toVersion).toBe('31');
    });

    it('parses --from-account / --to-account / --from-container / --to-container for diff-containers', () => {
      const args = parseCliArgs([
        'gtm',
        'diff-containers',
        '--from-account',
        '111',
        '--from-container',
        'A',
        '--to-account',
        '222',
        '--to-container',
        'B',
      ]);
      expect(args.command).toBe('diff-containers');
      expect(args.fromAccount).toBe('111');
      expect(args.toAccount).toBe('222');
      expect(args.fromContainer).toBe('A');
      expect(args.toContainer).toBe('B');
    });

    it('parses --from-file flag for create commands', () => {
      const args = parseCliArgs([
        'gtm',
        'create-tag',
        '--account',
        '111',
        '--container',
        '222',
        '--from-file',
        '/tmp/tag.json',
      ]);
      expect(args.command).toBe('create-tag');
      expect(args.fromFile).toBe('/tmp/tag.json');
    });

    it('parses --from-file flag for update-variable', () => {
      const args = parseCliArgs([
        'gtm',
        'update-variable',
        '--account',
        '111',
        '--container',
        '222',
        '--id',
        '27',
        '--from-file',
        '/tmp/var.json',
      ]);
      expect(args.command).toBe('update-variable');
      expect(args.id).toBe('27');
      expect(args.fromFile).toBe('/tmp/var.json');
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

  describe('Sheets subcommands', () => {
    it('parses sheets get with --id', () => {
      const args = parseCliArgs(['sheets', 'get', '--id', 'sheet-xyz']);
      expect(args.service).toBe('sheets');
      expect(args.command).toBe('get');
      expect(args.id).toBe('sheet-xyz');
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
