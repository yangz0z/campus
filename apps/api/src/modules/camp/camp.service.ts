import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ChecklistTemplate } from '../checklist-template/entities/checklist-template.entity';
import { Camp } from './entities/camp.entity';
import { CampMember } from './entities/camp-member.entity';
import { CampChecklistGroup } from './entities/camp-checklist-group.entity';
import { CampChecklistItem } from './entities/camp-checklist-item.entity';
import { CampChecklistItemAssignee } from './entities/camp-checklist-item-assignee.entity';
import { CampInvite } from './entities/camp-invite.entity';
import { CreateCampDto } from './dto/create-camp.dto';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { UpdateCampDto } from './dto/update-camp.dto';
import { SetItemAssigneesDto } from './dto/set-item-assignees.dto';
import { ToggleChecklistItemDto } from './dto/toggle-checklist-item.dto';
import { ReorderChecklistItemsDto, ReorderChecklistGroupsDto } from './dto/reorder-checklist.dto';
import { CampGateway } from './camp.gateway';
import { SocketEvents } from '@campus/shared';

@Injectable()
export class CampService {
  constructor(
    @InjectRepository(Camp)
    private readonly campRepository: Repository<Camp>,
    @InjectRepository(CampMember)
    private readonly campMemberRepository: Repository<CampMember>,
    @InjectRepository(CampChecklistGroup)
    private readonly campChecklistGroupRepository: Repository<CampChecklistGroup>,
    @InjectRepository(CampChecklistItem)
    private readonly campChecklistItemRepository: Repository<CampChecklistItem>,
    @InjectRepository(CampChecklistItemAssignee)
    private readonly campChecklistItemAssigneeRepository: Repository<CampChecklistItemAssignee>,
    @InjectRepository(ChecklistTemplate)
    private readonly checklistTemplateRepository: Repository<ChecklistTemplate>,
    @InjectRepository(CampInvite)
    private readonly campInviteRepository: Repository<CampInvite>,
    private readonly dataSource: DataSource,
    private readonly campGateway: CampGateway,
  ) {}

  async createCamp(user: User, dto: CreateCampDto): Promise<{ campId: string }> {
    const campId = await this.dataSource.transaction(async (manager) => {
      const camp = manager.create(Camp, {
        userId: user.id,
        title: dto.title,
        location: dto.location ?? null,
        startDate: dto.startDate,
        endDate: dto.endDate,
        season: dto.season,
      });
      const savedCamp = await manager.save(Camp, camp);

      const member = manager.create(CampMember, {
        campId: savedCamp.id,
        userId: user.id,
        role: 'owner',
      });
      const savedMember = await manager.save(CampMember, member);

      // 유저 커스텀 템플릿 우선, 없으면 시스템 템플릿 사용
      let template = await manager
        .createQueryBuilder(ChecklistTemplate, 't')
        .leftJoinAndSelect('t.groups', 'g')
        .leftJoinAndSelect('g.items', 'i')
        .where("t.owner_type = 'user'")
        .andWhere('t.user_id = :userId', { userId: user.id })
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
          .andWhere(':season = ANY(t.seasons)', { season: dto.season })
          .orderBy('g.sort_order', 'ASC')
          .addOrderBy('i.sort_order', 'ASC')
          .getOne();
      }

      if (template) {
        for (const templateGroup of template.groups) {
          const campGroup = manager.create(CampChecklistGroup, {
            campId: savedCamp.id,
            sourceGroupId: templateGroup.id,
            title: templateGroup.title,
            sortOrder: templateGroup.sortOrder,
          });
          const savedGroup = await manager.save(CampChecklistGroup, campGroup);

          const seasonItems = templateGroup.items.filter(
            (ti) => ti.seasons.includes(dto.season),
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
              memberId: savedMember.id,
            }));
          }
        }
      }

      return savedCamp.id;
    });

    return { campId };
  }

  async getMyCamps(user: User) {
    const members = await this.campMemberRepository.find({
      where: { userId: user.id },
      relations: ['camp', 'camp.members', 'camp.members.user'],
      order: { createdAt: 'DESC' },
    });

    return {
      camps: members.map((m) => ({
        id: m.camp.id,
        title: m.camp.title,
        location: m.camp.location,
        startDate: m.camp.startDate,
        endDate: m.camp.endDate,
        season: m.camp.season,
        myRole: m.role,
        members: [...m.camp.members]
          .sort((a, b) => {
            if (a.role === 'owner' && b.role !== 'owner') return -1;
            if (a.role !== 'owner' && b.role === 'owner') return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          })
          .map((cm) => ({
            nickname: cm.user.nickname,
            profileImage: cm.user.profileImage,
            role: cm.role,
          })),
      })),
    };
  }

  async getIncompleteCount(user: User, campId: string): Promise<{ incompleteCount: number }> {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

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

  async leaveCamp(user: User, campId: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();
    if (member.role === 'owner') throw new ForbiddenException('방장은 캠프를 나갈 수 없어요. 캠프를 삭제해주세요.');

    const memberId = member.id;
    await this.campMemberRepository.remove(member);

    this.campGateway.emitToCamp(campId, SocketEvents.MEMBER_LEFT, { campId, memberId });
  }

  async kickMember(requestingUser: User, campId: string, targetMemberId: string) {
    const requester = await this.campMemberRepository.findOne({ where: { campId, userId: requestingUser.id } });
    if (!requester) throw new ForbiddenException();
    if (requester.role !== 'owner') throw new ForbiddenException('방장만 멤버를 내보낼 수 있어요.');

    const target = await this.campMemberRepository.findOne({ where: { id: targetMemberId, campId } });
    if (!target) throw new NotFoundException();
    if (target.role === 'owner') throw new ForbiddenException('방장은 내보낼 수 없어요.');

    await this.campMemberRepository.remove(target);
    this.campGateway.emitToCamp(campId, SocketEvents.MEMBER_LEFT, { campId, memberId: targetMemberId });
  }

  async deleteCamp(user: User, campId: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();
    if (member.role !== 'owner') throw new ForbiddenException('캠프 소유자만 삭제할 수 있어요.');

    const camp = await this.campRepository.findOne({ where: { id: campId } });
    if (!camp) throw new NotFoundException();

    await this.campRepository.remove(camp);
  }

  async updateCamp(user: User, campId: string, dto: UpdateCampDto) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const camp = await this.campRepository.findOne({ where: { id: campId } });
    if (!camp) throw new NotFoundException();

    camp.title = dto.title;
    camp.location = dto.location ?? null;
    camp.startDate = dto.startDate;
    camp.endDate = dto.endDate;
    camp.season = dto.season;
    await this.campRepository.save(camp);
  }

  async getCamp(user: User, campId: string) {
    const member = await this.campMemberRepository.findOne({
      where: { campId, userId: user.id },
      relations: ['camp'],
    });
    if (!member) throw new ForbiddenException();

    const camp = member.camp;
    return {
      id: camp.id,
      title: camp.title,
      location: camp.location,
      startDate: camp.startDate,
      endDate: camp.endDate,
      season: camp.season,
      myRole: member.role,
      members: [],
    };
  }

  async getCampMembers(user: User, campId: string) {
    const member = await this.campMemberRepository.findOne({
      where: { campId, userId: user.id },
    });
    if (!member) throw new ForbiddenException();

    const members = await this.campMemberRepository.find({
      where: { campId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return {
      members: members.map((m) => ({
        memberId: m.id,
        nickname: m.user.nickname,
        profileImage: m.user.profileImage,
        role: m.role,
      })),
    };
  }

  async getCampChecklist(user: User, campId: string) {
    const member = await this.campMemberRepository.findOne({
      where: { campId, userId: user.id },
    });
    if (!member) throw new ForbiddenException();

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
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

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

  async updateChecklistGroup(user: User, campId: string, groupId: string, title: string, socketId?: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const group = await this.campChecklistGroupRepository.findOne({ where: { id: groupId, campId } });
    if (!group) throw new NotFoundException();

    group.title = title;
    await this.campChecklistGroupRepository.save(group);

    this.campGateway.emitToCamp(campId, SocketEvents.GROUP_UPDATED, { campId, groupId, title }, socketId);
  }

  async deleteChecklistGroup(user: User, campId: string, groupId: string, socketId?: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

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
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

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

  async toggleChecklistItem(user: User, campId: string, itemId: string, dto: ToggleChecklistItemDto, socketId?: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

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

  async updateChecklistItem(user: User, campId: string, itemId: string, dto: UpdateChecklistItemDto, socketId?: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const item = await this.campChecklistItemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.campId !== campId) throw new NotFoundException();

    item.title = dto.title;
    item.memo = dto.memo ?? null;
    await this.campChecklistItemRepository.save(item);

    this.campGateway.emitToCamp(campId, SocketEvents.ITEM_UPDATED, {
      campId, itemId, title: item.title, memo: item.memo,
    }, socketId);
  }

  async deleteChecklistItem(user: User, campId: string, itemId: string, socketId?: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const item = await this.campChecklistItemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.campId !== campId) throw new NotFoundException();

    await this.campChecklistItemRepository.remove(item);

    this.campGateway.emitToCamp(campId, SocketEvents.ITEM_DELETED, { campId, itemId }, socketId);
  }

  async createCampInvite(user: User, campId: string): Promise<{ token: string }> {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    let invite = await this.campInviteRepository.findOne({ where: { campId } });
    if (!invite) {
      invite = this.campInviteRepository.create({ campId, token: randomUUID() });
      invite = await this.campInviteRepository.save(invite);
    }
    return { token: invite.token };
  }

  async getCampInviteInfo(token: string): Promise<{ camp: { id: string; title: string; location: string | null; startDate: string; endDate: string; season: string } }> {
    const invite = await this.campInviteRepository.findOne({
      where: { token },
      relations: ['camp'],
    });
    if (!invite) throw new NotFoundException();

    return {
      camp: {
        id: invite.camp.id,
        title: invite.camp.title,
        location: invite.camp.location,
        startDate: invite.camp.startDate,
        endDate: invite.camp.endDate,
        season: invite.camp.season,
      },
    };
  }

  async acceptCampInvite(user: User, token: string): Promise<{ campId: string }> {
    const invite = await this.campInviteRepository.findOne({ where: { token } });
    if (!invite) throw new NotFoundException();

    const campId = invite.campId;

    const existing = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (existing) return { campId };

    const member = this.campMemberRepository.create({ campId, userId: user.id, role: 'member' });
    await this.campMemberRepository.save(member);

    const memberPayload = {
      campId,
      member: {
        memberId: member.id,
        nickname: user.nickname,
        profileImage: user.profileImage,
        role: member.role,
      },
    };
    console.log(`[CampService] Emitting MEMBER_JOINED to camp:${campId} - member: ${member.id} (${user.nickname})`);
    this.campGateway.emitToCamp(campId, SocketEvents.MEMBER_JOINED, memberPayload);

    return { campId };
  }

  async setItemAssignees(user: User, campId: string, itemId: string, dto: SetItemAssigneesDto, socketId?: string) {
    const member = await this.campMemberRepository.findOne({
      where: { campId, userId: user.id },
    });
    if (!member) throw new ForbiddenException();

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

    // 브로드캐스트를 위해 assignee 정보를 user join으로 다시 조회
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

  async reorderChecklistItems(user: User, campId: string, targetGroupId: string, dto: ReorderChecklistItemsDto, socketId?: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const targetGroup = await this.campChecklistGroupRepository.findOne({ where: { id: targetGroupId, campId } });
    if (!targetGroup) throw new NotFoundException();

    await this.dataSource.transaction(async (manager) => {
      // 이동 대상 아이템들의 원래 groupId 수집 (소스 그룹 재정렬용)
      const items = await manager.find(CampChecklistItem, {
        where: dto.itemIds.map((id) => ({ id })),
        select: ['id', 'groupId'],
      });
      const sourceGroupIds = new Set(
        items.filter((i) => i.groupId !== targetGroupId).map((i) => i.groupId),
      );

      // 1) 대상 아이템들: 음수 sortOrder로 초기화 (unique constraint 회피)
      for (let i = 0; i < dto.itemIds.length; i++) {
        await manager.update(CampChecklistItem, { id: dto.itemIds[i] }, {
          groupId: targetGroupId,
          sortOrder: -(i + 1),
        });
      }
      // 2) 대상 아이템들: 새 순서로 재할당
      for (let i = 0; i < dto.itemIds.length; i++) {
        await manager.update(CampChecklistItem, { id: dto.itemIds[i] }, { sortOrder: i });
      }

      // 3) 소스 그룹에서 빠진 아이템들의 sortOrder 재정렬
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

  async reorderChecklistGroups(user: User, campId: string, dto: ReorderChecklistGroupsDto, socketId?: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    await this.dataSource.transaction(async (manager) => {
      // 음수로 초기화하여 unique constraint 회피
      for (let i = 0; i < dto.groupIds.length; i++) {
        await manager.update(CampChecklistGroup, { id: dto.groupIds[i], campId }, { sortOrder: -(i + 1) });
      }
      // 새 순서로 재할당
      for (let i = 0; i < dto.groupIds.length; i++) {
        await manager.update(CampChecklistGroup, { id: dto.groupIds[i], campId }, { sortOrder: i });
      }
    });

    this.campGateway.emitToCamp(campId, SocketEvents.GROUPS_REORDERED, {
      campId, groupIds: dto.groupIds,
    }, socketId);
  }
}
