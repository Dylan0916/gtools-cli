import { readFile } from 'fs/promises';
import { getFirstWorkspaceId, updateTagHtml, updateVariable } from '../client';
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

export async function runUpdateVariable(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  variableId: string,
  fromFile: string,
): Promise<CommandResult> {
  let raw: string;
  try {
    raw = await readFile(fromFile, 'utf-8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to read JSON file "${fromFile}": ${message}` };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to parse JSON from "${fromFile}": ${message}` };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: `Expected a JSON object in "${fromFile}"` };
  }

  // Accept either a bare { parameter: [...] } or a get-variable style { variable: { parameter: [...] } }
  const obj = parsed as Record<string, unknown>;
  const source =
    obj.variable && typeof obj.variable === 'object' && !Array.isArray(obj.variable)
      ? (obj.variable as Record<string, unknown>)
      : obj;
  const parameter = source.parameter;
  if (!Array.isArray(parameter)) {
    return { error: `Expected a "parameter" array in the JSON payload` };
  }

  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const variable = await updateVariable(
    auth,
    accountId,
    containerId,
    workspaceId,
    variableId,
    parameter as Array<{ type: string; key: string; value?: string }>,
  );
  return { variable };
}
