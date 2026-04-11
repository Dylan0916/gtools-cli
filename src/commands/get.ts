import type { google } from 'googleapis';

import { getFirstWorkspaceId, getTag, getTrigger, getVariable } from '../gtmClient';
import type { CommandResult } from '../types';

type Auth = InstanceType<typeof google.auth.GoogleAuth>;

export async function runGetTag(
  auth: Auth,
  accountId: string,
  containerId: string,
  tagId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const tag = await getTag(auth, accountId, containerId, workspaceId, tagId);
  return { tag };
}

export async function runGetTrigger(
  auth: Auth,
  accountId: string,
  containerId: string,
  triggerId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const trigger = await getTrigger(auth, accountId, containerId, workspaceId, triggerId);
  return { trigger };
}

export async function runGetVariable(
  auth: Auth,
  accountId: string,
  containerId: string,
  variableId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const variable = await getVariable(auth, accountId, containerId, workspaceId, variableId);
  return { variable };
}
