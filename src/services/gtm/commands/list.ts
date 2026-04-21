import {
  listAccounts,
  listContainers,
  getFirstWorkspaceId,
  listTags,
  listTriggers,
  listVariables,
} from '@/services/gtm/client';
import type { AuthClient } from '@/auth';
import type { CommandResult } from '@/types';

export async function runListAccounts(auth: AuthClient): Promise<CommandResult> {
  const accounts = await listAccounts(auth);
  return { accounts };
}

export async function runListContainers(auth: AuthClient, accountId: string): Promise<CommandResult> {
  const containers = await listContainers(auth, accountId);
  return { containers };
}

export async function runListTags(auth: AuthClient, accountId: string, containerId: string): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const tags = await listTags(auth, accountId, containerId, workspaceId);
  return { tags };
}

export async function runListTriggers(auth: AuthClient, accountId: string, containerId: string): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const triggers = await listTriggers(auth, accountId, containerId, workspaceId);
  return { triggers };
}

export async function runListVariables(auth: AuthClient, accountId: string, containerId: string): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const variables = await listVariables(auth, accountId, containerId, workspaceId);
  return { variables };
}
