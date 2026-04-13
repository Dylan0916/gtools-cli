import { google } from 'googleapis';
import type {
  GtmAccount,
  GtmContainer,
  GtmTag,
  GtmTagDetail,
  GtmTemplate,
  GtmTemplateDetail,
  GtmTrigger,
  GtmTriggerDetail,
  GtmVariable,
  GtmVariableDetail,
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
  const t = res.data;
  return {
    tagId: t.tagId!,
    name: t.name!,
    type: t.type!,
    paused: t.paused ?? false,
    firingTriggerId: t.firingTriggerId ?? [],
    blockingTriggerId: t.blockingTriggerId ?? [],
    parameter: (t.parameter ?? []).map((p) => ({
      type: p.type!,
      key: p.key!,
      value: p.value ?? undefined,
    })),
  };
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
  const t = res.data;
  return {
    triggerId: t.triggerId!,
    name: t.name!,
    type: t.type!,
    filter: (t.filter ?? []).map((f) => ({
      type: f.type!,
      parameter: (f.parameter ?? []).map((p) => ({
        type: p.type!,
        key: p.key!,
        value: p.value ?? undefined,
      })),
    })),
  };
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
  const t = res.data;
  return {
    templateId: t.templateId!,
    name: t.name!,
    templateData: t.templateData ?? '',
  };
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
  const v = res.data;
  return {
    variableId: v.variableId!,
    name: v.name!,
    type: v.type!,
    parameter: (v.parameter ?? []).map((p) => ({
      type: p.type!,
      key: p.key!,
      value: p.value ?? undefined,
    })),
  };
}
