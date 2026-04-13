import { readFile } from 'fs/promises';
import { getFirstWorkspaceId, updateTagHtml } from '../client';
import type { AuthClient } from '../../../auth';
import type { CommandResult } from '../../../types';

export async function runUpdateTagHtml(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  tagId: string,
  htmlFile: string
): Promise<CommandResult> {
  let htmlContent: string;
  try {
    htmlContent = await readFile(htmlFile, 'utf-8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to read html file "${htmlFile}": ${message}` };
  }

  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const tag = await updateTagHtml(auth, accountId, containerId, workspaceId, tagId, htmlContent);
  return { tag };
}
