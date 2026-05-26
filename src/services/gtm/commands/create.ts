import { readFile } from 'fs/promises';

import { createTag, createTrigger, createVariable, resolveWorkspaceId } from '@/services/gtm/client';
import type { AuthClient } from '@/auth';
import type { CommandResult } from '@/types';

type WrapperKey = 'tag' | 'trigger' | 'variable';

// Discriminated by `ok` so callers can narrow without false-positive matches on `error` keys that
// might legitimately appear inside a successfully-parsed payload.
type LoadJsonResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

async function loadJson(fromFile: string): Promise<LoadJsonResult> {
  let raw: string;
  try {
    raw = await readFile(fromFile, 'utf-8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Failed to read JSON file "${fromFile}": ${message}` };
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ok: false, error: `Expected a JSON object in "${fromFile}"` };
    }
    return { ok: true, data: parsed as Record<string, unknown> };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Failed to parse JSON from "${fromFile}": ${message}` };
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
  workspace?: string,
): Promise<CommandResult> {
  const loaded = await loadJson(fromFile);
  if (!loaded.ok) {
    return { error: loaded.error };
  }
  const payload = unwrap(loaded.data, 'tag');
  const workspaceId = await resolveWorkspaceId(auth, accountId, containerId, workspace);
  const tag = await createTag(auth, accountId, containerId, workspaceId, payload);
  return { tag };
}

export async function runCreateTrigger(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  fromFile: string,
  workspace?: string,
): Promise<CommandResult> {
  const loaded = await loadJson(fromFile);
  if (!loaded.ok) {
    return { error: loaded.error };
  }
  const payload = unwrap(loaded.data, 'trigger');
  const workspaceId = await resolveWorkspaceId(auth, accountId, containerId, workspace);
  const trigger = await createTrigger(auth, accountId, containerId, workspaceId, payload);
  return { trigger };
}

export async function runCreateVariable(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  fromFile: string,
  workspace?: string,
): Promise<CommandResult> {
  const loaded = await loadJson(fromFile);
  if (!loaded.ok) {
    return { error: loaded.error };
  }
  const payload = unwrap(loaded.data, 'variable');
  const workspaceId = await resolveWorkspaceId(auth, accountId, containerId, workspace);
  const variable = await createVariable(auth, accountId, containerId, workspaceId, payload);
  return { variable };
}
