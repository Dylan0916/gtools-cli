import { getFirstWorkspaceId, listTags, listTriggers, listVariables } from '../client';
import type { AuthClient } from '../../../auth';
import type { CommandResult } from '../../../types';
import type { SearchResult } from '../types';

export async function runSearch(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  query: string
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const lowerQuery = query.toLowerCase();

  const [tags, triggers, variables] = await Promise.all([
    listTags(auth, accountId, containerId, workspaceId),
    listTriggers(auth, accountId, containerId, workspaceId),
    listVariables(auth, accountId, containerId, workspaceId),
  ]);

  const results: SearchResult[] = [
    ...tags
      .filter((t) => t.name.toLowerCase().includes(lowerQuery))
      .map((t) => ({ kind: 'tag' as const, id: t.tagId, name: t.name, type: t.type })),
    ...triggers
      .filter((t) => t.name.toLowerCase().includes(lowerQuery))
      .map((t) => ({ kind: 'trigger' as const, id: t.triggerId, name: t.name, type: t.type })),
    ...variables
      .filter((v) => v.name.toLowerCase().includes(lowerQuery))
      .map((v) => ({ kind: 'variable' as const, id: v.variableId, name: v.name, type: v.type })),
  ];

  return { results };
}
