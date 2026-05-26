import { listWorkspaces, createWorkspace, deleteWorkspace } from '@/services/gtm/client';
import type { AuthClient } from '@/auth';
import type { CommandResult } from '@/types';

export async function runListWorkspaces(
  auth: AuthClient,
  accountId: string,
  containerId: string,
): Promise<CommandResult> {
  const workspaces = await listWorkspaces(auth, accountId, containerId);
  return { workspaces };
}

export async function runCreateWorkspace(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  name: string,
  description?: string,
): Promise<CommandResult> {
  const workspace = await createWorkspace(auth, accountId, containerId, name, description);
  return { workspace };
}

export async function runDeleteWorkspace(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
): Promise<CommandResult> {
  await deleteWorkspace(auth, accountId, containerId, workspaceId);
  return { deletedWorkspaceId: workspaceId };
}
