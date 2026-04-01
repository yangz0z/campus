import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CampService } from './camp.service';
import { CreateCampDto } from './dto/create-camp.dto';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemMemoDto } from './dto/update-checklist-item-memo.dto';
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

  @Get(':campId')
  getCamp(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
  ) {
    return this.campService.getCamp(user, campId);
  }

  @Get(':campId/members')
  getCampMembers(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
  ) {
    return this.campService.getCampMembers(user, campId);
  }

  @Post(':campId/checklist/groups')
  createChecklistGroup(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Body() dto: CreateChecklistGroupDto,
  ) {
    return this.campService.createChecklistGroup(user, campId, dto);
  }

  @Post(':campId/checklist/groups/:groupId/items')
  createChecklistItem(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: CreateChecklistItemDto,
  ) {
    return this.campService.createChecklistItem(user, campId, groupId, dto);
  }

  @Get(':campId/checklist')
  getChecklist(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
  ) {
    return this.campService.getCampChecklist(user, campId);
  }

  @Patch(':campId/checklist/items/:itemId/memo')
  @HttpCode(204)
  updateChecklistItemMemo(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateChecklistItemMemoDto,
  ) {
    return this.campService.updateChecklistItemMemo(user, campId, itemId, dto);
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
