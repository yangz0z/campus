import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ChecklistTemplate } from '../checklist-template/entities/checklist-template.entity';
import { CampChecklistGroup } from './entities/camp-checklist-group.entity';
import { CampChecklistItem } from './entities/camp-checklist-item.entity';
import { CampChecklistItemAssignee } from './entities/camp-checklist-item-assignee.entity';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { SetItemAssigneesDto } from './dto/set-item-assignees.dto';
import { ToggleChecklistItemDto } from './dto/toggle-checklist-item.dto';
import { ReorderChecklistItemsDto, ReorderChecklistGroupsDto } from './dto/reorder-checklist.dto';
import { CampMemberService } from './camp-member.service';
import { CampGateway } from './camp.gateway';
import { Season, SocketEvents } from '@campus/shared';

@Injectable()
export class CampChecklistService {
  constructor(
    @InjectRepository(CampChecklistGroup)
    private readonly campChecklistGroupRepository: Repository<CampChecklistGroup>,
    @InjectRepository(CampChecklistItem)
    private readonly campChecklistItemRepository: Repository<CampChecklistItem>,
    @InjectRepository(CampChecklistItemAssignee)
    private readonly campChecklistItemAssigneeRepository: Repository<CampChecklistItemAssignee>,
    private readonly dataSource: DataSource,
    private readonly campMemberService: CampMemberService,
    private readonly campGateway: CampGateway,
  ) {}

  async getIncompleteCount(user: User, campId: string): Promise<{ incompleteCount: number }> {
    await this.campMemberService.requireMember(campId, user.id);

    const groups = await this.campChecklistGroupRepository.find({
      where: { campId },
      relations: ['items', 'items.assignees'],
    });

    let incompleteCount = 0;
    for (const group of groups) {
      for (const item of group.items) {
        const isComplete =
          item.assignees.length > 0 && item.assignees.every((a) => a.isChecked);
        if (!isComplete) incompleteCount++;
      }
    }

    return { incompleteCount };
  }

  async getCampChecklist(user: User, campId: string) {
    const member = await this.campMemberService.requireMember(campId, user.id);

    const groups = await this.campChecklistGroupRepository.find({
      where: { campId },
      relations: ['items', 'items.assignees', 'items.assignees.member', 'items.assignees.member.user'],
      order: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } },
    });

    return {
      myMemberId: member.id,
      groups: groups.map((g) => ({
        id: g.id,
        title: g.title,
        sortOrder: g.sortOrder,
        items: g.items.map((i) => {
          const myAssignee = i.assignees.find((a) => a.memberId === member.id);
          return {
            id: i.id,
            title: i.title,
            isRequired: i.isRequired,
            sortOrder: i.sortOrder,
            memo: i.memo,
            isCheckedByMe: myAssignee?.isChecked ?? false,
            assignees: i.assignees.map((a) => ({
              memberId: a.memberId,
              nickname: a.member.user.nickname,
              profileImage: a.member.user.profileImage,
              isChecked: a.isChecked,
            })),
          };
        }),
      })),
    };
  }

  async createChecklistGroup(user: User, campId: string, dto: CreateChecklistGroupDto, socketId?: string) {
    await this.campMemberService.requireMember(campId, user.id);

    const { max } = await this.campChecklistGroupRepository
      .createQueryBuilder('g')
      .select('MAX(g.sortOrder)', 'max')
      .where('g.campId = :campId', { campId })
      .getRawOne();

    const group = this.campChecklistGroupRepository.create({
      campId,
      title: dto.title,
      sortOrder: (max ?? -1) + 1,
    });
    const saved = await this.campChecklistGroupRepository.save(group);
    const result = { id: saved.id, title: saved.title, sortOrder: saved.sortOrder };

    this.campGateway.emitToCamp(campId, SocketEvents.GROUP_CREATED, { campId, group: result }, socketId);

    return result;
  }

  async updateChecklistGroup(user: User, campId: string, groupId: string, title: string, socketId?: string): Promise<void> {
    await this.campMemberService.requireMember(campId, user.id);

    const group = await this.campChecklistGroupRepository.findOne({ where: { id: groupId, campId } });
    if (!group) throw new NotFoundException();

    await this.campChecklistGroupRepository.update(groupId, { title });

    this.campGateway.emitToCamp(campId, SocketEvents.GROUP_UPDATED, { campId, groupId, title }, socketId);
  }

  async deleteChecklistGroup(user: User, campId: string, groupId: string, socketId?: string): Promise<void> {
    await this.campMemberService.requireMember(campId, user.id);

    const group = await this.campChecklistGroupRepository.findOne({
      where: { id: groupId, campId },
      relations: ['items'],
    });
    if (!group) throw new NotFoundException();
    if (group.items.length > 0) throw new BadRequestException('Group has items');

    await this.campChecklistGroupRepository.remove(group);

    this.campGateway.emitToCamp(campId, SocketEvents.GROUP_DELETED, { campId, groupId }, socketId);
  }

  async createChecklistItem(user: User, campId: string, groupId: string, dto: CreateChecklistItemDto, socketId?: string) {
    await this.campMemberService.requireMember(campId, user.id);

    const group = await this.campChecklistGroupRepository.findOne({ where: { id: groupId, campId } });
    if (!group) throw new NotFoundException();

    const { max } = await this.campChecklistItemRepository
      .createQueryBuilder('i')
      .select('MAX(i.sortOrder)', 'max')
      .where('i.groupId = :groupId', { groupId })
      .getRawOne();

    const item = this.campChecklistItemRepository.create({
      groupId,
      title: dto.title,
      sortOrder: (max ?? -1) + 1,
      isRequired: false,
      memo: null,
    });
    const saved = await this.campChecklistItemRepository.save(item);
    const result = {
      id: saved.id,
      title: saved.title,
      isRequired: saved.isRequired,
      sortOrder: saved.sortOrder,
      memo: saved.memo,
      assignees: [],
      isCheckedByMe: false,
    };

    this.campGateway.emitToCamp(campId, SocketEvents.ITEM_CREATED, { campId, groupId, item: result }, socketId);

    return result;
  }

  async toggleChecklistItem(user: User, campId: string, itemId: string, dto: ToggleChecklistItemDto, socketId?: string): Promise<void> {
    const member = await this.campMemberService.requireMember(campId, user.id);

    const item = await this.campChecklistItemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.campId !== campId) throw new NotFoundException();

    const assignees = await this.campChecklistItemAssigneeRepository.find({
      where: { itemId },
    });

    let assignee = assignees.find((a) => a.memberId === member.id);

    if (!assignee) {
      if (assignees.length > 0) {
        throw new ForbiddenException('담당자만 체크할 수 있습니다.');
      }
      assignee = this.campChecklistItemAssigneeRepository.create({ itemId, memberId: member.id });
    }

    assignee.isChecked = dto.isChecked;
    assignee.checkedAt = dto.isChecked ? new Date() : null;
    await this.campChecklistItemAssigneeRepository.save(assignee);

    this.campGateway.emitToCamp(campId, SocketEvents.CHECK_TOGGLED, {
      campId, itemId, memberId: member.id, isChecked: dto.isChecked,
    }, socketId);
  }

  async updateChecklistItem(user: User, campId: string, itemId: string, dto: UpdateChecklistItemDto, socketId?: string): Promise<void> {
    await this.campMemberService.requireMember(campId, user.id);

    const item = await this.campChecklistItemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.campId !== campId) throw new NotFoundException();

    await this.campChecklistItemRepository.update(itemId, {
      title: dto.title,
      memo: dto.memo ?? null,
    });

    this.campGateway.emitToCamp(campId, SocketEvents.ITEM_UPDATED, {
      campId, itemId, title: dto.title, memo: dto.memo ?? null,
    }, socketId);
  }

  async deleteChecklistItem(user: User, campId: string, itemId: string, socketId?: string): Promise<void> {
    await this.campMemberService.requireMember(campId, user.id);

    const item = await this.campChecklistItemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.campId !== campId) throw new NotFoundException();

    await this.campChecklistItemRepository.remove(item);

    this.campGateway.emitToCamp(campId, SocketEvents.ITEM_DELETED, { campId, itemId }, socketId);
  }

  async setItemAssignees(user: User, campId: string, itemId: string, dto: SetItemAssigneesDto, socketId?: string): Promise<void> {
    await this.campMemberService.requireMember(campId, user.id);

    const item = await this.campChecklistItemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.campId !== campId) throw new NotFoundException();

    await this.campChecklistItemAssigneeRepository.delete({ itemId });

    if (dto.memberIds.length > 0) {
      const assignees = dto.memberIds.map((memberId) =>
        this.campChecklistItemAssigneeRepository.create({ itemId, memberId }),
      );
      await this.campChecklistItemAssigneeRepository.save(assignees);
    }

    const savedAssignees = await this.campChecklistItemAssigneeRepository.find({
      where: { itemId },
      relations: ['member', 'member.user'],
    });
    this.campGateway.emitToCamp(campId, SocketEvents.ASSIGNEES_SET, {
      campId,
      itemId,
      assignees: savedAssignees.map((a) => ({
        memberId: a.memberId,
        nickname: a.member.user.nickname,
        profileImage: a.member.user.profileImage,
        isChecked: a.isChecked,
      })),
    }, socketId);
  }

  async reorderChecklistItems(user: User, campId: string, targetGroupId: string, dto: ReorderChecklistItemsDto, socketId?: string): Promise<void> {
    await this.campMemberService.requireMember(campId, user.id);

    const targetGroup = await this.campChecklistGroupRepository.findOne({ where: { id: targetGroupId, campId } });
    if (!targetGroup) throw new NotFoundException();

    await this.dataSource.transaction(async (manager) => {
      const items = await manager.find(CampChecklistItem, {
        where: dto.itemIds.map((id) => ({ id })),
        select: ['id', 'groupId'],
      });
      const sourceGroupIds = new Set(
        items.filter((i) => i.groupId !== targetGroupId).map((i) => i.groupId),
      );

      for (let i = 0; i < dto.itemIds.length; i++) {
        await manager.update(CampChecklistItem, { id: dto.itemIds[i] }, {
          groupId: targetGroupId,
          sortOrder: -(i + 1),
        });
      }
      for (let i = 0; i < dto.itemIds.length; i++) {
        await manager.update(CampChecklistItem, { id: dto.itemIds[i] }, { sortOrder: i });
      }

      for (const sourceGroupId of sourceGroupIds) {
        const remaining = await manager.find(CampChecklistItem, {
          where: { groupId: sourceGroupId },
          order: { sortOrder: 'ASC' },
        });
        for (let i = 0; i < remaining.length; i++) {
          if (remaining[i].sortOrder !== i) {
            await manager.update(CampChecklistItem, { id: remaining[i].id }, { sortOrder: -(i + 1) });
          }
        }
        for (let i = 0; i < remaining.length; i++) {
          if (remaining[i].sortOrder !== i) {
            await manager.update(CampChecklistItem, { id: remaining[i].id }, { sortOrder: i });
          }
        }
      }
    });

    this.campGateway.emitToCamp(campId, SocketEvents.ITEMS_REORDERED, {
      campId, targetGroupId, itemIds: dto.itemIds,
    }, socketId);
  }

  async reorderChecklistGroups(user: User, campId: string, dto: ReorderChecklistGroupsDto, socketId?: string): Promise<void> {
    await this.campMemberService.requireMember(campId, user.id);

    await this.dataSource.transaction(async (manager) => {
      for (let i = 0; i < dto.groupIds.length; i++) {
        await manager.update(CampChecklistGroup, { id: dto.groupIds[i], campId }, { sortOrder: -(i + 1) });
      }
      for (let i = 0; i < dto.groupIds.length; i++) {
        await manager.update(CampChecklistGroup, { id: dto.groupIds[i], campId }, { sortOrder: i });
      }
    });

    this.campGateway.emitToCamp(campId, SocketEvents.GROUPS_REORDERED, {
      campId, groupIds: dto.groupIds,
    }, socketId);
  }

  async initializeFromTemplate(
    manager: EntityManager,
    campId: string,
    memberId: string,
    userId: string,
    season: Season,
  ): Promise<void> {
    let template = await manager
      .createQueryBuilder(ChecklistTemplate, 't')
      .leftJoinAndSelect('t.groups', 'g')
      .leftJoinAndSelect('g.items', 'i')
      .where("t.owner_type = 'user'")
      .andWhere('t.user_id = :userId', { userId })
      .andWhere('t.is_active = true')
      .orderBy('g.sort_order', 'ASC')
      .addOrderBy('i.sort_order', 'ASC')
      .getOne();

    if (!template) {
      template = await manager
        .createQueryBuilder(ChecklistTemplate, 't')
        .leftJoinAndSelect('t.groups', 'g')
        .leftJoinAndSelect('g.items', 'i')
        .where("t.owner_type = 'system'")
        .andWhere('t.is_active = true')
        .andWhere(':season = ANY(t.seasons)', { season })
        .orderBy('g.sort_order', 'ASC')
        .addOrderBy('i.sort_order', 'ASC')
        .getOne();
    }

    if (!template) return;

    for (const templateGroup of template.groups) {
      const campGroup = manager.create(CampChecklistGroup, {
        campId,
        sourceGroupId: templateGroup.id,
        title: templateGroup.title,
        sortOrder: templateGroup.sortOrder,
      });
      const savedGroup = await manager.save(CampChecklistGroup, campGroup);

      const seasonItems = templateGroup.items.filter(
        (ti) => ti.seasons.includes(season),
      );
      for (const templateItem of seasonItems) {
        const campItem = manager.create(CampChecklistItem, {
          groupId: savedGroup.id,
          sourceItemId: templateItem.id,
          title: templateItem.title,
          memo: templateItem.description ?? null,
          sortOrder: templateItem.sortOrder,
          isRequired: templateItem.isRequired,
        });
        const savedItem = await manager.save(CampChecklistItem, campItem);
        await manager.save(CampChecklistItemAssignee, manager.create(CampChecklistItemAssignee, {
          itemId: savedItem.id,
          memberId,
        }));
      }
    }
  }
}
