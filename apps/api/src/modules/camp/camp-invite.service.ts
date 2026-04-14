import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CampMember, CAMP_MEMBER_ROLE } from './entities/camp-member.entity';
import { CampInvite } from './entities/camp-invite.entity';
import { CampMemberService } from './camp-member.service';
import { CampGateway } from './camp.gateway';
import { SocketEvents } from '@campus/shared';

@Injectable()
export class CampInviteService {
  private readonly logger = new Logger(CampInviteService.name);

  constructor(
    @InjectRepository(CampMember)
    private readonly campMemberRepository: Repository<CampMember>,
    @InjectRepository(CampInvite)
    private readonly campInviteRepository: Repository<CampInvite>,
    private readonly campMemberService: CampMemberService,
    private readonly campGateway: CampGateway,
  ) {}

  async createCampInvite(user: User, campId: string): Promise<{ token: string }> {
    await this.campMemberService.requireMember(campId, user.id);

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

    const member = this.campMemberRepository.create({ campId, userId: user.id, role: CAMP_MEMBER_ROLE.MEMBER });
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
    this.logger.log(`Emitting MEMBER_JOINED to camp:${campId} - member: ${member.id} (${user.nickname})`);
    this.campGateway.emitToCamp(campId, SocketEvents.MEMBER_JOINED, memberPayload);

    return { campId };
  }
}
