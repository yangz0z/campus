'use server';

import type {
  CampSummary,
  CreateCampRequest,
  CreateCampResponse,
  CreateChecklistGroupRequest,
  CreateChecklistGroupResponse,
  CreateChecklistItemRequest,
  CreateChecklistItemResponse,
  GetCampMembersResponse,
  GetChecklistResponse,
  GetMyCampsResponse,
  SetItemAssigneesRequest,
  ToggleCheckRequest,
  UpdateChecklistItemRequest,
} from '@campus/shared';
import { serverFetch } from '@/lib/api-server';

// ── 조회 ──

export async function getMyCamps(): Promise<GetMyCampsResponse> {
  return serverFetch<GetMyCampsResponse>('/camps');
}

export async function getCamp(campId: string): Promise<CampSummary> {
  return serverFetch<CampSummary>(`/camps/${campId}`);
}

export async function getCampChecklist(campId: string): Promise<GetChecklistResponse> {
  return serverFetch<GetChecklistResponse>(`/camps/${campId}/checklist`);
}

export async function getCampMembers(campId: string): Promise<GetCampMembersResponse> {
  return serverFetch<GetCampMembersResponse>(`/camps/${campId}/members`);
}

// ── 뮤테이션 ──

export async function createCamp(data: CreateCampRequest): Promise<CreateCampResponse> {
  return serverFetch<CreateCampResponse>('/camps', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createChecklistGroup(
  campId: string,
  data: CreateChecklistGroupRequest,
): Promise<CreateChecklistGroupResponse> {
  return serverFetch<CreateChecklistGroupResponse>(`/camps/${campId}/checklist/groups`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createChecklistItem(
  campId: string,
  groupId: string,
  data: CreateChecklistItemRequest,
): Promise<CreateChecklistItemResponse> {
  return serverFetch<CreateChecklistItemResponse>(
    `/camps/${campId}/checklist/groups/${groupId}/items`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

export async function toggleChecklistItem(
  campId: string,
  itemId: string,
  data: ToggleCheckRequest,
): Promise<void> {
  return serverFetch<void>(`/camps/${campId}/checklist/items/${itemId}/check`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function updateChecklistItem(
  campId: string,
  itemId: string,
  data: UpdateChecklistItemRequest,
): Promise<void> {
  return serverFetch<void>(`/camps/${campId}/checklist/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteChecklistItem(campId: string, itemId: string): Promise<void> {
  return serverFetch<void>(`/camps/${campId}/checklist/items/${itemId}`, { method: 'DELETE' });
}

export async function setItemAssignees(
  campId: string,
  itemId: string,
  data: SetItemAssigneesRequest,
): Promise<void> {
  return serverFetch<void>(`/camps/${campId}/checklist/items/${itemId}/assignees`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
