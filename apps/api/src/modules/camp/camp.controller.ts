import { Body, Controller, Delete, Get, Headers, HttpCode, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CampService } from './camp.service';
import { CreateCampDto } from './dto/create-camp.dto';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { ToggleChecklistItemDto } from './dto/toggle-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { UpdateCampDto } from './dto/update-camp.dto';
import { SetItemAssigneesDto } from './dto/set-item-assignees.dto';
import { ReorderChecklistItemsDto, ReorderChecklistGroupsDto } from './dto/reorder-checklist.dto';

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

  @Post(':campId/leave')
  @HttpCode(204)
  leaveCamp(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
  ) {
    return this.campService.leaveCamp(user, campId);
  }

  @Delete(':campId')
  @HttpCode(204)
  deleteCamp(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
  ) {
    return this.campService.deleteCamp(user, campId);
  }

  @Patch(':campId')
  @HttpCode(204)
  updateCamp(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Body() dto: UpdateCampDto,
  ) {
    return this.campService.updateCamp(user, campId, dto);
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
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.createChecklistGroup(user, campId, dto, socketId);
  }

  @Patch(':campId/checklist/groups/reorder')
  @HttpCode(204)
  reorderChecklistGroups(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Body() dto: ReorderChecklistGroupsDto,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.reorderChecklistGroups(user, campId, dto, socketId);
  }

  @Patch(':campId/checklist/groups/:groupId')
  @HttpCode(204)
  updateChecklistGroup(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body('title') title: string,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.updateChecklistGroup(user, campId, groupId, title, socketId);
  }

  @Delete(':campId/checklist/groups/:groupId')
  @HttpCode(204)
  deleteChecklistGroup(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.deleteChecklistGroup(user, campId, groupId, socketId);
  }

  @Post(':campId/checklist/groups/:groupId/items')
  createChecklistItem(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: CreateChecklistItemDto,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.createChecklistItem(user, campId, groupId, dto, socketId);
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
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.toggleChecklistItem(user, campId, itemId, dto, socketId);
  }

  @Patch(':campId/checklist/items/:itemId')
  @HttpCode(204)
  updateChecklistItem(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateChecklistItemDto,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.updateChecklistItem(user, campId, itemId, dto, socketId);
  }

  @Delete(':campId/checklist/items/:itemId')
  @HttpCode(204)
  deleteChecklistItem(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.deleteChecklistItem(user, campId, itemId, socketId);
  }

  @Patch(':campId/checklist/groups/:groupId/items/reorder')
  @HttpCode(204)
  reorderChecklistItems(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: ReorderChecklistItemsDto,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.reorderChecklistItems(user, campId, groupId, dto, socketId);
  }

  @Put(':campId/checklist/items/:itemId/assignees')
  @HttpCode(204)
  setItemAssignees(
    @CurrentUser() user: User,
    @Param('campId', ParseUUIDPipe) campId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SetItemAssigneesDto,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.campService.setItemAssignees(user, campId, itemId, dto, socketId);
  }
}
