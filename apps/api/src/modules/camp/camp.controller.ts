import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CampService } from './camp.service';
import { CreateCampDto } from './dto/create-camp.dto';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { ToggleChecklistItemDto } from './dto/toggle-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
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

  @Public()
  @Get('invite/:token')
  getCampInviteInfo(@Param('token') token: string) {
    return this.campService.getCampInviteInfo(token);
  }

  @Post('invite/:token/accept')
  acceptCampInvite(
    @CurrentUser() user: User,
    @Param('token') token: string,
  ) {
    return this.campService.acceptCampInvite(user, token);
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

  @Post(':campId/invite')
  createCampInvite(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
  ) {
    return this.campService.createCampInvite(user, campId);
  }

  @Post(':campId/checklist/groups')
  createChecklistGroup(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Body() dto: CreateChecklistGroupDto,
  ) {
    return this.campService.createChecklistGroup(user, campId, dto);
  }

  @Patch(':campId/checklist/groups/:groupId')
  @HttpCode(204)
  updateChecklistGroup(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body('title') title: string,
  ) {
    return this.campService.updateChecklistGroup(user, campId, groupId, title);
  }

  @Delete(':campId/checklist/groups/:groupId')
  @HttpCode(204)
  deleteChecklistGroup(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ) {
    return this.campService.deleteChecklistGroup(user, campId, groupId);
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

  @Patch(':campId/checklist/items/:itemId/check')
  @HttpCode(204)
  toggleChecklistItem(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: ToggleChecklistItemDto,
  ) {
    return this.campService.toggleChecklistItem(user, campId, itemId, dto);
  }

  @Patch(':campId/checklist/items/:itemId')
  @HttpCode(204)
  updateChecklistItem(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.campService.updateChecklistItem(user, campId, itemId, dto);
  }

  @Delete(':campId/checklist/items/:itemId')
  @HttpCode(204)
  deleteChecklistItem(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.campService.deleteChecklistItem(user, campId, itemId);
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
