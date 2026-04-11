import { getFirstWorkspaceId, getTag, getTrigger, getVariable } from '../gtmClient';
import type { AuthClient } from '../auth';
import type { CommandResult } from '../types';

export async function runGetTag(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  tagId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const tag = await getTag(auth, accountId, containerId, workspaceId, tagId);
  return { tag };
}

export async function runGetTrigger(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  triggerId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const trigger = await getTrigger(auth, accountId, containerId, workspaceId, triggerId);
  return { trigger };
}

export async function runGetVariable(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  variableId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const variable = await getVariable(auth, accountId, containerId, workspaceId, variableId);
  return { variable };
}
