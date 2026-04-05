import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Season } from '@campus/shared';
import { User } from '../user/entities/user.entity';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistTemplateGroup } from './entities/checklist-template-group.entity';
import { ChecklistTemplateItem } from './entities/checklist-template-item.entity';
import { CreateTemplateGroupDto } from './dto/create-template-group.dto';
import { CreateTemplateItemDto } from './dto/create-template-item.dto';
import { UpdateTemplateItemDto } from './dto/update-template-item.dto';
import { SaveTemplateDto } from './dto/save-template.dto';

@Injectable()
export class ChecklistTemplateService {
  constructor(
    @InjectRepository(ChecklistTemplate)
    private readonly templateRepository: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistTemplateGroup)
    private readonly groupRepository: Repository<ChecklistTemplateGroup>,
    @InjectRepository(ChecklistTemplateItem)
    private readonly itemRepository: Repository<ChecklistTemplateItem>,
    private readonly dataSource: DataSource,
  ) {}

  async getMyTemplate(user: User) {
    let template = await this.templateRepository.findOne({
      where: { userId: user.id, ownerType: 'user' },
      relations: ['groups', 'groups.items'],
      order: { groups: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } } },
    });

    if (!template) {
      template = await this.cloneSystemTemplate(user);
    }

    return {
      id: template.id,
      title: template.title,
      groups: template.groups.map((g) => ({
        id: g.id,
        title: g.title,
        sortOrder: g.sortOrder,
        items: g.items.map((i) => ({
          id: i.id,
          title: i.title,
          seasons: i.seasons,
          sortOrder: i.sortOrder,
        })),
      })),
    };
  }

  private async cloneSystemTemplate(user: User): Promise<ChecklistTemplate> {
    const systemTemplate = await this.templateRepository.findOne({
      where: { ownerType: 'system', isActive: true },
      relations: ['groups', 'groups.items'],
      order: { groups: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } } },
    });

    return this.dataSource.transaction(async (manager) => {
      const userTemplate = manager.create(ChecklistTemplate, {
        title: '나의 체크리스트 템플릿',
        ownerType: 'user',
        userId: user.id,
        sourceTemplateId: systemTemplate?.id ?? null,
        seasons: Object.values(Season),
        isActive: true,
      });
      const savedTemplate = await manager.save(ChecklistTemplate, userTemplate);

      if (systemTemplate) {
        for (const sGroup of systemTemplate.groups) {
          const group = manager.create(ChecklistTemplateGroup, {
            templateId: savedTemplate.id,
            title: sGroup.title,
            sortOrder: sGroup.sortOrder,
          });
          const savedGroup = await manager.save(ChecklistTemplateGroup, group);

          for (const sItem of sGroup.items) {
            const item = manager.create(ChecklistTemplateItem, {
              groupId: savedGroup.id,
              title: sItem.title,
              description: sItem.description,
              sortOrder: sItem.sortOrder,
              isRequired: sItem.isRequired,
              seasons: sItem.seasons,
            });
            await manager.save(ChecklistTemplateItem, item);
          }
        }
      }

      return manager.findOneOrFail(ChecklistTemplate, {
        where: { id: savedTemplate.id },
        relations: ['groups', 'groups.items'],
        order: { groups: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } } },
      });
    });
  }

  private async getUserTemplate(user: User): Promise<ChecklistTemplate> {
    const template = await this.templateRepository.findOne({
      where: { userId: user.id, ownerType: 'user' },
    });
    if (!template) throw new NotFoundException('Template not found. Please fetch your template first.');
    return template;
  }

  async addGroup(user: User, dto: CreateTemplateGroupDto) {
    const template = await this.getUserTemplate(user);

    const { max } = await this.groupRepository
      .createQueryBuilder('g')
      .select('MAX(g.sortOrder)', 'max')
      .where('g.templateId = :templateId', { templateId: template.id })
      .getRawOne();

    const group = this.groupRepository.create({
      templateId: template.id,
      title: dto.title,
      sortOrder: (max ?? -1) + 1,
    });
    const saved = await this.groupRepository.save(group);
    return { id: saved.id, title: saved.title, sortOrder: saved.sortOrder };
  }

  async updateGroup(user: User, groupId: string, title: string) {
    const template = await this.getUserTemplate(user);
    const group = await this.groupRepository.findOne({
      where: { id: groupId, templateId: template.id },
    });
    if (!group) throw new NotFoundException();

    group.title = title;
    await this.groupRepository.save(group);
  }

  async deleteGroup(user: User, groupId: string) {
    const template = await this.getUserTemplate(user);
    const group = await this.groupRepository.findOne({
      where: { id: groupId, templateId: template.id },
      relations: ['items'],
    });
    if (!group) throw new NotFoundException();
    if (group.items.length > 0) throw new BadRequestException('Group has items');

    await this.groupRepository.remove(group);
  }

  async addItem(user: User, groupId: string, dto: CreateTemplateItemDto) {
    const template = await this.getUserTemplate(user);
    const group = await this.groupRepository.findOne({
      where: { id: groupId, templateId: template.id },
    });
    if (!group) throw new NotFoundException();

    const { max } = await this.itemRepository
      .createQueryBuilder('i')
      .select('MAX(i.sortOrder)', 'max')
      .where('i.groupId = :groupId', { groupId })
      .getRawOne();

    const item = this.itemRepository.create({
      groupId,
      title: dto.title,
      seasons: dto.seasons,
      sortOrder: (max ?? -1) + 1,
    });
    const saved = await this.itemRepository.save(item);
    return {
      id: saved.id,
      title: saved.title,
      seasons: saved.seasons,
      sortOrder: saved.sortOrder,
    };
  }

  async updateItem(user: User, itemId: string, dto: UpdateTemplateItemDto) {
    const template = await this.getUserTemplate(user);
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.templateId !== template.id) throw new NotFoundException();

    if (dto.title !== undefined) item.title = dto.title;
    if (dto.seasons !== undefined) item.seasons = dto.seasons;
    await this.itemRepository.save(item);
  }

  async deleteItem(user: User, itemId: string) {
    const template = await this.getUserTemplate(user);
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['group'],
    });
    if (!item || item.group.templateId !== template.id) throw new NotFoundException();

    await this.itemRepository.remove(item);
  }

  async saveTemplate(user: User, dto: SaveTemplateDto) {
    let template = await this.templateRepository.findOne({
      where: { userId: user.id, ownerType: 'user' },
    });

    // 아직 유저 템플릿이 없으면 빈 껍데기 생성
    if (!template) {
      template = await this.templateRepository.save(
        this.templateRepository.create({
          title: '나의 체크리스트 템플릿',
          ownerType: 'user',
          userId: user.id,
          seasons: Object.values(Season),
          isActive: true,
        }),
      );
    }

    const templateId = template.id;

    await this.dataSource.transaction(async (manager) => {
      // 기존 그룹 + 아이템 전부 삭제 (cascade)
      await manager.delete(ChecklistTemplateGroup, { templateId });

      // 새 데이터 삽입
      for (let gi = 0; gi < dto.groups.length; gi++) {
        const gDto = dto.groups[gi];
        const group = await manager.save(
          ChecklistTemplateGroup,
          manager.create(ChecklistTemplateGroup, {
            templateId,
            title: gDto.title,
            sortOrder: gi,
          }),
        );

        for (let ii = 0; ii < gDto.items.length; ii++) {
          const iDto = gDto.items[ii];
          await manager.save(
            ChecklistTemplateItem,
            manager.create(ChecklistTemplateItem, {
              groupId: group.id,
              title: iDto.title,
              seasons: iDto.seasons,
              sortOrder: ii,
            }),
          );
        }
      }
    });
  }
}
