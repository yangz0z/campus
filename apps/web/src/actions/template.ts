'use server';

import type {
  GetMyTemplateResponse,
  CreateTemplateGroupRequest,
  CreateTemplateGroupResponse,
  CreateTemplateItemRequest,
  CreateTemplateItemResponse,
  UpdateTemplateItemRequest,
  SaveTemplateRequest,
} from '@campus/shared';
import { serverFetch } from '@/lib/api-server';

export async function getMyTemplate(): Promise<GetMyTemplateResponse> {
  return serverFetch<GetMyTemplateResponse>('/templates/me');
}

export async function addTemplateGroup(
  data: CreateTemplateGroupRequest,
): Promise<CreateTemplateGroupResponse> {
  return serverFetch<CreateTemplateGroupResponse>('/templates/me/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTemplateGroup(groupId: string, title: string): Promise<void> {
  return serverFetch<void>(`/templates/me/groups/${groupId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function deleteTemplateGroup(groupId: string): Promise<void> {
  return serverFetch<void>(`/templates/me/groups/${groupId}`, { method: 'DELETE' });
}

export async function addTemplateItem(
  groupId: string,
  data: CreateTemplateItemRequest,
): Promise<CreateTemplateItemResponse> {
  return serverFetch<CreateTemplateItemResponse>(`/templates/me/groups/${groupId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTemplateItem(
  itemId: string,
  data: UpdateTemplateItemRequest,
): Promise<void> {
  return serverFetch<void>(`/templates/me/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTemplateItem(itemId: string): Promise<void> {
  return serverFetch<void>(`/templates/me/items/${itemId}`, { method: 'DELETE' });
}

export async function saveMyTemplate(data: SaveTemplateRequest): Promise<void> {
  return serverFetch<void>('/templates/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
