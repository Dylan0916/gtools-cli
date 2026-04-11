import type { google } from 'googleapis';

import {
  listAccounts,
  listContainers,
  getFirstWorkspaceId,
  listTags,
  listTriggers,
  listVariables,
} from '../gtmClient';
import type { CommandResult } from '../types';

type Auth = InstanceType<typeof google.auth.GoogleAuth>;

export async function runListAccounts(auth: Auth): Promise<CommandResult> {
  const accounts = await listAccounts(auth);
  return { accounts };
}

export async function runListContainers(auth: Auth, accountId: string): Promise<CommandResult> {
  const containers = await listContainers(auth, accountId);
  return { containers };
}

export async function runListTags(auth: Auth, accountId: string, containerId: string): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const tags = await listTags(auth, accountId, containerId, workspaceId);
  return { tags };
}

export async function runListTriggers(auth: Auth, accountId: string, containerId: string): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const triggers = await listTriggers(auth, accountId, containerId, workspaceId);
  return { triggers };
}

export async function runListVariables(auth: Auth, accountId: string, containerId: string): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const variables = await listVariables(auth, accountId, containerId, workspaceId);
  return { variables };
}
