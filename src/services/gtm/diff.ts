import type {
  GtmBuiltInVariable,
  GtmDiffAddedOrRemovedEntry,
  GtmDiffModifiedEntry,
  GtmDiffResult,
  GtmResourceKind,
  GtmTagDetail,
  GtmTemplateDetail,
  GtmTriggerDetail,
  GtmVariableDetail,
  GtmVersionDetail,
} from './types';

type MatchBy = 'id' | 'name';

interface IdentityKey {
  identity: string;
  name: string;
}

function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function changedFieldsOf<T extends Record<string, unknown>>(before: T, after: T): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed: string[] = [];
  for (const k of keys) {
    if (!jsonEqual(before[k], after[k])) {
      changed.push(k);
    }
  }
  return changed.sort();
}

function buildTriggerIdToNameMap(triggers: GtmTriggerDetail[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const t of triggers) {
    m.set(t.triggerId, t.name);
  }
  return m;
}

// When matching by name across containers, resource IDs (tagId/triggerId/variableId/templateId)
// legitimately differ — they're assigned independently per container. Strip them from comparison so
// they don't flood `modified` with non-semantic noise. Also resolve tag trigger references (which
// hold trigger IDs) to names so the same logical trigger doesn't appear as a change.
function prepareTags(tags: GtmTagDetail[], triggers: GtmTriggerDetail[], matchBy: MatchBy): GtmTagDetail[] {
  if (matchBy === 'id') {
    return tags;
  }
  const idToName = buildTriggerIdToNameMap(triggers);
  return tags.map((t) => ({
    ...t,
    tagId: '',
    firingTriggerId: t.firingTriggerId.map((id) => idToName.get(id) ?? id),
    blockingTriggerId: t.blockingTriggerId.map((id) => idToName.get(id) ?? id),
  }));
}

function prepareTriggers(triggers: GtmTriggerDetail[], matchBy: MatchBy): GtmTriggerDetail[] {
  if (matchBy === 'id') {
    return triggers;
  }
  return triggers.map((t) => ({ ...t, triggerId: '' }));
}

function prepareVariables(variables: GtmVariableDetail[], matchBy: MatchBy): GtmVariableDetail[] {
  if (matchBy === 'id') {
    return variables;
  }
  return variables.map((v) => ({ ...v, variableId: '' }));
}

function prepareTemplates(templates: GtmTemplateDetail[], matchBy: MatchBy): GtmTemplateDetail[] {
  if (matchBy === 'id') {
    return templates;
  }
  return templates.map((t) => ({ ...t, templateId: '' }));
}

function diffCollection<T extends Record<string, unknown>>(
  kind: GtmResourceKind,
  left: T[],
  right: T[],
  keyFn: (item: T) => IdentityKey,
): { added: GtmDiffAddedOrRemovedEntry[]; removed: GtmDiffAddedOrRemovedEntry[]; modified: GtmDiffModifiedEntry[] } {
  const leftMap = new Map<string, T>();
  const leftNames = new Map<string, string>();
  for (const item of left) {
    const { identity, name } = keyFn(item);
    leftMap.set(identity, item);
    leftNames.set(identity, name);
  }

  const rightMap = new Map<string, T>();
  const rightNames = new Map<string, string>();
  for (const item of right) {
    const { identity, name } = keyFn(item);
    rightMap.set(identity, item);
    rightNames.set(identity, name);
  }

  const added: GtmDiffAddedOrRemovedEntry[] = [];
  const removed: GtmDiffAddedOrRemovedEntry[] = [];
  const modified: GtmDiffModifiedEntry[] = [];

  for (const [identity, item] of rightMap) {
    if (!leftMap.has(identity)) {
      added.push({ kind, identity, name: rightNames.get(identity) ?? identity, value: item });
    }
  }
  for (const [identity, item] of leftMap) {
    if (!rightMap.has(identity)) {
      removed.push({ kind, identity, name: leftNames.get(identity) ?? identity, value: item });
    }
  }
  for (const [identity, before] of leftMap) {
    const after = rightMap.get(identity);
    if (after === undefined) {
      continue;
    }
    if (!jsonEqual(before, after)) {
      modified.push({
        kind,
        identity,
        name: rightNames.get(identity) ?? leftNames.get(identity) ?? identity,
        changedFields: changedFieldsOf(before, after),
        before,
        after,
      });
    }
  }

  return { added, removed, modified };
}

export function computeDiff(
  left: GtmVersionDetail,
  right: GtmVersionDetail,
  matchBy: MatchBy,
): GtmDiffResult {
  const leftTags = prepareTags(left.tag, left.trigger, matchBy);
  const rightTags = prepareTags(right.tag, right.trigger, matchBy);
  const leftTriggers = prepareTriggers(left.trigger, matchBy);
  const rightTriggers = prepareTriggers(right.trigger, matchBy);
  const leftVariables = prepareVariables(left.variable, matchBy);
  const rightVariables = prepareVariables(right.variable, matchBy);
  const leftTemplates = prepareTemplates(left.template, matchBy);
  const rightTemplates = prepareTemplates(right.template, matchBy);

  const tagKey = (t: GtmTagDetail): IdentityKey =>
    matchBy === 'id' ? { identity: t.tagId, name: t.name } : { identity: t.name, name: t.name };
  const triggerKey = (t: GtmTriggerDetail): IdentityKey =>
    matchBy === 'id' ? { identity: t.triggerId, name: t.name } : { identity: t.name, name: t.name };
  const variableKey = (v: GtmVariableDetail): IdentityKey =>
    matchBy === 'id' ? { identity: v.variableId, name: v.name } : { identity: v.name, name: v.name };
  const templateKey = (t: GtmTemplateDetail): IdentityKey =>
    matchBy === 'id' ? { identity: t.templateId, name: t.name } : { identity: t.name, name: t.name };
  // builtInVariable has no id; type is the canonical identifier (e.g. "pageUrl")
  const builtInKey = (b: GtmBuiltInVariable): IdentityKey => ({ identity: b.type, name: b.name });

  const tagDiff = diffCollection('tag', leftTags, rightTags, tagKey);
  const triggerDiff = diffCollection('trigger', leftTriggers, rightTriggers, triggerKey);
  const variableDiff = diffCollection('variable', leftVariables, rightVariables, variableKey);
  const templateDiff = diffCollection('template', leftTemplates, rightTemplates, templateKey);
  const builtInDiff = diffCollection('builtInVariable', left.builtInVariable, right.builtInVariable, builtInKey);

  return {
    added: [...tagDiff.added, ...triggerDiff.added, ...variableDiff.added, ...templateDiff.added, ...builtInDiff.added],
    removed: [
      ...tagDiff.removed,
      ...triggerDiff.removed,
      ...variableDiff.removed,
      ...templateDiff.removed,
      ...builtInDiff.removed,
    ],
    modified: [
      ...tagDiff.modified,
      ...triggerDiff.modified,
      ...variableDiff.modified,
      ...templateDiff.modified,
      ...builtInDiff.modified,
    ],
  };
}
