import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

interface CreateUserParams {
  provider: string;
  providerId: string;
  email: string | null;
  nickname: string;
  profileImage: string | null;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /** providerId(clerkUserId)로 유저 조회 */
  async findByProviderId(providerId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { providerId } });
  }

  /** provider + email로 유저 조회 */
  async findByProviderAndEmail(provider: string, email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { provider, email } });
  }

  /** 기존 유저의 providerId 갱신 (계정 연결) */
  async linkProvider(user: User, providerId: string): Promise<User> {
    user.providerId = providerId;
    return this.userRepository.save(user);
  }

  /** 신규 유저 생성 */
  async create(params: CreateUserParams): Promise<User> {
    const user = this.userRepository.create(params);
    return this.userRepository.save(user);
  }
}
