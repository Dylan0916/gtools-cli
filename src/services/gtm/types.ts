export interface GtmAccount {
  accountId: string;
  name: string;
}

export interface GtmContainer {
  accountId: string;
  containerId: string;
  publicId: string; // e.g. "GTM-XXXXXX"
  name: string;
}

export interface GtmTag {
  tagId: string;
  name: string;
  type: string;
  paused: boolean;
}

export interface GtmTrigger {
  triggerId: string;
  name: string;
  type: string;
}

export interface GtmVariable {
  variableId: string;
  name: string;
  type: string;
}

// Detail types keep the common fields strongly typed while accepting unknown fields from the
// GTM API (customEventFilter, waitForTags, list/map parameters, etc.). This lets the CLI round-trip
// full resource payloads between containers without lossy re-serialization.
export interface GtmTagDetail extends GtmTag {
  firingTriggerId: string[];
  blockingTriggerId: string[];
  parameter: Array<{ type: string; key: string; value?: string; [extra: string]: unknown }>;
  [extra: string]: unknown;
}

export interface GtmTriggerDetail extends GtmTrigger {
  filter?: Array<{ type: string; parameter: Array<{ type: string; key: string; value?: string; [extra: string]: unknown }> }>;
  [extra: string]: unknown;
}

export interface GtmVariableDetail extends GtmVariable {
  parameter?: Array<{ type: string; key: string; value?: string; [extra: string]: unknown }>;
  [extra: string]: unknown;
}

export interface GtmTemplate {
  templateId: string;
  name: string;
}

export interface GtmTemplateDetail extends GtmTemplate {
  templateData: string;
}

export interface SearchResult {
  kind: 'tag' | 'trigger' | 'variable';
  id: string;
  name: string;
  type: string;
}

export interface GtmBuiltInVariable {
  name: string;
  type: string;
}

export interface GtmVersionHeader {
  containerVersionId: string;
  name: string;
  description?: string;
  deleted: boolean;
  numTags?: string;
  numTriggers?: string;
  numVariables?: string;
  numCustomTemplates?: string;
}

export interface GtmVersionDetail {
  containerVersionId: string;
  name: string;
  description?: string;
  deleted: boolean;
  tag: GtmTagDetail[];
  trigger: GtmTriggerDetail[];
  variable: GtmVariableDetail[];
  template: GtmTemplateDetail[];
  builtInVariable: GtmBuiltInVariable[];
}

export type GtmResourceKind = 'tag' | 'trigger' | 'variable' | 'template' | 'builtInVariable';

export interface GtmDiffModifiedEntry {
  kind: GtmResourceKind;
  // Identity used to match the resource across the two sides:
  // - diff-versions: matches by id (stable within container)
  // - diff-containers: matches by name (ids differ across containers)
  identity: string;
  name: string;
  changedFields: string[];
  before: unknown;
  after: unknown;
}

export interface GtmDiffAddedOrRemovedEntry {
  kind: GtmResourceKind;
  identity: string;
  name: string;
  value: unknown;
}

export interface GtmDiffResult {
  added: GtmDiffAddedOrRemovedEntry[];
  removed: GtmDiffAddedOrRemovedEntry[];
  modified: GtmDiffModifiedEntry[];
}

export type GtmCommandResult =
  | { accounts: GtmAccount[] }
  | { containers: GtmContainer[] }
  | { tags: GtmTag[] }
  | { triggers: GtmTrigger[] }
  | { variables: GtmVariable[] }
  | { tag: GtmTagDetail }
  | { trigger: GtmTriggerDetail }
  | { variable: GtmVariableDetail }
  | { templates: GtmTemplate[] }
  | { template: GtmTemplateDetail }
  | { results: SearchResult[] }
  | { versions: GtmVersionHeader[] }
  | { version: GtmVersionDetail }
  | { diff: GtmDiffResult };
