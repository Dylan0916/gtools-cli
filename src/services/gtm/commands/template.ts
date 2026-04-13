import { getFirstWorkspaceId, getTemplate, listTemplates } from '../client';
import type { AuthClient } from '../../../auth';
import type { CommandResult } from '../../../types';

export async function runListTemplates(
  auth: AuthClient,
  accountId: string,
  containerId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const templates = await listTemplates(auth, accountId, containerId, workspaceId);
  return { templates };
}

export async function runGetTemplate(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  templateId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const template = await getTemplate(auth, accountId, containerId, workspaceId, templateId);
  return { template };
}
