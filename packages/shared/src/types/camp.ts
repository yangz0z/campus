export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
}

export interface CreateCampRequest {
  title: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  season: Season;
}

export interface CreateCampResponse {
  campId: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isRequired: boolean;
  sortOrder: number;
  memo: string | null;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  sortOrder: number;
  items: ChecklistItem[];
}

export interface GetChecklistResponse {
  groups: ChecklistGroup[];
}

export interface CampSummary {
  id: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string;
  season: Season;
}

export interface GetMyCampsResponse {
  camps: CampSummary[];
}
