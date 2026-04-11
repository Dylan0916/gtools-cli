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

export interface GtmTagDetail extends GtmTag {
  firingTriggerId: string[];
  blockingTriggerId: string[];
  parameter: Array<{ type: string; key: string; value?: string }>;
}

export interface GtmTriggerDetail extends GtmTrigger {
  filter?: Array<{ type: string; parameter: Array<{ type: string; key: string; value?: string }> }>;
}

export interface GtmVariableDetail extends GtmVariable {
  parameter?: Array<{ type: string; key: string; value?: string }>;
}

export type CommandResult =
  | { accounts: GtmAccount[] }
  | { containers: GtmContainer[] }
  | { tags: GtmTag[] }
  | { triggers: GtmTrigger[] }
  | { variables: GtmVariable[] }
  | { tag: GtmTagDetail }
  | { trigger: GtmTriggerDetail }
  | { variable: GtmVariableDetail }
  | { results: SearchResult[] }
  | { error: string };

export interface SearchResult {
  kind: 'tag' | 'trigger' | 'variable';
  id: string;
  name: string;
  type: string;
}
