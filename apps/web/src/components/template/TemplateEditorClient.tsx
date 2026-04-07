'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Season } from '@campus/shared';
import type { GetMyTemplateResponse } from '@campus/shared';
import { saveMyTemplate } from '@/actions/template';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Confirm';
import { useAction } from '@/hooks/useAction';
import {
  GripHandle, SortableContainer, SortableGroupDropzone,
  useSortableList, useSortableStyle,
} from '@/components/ui/dnd';

// ── Local types ──

interface LocalItem {
  localId: string;
  title: string;
  seasons: Season[];
}

interface LocalGroup {
  localId: string;
  title: string;
  items: LocalItem[];
}

let _localIdCounter = 0;
function nextLocalId() {
  return `local_${++_localIdCounter}_${Date.now()}`;
}

function toLocal(data: GetMyTemplateResponse): LocalGroup[] {
  return data.groups.map((g) => ({
    localId: g.id,
    title: g.title,
    items: g.items.map((i) => ({
      localId: i.id,
      title: i.title,
      seasons: i.seasons,
    })),
  }));
}

// ── Constants ──

const SEASON_TABS = [
  { id: 'all' as const, name: '전체', icon: '📋' },
  { id: Season.SPRING, name: '봄', icon: '🌸' },
  { id: Season.SUMMER, name: '여름', icon: '☀️' },
  { id: Season.FALL, name: '가을', icon: '🍂' },
  { id: Season.WINTER, name: '겨울', icon: '❄️' },
] as const;

const SEASON_BADGE: Record<Season, { icon: string; active: string; inactive: string }> = {
  [Season.SPRING]: { icon: '🌸', active: 'bg-pink-100 text-pink-700 ring-1 ring-pink-200', inactive: 'bg-gray-50 grayscale opacity-30' },
  [Season.SUMMER]: { icon: '☀️', active: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200', inactive: 'bg-gray-50 grayscale opacity-30' },
  [Season.FALL]: { icon: '🍂', active: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200', inactive: 'bg-gray-50 grayscale opacity-30' },
  [Season.WINTER]: { icon: '❄️', active: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200', inactive: 'bg-gray-50 grayscale opacity-30' },
};

type SeasonFilter = 'all' | Season;

// ── Sortable Group ──

interface SortableGroupProps {
  group: LocalGroup;
  filteredItems: LocalItem[];
  editingGroupId: string | null;
  editingItemId: string | null;
  addingItemGroupId: string | null;
  newItemInputRef: React.RefObject<HTMLInputElement | null>;
  activeSeason: SeasonFilter;
  onGroupTitleSave: (id: string, title: string) => void;
  onEditGroup: (id: string | null) => void;
  onDeleteGroup: (id: string) => void;
  onAddItemStart: (groupId: string) => void;
  onAddItem: (groupId: string, title: string) => void;
  onCancelAddItem: () => void;
  onEditItem: (id: string | null) => void;
  onItemTitleSave: (id: string, title: string) => void;
  onDeleteItem: (id: string) => void;
  onSeasonToggle: (itemId: string, season: Season) => void;
}

function SortableGroup({
  group, filteredItems, editingGroupId, editingItemId, addingItemGroupId,
  newItemInputRef, activeSeason,
  onGroupTitleSave, onEditGroup, onDeleteGroup, onAddItemStart,
  onAddItem, onCancelAddItem, onEditItem, onItemTitleSave, onDeleteItem, onSeasonToggle,
}: SortableGroupProps) {
  const {
    attributes, listeners, setNodeRef, style,
  } = useSortableStyle({ id: group.localId, data: { type: 'group' } });

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {/* Group Header */}
      <div className="flex items-center gap-1 border-b border-gray-100 px-2 py-3 pr-4">
        <GripHandle listeners={listeners} attributes={attributes} />

        {editingGroupId === group.localId ? (
          <input
            className="min-w-0 flex-1 rounded-lg border border-primary-300 px-2 py-1 text-[15px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-200"
            defaultValue={group.title}
            autoFocus
            onBlur={(e) => onGroupTitleSave(group.localId, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onGroupTitleSave(group.localId, e.currentTarget.value);
              if (e.key === 'Escape') onEditGroup(null);
            }}
          />
        ) : (
          <h2
            className="min-w-0 flex-1 cursor-pointer break-words text-[15px] font-bold leading-snug text-gray-900"
            onClick={() => onEditGroup(group.localId)}
          >
            {group.title}
          </h2>
        )}

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onAddItemStart(group.localId)}
            className="cursor-pointer rounded-lg px-2 py-1 text-[12px] font-semibold text-primary-600 transition-colors hover:bg-primary-50"
          >
            + 아이템
          </button>
          <button
            onClick={() => onDeleteGroup(group.localId)}
            className="cursor-pointer rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Items */}
      <SortableGroupDropzone
        groupId={group.localId}
        itemIds={filteredItems.map((i) => i.localId)}
        data={{ groupLocalId: group.localId }}
        className="divide-y divide-gray-50"
      >
        {filteredItems.map((item) => (
          <SortableItem
            key={item.localId}
            item={item}
            groupLocalId={group.localId}
            isEditing={editingItemId === item.localId}
            onEdit={onEditItem}
            onTitleSave={onItemTitleSave}
            onDelete={onDeleteItem}
            onSeasonToggle={onSeasonToggle}
          />
        ))}

        {addingItemGroupId === group.localId && (
          <div className="flex items-center gap-2 px-4 py-2.5">
            <input
              ref={newItemInputRef}
              className="min-w-0 flex-1 rounded border border-primary-300 px-2 py-1 text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="새 아이템 이름"
              onBlur={(e) => onAddItem(group.localId, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddItem(group.localId, e.currentTarget.value);
                if (e.key === 'Escape') onCancelAddItem();
              }}
            />
          </div>
        )}

        {filteredItems.length === 0 && addingItemGroupId !== group.localId && (
          <div className="px-4 py-6 text-center text-[13px] text-gray-400">
            {activeSeason === 'all' ? '아이템이 없습니다' : '이 계절에 해당하는 아이템이 없습니다'}
          </div>
        )}
      </SortableGroupDropzone>
    </div>
  );
}

// ── Sortable Item ──

interface SortableItemProps {
  item: LocalItem;
  groupLocalId: string;
  isEditing: boolean;
  onEdit: (id: string | null) => void;
  onTitleSave: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onSeasonToggle: (itemId: string, season: Season) => void;
}

function SortableItem({ item, groupLocalId, isEditing, onEdit, onTitleSave, onDelete, onSeasonToggle }: SortableItemProps) {
  const {
    attributes, listeners, setNodeRef, style,
  } = useSortableStyle({ id: item.localId, data: { type: 'item', groupLocalId } });

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 px-2 py-2.5 pr-4">
      <GripHandle listeners={listeners} attributes={attributes} className="text-gray-200" iconClassName="h-3.5 w-3.5" />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            className="w-full rounded border border-primary-300 px-2 py-0.5 text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-primary-200"
            defaultValue={item.title}
            autoFocus
            onBlur={(e) => onTitleSave(item.localId, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onTitleSave(item.localId, e.currentTarget.value);
              if (e.key === 'Escape') onEdit(null);
            }}
          />
        ) : (
          <span
            className="cursor-pointer break-words text-[14px] leading-snug text-gray-800"
            onClick={() => onEdit(item.localId)}
          >
            {item.title}
          </span>
        )}
      </div>

      <div className="flex shrink-0 gap-0.5">
        {Object.values(Season).map((s) => {
          const badge = SEASON_BADGE[s];
          const active = item.seasons.includes(s);
          return (
            <button
              key={s}
              onClick={() => onSeasonToggle(item.localId, s)}
              className={`cursor-pointer rounded-md px-1 py-0.5 text-[11px] transition-colors ${active ? badge.active : badge.inactive}`}
              title={`${SEASON_TABS.find((t) => t.id === s)?.name}`}
            >
              {badge.icon}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onDelete(item.localId)}
        className="shrink-0 cursor-pointer rounded-lg p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ── Drag Overlay Previews ──

function GroupOverlay({ group }: { group: LocalGroup }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      <div className="flex items-center gap-1 border-b border-gray-100 px-2 py-3 pr-4">
        <GripHandle />
        <h2 className="text-[15px] font-bold text-gray-900">{group.title}</h2>
      </div>
      <div className="px-4 py-3 text-[13px] text-gray-400">
        {group.items.length}개 아이템
      </div>
    </div>
  );
}

function ItemOverlay({ item }: { item: LocalItem }) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-white px-2 py-2.5 pr-4 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      <GripHandle className="text-gray-200" iconClassName="h-3.5 w-3.5" />
      <span className="flex-1 text-[14px] text-gray-800">{item.title}</span>
      <div className="flex gap-0.5">
        {Object.values(Season).map((s) => {
          const badge = SEASON_BADGE[s];
          const active = item.seasons.includes(s);
          return (
            <span key={s} className={`rounded-md px-1 py-0.5 text-[11px] ${active ? badge.active : badge.inactive}`}>
              {badge.icon}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ── Main Component ──
// ══════════════════════════════════════

interface Props {
  initialData: GetMyTemplateResponse;
}

export default function TemplateEditorClient({ initialData }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const action = useAction();

  const [groups, setGroups] = useState<LocalGroup[]>(() => toLocal(initialData));
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => JSON.stringify(toLocal(initialData)));
  const [activeSeason, setActiveSeason] = useState<SeasonFilter>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [addingItemGroupId, setAddingItemGroupId] = useState<string | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [saving, setSaving] = useState(false);

  const newItemInputRef = useRef<HTMLInputElement>(null);

  const isDirty = useMemo(() => JSON.stringify(groups) !== savedSnapshot, [groups, savedSnapshot]);

  const filteredGroups = groups.map((g) => ({
    ...g,
    filteredItems: activeSeason === 'all' ? g.items : g.items.filter((i) => i.seasons.includes(activeSeason)),
  }));

  // ── DnD (shared hook) ──
  const dnd = useSortableList<LocalGroup, LocalItem>({
    groups,
    setGroups,
    getGroupId: (g) => g.localId,
    getItems: (g) => g.items,
    getItemId: (i) => i.localId,
    setItems: (g, items) => ({ ...g, items }),
  });

  // ── beforeunload ──
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── Handlers ──

  const handleSeasonToggle = useCallback((itemLocalId: string, season: Season) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => {
          if (i.localId !== itemLocalId) return i;
          const ns = i.seasons.includes(season) ? i.seasons.filter((s) => s !== season) : [...i.seasons, season];
          return ns.length === 0 ? i : { ...i, seasons: ns };
        }),
      })),
    );
  }, []);

  const handleItemTitleSave = useCallback((id: string, t: string) => {
    const trimmed = t.trim();
    if (!trimmed) { setEditingItemId(null); return; }
    setGroups((prev) => prev.map((g) => ({ ...g, items: g.items.map((i) => (i.localId === id ? { ...i, title: trimmed } : i)) })));
    setEditingItemId(null);
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setGroups((prev) => prev.map((g) => ({ ...g, items: g.items.filter((i) => i.localId !== id) })));
  }, []);

  const handleAddItem = useCallback((gId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) { setAddingItemGroupId(null); return; }
    const seasons = activeSeason === 'all' ? Object.values(Season) : [activeSeason];
    setGroups((prev) => prev.map((g) => (g.localId === gId ? { ...g, items: [...g.items, { localId: nextLocalId(), title: trimmed, seasons }] } : g)));
    setAddingItemGroupId(null);
  }, [activeSeason]);

  const handleGroupTitleSave = useCallback((id: string, t: string) => {
    const trimmed = t.trim();
    if (!trimmed) { setEditingGroupId(null); return; }
    setGroups((prev) => prev.map((g) => (g.localId === id ? { ...g, title: trimmed } : g)));
    setEditingGroupId(null);
  }, []);

  const handleDeleteGroup = useCallback((id: string) => {
    const group = groups.find((g) => g.localId === id);
    if (group && group.items.length > 0) { toast('아이템을 먼저 삭제해 주세요'); return; }
    setGroups((prev) => prev.filter((g) => g.localId !== id));
  }, [groups, toast]);

  const handleAddGroup = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) { setAddingGroup(false); return; }
    setGroups((prev) => [...prev, { localId: nextLocalId(), title: trimmed, items: [] }]);
    setAddingGroup(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const result = await action(
      () => saveMyTemplate({
        groups: groups.map((g) => ({
          title: g.title,
          items: g.items.map((i) => ({ title: i.title, seasons: i.seasons })),
        })),
      }),
      '저장에 실패했습니다. 다시 시도해 주세요.',
    );
    if (result.ok) {
      setSavedSnapshot(JSON.stringify(groups));
      toast('저장되었습니다');
    }
    setSaving(false);
  }, [groups, toast, action]);

  const handleDiscard = useCallback(async () => {
    const ok = await confirm({ title: '변경 사항 되돌리기', description: '저장하지 않은 변경 사항이 모두 사라집니다. 되돌릴까요?', confirmLabel: '되돌리기' });
    if (ok) setGroups(JSON.parse(savedSnapshot));
  }, [savedSnapshot, confirm]);

  const handleBack = useCallback(async () => {
    if (!isDirty) { router.push('/mypage'); return; }
    const ok = await confirm({ title: '저장하지 않은 변경 사항', description: '변경 사항을 저장하지 않고 나갈까요?', confirmLabel: '나가기' });
    if (ok) router.push('/mypage');
  }, [isDirty, router, confirm]);

  return (
    <div className="mx-auto max-w-sm pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#F2F2F0] px-5 pb-3 pt-10">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 className="flex-1 text-[20px] font-bold text-gray-900">나의 체크리스트 템플릿</h1>
          {isDirty && (
            <button onClick={handleDiscard} className="cursor-pointer rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600">
              되돌리기
            </button>
          )}
        </div>
      </header>

      {/* Season Tabs */}
      <div className="sticky top-[76px] z-10 bg-[#F2F2F0] px-5 pb-3">
        <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-white p-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {SEASON_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSeason(tab.id)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                activeSeason === tab.id ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Groups with DnD */}
      <SortableContainer<LocalGroup, LocalItem>
        dnd={dnd}
        groupIds={groups.map((g) => g.localId)}
        renderGroupOverlay={(group) => <GroupOverlay group={group} />}
        renderItemOverlay={(item) => <ItemOverlay item={item} />}
      >
        <div className="space-y-3 px-4 pt-1">
          {filteredGroups.map((group) => (
            <SortableGroup
              key={group.localId}
              group={group}
              filteredItems={group.filteredItems}
              editingGroupId={editingGroupId}
              editingItemId={editingItemId}
              addingItemGroupId={addingItemGroupId}
              newItemInputRef={newItemInputRef}
              activeSeason={activeSeason}
              onGroupTitleSave={handleGroupTitleSave}
              onEditGroup={setEditingGroupId}
              onDeleteGroup={handleDeleteGroup}
              onAddItemStart={(gId) => { setAddingItemGroupId(gId); setTimeout(() => newItemInputRef.current?.focus(), 50); }}
              onAddItem={handleAddItem}
              onCancelAddItem={() => setAddingItemGroupId(null)}
              onEditItem={setEditingItemId}
              onItemTitleSave={handleItemTitleSave}
              onDeleteItem={handleDeleteItem}
              onSeasonToggle={handleSeasonToggle}
            />
          ))}

          {addingGroup ? (
            <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <input
                className="w-full rounded-lg border border-primary-300 px-3 py-2 text-[15px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="새 그룹 이름"
                autoFocus
                onBlur={(e) => handleAddGroup(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddGroup(e.currentTarget.value); if (e.key === 'Escape') setAddingGroup(false); }}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingGroup(true)}
              className="w-full cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 py-4 text-center text-[14px] font-semibold text-gray-400 transition-colors hover:border-primary-300 hover:text-primary-600"
            >
              + 새 그룹 추가
            </button>
          )}
        </div>
      </SortableContainer>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 left-1/2 z-30 w-full max-w-sm -translate-x-1/2 px-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full cursor-pointer rounded-2xl bg-primary-600 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(22,163,74,0.4)] transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60"
            >
              {saving ? '저장 중...' : '변경 사항 저장'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
