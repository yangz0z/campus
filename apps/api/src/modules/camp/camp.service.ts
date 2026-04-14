import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Camp } from './entities/camp.entity';
import { CampMember, CAMP_MEMBER_ROLE } from './entities/camp-member.entity';
import { CreateCampDto } from './dto/create-camp.dto';
import { UpdateCampDto } from './dto/update-camp.dto';
import { CampMemberService } from './camp-member.service';
import { CampChecklistService } from './camp-checklist.service';
import { CampGateway } from './camp.gateway';
import { SocketEvents } from '@campus/shared';

@Injectable()
export class CampService {
  constructor(
    @InjectRepository(Camp)
    private readonly campRepository: Repository<Camp>,
    @InjectRepository(CampMember)
    private readonly campMemberRepository: Repository<CampMember>,
    private readonly dataSource: DataSource,
    private readonly campMemberService: CampMemberService,
    private readonly campChecklistService: CampChecklistService,
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
        role: CAMP_MEMBER_ROLE.OWNER,
      });
      const savedMember = await manager.save(CampMember, member);

      await this.campChecklistService.initializeFromTemplate(
        manager, savedCamp.id, savedMember.id, user.id, dto.season,
      );

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
            if (a.role === CAMP_MEMBER_ROLE.OWNER && b.role !== CAMP_MEMBER_ROLE.OWNER) return -1;
            if (a.role !== CAMP_MEMBER_ROLE.OWNER && b.role === CAMP_MEMBER_ROLE.OWNER) return 1;
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

  async updateCamp(user: User, campId: string, dto: UpdateCampDto): Promise<void> {
    await this.campMemberService.requireMember(campId, user.id);

    const camp = await this.campRepository.findOne({ where: { id: campId } });
    if (!camp) throw new NotFoundException();

    await this.campRepository.update(campId, {
      title: dto.title,
      location: dto.location ?? null,
      startDate: dto.startDate,
      endDate: dto.endDate,
      season: dto.season,
    });
  }

  async deleteCamp(user: User, campId: string): Promise<void> {
    const member = await this.campMemberService.requireMember(campId, user.id);
    if (member.role !== CAMP_MEMBER_ROLE.OWNER) throw new ForbiddenException('캠프 소유자만 삭제할 수 있어요.');

    const camp = await this.campRepository.findOne({ where: { id: campId } });
    if (!camp) throw new NotFoundException();

    await this.campRepository.remove(camp);
  }

  async getCampMembers(user: User, campId: string) {
    await this.campMemberService.requireMember(campId, user.id);

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

  async leaveCamp(user: User, campId: string): Promise<void> {
    const member = await this.campMemberService.requireMember(campId, user.id);
    if (member.role === CAMP_MEMBER_ROLE.OWNER) throw new ForbiddenException('방장은 캠프를 나갈 수 없어요. 캠프를 삭제해주세요.');

    const memberId = member.id;
    await this.campMemberRepository.remove(member);

    this.campGateway.emitToCamp(campId, SocketEvents.MEMBER_LEFT, { campId, memberId });
  }

  async kickMember(requestingUser: User, campId: string, targetMemberId: string): Promise<void> {
    const requester = await this.campMemberService.requireMember(campId, requestingUser.id);
    if (requester.role !== CAMP_MEMBER_ROLE.OWNER) throw new ForbiddenException('방장만 멤버를 내보낼 수 있어요.');

    const target = await this.campMemberRepository.findOne({ where: { id: targetMemberId, campId } });
    if (!target) throw new NotFoundException();
    if (target.role === CAMP_MEMBER_ROLE.OWNER) throw new ForbiddenException('방장은 내보낼 수 없어요.');

    await this.campMemberRepository.remove(target);
    this.campGateway.emitToCamp(campId, SocketEvents.MEMBER_LEFT, { campId, memberId: targetMemberId });
  }
}
