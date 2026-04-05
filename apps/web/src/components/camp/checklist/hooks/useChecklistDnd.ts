import type { ChecklistGroup } from '@campus/shared';
import { useSortableList } from '@/components/ui/dnd';
import { reorderChecklistItems, reorderChecklistGroups } from '@/actions/camp';

// re-export for consumers
export { groupDroppableId as getGroupDroppableId } from '@/components/ui/dnd';

interface UseChecklistDndParams {
  campId: string;
  groups: ChecklistGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ChecklistGroup[]>>;
  socketId: string | null;
}

export function useChecklistDnd({ campId, groups, setGroups, socketId }: UseChecklistDndParams) {
  return useSortableList<ChecklistGroup, ChecklistGroup['items'][number]>({
    groups,
    setGroups,
    getGroupId: (g) => g.id,
    getItems: (g) => g.items,
    getItemId: (i) => i.id,
    setItems: (g, items) => ({ ...g, items }),
    onGroupsReordered: (reordered) => {
      reorderChecklistGroups(campId, { groupIds: reordered.map((g) => g.id) }, socketId ?? undefined);
    },
    onItemsReordered: (group) => {
      reorderChecklistItems(campId, group.id, { itemIds: group.items.map((i) => i.id) }, socketId ?? undefined);
    },
  });
}
