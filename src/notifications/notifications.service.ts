import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { NotificationType, NotificationPriority } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // =============== CRUD OPERATIONS ===============

  async createNotification(createDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        recipientId: createDto.recipientId,
        type: createDto.type,
        title: createDto.title,
        message: createDto.message,
        data: createDto.data,
        actionUrl: createDto.actionUrl,
        priority: createDto.priority || NotificationPriority.MEDIUM,
        expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
      },
      include: {
        recipient: {
          select: {
            id: true,
            email: true,
            role: true,
            profilePhoto: true,
          },
        },
      },
    });
  }

  async createBulkNotifications(notifications: CreateNotificationDto[]) {
    const createdNotifications = await this.prisma.$transaction(
      notifications.map(notification =>
        this.prisma.notification.create({
          data: {
            recipientId: notification.recipientId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            actionUrl: notification.actionUrl,
            priority: notification.priority || NotificationPriority.MEDIUM,
            expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : null,
          },
        })
      )
    );

    return {
      count: createdNotifications.length,
      notifications: createdNotifications,
    };
  }

  async getUserNotifications(userId: string, query: QueryNotificationsDto) {
    const { type, priority, isRead, page = 1, limit = 20, search } = query;

    const where: any = {
      recipientId: userId,
      OR: search ? [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ] : undefined,
    };

    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (typeof isRead === 'boolean') where.isRead = isRead;

    // Remove expired notifications
    where.OR = where.OR || [];
    where.OR.push({ expiresAt: null }, { expiresAt: { gt: new Date() } });

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          recipient: {
            select: {
              id: true,
              email: true,
              role: true,
              profilePhoto: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getNotificationById(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        recipient: {
          select: {
            id: true,
            email: true,
            role: true,
            profilePhoto: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('You can only view your own notifications');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.getNotificationById(id, userId);

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      include: {
        recipient: {
          select: {
            id: true,
            email: true,
            role: true,
            profilePhoto: true,
          },
        },
      },
    });
  }

  async markAllAsRead(userId: string, notificationIds?: string[]) {
    const where: any = { 
      recipientId: userId,
      isRead: false,
    };

    if (notificationIds && notificationIds.length > 0) {
      where.id = { in: notificationIds };
    }

    const updateResult = await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    return {
      count: updateResult.count,
      message: `${updateResult.count} notification(s) marked as read`,
    };
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await this.getNotificationById(id, userId);

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted successfully' };
  }

  async deleteAllRead(userId: string) {
    const deleteResult = await this.prisma.notification.deleteMany({
      where: {
        recipientId: userId,
        isRead: true,
      },
    });

    return {
      count: deleteResult.count,
      message: `${deleteResult.count} read notification(s) deleted`,
    };
  }

  // =============== STATISTICS ===============

  async getNotificationStats(userId: string) {
    const [total, unread, byType, byPriority] = await Promise.all([
      this.prisma.notification.count({
        where: { recipientId: userId },
      }),
      this.prisma.notification.count({
        where: { 
          recipientId: userId,
          isRead: false,
        },
      }),
      this.prisma.notification.groupBy({
        by: ['type'],
        where: { recipientId: userId },
        _count: true,
      }),
      this.prisma.notification.groupBy({
        by: ['priority'],
        where: { 
          recipientId: userId,
          isRead: false,
        },
        _count: true,
      }),
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {}),
    };
  }

  // =============== UTILITY METHODS ===============

  async cleanExpiredNotifications() {
    const deleteResult = await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return {
      count: deleteResult.count,
      message: `${deleteResult.count} expired notification(s) cleaned up`,
    };
  }

  // =============== HELPER METHODS FOR CREATING SPECIFIC NOTIFICATIONS ===============

  async notifyServiceRequestApproved(serviceRequestId: string, clientId: string, projectName: string) {
    return this.createNotification({
      recipientId: clientId,
      type: NotificationType.SERVICE_REQUEST_APPROVED,
      title: 'Solicitação de Serviço Aprovada',
      message: `Sua solicitação para o projeto "${projectName}" foi aprovada e está sendo processada.`,
      actionUrl: `/service-requests/${serviceRequestId}`,
      priority: NotificationPriority.HIGH,
      data: { serviceRequestId, projectName },
    });
  }

  async notifyServiceRequestRejected(serviceRequestId: string, clientId: string, projectName: string, reason?: string) {
    return this.createNotification({
      recipientId: clientId,
      type: NotificationType.SERVICE_REQUEST_REJECTED,
      title: 'Solicitação de Serviço Rejeitada',
      message: `Sua solicitação para o projeto "${projectName}" foi rejeitada.${reason ? ` Motivo: ${reason}` : ''}`,
      actionUrl: `/service-requests/${serviceRequestId}`,
      priority: NotificationPriority.HIGH,
      data: { serviceRequestId, projectName, reason },
    });
  }

  async notifyTaskAssigned(taskId: string, employeeId: string, taskTitle: string) {
    return this.createNotification({
      recipientId: employeeId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Nova Tarefa Atribuída',
      message: `Uma nova tarefa foi atribuída a você: "${taskTitle}"`,
      actionUrl: `/tasks/${taskId}`,
      priority: NotificationPriority.MEDIUM,
      data: { taskId, taskTitle },
    });
  }

  async notifyPaymentSuccess(userId: string, amount: number, description: string) {
    return this.createNotification({
      recipientId: userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Pagamento Processado',
      message: `Seu pagamento de R$ ${amount.toFixed(2)} foi processado com sucesso. ${description}`,
      priority: NotificationPriority.HIGH,
      data: { amount, description },
    });
  }

  async notifyCreditsLow(userId: string, remainingCredits: number) {
    return this.createNotification({
      recipientId: userId,
      type: NotificationType.CREDITS_LOW,
      title: 'Créditos Baixos',
      message: `Seus créditos estão acabando! Você tem apenas ${remainingCredits} créditos restantes.`,
      actionUrl: '/billing/packages',
      priority: NotificationPriority.MEDIUM,
      data: { remainingCredits },
    });
  }
}