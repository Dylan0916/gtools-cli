import type { google } from 'googleapis';

import { getFirstWorkspaceId, getTemplate, listTemplates } from '../gtmClient';
import type { CommandResult } from '../types';

type Auth = InstanceType<typeof google.auth.GoogleAuth>;

export async function runListTemplates(
  auth: Auth,
  accountId: string,
  containerId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const templates = await listTemplates(auth, accountId, containerId, workspaceId);
  return { templates };
}

export async function runGetTemplate(
  auth: Auth,
  accountId: string,
  containerId: string,
  templateId: string,
): Promise<CommandResult> {
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const template = await getTemplate(auth, accountId, containerId, workspaceId, templateId);
  return { template };
}
