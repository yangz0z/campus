import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
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

      const template = await manager
        .createQueryBuilder(ChecklistTemplate, 't')
        .leftJoinAndSelect('t.groups', 'g')
        .leftJoinAndSelect('g.items', 'i')
        .where("t.owner_type = 'system'")
        .andWhere('t.is_active = true')
        .andWhere(':season = ANY(t.seasons)', { season: dto.season })
        .orderBy('g.sort_order', 'ASC')
        .addOrderBy('i.sort_order', 'ASC')
        .getOne();

      if (template) {
        for (const templateGroup of template.groups) {
          const campGroup = manager.create(CampChecklistGroup, {
            campId: savedCamp.id,
            sourceGroupId: templateGroup.id,
            title: templateGroup.title,
            sortOrder: templateGroup.sortOrder,
          });
          const savedGroup = await manager.save(CampChecklistGroup, campGroup);

          for (const templateItem of templateGroup.items) {
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
        members: m.camp.members.map((cm) => ({
          nickname: cm.user.nickname,
          profileImage: cm.user.profileImage,
        })),
      })),
    };
  }

  async deleteCamp(user: User, campId: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();
    if (member.role !== 'owner') throw new ForbiddenException('Only owner can delete camp');

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

  async createChecklistGroup(user: User, campId: string, dto: CreateChecklistGroupDto) {
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
    return { id: saved.id, title: saved.title, sortOrder: saved.sortOrder };
  }

  async updateChecklistGroup(user: User, campId: string, groupId: string, title: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const group = await this.campChecklistGroupRepository.findOne({ where: { id: groupId, campId } });
    if (!group) throw new NotFoundException();

    group.title = title;
    await this.campChecklistGroupRepository.save(group);
  }

  async deleteChecklistGroup(user: User, campId: string, groupId: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const group = await this.campChecklistGroupRepository.findOne({
      where: { id: groupId, campId },
      relations: ['items'],
    });
    if (!group) throw new NotFoundException();
    if (group.items.length > 0) throw new BadRequestException('Group has items');

    await this.campChecklistGroupRepository.remove(group);
  }

  async createChecklistItem(user: User, campId: string, groupId: string, dto: CreateChecklistItemDto) {
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
    return {
      id: saved.id,
      title: saved.title,
      isRequired: saved.isRequired,
      sortOrder: saved.sortOrder,
      memo: saved.memo,
      assignees: [],
      isCheckedByMe: false,
    };
  }

  async toggleChecklistItem(user: User, campId: string, itemId: string, dto: ToggleChecklistItemDto) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const item = await this.campChecklistItemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.campId !== campId) throw new NotFoundException();

    let assignee = await this.campChecklistItemAssigneeRepository.findOne({
      where: { itemId, memberId: member.id },
    });

    if (!assignee) {
      assignee = this.campChecklistItemAssigneeRepository.create({ itemId, memberId: member.id });
    }

    assignee.isChecked = dto.isChecked;
    assignee.checkedAt = dto.isChecked ? new Date() : null;
    await this.campChecklistItemAssigneeRepository.save(assignee);
  }

  async updateChecklistItem(user: User, campId: string, itemId: string, dto: UpdateChecklistItemDto) {
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
  }

  async deleteChecklistItem(user: User, campId: string, itemId: string) {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId: user.id } });
    if (!member) throw new ForbiddenException();

    const item = await this.campChecklistItemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.campId !== campId) throw new NotFoundException();

    await this.campChecklistItemRepository.remove(item);
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
    return { campId };
  }

  async setItemAssignees(user: User, campId: string, itemId: string, dto: SetItemAssigneesDto) {
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
  }
}
