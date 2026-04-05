import type { Season } from './camp';

export interface TemplateItemResponse {
  id: string;
  title: string;
  seasons: Season[];
  sortOrder: number;
}

export interface TemplateGroupResponse {
  id: string;
  title: string;
  sortOrder: number;
  items: TemplateItemResponse[];
}

export interface GetMyTemplateResponse {
  id: string;
  title: string;
  groups: TemplateGroupResponse[];
}

export interface CreateTemplateGroupRequest {
  title: string;
}

export interface CreateTemplateGroupResponse {
  id: string;
  title: string;
  sortOrder: number;
}

export interface CreateTemplateItemRequest {
  title: string;
  seasons: Season[];
}

export interface CreateTemplateItemResponse {
  id: string;
  title: string;
  seasons: Season[];
  sortOrder: number;
}

export interface UpdateTemplateItemRequest {
  title?: string;
  seasons?: Season[];
}

export interface SaveTemplateItemRequest {
  title: string;
  seasons: Season[];
}

export interface SaveTemplateGroupRequest {
  title: string;
  items: SaveTemplateItemRequest[];
}

export interface SaveTemplateRequest {
  groups: SaveTemplateGroupRequest[];
}
