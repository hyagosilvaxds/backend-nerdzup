import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateBulkNotificationsDto } from './dto/create-bulk-notifications.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { MarkNotificationsReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // =============== USER ENDPOINTS ===============

  @Get()
  async getMyNotifications(
    @Query() query: QueryNotificationsDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Get('stats')
  async getMyNotificationStats(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getNotificationStats(userId);
  }

  @Get(':id')
  async getNotification(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getNotificationById(id, userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  async markAllAsRead(
    @Body() markReadDto: MarkNotificationsReadDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(
      userId,
      markReadDto.notificationIds,
    );
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.deleteNotification(id, userId);
  }

  @Delete('read/all')
  async deleteAllRead(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.deleteAllRead(userId);
  }

  // =============== ADMIN ENDPOINTS ===============

  @Post()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  async createNotification(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createDto);
  }

  @Post('bulk')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  async createBulkNotifications(@Body() bulkDto: CreateBulkNotificationsDto) {
    return this.notificationsService.createBulkNotifications(bulkDto.notifications);
  }

  @Post('broadcast')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  async broadcastNotification(@Body() broadcastDto: BroadcastNotificationDto) {
    return this.notificationsService.broadcastNotification(broadcastDto);
  }

  @Delete('cleanup/expired')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async cleanExpiredNotifications() {
    return this.notificationsService.cleanExpiredNotifications();
  }

  // =============== DEBUG ENDPOINT ===============

  @Get('debug/recipients')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAvailableRecipients() {
    return this.notificationsService.getAvailableRecipients();
  }
}