import { describe, it, expect } from 'bun:test';

import { computeDiff } from '@/services/gtm/diff';
import type { GtmVersionDetail } from '@/services/gtm/types';

function makeVersion(overrides: Partial<GtmVersionDetail> = {}): GtmVersionDetail {
  return {
    containerVersionId: '1',
    name: 'v1',
    deleted: false,
    tag: [],
    trigger: [],
    variable: [],
    template: [],
    builtInVariable: [],
    ...overrides,
  };
}

describe('computeDiff (matchBy: id)', () => {
  it('returns empty diff when versions are identical', () => {
    const v = makeVersion({
      tag: [
        {
          tagId: '10',
          name: 'GA4 Purchase',
          type: 'gaawe',
          paused: false,
          firingTriggerId: ['20'],
          blockingTriggerId: [],
          parameter: [{ type: 'template', key: 'measurementId', value: 'G-XXXXX' }],
        },
      ],
    });

    const diff = computeDiff(v, v, 'id');

    expect(diff).toEqual({ added: [], removed: [], modified: [] });
  });

  it('detects added tag (present in right, missing in left)', () => {
    const left = makeVersion();
    const right = makeVersion({
      tag: [
        {
          tagId: '10',
          name: 'GA4 Purchase',
          type: 'gaawe',
          paused: false,
          firingTriggerId: ['20'],
          blockingTriggerId: [],
          parameter: [],
        },
      ],
    });

    const diff = computeDiff(left, right, 'id');

    expect(diff.removed).toEqual([]);
    expect(diff.modified).toEqual([]);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0]).toMatchObject({ kind: 'tag', identity: '10', name: 'GA4 Purchase' });
  });

  it('detects removed tag (present in left, missing in right)', () => {
    const tag = {
      tagId: '10',
      name: 'Search Query Sent',
      type: 'html',
      paused: false,
      firingTriggerId: ['20'],
      blockingTriggerId: [],
      parameter: [],
    };
    const left = makeVersion({ tag: [tag] });
    const right = makeVersion();

    const diff = computeDiff(left, right, 'id');

    expect(diff.added).toEqual([]);
    expect(diff.modified).toEqual([]);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0]).toMatchObject({ kind: 'tag', identity: '10', name: 'Search Query Sent' });
  });

  it('detects modified tag and lists changed fields', () => {
    const leftTag = {
      tagId: '10',
      name: 'GA4 Purchase',
      type: 'gaawe',
      paused: false,
      firingTriggerId: ['20'],
      blockingTriggerId: [],
      parameter: [{ type: 'template', key: 'measurementId', value: 'G-OLD' }],
    };
    const rightTag = { ...leftTag, paused: true, parameter: [{ type: 'template', key: 'measurementId', value: 'G-NEW' }] };
    const left = makeVersion({ tag: [leftTag] });
    const right = makeVersion({ tag: [rightTag] });

    const diff = computeDiff(left, right, 'id');

    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].kind).toBe('tag');
    expect(diff.modified[0].identity).toBe('10');
    expect(diff.modified[0].changedFields.sort()).toEqual(['parameter', 'paused']);
    expect(diff.modified[0].before).toEqual(leftTag);
    expect(diff.modified[0].after).toEqual(rightTag);
  });

  it('diffs triggers, variables, templates, and builtInVariables', () => {
    const left = makeVersion({
      trigger: [{ triggerId: '20', name: 'T1', type: 'CLICK', filter: [] }],
      variable: [{ variableId: '30', name: 'V1', type: 'v', parameter: [] }],
      template: [{ templateId: '40', name: 'Tmpl', templateData: 'old' }],
      builtInVariable: [{ name: 'Page URL', type: 'pageUrl' }],
    });
    const right = makeVersion({
      trigger: [{ triggerId: '21', name: 'T2', type: 'CLICK', filter: [] }],
      variable: [{ variableId: '30', name: 'V1', type: 'v', parameter: [{ type: 'template', key: 'name', value: 'x' }] }],
      template: [{ templateId: '40', name: 'Tmpl', templateData: 'new' }],
      builtInVariable: [
        { name: 'Page URL', type: 'pageUrl' },
        { name: 'Click Element', type: 'clickElement' },
      ],
    });

    const diff = computeDiff(left, right, 'id');

    const added = diff.added.map((e) => `${e.kind}:${e.identity}`).sort();
    const removed = diff.removed.map((e) => `${e.kind}:${e.identity}`).sort();
    const modified = diff.modified.map((e) => `${e.kind}:${e.identity}`).sort();

    expect(added).toEqual(['builtInVariable:clickElement', 'trigger:21']);
    expect(removed).toEqual(['trigger:20']);
    expect(modified).toEqual(['template:40', 'variable:30']);
  });
});

describe('computeDiff (matchBy: name) — cross-container semantics', () => {
  it('matches tags by name even when ids differ', () => {
    const leftTag = {
      tagId: '10',
      name: 'GA4 Purchase',
      type: 'gaawe',
      paused: false,
      firingTriggerId: ['100'],
      blockingTriggerId: [],
      parameter: [],
    };
    const rightTag = { ...leftTag, tagId: '999', firingTriggerId: ['200'] };
    // Trigger id 100 in left and 200 in right both resolve to the same name "Click"
    const left = makeVersion({
      tag: [leftTag],
      trigger: [{ triggerId: '100', name: 'Click', type: 'CLICK', filter: [] }],
    });
    const right = makeVersion({
      tag: [rightTag],
      trigger: [{ triggerId: '200', name: 'Click', type: 'CLICK', filter: [] }],
    });

    const diff = computeDiff(left, right, 'name');

    // Same tag (by name), same trigger (by name), ids differ but that's expected across containers
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.modified).toEqual([]);
  });

  it('detects genuine changes even when trigger ids differ', () => {
    const leftTag = {
      tagId: '10',
      name: 'GA4 Purchase',
      type: 'gaawe',
      paused: false,
      firingTriggerId: ['100'],
      blockingTriggerId: [],
      parameter: [{ type: 'template', key: 'measurementId', value: 'G-OLD' }],
    };
    const rightTag = {
      ...leftTag,
      tagId: '999',
      firingTriggerId: ['200'],
      parameter: [{ type: 'template', key: 'measurementId', value: 'G-NEW' }],
    };
    const left = makeVersion({
      tag: [leftTag],
      trigger: [{ triggerId: '100', name: 'Click', type: 'CLICK', filter: [] }],
    });
    const right = makeVersion({
      tag: [rightTag],
      trigger: [{ triggerId: '200', name: 'Click', type: 'CLICK', filter: [] }],
    });

    const diff = computeDiff(left, right, 'name');

    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].changedFields).toEqual(['parameter']);
  });

  it('flags tag as modified when a firing trigger is renamed even if ids stay the same', () => {
    const tag = {
      tagId: '10',
      name: 'GA4 Purchase',
      type: 'gaawe',
      paused: false,
      firingTriggerId: ['100'],
      blockingTriggerId: [],
      parameter: [],
    };
    const left = makeVersion({
      tag: [tag],
      trigger: [{ triggerId: '100', name: 'Click - Old', type: 'CLICK', filter: [] }],
    });
    const right = makeVersion({
      tag: [tag],
      trigger: [{ triggerId: '100', name: 'Click - New', type: 'CLICK', filter: [] }],
    });

    const diff = computeDiff(left, right, 'name');

    // Same tag payload, but the referenced trigger's name changed → tag considered modified under name-matching
    const modifiedTag = diff.modified.find((e) => e.kind === 'tag');
    expect(modifiedTag?.changedFields).toContain('firingTriggerId');
  });
});
