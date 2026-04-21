import { getVersion, getLiveVersion } from '@/services/gtm/client';
import { computeDiff } from '@/services/gtm/diff';
import type { AuthClient } from '@/auth';
import type { CommandResult } from '@/types';

export async function runDiffVersions(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  fromVersionId: string,
  toVersionId: string,
): Promise<CommandResult> {
  const [left, right] = await Promise.all([
    getVersion(auth, accountId, containerId, fromVersionId),
    getVersion(auth, accountId, containerId, toVersionId),
  ]);
  return { diff: computeDiff(left, right, 'id') };
}

export async function runDiffContainers(
  auth: AuthClient,
  fromAccountId: string,
  fromContainerId: string,
  toAccountId: string,
  toContainerId: string,
): Promise<CommandResult> {
  const [left, right] = await Promise.all([
    getLiveVersion(auth, fromAccountId, fromContainerId),
    getLiveVersion(auth, toAccountId, toContainerId),
  ]);
  return { diff: computeDiff(left, right, 'name') };
}
