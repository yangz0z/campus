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

export interface AssigneeInfo {
  memberId: string;
  nickname: string;
  profileImage: string | null;
  isChecked: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isRequired: boolean;
  sortOrder: number;
  memo: string | null;
  assignees: AssigneeInfo[];
  isCheckedByMe: boolean;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  sortOrder: number;
  items: ChecklistItem[];
}

export interface GetChecklistResponse {
  myMemberId: string;
  groups: ChecklistGroup[];
}

export interface CampMemberInfo {
  memberId: string;
  nickname: string;
  profileImage: string | null;
  role: 'owner' | 'member';
}

export interface GetCampMembersResponse {
  members: CampMemberInfo[];
}

export interface SetItemAssigneesRequest {
  memberIds: string[];
}

export interface CreateChecklistGroupRequest {
  title: string;
}

export interface CreateChecklistGroupResponse {
  id: string;
  title: string;
  sortOrder: number;
}

export interface CreateChecklistItemRequest {
  title: string;
}

export interface UpdateChecklistItemRequest {
  title: string;
  memo: string | null;
}

export interface ToggleCheckRequest {
  isChecked: boolean;
}

export interface CreateChecklistItemResponse {
  id: string;
  title: string;
  isRequired: boolean;
  sortOrder: number;
  memo: string | null;
  assignees: AssigneeInfo[];
  isCheckedByMe: boolean;
}

export interface CampSummaryMember {
  nickname: string;
  profileImage: string | null;
  role: 'owner' | 'member';
}

export interface CampSummary {
  id: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string;
  season: Season;
  myRole: 'owner' | 'member';
  members: CampSummaryMember[];
}

export interface GetIncompleteCountResponse {
  incompleteCount: number;
}

export interface GetMyCampsResponse {
  camps: CampSummary[];
}

export interface UpdateCampRequest {
  title: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  season: Season;
}

export interface CreateCampInviteResponse {
  token: string;
}

export interface GetCampInviteInfoResponse {
  camp: CampSummary;
}

export interface AcceptCampInviteResponse {
  campId: string;
}

export interface ReorderChecklistItemsRequest {
  itemIds: string[];
}

export interface ReorderChecklistGroupsRequest {
  groupIds: string[];
}
