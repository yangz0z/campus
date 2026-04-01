import type {
  CreateCampRequest,
  CreateCampResponse,
  GetChecklistResponse,
  GetCampMembersResponse,
  GetMyCampsResponse,
  SetItemAssigneesRequest,
} from '@campus/shared';
import { apiFetch } from '../api';

export function getMyCamps(token: string): Promise<GetMyCampsResponse> {
  return apiFetch<GetMyCampsResponse>('/camps', token);
}

export function createCamp(token: string, data: CreateCampRequest): Promise<CreateCampResponse> {
  return apiFetch<CreateCampResponse>('/camps', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getCampMembers(token: string, campId: string): Promise<GetCampMembersResponse> {
  return apiFetch<GetCampMembersResponse>(`/camps/${campId}/members`, token);
}

export function getCampChecklist(token: string, campId: string): Promise<GetChecklistResponse> {
  return apiFetch<GetChecklistResponse>(`/camps/${campId}/checklist`, token);
}

export function setItemAssignees(
  token: string,
  campId: string,
  itemId: string,
  data: SetItemAssigneesRequest,
): Promise<void> {
  return apiFetch<void>(`/camps/${campId}/checklist/items/${itemId}/assignees`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
