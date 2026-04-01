import type { CreateCampRequest, CreateCampResponse, GetChecklistResponse, GetMyCampsResponse } from '@campus/shared';
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

export function getCampChecklist(
  token: string,
  campId: string,
): Promise<GetChecklistResponse> {
  return apiFetch<GetChecklistResponse>(`/camps/${campId}/checklist`, token);
}
