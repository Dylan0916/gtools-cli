import { readFile } from 'fs/promises';
import { createTag, createTrigger, createVariable, getFirstWorkspaceId } from '../client';
import type { AuthClient } from '../../../auth';
import type { CommandResult } from '../../../types';

type WrapperKey = 'tag' | 'trigger' | 'variable';

async function loadJson(fromFile: string): Promise<Record<string, unknown> | { error: string }> {
  let raw: string;
  try {
    raw = await readFile(fromFile, 'utf-8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to read JSON file "${fromFile}": ${message}` };
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { error: `Expected a JSON object in "${fromFile}"` };
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to parse JSON from "${fromFile}": ${message}` };
  }
}

// Unwrap if the JSON is what `get-tag`/`get-trigger`/`get-variable` emit — an object with a single
// `tag` / `trigger` / `variable` key wrapping the resource. Let users pipe output directly to input.
function unwrap(payload: Record<string, unknown>, key: WrapperKey): Record<string, unknown> {
  const inner = payload[key];
  if (typeof inner === 'object' && inner !== null && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return payload;
}

export async function runCreateTag(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  fromFile: string,
): Promise<CommandResult> {
  const loaded = await loadJson(fromFile);
  if ('error' in loaded) {
    return loaded;
  }
  const payload = unwrap(loaded, 'tag');
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const tag = await createTag(auth, accountId, containerId, workspaceId, payload);
  return { tag };
}

export async function runCreateTrigger(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  fromFile: string,
): Promise<CommandResult> {
  const loaded = await loadJson(fromFile);
  if ('error' in loaded) {
    return loaded;
  }
  const payload = unwrap(loaded, 'trigger');
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const trigger = await createTrigger(auth, accountId, containerId, workspaceId, payload);
  return { trigger };
}

export async function runCreateVariable(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  fromFile: string,
): Promise<CommandResult> {
  const loaded = await loadJson(fromFile);
  if ('error' in loaded) {
    return loaded;
  }
  const payload = unwrap(loaded, 'variable');
  const workspaceId = await getFirstWorkspaceId(auth, accountId, containerId);
  const variable = await createVariable(auth, accountId, containerId, workspaceId, payload);
  return { variable };
}
