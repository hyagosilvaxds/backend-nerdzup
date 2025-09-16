import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskForEmployeeDto } from './dto/create-task-for-employee.dto';
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

  async createTaskForEmployee(createTaskDto: CreateTaskForEmployeeDto, createdByEmployeeId: string) {
    // Verificar se o employee que está criando a task existe
    const createdBy = await this.prisma.employee.findUnique({
      where: { id: createdByEmployeeId },
      include: { user: true },
    });

    if (!createdBy) {
      throw new NotFoundException('Creating employee not found');
    }

    // Verificar se o employee destinatário existe
    const assignedTo = await this.prisma.employee.findUnique({
      where: { id: createTaskDto.assignedToEmployeeId },
      include: { user: true },
    });

    if (!assignedTo) {
      throw new NotFoundException('Assigned employee not found');
    }

    // Se não forneceu clientId ou serviceId, buscar valores padrão
    let clientId = createTaskDto.clientId;
    let serviceId = createTaskDto.serviceId;

    if (!serviceId) {
      const defaultService = await this.prisma.service.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      if (!defaultService) {
        throw new BadRequestException('No services available. Please contact administrator.');
      }
      serviceId = defaultService.id;
    }

    if (!clientId) {
      // Se não especificou cliente, usar o primeiro cliente disponível como padrão
      const defaultClient = await this.prisma.client.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      if (!defaultClient) {
        throw new BadRequestException('No clients available. Please contact administrator.');
      }
      clientId = defaultClient.id;
    }

    // Criar a task
    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || TaskStatus.BACKLOG,
        priority: createTaskDto.priority || TaskPriority.MEDIA,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        estimatedHours: createTaskDto.estimatedHours,
        serviceId,
        clientId,
        assignees: {
          create: [{
            employeeId: createTaskDto.assignedToEmployeeId,
            assignedAt: new Date(),
            assignedBy: createdBy.userId,
          }],
        },
      },
      include: {
        client: { include: { user: true } },
        service: true,
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
    // Verificar e atualizar tarefas atrasadas primeiro
    await this.checkAndUpdateOverdueTasks();

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
    // Verificar e atualizar tarefas atrasadas primeiro
    await this.checkAndUpdateOverdueTasks();

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

  async updateStatus(id: string, updateStatusDto: UpdateTaskStatusDto, userId: string, userRole: Role) {
    const task = await this.findOne(id);

    // Verificar permissões: apenas admin ou funcionários atribuídos à tarefa podem alterar status
    if (userRole !== Role.ADMIN) {
      const employee = await this.prisma.employee.findUnique({
        where: { userId }
      });

      if (!employee) {
        throw new ForbiddenException('Employee profile not found');
      }

      const isAssigned = task.assignees.some(assignee => assignee.employeeId === employee.id);
      if (!isAssigned) {
        throw new ForbiddenException('You can only update status of tasks assigned to you');
      }
    }

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
    // Verificar e atualizar tarefas atrasadas primeiro
    await this.checkAndUpdateOverdueTasks();

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

  async findEmployeeTasks(employeeId: string, query: QueryTasksDto) {
    // Verificar e atualizar tarefas atrasadas primeiro
    await this.checkAndUpdateOverdueTasks();

    const where: any = {
      assignees: {
        some: {
          employeeId
        }
      }
    };

    // Apply additional filters from query
    this.applyTaskFilters(where, query);

    return this.findAllWithFilters(where, query);
  }

  async findClientTasks(clientId: string, query: QueryTasksDto) {
    // Verificar e atualizar tarefas atrasadas primeiro
    await this.checkAndUpdateOverdueTasks();

    const where: any = {
      clientId
    };

    // Apply additional filters from query
    this.applyTaskFilters(where, query);

    return this.findAllWithFilters(where, query);
  }

  private applyTaskFilters(where: any, query: QueryTasksDto) {
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

    if (query.dueDateFrom || query.dueDateTo) {
      where.dueDate = {};
      if (query.dueDateFrom) {
        where.dueDate.gte = new Date(query.dueDateFrom);
      }
      if (query.dueDateTo) {
        where.dueDate.lte = new Date(query.dueDateTo);
      }
    }

    if (query.overdue) {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = {
        not: TaskStatus.CONCLUIDO
      };
    }
  }

  private async findAllWithFilters(where: any, query: QueryTasksDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const orderBy: any = {};
    if (query.sortBy === 'dueDate') {
      orderBy.dueDate = query.sortOrder;
    } else if (query.sortBy === 'priority') {
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
          service: {
            select: {
              id: true,
              displayName: true,
              description: true,
              credits: true
            }
          },
          client: { 
            include: { 
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            } 
          },
          campaign: {
            select: {
              id: true,
              name: true,
              description: true,
              startDate: true,
              endDate: true,
              budget: true
            }
          },
          assignees: {
            include: {
              employee: { 
                include: { 
                  user: {
                    select: {
                      id: true,
                      email: true
                    }
                  }
                } 
              }
            }
          },
          files: {
            orderBy: { uploadedAt: 'desc' }
          },
          comments: {
            include: { 
              author: {
                select: {
                  id: true,
                  email: true
                }
              } 
            },
            orderBy: { createdAt: 'desc' }
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

    // Calculate totals for summary
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalSpentHours = tasks.reduce((sum, task) => sum + (task.spentHours || 0), 0);
    const totalCreditValue = tasks.reduce((sum, task) => sum + (task.service?.credits || 0), 0);
    const completedTasks = tasks.filter(task => task.status === TaskStatus.CONCLUIDO).length;
    const averageProgress = tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0;

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalTasks: total,
        completedTasks,
        completionRate: total > 0 ? Math.round((completedTasks / total) * 100) : 0,
        averageProgress,
        totalEstimatedHours,
        totalSpentHours,
        totalCreditValue
      }
    };
  }

  async getStatusOptions() {
    return {
      statuses: [
        { value: 'BACKLOG', label: 'Backlog', description: 'Tarefa na fila' },
        { value: 'ANDAMENTO', label: 'Em Andamento', description: 'Em progresso' },
        { value: 'REVISAO', label: 'Em Revisão', description: 'Em revisão' },
        { value: 'CONCLUIDO', label: 'Concluído', description: 'Finalizada' },
        { value: 'ATRASADO', label: 'Atrasado', description: 'Fora do prazo' },
        { value: 'ARQUIVADO', label: 'Arquivado', description: 'Arquivada' }
      ]
    };
  }

  async checkAndUpdateOverdueTasks() {
    const now = new Date();
    
    // Buscar tarefas que passaram do prazo e não estão concluídas ou arquivadas
    const overdueTasks = await this.prisma.task.findMany({
      where: {
        dueDate: {
          lt: now
        },
        status: {
          notIn: [TaskStatus.CONCLUIDO, TaskStatus.ARQUIVADO, TaskStatus.ATRASADO]
        }
      }
    });

    if (overdueTasks.length > 0) {
      // Atualizar todas as tarefas atrasadas
      await this.prisma.task.updateMany({
        where: {
          id: {
            in: overdueTasks.map(task => task.id)
          }
        },
        data: {
          status: TaskStatus.ATRASADO
        }
      });

      console.log(`Updated ${overdueTasks.length} tasks to ATRASADO status`);
    }

    return {
      updated: overdueTasks.length,
      tasks: overdueTasks.map(task => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        previousStatus: task.status
      }))
    };
  }

  async getApprovalCenter(query: QueryTasksDto, userId: string, userRole: Role) {
    // Verificar e atualizar tarefas atrasadas primeiro
    await this.checkAndUpdateOverdueTasks();

    const where: any = {
      status: TaskStatus.REVISAO
    };

    if (userRole === Role.CLIENT) {
      // Clientes só veem suas próprias tarefas em revisão
      where.clientId = await this.getClientIdFromUser(userId);
    } else if (userRole === Role.EMPLOYEE) {
      // Funcionários veem tarefas onde estão atribuídos
      const employee = await this.prisma.employee.findUnique({
        where: { userId }
      });

      if (!employee) {
        throw new ForbiddenException('Employee profile not found');
      }

      where.assignees = {
        some: {
          employeeId: employee.id
        }
      };
    }

    // Apply additional filters from query
    this.applyTaskFilters(where, query);

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' }
        ],
        include: {
          service: {
            select: {
              id: true,
              displayName: true,
              description: true,
              credits: true
            }
          },
          client: { 
            include: { 
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            } 
          },
          campaign: {
            select: {
              id: true,
              name: true,
              description: true,
              startDate: true,
              endDate: true,
              budget: true
            }
          },
          assignees: {
            include: {
              employee: { 
                include: { 
                  user: {
                    select: {
                      id: true,
                      email: true
                    }
                  }
                } 
              }
            }
          },
          files: {
            orderBy: { uploadedAt: 'desc' }
          },
          comments: {
            include: { 
              author: {
                select: {
                  id: true,
                  email: true
                }
              } 
            },
            orderBy: { createdAt: 'desc' }
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
      summary: {
        totalPendingApproval: total,
        userRole: userRole
      }
    };
  }

  async approveTask(taskId: string, comment: string | undefined, userId: string) {
    const task = await this.findOne(taskId);
    
    // Verificar se é cliente e se a tarefa pertence a ele
    const clientId = await this.getClientIdFromUser(userId);
    if (task.clientId !== clientId) {
      throw new ForbiddenException('You can only approve your own tasks');
    }

    // Verificar se a tarefa está em status de revisão
    if (task.status !== TaskStatus.REVISAO) {
      throw new BadRequestException('Task must be in REVISAO status to be approved');
    }

    // Usar transação para garantir consistência
    return await this.prisma.$transaction(async (prisma) => {
      // Adicionar comentário de aprovação se fornecido
      if (comment) {
        await prisma.taskComment.create({
          data: {
            taskId,
            authorId: userId,
            content: `[APROVAÇÃO] ${comment}`,
          }
        });
      }

      // Atualizar status da tarefa para ARQUIVADO
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.ARQUIVADO,
          completedAt: new Date(),
          progress: 100
        },
        include: {
          campaign: true,
          service: true,
          client: { include: { user: true } },
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

      // Se a tarefa tem uma campanha associada, verificar se todas as tarefas da campanha foram aprovadas
      let campaignArchived = false;
      if (updatedTask.campaignId) {
        const remainingTasks = await prisma.task.count({
          where: {
            campaignId: updatedTask.campaignId,
            status: {
              notIn: [TaskStatus.ARQUIVADO, TaskStatus.CONCLUIDO]
            }
          }
        });

        // Se não há mais tarefas pendentes, arquivar a campanha
        if (remainingTasks === 0) {
          await prisma.campaign.update({
            where: { id: updatedTask.campaignId },
            data: {
              status: 'ARCHIVED'
            }
          });
          campaignArchived = true;
        }
      }

      return {
        task: updatedTask,
        message: 'Task approved and archived successfully',
        campaignArchived
      };
    });
  }

  private async getClientIdFromUser(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    });

    if (!user?.client) {
      throw new ForbiddenException('Client profile not found');
    }

    return user.client.id;
  }

  async toggleStatus(id: string, userId: string, userRole: Role) {
    const task = await this.findOne(id);

    // Verificar permissões
    if (userRole !== Role.ADMIN) {
      const employee = await this.prisma.employee.findUnique({
        where: { userId }
      });

      if (!employee) {
        throw new ForbiddenException('Employee profile not found');
      }

      const isAssigned = task.assignees.some(assignee => assignee.employeeId === employee.id);
      if (!isAssigned) {
        throw new ForbiddenException('You can only toggle status of tasks assigned to you');
      }
    }

    // Lógica de toggle baseada no status atual
    let newStatus: TaskStatus;
    let completedAt: Date | null = null;
    let progress: number | undefined = undefined;

    switch (task.status) {
      case TaskStatus.BACKLOG:
        newStatus = TaskStatus.ANDAMENTO;
        break;
      case TaskStatus.ANDAMENTO:
        newStatus = TaskStatus.REVISAO;
        break;
      case TaskStatus.REVISAO:
        newStatus = TaskStatus.CONCLUIDO;
        completedAt = new Date();
        progress = 100;
        break;
      case TaskStatus.CONCLUIDO:
        newStatus = TaskStatus.ANDAMENTO;
        progress = 90;
        break;
      case TaskStatus.ATRASADO:
        newStatus = TaskStatus.ANDAMENTO;
        break;
      case TaskStatus.ARQUIVADO:
        newStatus = TaskStatus.BACKLOG;
        break;
      default:
        newStatus = TaskStatus.ANDAMENTO;
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt,
        progress: progress !== undefined ? progress : task.progress,
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

  async archiveTask(id: string, userId: string, userRole: Role) {
    const task = await this.findOne(id);

    // Verificar permissões
    if (userRole !== Role.ADMIN) {
      const employee = await this.prisma.employee.findUnique({
        where: { userId }
      });

      if (!employee) {
        throw new ForbiddenException('Employee profile not found');
      }

      const isAssigned = task.assignees.some(assignee => assignee.employeeId === employee.id);
      if (!isAssigned) {
        throw new ForbiddenException('You can only archive tasks assigned to you');
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.ARQUIVADO,
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
}