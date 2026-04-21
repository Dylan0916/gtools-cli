import { listVersionHeaders, getVersion, getLiveVersion } from '../client';
import type { AuthClient } from '../../../auth';
import type { CommandResult } from '../../../types';

export async function runListVersions(
  auth: AuthClient,
  accountId: string,
  containerId: string,
): Promise<CommandResult> {
  const versions = await listVersionHeaders(auth, accountId, containerId);
  return { versions };
}

export async function runGetVersion(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  versionId: string,
): Promise<CommandResult> {
  const version = await getVersion(auth, accountId, containerId, versionId);
  return { version };
}

export async function runGetLiveVersion(
  auth: AuthClient,
  accountId: string,
  containerId: string,
): Promise<CommandResult> {
  const version = await getLiveVersion(auth, accountId, containerId);
  return { version };
}
