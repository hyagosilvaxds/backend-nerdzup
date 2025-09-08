import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto, UpdateTaskStatusDto, UpdateTaskProgressDto, AssignTaskDto, CreateTaskCommentDto, CreateTaskFileDto } from './dto/query-tasks.dto';
import { TaskStatus, TaskPriority, TaskFileType, Role } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, createdBy: string) {
    const { employeeIds, ...taskData } = createTaskDto;

    // Verificar se serviço existe
    const service = await this.prisma.service.findUnique({
      where: { id: createTaskDto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Verificar se cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: createTaskDto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Verificar se campanha existe (se fornecida)
    if (createTaskDto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: createTaskDto.campaignId },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }
    }

    const task = await this.prisma.task.create({
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        assignees: employeeIds ? {
          create: employeeIds.map(employeeId => ({
            employeeId,
            assignedBy: createdBy,
          }))
        } : undefined,
      },
      include: {
        service: true,
        client: { include: { user: true } },
        campaign: true,
        assignees: {
          include: {
            employee: { include: { user: true } }
          }
        },
        files: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    return task;
  }

  async findAll(query: QueryTasksDto) {
    const where: any = {};
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Filtros básicos
    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    if (query.campaignId) {
      where.campaignId = query.campaignId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    // Filtro por funcionário atribuído
    if (query.employeeId) {
      where.assignees = {
        some: {
          employeeId: query.employeeId
        }
      };
    }

    // Busca por texto
    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Filtros de data
    if (query.dueDateFrom || query.dueDateTo) {
      where.dueDate = {};
      if (query.dueDateFrom) {
        where.dueDate.gte = new Date(query.dueDateFrom);
      }
      if (query.dueDateTo) {
        where.dueDate.lte = new Date(query.dueDateTo);
      }
    }

    // Filtro de tarefas atrasadas
    if (query.overdue) {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = {
        not: TaskStatus.CONCLUIDO
      };
    }

    // Configurar ordenação
    const orderBy: any = {};
    if (query.sortBy === 'dueDate') {
      orderBy.dueDate = query.sortOrder;
    } else if (query.sortBy === 'priority') {
      // Ordenar por prioridade (URGENTE > ALTA > MEDIA > BAIXA)
      orderBy.priority = query.sortOrder;
    } else if (query.sortBy === 'progress') {
      orderBy.progress = query.sortOrder;
    } else if (query.sortBy === 'title') {
      orderBy.title = query.sortOrder;
    } else {
      orderBy.createdAt = query.sortOrder;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          service: true,
          client: { include: { user: true } },
          campaign: true,
          assignees: {
            include: {
              employee: { include: { user: true } }
            }
          },
          files: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: 'desc' },
            take: 3 // Apenas os últimos 3 comentários na listagem
          },
          _count: {
            select: {
              comments: true,
              files: true,
            }
          }
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        service: true,
        client: { include: { user: true } },
        campaign: true,
        assignees: {
          include: {
            employee: { include: { user: true } }
          }
        },
        files: {
          orderBy: { uploadedAt: 'desc' }
        },
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
        completedAt: updateTaskDto.completedAt ? new Date(updateTaskDto.completedAt) : undefined,
      },
      include: {
        service: true,
        client: { include: { user: true } },
        campaign: true,
        assignees: {
          include: {
            employee: { include: { user: true } }
          }
        },
        files: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    return updatedTask;
  }

  async updateStatus(id: string, updateStatusDto: UpdateTaskStatusDto) {
    const task = await this.findOne(id);

    // Se marcando como concluído, definir data de conclusão
    const completedAt = updateStatusDto.status === TaskStatus.CONCLUIDO ? new Date() : null;

    return this.prisma.task.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        completedAt,
        progress: updateStatusDto.status === TaskStatus.CONCLUIDO ? 100 : undefined,
      },
      include: {
        service: true,
        client: { include: { user: true } },
        campaign: true,
        assignees: {
          include: {
            employee: { include: { user: true } }
          }
        },
        files: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        }
      },
    });
  }

  async updateProgress(id: string, updateProgressDto: UpdateTaskProgressDto) {
    const task = await this.findOne(id);

    // Se progresso for 100%, marcar como concluído
    const status = updateProgressDto.progress === 100 ? TaskStatus.CONCLUIDO : undefined;
    const completedAt = updateProgressDto.progress === 100 ? new Date() : undefined;

    return this.prisma.task.update({
      where: { id },
      data: {
        progress: updateProgressDto.progress,
        status: status || task.status,
        completedAt,
      },
      include: {
        service: true,
        client: { include: { user: true } },
        campaign: true,
        assignees: {
          include: {
            employee: { include: { user: true } }
          }
        },
        files: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        }
      },
    });
  }

  async assignEmployees(id: string, assignDto: AssignTaskDto, assignedBy: string) {
    const task = await this.findOne(id);

    // Remover atribuições existentes
    await this.prisma.taskAssignee.deleteMany({
      where: { taskId: id }
    });

    // Criar novas atribuições
    await this.prisma.taskAssignee.createMany({
      data: assignDto.employeeIds.map(employeeId => ({
        taskId: id,
        employeeId,
        assignedBy,
      }))
    });

    return this.findOne(id);
  }

  async addComment(id: string, commentDto: CreateTaskCommentDto, authorId: string) {
    const task = await this.findOne(id);

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId: id,
        authorId,
        content: commentDto.content,
      },
      include: {
        author: true
      }
    });

    return comment;
  }

  async addFile(id: string, fileDto: CreateTaskFileDto, uploadedBy: string, fileType: TaskFileType) {
    const task = await this.findOne(id);

    const file = await this.prisma.taskFile.create({
      data: {
        taskId: id,
        fileName: fileDto.fileName,
        fileUrl: fileDto.fileUrl,
        fileType,
        uploadedBy,
        description: fileDto.description,
      }
    });

    return file;
  }

  async removeFile(id: string, fileId: string, userId: string, userRole: Role) {
    const file = await this.prisma.taskFile.findUnique({
      where: { id: fileId },
      include: { task: true }
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.taskId !== id) {
      throw new BadRequestException('File does not belong to this task');
    }

    // Apenas quem fez upload ou admin pode remover
    if (file.uploadedBy !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only remove files you uploaded');
    }

    await this.prisma.taskFile.delete({
      where: { id: fileId }
    });

    return { message: 'File removed successfully' };
  }

  async remove(id: string) {
    const task = await this.findOne(id);

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }

  async getKanbanBoard(clientId?: string, employeeId?: string) {
    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (employeeId) {
      where.assignees = {
        some: {
          employeeId
        }
      };
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        service: true,
        client: { include: { user: true } },
        assignees: {
          include: {
            employee: { include: { user: true } }
          }
        },
        _count: {
          select: {
            comments: true,
            files: true,
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Agrupar tarefas por status
    const board = {
      [TaskStatus.BACKLOG]: tasks.filter(task => task.status === TaskStatus.BACKLOG),
      [TaskStatus.ANDAMENTO]: tasks.filter(task => task.status === TaskStatus.ANDAMENTO),
      [TaskStatus.REVISAO]: tasks.filter(task => task.status === TaskStatus.REVISAO),
      [TaskStatus.CONCLUIDO]: tasks.filter(task => task.status === TaskStatus.CONCLUIDO),
      [TaskStatus.ATRASADO]: tasks.filter(task => task.status === TaskStatus.ATRASADO),
      [TaskStatus.ARQUIVADO]: tasks.filter(task => task.status === TaskStatus.ARQUIVADO),
    };

    return board;
  }

  async getStats(clientId?: string, employeeId?: string) {
    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (employeeId) {
      where.assignees = {
        some: {
          employeeId
        }
      };
    }

    const [
      total,
      completed,
      inProgress,
      overdue,
      byPriority,
      byStatus
    ] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({ where: { ...where, status: TaskStatus.CONCLUIDO } }),
      this.prisma.task.count({ where: { ...where, status: TaskStatus.ANDAMENTO } }),
      this.prisma.task.count({ 
        where: { 
          ...where, 
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.CONCLUIDO }
        } 
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true }
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
    ]);

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
    };
  }
}