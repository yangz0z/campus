import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '@clerk/backend';
import { SocketEvents } from '@campus/shared';
import type { JoinCampPayload, LeaveCampPayload } from '@campus/shared';
import { CampMember } from './entities/camp-member.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3200',
    credentials: true,
  },
})
export class CampGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CampGateway.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CampMember)
    private readonly campMemberRepository: Repository<CampMember>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await verifyToken(token, {
        secretKey: this.configService.get<string>('CLERK_SECRET_KEY')!,
      });

      client.data.clerkUserId = payload.sub;
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      this.logger.warn(`Auth failed for client: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SocketEvents.JOIN_CAMP)
  async handleJoinCamp(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinCampPayload,
  ) {
    const clerkUserId = client.data.clerkUserId;
    if (!clerkUserId) {
      client.disconnect();
      return;
    }

    // CampMember에서 user relation을 통해 clerkUserId(=providerId)로 멤버 확인
    const member = await this.campMemberRepository.findOne({
      where: { campId: data.campId, user: { providerId: clerkUserId } },
      relations: ['user'],
    });

    if (!member) {
      client.emit('error', { message: 'Not a member of this camp' });
      return;
    }

    client.join(`camp:${data.campId}`);
    this.logger.log(`Client ${client.id} joined camp:${data.campId}`);
  }

  @SubscribeMessage(SocketEvents.LEAVE_CAMP)
  handleLeaveCamp(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LeaveCampPayload,
  ) {
    client.leave(`camp:${data.campId}`);
    this.logger.log(`Client ${client.id} left camp:${data.campId}`);
  }

  async emitToCamp(campId: string, event: string, payload: unknown, excludeSocketId?: string) {
    const roomName = `camp:${campId}`;
    const sockets = await this.server.in(roomName).fetchSockets();
    this.logger.log(`emitToCamp ${event} to ${roomName} — ${sockets.length} socket(s) in room`);
    const room = this.server.to(roomName);
    if (excludeSocketId) {
      room.except(excludeSocketId).emit(event, payload);
    } else {
      room.emit(event, payload);
    }
  }
}
