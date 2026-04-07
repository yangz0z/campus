import type { AssigneeInfo, CampMemberInfo, CreateChecklistGroupResponse, CreateChecklistItemResponse } from './camp';

// ── Socket Event Names ──

export const SocketEvents = {
  // Client → Server
  JOIN_CAMP: 'camp:join',
  LEAVE_CAMP: 'camp:leave',

  // Server → Client
  GROUP_CREATED: 'checklist:group:created',
  GROUP_UPDATED: 'checklist:group:updated',
  GROUP_DELETED: 'checklist:group:deleted',
  GROUPS_REORDERED: 'checklist:groups:reordered',
  ITEM_CREATED: 'checklist:item:created',
  ITEM_UPDATED: 'checklist:item:updated',
  ITEM_DELETED: 'checklist:item:deleted',
  ITEMS_REORDERED: 'checklist:items:reordered',
  CHECK_TOGGLED: 'checklist:check:toggled',
  ASSIGNEES_SET: 'checklist:assignees:set',
  MEMBER_JOINED: 'camp:member:joined',
} as const;

// ── Client → Server Payloads ──

export interface JoinCampPayload {
  campId: string;
}

export interface LeaveCampPayload {
  campId: string;
}

// ── Server → Client Payloads ──

export interface GroupCreatedPayload {
  campId: string;
  group: CreateChecklistGroupResponse;
}

export interface GroupUpdatedPayload {
  campId: string;
  groupId: string;
  title: string;
}

export interface GroupDeletedPayload {
  campId: string;
  groupId: string;
}

export interface GroupsReorderedPayload {
  campId: string;
  groupIds: string[];
}

export interface ItemCreatedPayload {
  campId: string;
  groupId: string;
  item: CreateChecklistItemResponse;
}

export interface ItemUpdatedPayload {
  campId: string;
  itemId: string;
  title: string;
  memo: string | null;
}

export interface ItemDeletedPayload {
  campId: string;
  itemId: string;
}

export interface ItemsReorderedPayload {
  campId: string;
  targetGroupId: string;
  itemIds: string[];
}

export interface CheckToggledPayload {
  campId: string;
  itemId: string;
  memberId: string;
  isChecked: boolean;
}

export interface AssigneesSetPayload {
  campId: string;
  itemId: string;
  assignees: AssigneeInfo[];
}

export interface MemberJoinedPayload {
  campId: string;
  member: CampMemberInfo;
}
