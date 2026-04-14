import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampMember } from './entities/camp-member.entity';

@Injectable()
export class CampMemberService {
  constructor(
    @InjectRepository(CampMember)
    private readonly campMemberRepository: Repository<CampMember>,
  ) {}

  async requireMember(campId: string, userId: string): Promise<CampMember> {
    const member = await this.campMemberRepository.findOne({ where: { campId, userId } });
    if (!member) throw new ForbiddenException();
    return member;
  }
}
