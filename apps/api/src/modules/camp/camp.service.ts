import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ChecklistTemplate } from '../checklist-template/entities/checklist-template.entity';
import { Camp } from './entities/camp.entity';
import { CampMember } from './entities/camp-member.entity';
import { CampChecklistGroup } from './entities/camp-checklist-group.entity';
import { CampChecklistItem } from './entities/camp-checklist-item.entity';
import { CreateCampDto } from './dto/create-camp.dto';

@Injectable()
export class CampService {
  constructor(
    @InjectRepository(Camp)
    private readonly campRepository: Repository<Camp>,
    @InjectRepository(CampMember)
    private readonly campMemberRepository: Repository<CampMember>,
    @InjectRepository(CampChecklistGroup)
    private readonly campChecklistGroupRepository: Repository<CampChecklistGroup>,
    @InjectRepository(ChecklistTemplate)
    private readonly checklistTemplateRepository: Repository<ChecklistTemplate>,
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
      await manager.save(CampMember, member);

      const template = await manager
        .createQueryBuilder(ChecklistTemplate, 't')
        .leftJoinAndSelect('t.groups', 'g')
        .leftJoinAndSelect('g.items', 'i')
        .where("t.owner_type = 'system'")
        .andWhere('t.is_active = true')
        .andWhere('t.seasons @> ARRAY[:season]::season[]', { season: dto.season })
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
            await manager.save(CampChecklistItem, campItem);
          }
        }
      }

      return savedCamp.id;
    });

    return { campId };
  }

  async getCampChecklist(user: User, campId: string) {
    const member = await this.campMemberRepository.findOne({
      where: { campId, userId: user.id },
    });
    if (!member) {
      throw new ForbiddenException();
    }

    const groups = await this.campChecklistGroupRepository.find({
      where: { campId },
      relations: ['items'],
      order: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } },
    });

    return {
      groups: groups.map((g) => ({
        id: g.id,
        title: g.title,
        sortOrder: g.sortOrder,
        items: g.items.map((i) => ({
          id: i.id,
          title: i.title,
          isRequired: i.isRequired,
          sortOrder: i.sortOrder,
          memo: i.memo,
        })),
      })),
    };
  }
}
