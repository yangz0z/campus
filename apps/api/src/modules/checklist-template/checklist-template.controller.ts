import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChecklistTemplateService } from './checklist-template.service';
import { CreateTemplateGroupDto } from './dto/create-template-group.dto';
import { CreateTemplateItemDto } from './dto/create-template-item.dto';
import { UpdateTemplateItemDto } from './dto/update-template-item.dto';
import { SaveTemplateDto } from './dto/save-template.dto';

@Controller('templates')
export class ChecklistTemplateController {
  constructor(private readonly templateService: ChecklistTemplateService) {}

  @Get('me')
  getMyTemplate(@CurrentUser() user: User) {
    return this.templateService.getMyTemplate(user);
  }

  @Put('me')
  @HttpCode(204)
  saveTemplate(
    @CurrentUser() user: User,
    @Body() dto: SaveTemplateDto,
  ) {
    return this.templateService.saveTemplate(user, dto);
  }

  @Post('me/groups')
  addGroup(
    @CurrentUser() user: User,
    @Body() dto: CreateTemplateGroupDto,
  ) {
    return this.templateService.addGroup(user, dto);
  }

  @Patch('me/groups/:groupId')
  @HttpCode(204)
  updateGroup(
    @CurrentUser() user: User,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body('title') title: string,
  ) {
    return this.templateService.updateGroup(user, groupId, title);
  }

  @Delete('me/groups/:groupId')
  @HttpCode(204)
  deleteGroup(
    @CurrentUser() user: User,
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ) {
    return this.templateService.deleteGroup(user, groupId);
  }

  @Post('me/groups/:groupId/items')
  addItem(
    @CurrentUser() user: User,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: CreateTemplateItemDto,
  ) {
    return this.templateService.addItem(user, groupId, dto);
  }

  @Patch('me/items/:itemId')
  @HttpCode(204)
  updateItem(
    @CurrentUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateTemplateItemDto,
  ) {
    return this.templateService.updateItem(user, itemId, dto);
  }

  @Delete('me/items/:itemId')
  @HttpCode(204)
  deleteItem(
    @CurrentUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.templateService.deleteItem(user, itemId);
  }
}
