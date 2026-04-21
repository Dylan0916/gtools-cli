import { google } from 'googleapis';
import type {
  GtmAccount,
  GtmBuiltInVariable,
  GtmContainer,
  GtmTag,
  GtmTagDetail,
  GtmTemplate,
  GtmTemplateDetail,
  GtmTrigger,
  GtmTriggerDetail,
  GtmVariable,
  GtmVariableDetail,
  GtmVersionDetail,
  GtmVersionHeader,
} from './types';
import type { AuthClient } from '../../auth';

const tagmanager = google.tagmanager('v2');

export async function listAccounts(auth: AuthClient): Promise<GtmAccount[]> {
  const res = await tagmanager.accounts.list({ auth });
  return (res.data.account ?? []).map((a) => ({
    accountId: a.accountId!,
    name: a.name!,
  }));
}

export async function listContainers(auth: AuthClient, accountId: string): Promise<GtmContainer[]> {
  const res = await tagmanager.accounts.containers.list({
    auth,
    parent: `accounts/${accountId}`,
  });
  return (res.data.container ?? []).map((c) => ({
    accountId,
    containerId: c.containerId!,
    publicId: c.publicId!,
    name: c.name!,
  }));
}

export async function getFirstWorkspaceId(
  auth: AuthClient,
  accountId: string,
  containerId: string
): Promise<string> {
  const res = await tagmanager.accounts.containers.workspaces.list({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}`,
  });
  const workspaces = res.data.workspace ?? [];
  if (workspaces.length === 0) {
    throw new Error(`No workspaces found in container ${containerId}`);
  }
  return workspaces[0].workspaceId!;
}

export async function listTags(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string
): Promise<GtmTag[]> {
  const res = await tagmanager.accounts.containers.workspaces.tags.list({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
  });
  return (res.data.tag ?? []).map((t) => ({
    tagId: t.tagId!,
    name: t.name!,
    type: t.type!,
    paused: t.paused ?? false,
  }));
}

export async function listTriggers(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string
): Promise<GtmTrigger[]> {
  const res = await tagmanager.accounts.containers.workspaces.triggers.list({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
  });
  return (res.data.trigger ?? []).map((t) => ({
    triggerId: t.triggerId!,
    name: t.name!,
    type: t.type!,
  }));
}

export async function listVariables(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string
): Promise<GtmVariable[]> {
  const res = await tagmanager.accounts.containers.workspaces.variables.list({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
  });
  return (res.data.variable ?? []).map((v) => ({
    variableId: v.variableId!,
    name: v.name!,
    type: v.type!,
  }));
}

// Drop fields that are server-assigned or tied to the source container; pass everything else
// through. GTM resources have lots of type-specific fields (customEventFilter, waitForTags,
// scroll percentages, list/map parameter values, etc.) and lossy mapping previously caused
// create-* calls to fail for customEvent triggers and tags with non-template parameters.
const DISPLAY_STRIP_FIELDS = [
  'path',
  'accountId',
  'containerId',
  'workspaceId',
  'fingerprint',
  'parentFolderId',
] as const;

function stripForDisplay<T extends Record<string, unknown>>(raw: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!DISPLAY_STRIP_FIELDS.includes(k as (typeof DISPLAY_STRIP_FIELDS)[number])) {
      out[k] = v;
    }
  }
  return out;
}

function mapTagDetail(t: any): GtmTagDetail {
  return {
    ...stripForDisplay(t),
    tagId: t.tagId!,
    name: t.name!,
    type: t.type!,
    paused: t.paused ?? false,
    firingTriggerId: t.firingTriggerId ?? [],
    blockingTriggerId: t.blockingTriggerId ?? [],
    parameter: t.parameter ?? [],
  } as GtmTagDetail;
}

function mapTriggerDetail(t: any): GtmTriggerDetail {
  return {
    ...stripForDisplay(t),
    triggerId: t.triggerId!,
    name: t.name!,
    type: t.type!,
  } as GtmTriggerDetail;
}

function mapVariableDetail(v: any): GtmVariableDetail {
  return {
    ...stripForDisplay(v),
    variableId: v.variableId!,
    name: v.name!,
    type: v.type!,
    parameter: v.parameter ?? [],
  } as GtmVariableDetail;
}

function mapTemplateDetail(t: any): GtmTemplateDetail {
  return {
    templateId: t.templateId!,
    name: t.name!,
    templateData: t.templateData ?? '',
  };
}

function mapBuiltInVariable(b: any): GtmBuiltInVariable {
  return {
    name: b.name!,
    type: b.type!,
  };
}

function mapVersionHeader(v: any): GtmVersionHeader {
  return {
    containerVersionId: v.containerVersionId!,
    name: v.name ?? '',
    description: v.description ?? undefined,
    deleted: v.deleted ?? false,
    numTags: v.numTags ?? undefined,
    numTriggers: v.numTriggers ?? undefined,
    numVariables: v.numVariables ?? undefined,
    numCustomTemplates: v.numCustomTemplates ?? undefined,
  };
}

function mapVersionDetail(v: any): GtmVersionDetail {
  return {
    containerVersionId: v.containerVersionId!,
    name: v.name ?? '',
    description: v.description ?? undefined,
    deleted: v.deleted ?? false,
    tag: (v.tag ?? []).map(mapTagDetail),
    trigger: (v.trigger ?? []).map(mapTriggerDetail),
    variable: (v.variable ?? []).map(mapVariableDetail),
    template: (v.customTemplate ?? []).map(mapTemplateDetail),
    builtInVariable: (v.builtInVariable ?? []).map(mapBuiltInVariable),
  };
}

export async function getTag(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  tagId: string
): Promise<GtmTagDetail> {
  const res = await tagmanager.accounts.containers.workspaces.tags.get({
    auth,
    path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`,
  });
  return mapTagDetail(res.data);
}

/**
 * Update an HTML-type tag's `html` parameter with new content.
 * Only works on tags with an `html` parameter; throws otherwise.
 */
export async function updateTagHtml(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  tagId: string,
  htmlContent: string
): Promise<GtmTagDetail> {
  const basePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`;

  const current = await tagmanager.accounts.containers.workspaces.tags.get({ auth, path: basePath });
  const currentTag = current.data;

  const hasHtmlParam = (currentTag.parameter ?? []).some((p) => p.key === 'html');
  if (!hasHtmlParam) {
    throw new Error(
      `Tag ${tagId} has no "html" parameter (type: ${currentTag.type}). Only HTML tags can be updated with this command.`
    );
  }

  const updatedParams = (currentTag.parameter ?? []).map((p) =>
    p.key === 'html' ? { ...p, value: htmlContent } : p
  );

  const res = await tagmanager.accounts.containers.workspaces.tags.update({
    auth,
    path: basePath,
    requestBody: { ...currentTag, parameter: updatedParams },
  });
  return mapTagDetail(res.data);
}

export async function getTrigger(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  triggerId: string
): Promise<GtmTriggerDetail> {
  const res = await tagmanager.accounts.containers.workspaces.triggers.get({
    auth,
    path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`,
  });
  return mapTriggerDetail(res.data);
}

export async function listTemplates(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string
): Promise<GtmTemplate[]> {
  const res = await tagmanager.accounts.containers.workspaces.templates.list({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
  });
  return (res.data.template ?? []).map((t) => ({
    templateId: t.templateId!,
    name: t.name!,
  }));
}

export async function getTemplate(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  templateId: string
): Promise<GtmTemplateDetail> {
  const res = await tagmanager.accounts.containers.workspaces.templates.get({
    auth,
    path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/templates/${templateId}`,
  });
  return mapTemplateDetail(res.data);
}

export async function getVariable(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  variableId: string
): Promise<GtmVariableDetail> {
  const res = await tagmanager.accounts.containers.workspaces.variables.get({
    auth,
    path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`,
  });
  return mapVariableDetail(res.data);
}

// Fields assigned by GTM on creation or tied to the source location. Stripping them lets a payload
// pulled from one container be posted into another container's workspace without server errors or
// surprising cross-container references.
const READ_ONLY_FIELDS = [
  'path',
  'accountId',
  'containerId',
  'workspaceId',
  'fingerprint',
  'tagId',
  'triggerId',
  'variableId',
  'templateId',
  'parentFolderId',
  'tagManagerUrl',
] as const;

function stripForCreate(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (!READ_ONLY_FIELDS.includes(k as (typeof READ_ONLY_FIELDS)[number])) {
      out[k] = v;
    }
  }
  return out;
}

export async function createTag(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  payload: Record<string, unknown>
): Promise<GtmTagDetail> {
  const res = await tagmanager.accounts.containers.workspaces.tags.create({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
    requestBody: stripForCreate(payload),
  });
  return mapTagDetail(res.data);
}

export async function createTrigger(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  payload: Record<string, unknown>
): Promise<GtmTriggerDetail> {
  const res = await tagmanager.accounts.containers.workspaces.triggers.create({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
    requestBody: stripForCreate(payload),
  });
  return mapTriggerDetail(res.data);
}

export async function createVariable(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  payload: Record<string, unknown>
): Promise<GtmVariableDetail> {
  const res = await tagmanager.accounts.containers.workspaces.variables.create({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
    requestBody: stripForCreate(payload),
  });
  return mapVariableDetail(res.data);
}

// Replaces only the `parameter` array of an existing variable — mirrors the conservative
// update-tag-html pattern: read current, merge the one field we care about, write back.
export async function updateVariable(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  workspaceId: string,
  variableId: string,
  newParameters: Array<{ type: string; key: string; value?: string }>
): Promise<GtmVariableDetail> {
  const basePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`;
  const current = await tagmanager.accounts.containers.workspaces.variables.get({ auth, path: basePath });
  const res = await tagmanager.accounts.containers.workspaces.variables.update({
    auth,
    path: basePath,
    requestBody: { ...current.data, parameter: newParameters },
  });
  return mapVariableDetail(res.data);
}

export async function listVersionHeaders(
  auth: AuthClient,
  accountId: string,
  containerId: string
): Promise<GtmVersionHeader[]> {
  const headers: any[] = [];
  let pageToken: string | undefined;
  do {
    const res: any = await tagmanager.accounts.containers.version_headers.list({
      auth,
      parent: `accounts/${accountId}/containers/${containerId}`,
      ...(pageToken ? { pageToken } : {}),
    });
    headers.push(...(res.data.containerVersionHeader ?? []));
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);
  return headers.map(mapVersionHeader);
}

export async function getVersion(
  auth: AuthClient,
  accountId: string,
  containerId: string,
  versionId: string
): Promise<GtmVersionDetail> {
  const res = await tagmanager.accounts.containers.versions.get({
    auth,
    path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
  });
  return mapVersionDetail(res.data);
}

export async function getLiveVersion(
  auth: AuthClient,
  accountId: string,
  containerId: string
): Promise<GtmVersionDetail> {
  const res = await tagmanager.accounts.containers.versions.live({
    auth,
    parent: `accounts/${accountId}/containers/${containerId}`,
  });
  return mapVersionDetail(res.data);
}
