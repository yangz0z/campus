import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CampService } from './camp.service';
import { CreateCampDto } from './dto/create-camp.dto';
import { SetItemAssigneesDto } from './dto/set-item-assignees.dto';

@Controller('camps')
export class CampController {
  constructor(private readonly campService: CampService) {}

  @Get()
  getMyCamps(@CurrentUser() user: User) {
    return this.campService.getMyCamps(user);
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateCampDto,
  ): Promise<{ campId: string }> {
    return this.campService.createCamp(user, dto);
  }

  @Get(':campId/members')
  getCampMembers(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
  ) {
    return this.campService.getCampMembers(user, campId);
  }

  @Get(':campId/checklist')
  getChecklist(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
  ) {
    return this.campService.getCampChecklist(user, campId);
  }

  @Put(':campId/checklist/items/:itemId/assignees')
  @HttpCode(204)
  setItemAssignees(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SetItemAssigneesDto,
  ) {
    return this.campService.setItemAssignees(user, campId, itemId, dto);
  }
}
