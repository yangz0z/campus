import { Injectable } from '@nestjs/common';
import { nowISO } from '@campus/shared';

@Injectable()
export class AppService {
  getHealth() {
    return { status: 'ok', timestamp: nowISO() };
  }
}
