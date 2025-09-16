import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignEmployeesToCampaignDto } from './dto/assign-employees-to-campaign.dto';
import { QueryCampaignsDto } from './dto/query-campaigns.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { CreateCampaignTaskDto } from './dto/create-campaign-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { CreateCampaignCommentDto } from './dto/create-campaign-comment.dto';
import { Role, TaskStatus, TaskFileType } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Atribuir funcionários a uma campanha
   * Implementa atribuição bidirecional: quando funcionários são atribuídos à campanha,
   * eles também são atribuídos às tasks da campanha
   */
  async assignEmployeesToCampaign(
    campaignId: string,
    assignDto: AssignEmployeesToCampaignDto,
    assignedBy: string
  ) {
    // Verificar se a campanha existe
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      include: {
        tasks: {
          include: {
            assignees: true
          }
        }
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Verificar se todos os funcionários existem e estão ativos
    const employees = await this.prisma.employee.findMany({
      where: {
        id: { in: assignDto.employeeIds },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true
          }
        }
      }
    });

    if (employees.length !== assignDto.employeeIds.length) {
      throw new BadRequestException('One or more employees not found or inactive');
    }

    // Usar transação para garantir consistência
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Atribuir funcionários à campanha
      const campaignAssignments = assignDto.employeeIds.map(employeeId => ({
        campaignId,
        employeeId,
        assignedBy
      }));

      // Remover atribuições existentes primeiro para evitar duplicatas
      await tx.campaignAssignee.deleteMany({
        where: {
          campaignId,
          employeeId: { in: assignDto.employeeIds }
        }
      });

      // Criar novas atribuições
      await tx.campaignAssignee.createMany({
        data: campaignAssignments
      });

      // 2. Atribuir funcionários a todas as tasks da campanha (atribuição bidirecional)
      for (const task of campaign.tasks) {
        const taskAssignments = assignDto.employeeIds.map(employeeId => ({
          taskId: task.id,
          employeeId,
          assignedBy
        }));

        // Remover atribuições existentes da task primeiro
        await tx.taskAssignee.deleteMany({
          where: {
            taskId: task.id,
            employeeId: { in: assignDto.employeeIds }
          }
        });

        // Criar novas atribuições da task
        await tx.taskAssignee.createMany({
          data: taskAssignments
        });
      }

      // 3. Buscar a campanha atualizada com as atribuições
      const updatedCampaign = await tx.campaign.findFirst({
        where: { id: campaignId },
        include: {
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  user: {
                    select: {
                      email: true
                    }
                  }
                }
              }
            }
          },
          tasks: {
            include: {
              assignees: {
                include: {
                  employee: {
                    select: {
                      id: true,
                      name: true,
                      position: true,
                      user: {
                        select: {
                          email: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      return updatedCampaign;
    });

    return {
      message: 'Employees assigned to campaign and its tasks successfully',
      campaign: result,
      assignedEmployees: employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        email: emp.user.email
      }))
    };
  }

  /**
   * Remover funcionários de uma campanha
   * Implementa remoção bidirecional: quando funcionários são removidos da campanha,
   * eles também são removidos das tasks da campanha
   */
  async removeEmployeesFromCampaign(
    campaignId: string,
    employeeIds: string[],
    removedBy: string
  ) {
    // Verificar se a campanha existe
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      include: {
        tasks: true
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Usar transação para garantir consistência
    await this.prisma.$transaction(async (tx) => {
      // 1. Remover funcionários da campanha
      await tx.campaignAssignee.deleteMany({
        where: {
          campaignId,
          employeeId: { in: employeeIds }
        }
      });

      // 2. Remover funcionários de todas as tasks da campanha
      for (const task of campaign.tasks) {
        await tx.taskAssignee.deleteMany({
          where: {
            taskId: task.id,
            employeeId: { in: employeeIds }
          }
        });
      }
    });

    return {
      message: 'Employees removed from campaign and its tasks successfully'
    };
  }

  /**
   * Buscar campanha por ID com funcionários atribuídos
   */
  async findCampaignWithAssignees(campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        assignees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                position: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        tasks: {
          include: {
            assignees: {
              include: {
                employee: {
                  select: {
                    id: true,
                    name: true,
                    position: true,
                    user: {
                      select: {
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        serviceRequest: {
          select: {
            id: true,
            projectName: true,
            description: true,
            status: true
          }
        }
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  /**
   * Listar campanhas para admins/employees (todas as campanhas)
   */
  async findAllCampaigns(query: QueryCampaignsDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    
    const whereConditions: any = {};

    // Filtros
    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.clientId) {
      whereConditions.clientId = query.clientId;
    }

    if (query.search) {
      whereConditions.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { client: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { client: { companyName: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where: whereConditions,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  user: {
                    select: {
                      email: true
                    }
                  }
                }
              }
            }
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              progress: true,
              estimatedHours: true,
              spentHours: true,
              dueDate: true,
              completedAt: true,
              createdAt: true,
              service: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  credits: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          serviceRequest: {
            select: {
              id: true,
              projectName: true,
              description: true,
              status: true,
              creditsCost: true
            }
          }
        },
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        skip,
        take: query.limit || 20
      }),
      this.prisma.campaign.count({ where: whereConditions })
    ]);

    // Calcular totais por campanha
    const campaignsWithTotals = await Promise.all(campaigns.map(async (campaign) => {
      // Buscar todos os arquivos das tasks desta campanha
      const taskFiles = await this.prisma.taskFile.findMany({
        where: {
          taskId: { in: campaign.tasks.map(t => t.id) }
        },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          description: true,
          uploadedAt: true,
          taskId: true
        },
        orderBy: { uploadedAt: 'desc' }
      });

      // Buscar comentários das tasks desta campanha
      const taskComments = await this.prisma.taskComment.findMany({
        where: {
          taskId: { in: campaign.tasks.map(t => t.id) }
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              employee: {
                select: {
                  name: true
                }
              },
              client: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Últimos 10 comentários
      });

      // Calcular totais
      const totalEstimatedHours = campaign.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
      const totalSpentHours = campaign.tasks.reduce((sum, task) => sum + task.spentHours, 0);
      const totalCredits = campaign.tasks.reduce((sum, task) => sum + task.service.credits, 0);
      const completedTasks = campaign.tasks.filter(task => task.status === 'CONCLUIDO').length;
      const totalTasks = campaign.tasks.length;
      const campaignProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...campaign,
        files: taskFiles,
        comments: taskComments,
        totals: {
          estimatedHours: totalEstimatedHours,
          spentHours: totalSpentHours,
          credits: totalCredits,
          tasks: totalTasks,
          completedTasks,
          progress: campaignProgress
        }
      };
    }));

    return {
      campaigns: campaignsWithTotals,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        pages: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  /**
   * Listar campanhas para um cliente específico
   */
  async findClientCampaigns(clientId: string, query: QueryCampaignsDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    
    const whereConditions: any = {
      clientId
    };

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.search) {
      whereConditions.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where: whereConditions,
        include: {
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  user: {
                    select: {
                      email: true
                    }
                  }
                }
              }
            }
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              progress: true,
              estimatedHours: true,
              spentHours: true,
              dueDate: true,
              completedAt: true,
              createdAt: true,
              service: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  credits: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          serviceRequest: {
            select: {
              id: true,
              projectName: true,
              description: true,
              status: true,
              creditsCost: true
            }
          }
        },
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        skip,
        take: query.limit || 20
      }),
      this.prisma.campaign.count({ where: whereConditions })
    ]);

    // Calcular totais por campanha (mesmo lógica do método anterior)
    const campaignsWithTotals = await Promise.all(campaigns.map(async (campaign) => {
      const taskFiles = await this.prisma.taskFile.findMany({
        where: {
          taskId: { in: campaign.tasks.map(t => t.id) }
        },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          description: true,
          uploadedAt: true,
          taskId: true
        },
        orderBy: { uploadedAt: 'desc' }
      });

      const taskComments = await this.prisma.taskComment.findMany({
        where: {
          taskId: { in: campaign.tasks.map(t => t.id) }
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              employee: {
                select: {
                  name: true
                }
              },
              client: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const totalEstimatedHours = campaign.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
      const totalSpentHours = campaign.tasks.reduce((sum, task) => sum + task.spentHours, 0);
      const totalCredits = campaign.tasks.reduce((sum, task) => sum + task.service.credits, 0);
      const completedTasks = campaign.tasks.filter(task => task.status === 'CONCLUIDO').length;
      const totalTasks = campaign.tasks.length;
      const campaignProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...campaign,
        files: taskFiles,
        comments: taskComments,
        totals: {
          estimatedHours: totalEstimatedHours,
          spentHours: totalSpentHours,
          credits: totalCredits,
          tasks: totalTasks,
          completedTasks,
          progress: campaignProgress
        }
      };
    }));

    return {
      campaigns: campaignsWithTotals,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        pages: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  /**
   * Listar campanhas atribuídas a um funcionário específico
   */
  async findEmployeeCampaigns(employeeId: string, query: QueryCampaignsDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    
    const whereConditions: any = {
      assignees: {
        some: {
          employeeId
        }
      }
    };

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.search) {
      whereConditions.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { client: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { client: { companyName: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where: whereConditions,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  user: {
                    select: {
                      email: true
                    }
                  }
                }
              }
            }
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              progress: true,
              estimatedHours: true,
              spentHours: true,
              dueDate: true,
              completedAt: true,
              createdAt: true,
              service: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  credits: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          serviceRequest: {
            select: {
              id: true,
              projectName: true,
              description: true,
              status: true,
              creditsCost: true
            }
          }
        },
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        skip,
        take: query.limit || 20
      }),
      this.prisma.campaign.count({ where: whereConditions })
    ]);

    // Calcular totais por campanha (mesmo lógica dos métodos anteriores)
    const campaignsWithTotals = await Promise.all(campaigns.map(async (campaign) => {
      const taskFiles = await this.prisma.taskFile.findMany({
        where: {
          taskId: { in: campaign.tasks.map(t => t.id) }
        },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          description: true,
          uploadedAt: true,
          taskId: true
        },
        orderBy: { uploadedAt: 'desc' }
      });

      const taskComments = await this.prisma.taskComment.findMany({
        where: {
          taskId: { in: campaign.tasks.map(t => t.id) }
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              employee: {
                select: {
                  name: true
                }
              },
              client: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const totalEstimatedHours = campaign.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
      const totalSpentHours = campaign.tasks.reduce((sum, task) => sum + task.spentHours, 0);
      const totalCredits = campaign.tasks.reduce((sum, task) => sum + task.service.credits, 0);
      const completedTasks = campaign.tasks.filter(task => task.status === 'CONCLUIDO').length;
      const totalTasks = campaign.tasks.length;
      const campaignProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...campaign,
        files: taskFiles,
        comments: taskComments,
        totals: {
          estimatedHours: totalEstimatedHours,
          spentHours: totalSpentHours,
          credits: totalCredits,
          tasks: totalTasks,
          completedTasks,
          progress: campaignProgress
        }
      };
    }));

    return {
      campaigns: campaignsWithTotals,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        pages: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  // =============== TASK MANAGEMENT METHODS ===============

  /**
   * Criar uma nova task na campanha
   */
  async createCampaignTask(
    campaignId: string,
    createTaskDto: CreateCampaignTaskDto,
    createdByEmployeeId?: string
  ) {
    // Verificar se a campanha existe
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true
          }
        },
        serviceRequest: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                displayName: true,
                credits: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Verificar se o employee está atribuído à campanha (apenas se createdByEmployeeId for fornecido)
    if (createdByEmployeeId) {
      const isAssigned = await this.prisma.campaignAssignee.findFirst({
        where: {
          campaignId,
          employeeId: createdByEmployeeId
        }
      });

      if (!isAssigned) {
        throw new BadRequestException('You are not assigned to this campaign');
      }
    }

    // Verificar se os assignees existem (se fornecidos)
    let assigneeEmployees: any[] = [];
    if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
      assigneeEmployees = await this.prisma.employee.findMany({
        where: {
          id: { in: createTaskDto.assigneeIds },
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });

      if (assigneeEmployees.length !== createTaskDto.assigneeIds.length) {
        throw new BadRequestException('One or more assigned employees not found or inactive');
      }
    }

    // Usar transação para criar task e atribuições
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Criar a task
      const task = await tx.task.create({
        data: {
          title: createTaskDto.title,
          description: createTaskDto.description,
          status: createTaskDto.status || TaskStatus.BACKLOG,
          priority: createTaskDto.priority,
          dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
          estimatedHours: createTaskDto.estimatedHours,
          // tags: createTaskDto.tags || [], // tags field not in schema
          campaignId,
          clientId: campaign.clientId,
          serviceId: campaign.serviceRequest?.service?.id || ''
          // createdByUserId: (await tx.employee.findUnique({
          //   where: { id: createdByEmployeeId },
          //   select: { userId: true }
          // }))?.userId // field not in schema
        }
      });

      // 2. Criar atribuições da task
      if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
        let assignedByUserId = '';
        
        // Get user ID from employee if available
        if (createdByEmployeeId) {
          const createdByUser = await tx.employee.findUnique({
            where: { id: createdByEmployeeId },
            select: { userId: true }
          });
          assignedByUserId = createdByUser?.userId || '';
        }

        const taskAssignments = createTaskDto.assigneeIds.map(employeeId => ({
          taskId: task.id,
          employeeId,
          assignedBy: assignedByUserId
        }));

        await tx.taskAssignee.createMany({
          data: taskAssignments
        });
      }

      // 3. Buscar a task completa com relacionamentos
      const completeTask = await tx.task.findFirst({
        where: { id: task.id },
        include: {
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  user: {
                    select: {
                      email: true
                    }
                  }
                }
              }
            }
          },
          campaign: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              displayName: true,
              credits: true
            }
          },
          // createdByUser: {
          //   select: {
          //     id: true,
          //     email: true,
          //     role: true,
          //     employee: {
          //       select: {
          //         name: true
          //       }
          //     }
          //   }
          // }
        }
      });

      return completeTask;
    });

    return {
      message: 'Task created successfully',
      task: result
    };
  }

  /**
   * Listar tasks de uma campanha
   */
  async getCampaignTasks(campaignId: string) {
    // Verificar se a campanha existe
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Buscar todas as tasks da campanha
    const tasks = await this.prisma.task.findMany({
      where: { campaignId },
      include: {
        assignees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                position: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            displayName: true,
            credits: true
          }
        },
        // createdByUser: {
        //   select: {
        //     id: true,
        //     email: true,
        //     role: true,
        //     employee: {
        //       select: {
        //         name: true
        //       }
        //     }
        //   }
        // },
        files: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            // fileSize: true, // field not in schema
            description: true,
            uploadedAt: true
          },
          orderBy: { uploadedAt: 'desc' }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
                employee: {
                  select: {
                    name: true
                  }
                },
                client: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // Últimos 5 comentários por task
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      campaign,
      tasks,
      totalTasks: tasks.length,
      tasksByStatus: {
        backlog: tasks.filter(t => t.status === TaskStatus.BACKLOG).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.ANDAMENTO).length,
        inReview: tasks.filter(t => t.status === TaskStatus.REVISAO).length,
        completed: tasks.filter(t => t.status === TaskStatus.CONCLUIDO).length,
        overdue: tasks.filter(t => t.status === TaskStatus.ATRASADO).length,
        archived: tasks.filter(t => t.status === TaskStatus.ARQUIVADO).length
      }
    };
  }

  /**
   * Atualizar status de uma task
   */
  async updateTaskStatus(
    campaignId: string,
    taskId: string,
    updateStatusDto: UpdateTaskStatusDto,
    updatedByEmployeeId?: string,
    userRole?: string
  ) {
    console.log('updateTaskStatus called with:', {
      campaignId,
      taskId,
      updatedByEmployeeId,
      userRole,
      status: updateStatusDto.status
    });

    // Verificar se a task existe e pertence à campanha
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        campaignId
      },
      include: {
        assignees: updatedByEmployeeId ? {
          where: {
            employeeId: updatedByEmployeeId
          }
        } : undefined
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found in this campaign');
    }

    console.log('Task found:', {
      taskId: task.id,
      assigneesCount: task.assignees?.length || 0,
      hasAssignees: task.assignees && task.assignees.length > 0
    });

    // Verificar permissões apenas se não for ADMIN
    if (userRole !== 'ADMIN' && updatedByEmployeeId) {
      console.log('Checking permissions for non-ADMIN user');
      
      // Verificar se o employee está atribuído à task ou à campanha
      const isAssignedToTask = task.assignees && task.assignees.length > 0;
      const isAssignedToCampaign = await this.prisma.campaignAssignee.findFirst({
        where: {
          campaignId,
          employeeId: updatedByEmployeeId
        }
      });

      console.log('Permission check results:', {
        isAssignedToTask,
        isAssignedToCampaign: !!isAssignedToCampaign
      });

      if (!isAssignedToTask && !isAssignedToCampaign) {
        throw new BadRequestException('You are not assigned to this task or campaign');
      }
    } else {
      console.log('Skipping permission check - user is ADMIN or no employeeId');
    }

    // Atualizar a task
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: updateStatusDto.status,
        progress: updateStatusDto.progress !== undefined ? updateStatusDto.progress : task.progress,
        spentHours: updateStatusDto.spentHours !== undefined ? updateStatusDto.spentHours : task.spentHours,
        completedAt: updateStatusDto.status === TaskStatus.CONCLUIDO ? new Date() : null,
        updatedAt: new Date()
      },
      include: {
        assignees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                position: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            displayName: true,
            credits: true
          }
        }
      }
    });

    // Criar comentário automático se fornecido
    if (updateStatusDto.notes && updatedByEmployeeId) {
      const updatedByUser = await this.prisma.employee.findUnique({
        where: { id: updatedByEmployeeId },
        select: { userId: true }
      });

      if (updatedByUser) {
        await this.prisma.taskComment.create({
          data: {
            taskId,
            authorId: updatedByUser.userId,
            content: `Status atualizado para ${updateStatusDto.status}: ${updateStatusDto.notes}`,
            // isSystemComment: true // field not in schema
          }
        });
      }
    }

    return {
      message: 'Task status updated successfully',
      task: updatedTask
    };
  }

  // =============== FILE MANAGEMENT METHODS ===============

  /**
   * Adicionar arquivos a uma task
   */
  async addTaskFiles(
    campaignId: string,
    taskId: string,
    files: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      description?: string;
    }>,
    uploadedByEmployeeId: string
  ) {
    // Verificar se a task existe e pertence à campanha
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        campaignId
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found in this campaign');
    }

    // Verificar se o employee está atribuído à campanha
    const isAssignedToCampaign = await this.prisma.campaignAssignee.findFirst({
      where: {
        campaignId,
        employeeId: uploadedByEmployeeId
      }
    });

    if (!isAssignedToCampaign) {
      throw new BadRequestException('You are not assigned to this campaign');
    }

    // Buscar userId do employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: uploadedByEmployeeId },
      select: { userId: true }
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // Criar registros dos arquivos
    const createdFiles = await this.prisma.taskFile.createMany({
      data: files.map(file => ({
        taskId,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: TaskFileType.DELIVERABLE, // Default to DELIVERABLE for employee uploads
        fileSize: file.fileSize,
        description: file.description,
        uploadedBy: employee.userId
      }))
    });

    // Buscar os arquivos criados
    const taskFiles = await this.prisma.taskFile.findMany({
      where: { taskId },
      // include: {
      //   uploadedBy: {
      //     select: {
      //       id: true,
      //       email: true,
      //       employee: {
      //         select: {
      //           name: true
      //         }
      //       }
      //     }
      //   }
      // },
      orderBy: { uploadedAt: 'desc' }
    });

    return {
      message: 'Files uploaded successfully',
      filesCount: files.length,
      files: taskFiles
    };
  }

  /**
   * Listar arquivos de uma task
   */
  async getTaskFiles(campaignId: string, taskId: string) {
    // Verificar se a task existe e pertence à campanha
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        campaignId
      },
      select: {
        id: true,
        title: true
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found in this campaign');
    }

    // Buscar arquivos da task
    const files = await this.prisma.taskFile.findMany({
      where: { taskId },
      // include: {
      //   uploadedBy: {
      //     select: {
      //       id: true,
      //       email: true,
      //       employee: {
      //         select: {
      //           name: true
      //         }
      //       }
      //     }
      //   }
      // },
      orderBy: { uploadedAt: 'desc' }
    });

    return {
      task,
      files,
      totalFiles: files.length,
      totalSize: files.length // files.reduce((sum, file) => sum + file.fileSize, 0) // fileSize not in schema
    };
  }

  /**
   * Deletar arquivo de uma task
   */
  async deleteTaskFile(
    campaignId: string,
    taskId: string,
    fileId: string,
    deletedByEmployeeId: string
  ) {
    // Verificar se o arquivo existe e pertence à task
    const file = await this.prisma.taskFile.findFirst({
      where: {
        id: fileId,
        taskId
      },
      include: {
        task: {
          select: {
            campaignId: true
          }
        }
      }
    });

    if (!file || file.task.campaignId !== campaignId) {
      throw new NotFoundException('File not found in this campaign task');
    }

    // Verificar se o employee está atribuído à campanha
    const isAssignedToCampaign = await this.prisma.campaignAssignee.findFirst({
      where: {
        campaignId,
        employeeId: deletedByEmployeeId
      }
    });

    if (!isAssignedToCampaign) {
      throw new BadRequestException('You are not assigned to this campaign');
    }

    // Deletar o arquivo
    await this.prisma.taskFile.delete({
      where: { id: fileId }
    });

    return {
      message: 'File deleted successfully',
      deletedFile: {
        id: file.id,
        fileName: file.fileName
      }
    };
  }

  // =============== CAMPAIGN DOCUMENTS AND DETAILS ===============

  /**
   * Listar todos os documentos de todas as tasks vinculadas a uma campanha
   */
  async getCampaignDocuments(campaignId: string) {
    // Verificar se a campanha existe
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Buscar todas as tasks da campanha com seus arquivos
    const tasksWithFiles = await this.prisma.task.findMany({
      where: { campaignId },
      select: {
        id: true,
        title: true,
        status: true,
        files: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            description: true,
            uploadedAt: true,
            uploadedBy: true
          },
          orderBy: { uploadedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Organizar arquivos por task
    const allFiles: any[] = [];
    const filesByTask: any = {};

    tasksWithFiles.forEach(task => {
      filesByTask[task.id] = {
        taskId: task.id,
        taskTitle: task.title,
        taskStatus: task.status,
        files: task.files,
        filesCount: task.files.length
      };

      // Adicionar arquivos à lista geral
      task.files.forEach(file => {
        allFiles.push({
          ...file,
          taskId: task.id,
          taskTitle: task.title
        });
      });
    });

    return {
      campaign,
      allFiles: allFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
      filesByTask,
      totalFiles: allFiles.length,
      totalTasks: tasksWithFiles.length
    };
  }

  /**
   * Obter detalhes completos de uma task com documentos
   */
  async getTaskDetails(campaignId: string, taskId: string) {
    // Verificar se a task existe e pertence à campanha
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        campaignId
      },
      include: {
        assignees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                position: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            description: true,
            uploadedAt: true,
            uploadedBy: true
          },
          orderBy: { uploadedAt: 'desc' }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
                employee: {
                  select: {
                    name: true
                  }
                },
                client: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Últimos 10 comentários
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            displayName: true,
            credits: true
          }
        }
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found in this campaign');
    }

    return {
      task,
      statistics: {
        filesCount: task.files.length,
        commentsCount: task.comments.length,
        assigneesCount: task.assignees.length
      }
    };
  }

  // =============== TASK COMMENTS METHODS ===============

  /**
   * Criar comentário em uma task
   */
  async createTaskComment(
    campaignId: string,
    taskId: string,
    createCommentDto: CreateTaskCommentDto,
    authorId: string
  ) {
    // Verificar se a task existe e pertence à campanha
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        campaignId
      },
      select: {
        id: true,
        title: true
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found in this campaign');
    }

    // Criar o comentário
    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        authorId,
        content: createCommentDto.content
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: {
              select: {
                name: true
              }
            },
            client: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    return {
      message: 'Comment created successfully',
      comment
    };
  }

  /**
   * Listar comentários de uma task
   */
  async getTaskComments(campaignId: string, taskId: string, page = 1, limit = 20) {
    // Verificar se a task existe e pertence à campanha
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        campaignId
      },
      select: {
        id: true,
        title: true
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found in this campaign');
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.taskComment.findMany({
        where: { taskId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              employee: {
                select: {
                  name: true
                }
              },
              client: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.taskComment.count({ where: { taskId } })
    ]);

    return {
      task,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Deletar comentário de uma task
   */
  async deleteTaskComment(
    campaignId: string,
    taskId: string,
    commentId: string,
    userId: string
  ) {
    // Verificar se a task existe e pertence à campanha
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        campaignId
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found in this campaign');
    }

    // Verificar se o comentário existe e pertence ao usuário
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        taskId,
        authorId: userId
      }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found or you are not authorized to delete it');
    }

    // Deletar o comentário
    await this.prisma.taskComment.delete({
      where: { id: commentId }
    });

    return {
      message: 'Comment deleted successfully'
    };
  }

  // =============== CAMPAIGN COMMENTS METHODS ===============

  /**
   * Criar comentário em uma campanha
   */
  async createCampaignComment(
    campaignId: string,
    createCommentDto: CreateCampaignCommentDto,
    authorId: string
  ) {
    // Verificar se a campanha existe
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      select: {
        id: true,
        name: true
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Criar o comentário
    const comment = await this.prisma.campaignComment.create({
      data: {
        campaignId,
        authorId,
        content: createCommentDto.content
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: {
              select: {
                name: true
              }
            },
            client: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    return {
      message: 'Comment created successfully',
      comment
    };
  }

  /**
   * Listar comentários de uma campanha
   */
  async getCampaignComments(campaignId: string, page = 1, limit = 20) {
    // Verificar se a campanha existe
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      select: {
        id: true,
        name: true
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.campaignComment.findMany({
        where: { campaignId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              employee: {
                select: {
                  name: true
                }
              },
              client: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.campaignComment.count({ where: { campaignId } })
    ]);

    return {
      campaign,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Deletar comentário de uma campanha
   */
  async deleteCampaignComment(
    campaignId: string,
    commentId: string,
    userId: string
  ) {
    // Verificar se a campanha existe
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Verificar se o comentário existe e pertence ao usuário
    const comment = await this.prisma.campaignComment.findFirst({
      where: {
        id: commentId,
        campaignId,
        authorId: userId
      }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found or you are not authorized to delete it');
    }

    // Deletar o comentário
    await this.prisma.campaignComment.delete({
      where: { id: commentId }
    });

    return {
      message: 'Comment deleted successfully'
    };
  }

  // =============== ADMIN OVERVIEW METHODS ===============

  /**
   * Visão geral das campanhas para administradores com estatísticas detalhadas
   */
  async getAdminCampaignsOverview(query: QueryCampaignsDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);

    const whereConditions: any = {};

    // Filtros
    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.clientId) {
      whereConditions.clientId = query.clientId;
    }

    if (query.search) {
      whereConditions.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { client: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { client: { companyName: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    // Buscar campanhas com informações detalhadas para admin
    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where: whereConditions,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  isActive: true,
                  createdAt: true
                }
              }
            }
          },
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  department: true,
                  user: {
                    select: {
                      email: true,
                      isActive: true
                    }
                  }
                }
              }
            }
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              progress: true,
              estimatedHours: true,
              spentHours: true,
              dueDate: true,
              completedAt: true,
              createdAt: true,
              updatedAt: true,
              assignees: {
                select: {
                  employeeId: true
                }
              },
              files: {
                select: {
                  id: true,
                  uploadedAt: true
                }
              },
              comments: {
                select: {
                  id: true,
                  createdAt: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          serviceRequest: {
            select: {
              id: true,
              projectName: true,
              description: true,
              status: true,
              creditsCost: true,
              createdAt: true,
              approvedAt: true
            }
          },
          comments: {
            select: {
              id: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        skip,
        take: query.limit || 20
      }),
      this.prisma.campaign.count({ where: whereConditions })
    ]);

    // Calcular estatísticas administrativas detalhadas
    const campaignsWithAdminStats = await Promise.all(campaigns.map(async (campaign) => {
      // Estatísticas de tasks
      const totalTasks = campaign.tasks.length;
      const completedTasks = campaign.tasks.filter(t => t.status === TaskStatus.CONCLUIDO).length;
      const inProgressTasks = campaign.tasks.filter(t => t.status === TaskStatus.ANDAMENTO).length;
      const inReviewTasks = campaign.tasks.filter(t => t.status === TaskStatus.REVISAO).length;
      const overdueTasks = campaign.tasks.filter(t =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatus.CONCLUIDO
      ).length;

      // Estatísticas de tempo
      const totalEstimatedHours = campaign.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
      const totalSpentHours = campaign.tasks.reduce((sum, task) => sum + task.spentHours, 0);
      const avgProgress = totalTasks > 0 ?
        Math.round(campaign.tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks) : 0;

      // Estatísticas de arquivos e comentários
      const totalFiles = campaign.tasks.reduce((sum, task) => sum + task.files.length, 0);
      const totalTaskComments = campaign.tasks.reduce((sum, task) => sum + task.comments.length, 0);
      const totalCampaignComments = campaign.comments.length;

      // Estatísticas de equipe
      const uniqueEmployees = new Set();
      campaign.tasks.forEach(task => {
        task.assignees.forEach(assignee => {
          uniqueEmployees.add(assignee.employeeId);
        });
      });

      // Última atividade
      const allDates = [
        ...campaign.tasks.map(t => t.updatedAt),
        ...campaign.comments.map(c => c.createdAt)
      ];
      const lastActivity = allDates.length > 0 ?
        new Date(Math.max(...allDates.map(d => new Date(d).getTime()))) : campaign.updatedAt;

      // Tempo total da campanha
      const campaignDuration = campaign.endDate ?
        Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24)) :
        Math.ceil((new Date().getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...campaign,
        adminStats: {
          // Estatísticas de tasks
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            inReview: inReviewTasks,
            overdue: overdueTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          },

          // Estatísticas de tempo
          time: {
            estimatedHours: totalEstimatedHours,
            spentHours: totalSpentHours,
            efficiency: totalEstimatedHours > 0 ? Math.round((totalSpentHours / totalEstimatedHours) * 100) : 0,
            avgProgress: avgProgress,
            campaignDurationDays: campaignDuration
          },

          // Estatísticas de conteúdo
          content: {
            files: totalFiles,
            taskComments: totalTaskComments,
            campaignComments: totalCampaignComments,
            totalComments: totalTaskComments + totalCampaignComments
          },

          // Estatísticas de equipe
          team: {
            assignedEmployees: campaign.assignees.length,
            uniqueWorkingEmployees: uniqueEmployees.size,
            avgTasksPerEmployee: uniqueEmployees.size > 0 ? Math.round(totalTasks / uniqueEmployees.size) : 0
          },

          // Informações de cliente
          client: {
            isActive: campaign.client.user.isActive,
            memberSince: campaign.client.user.createdAt,
            creditsCost: campaign.serviceRequest?.creditsCost || 0
          },

          // Atividade
          activity: {
            lastActivity: lastActivity,
            daysSinceLastActivity: Math.ceil((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
          }
        }
      };
    }));

    // Calcular estatísticas globais para o admin
    const globalStats = {
      totalCampaigns: total,
      activeCampaigns: campaignsWithAdminStats.filter(c => c.status === 'ACTIVE').length,
      completedCampaigns: campaignsWithAdminStats.filter(c => c.status === 'COMPLETED').length,

      totalTasks: campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.tasks.total, 0),
      totalCompletedTasks: campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.tasks.completed, 0),
      totalOverdueTasks: campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.tasks.overdue, 0),

      totalEstimatedHours: campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.time.estimatedHours, 0),
      totalSpentHours: campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.time.spentHours, 0),

      totalFiles: campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.content.files, 0),
      totalComments: campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.content.totalComments, 0),

      totalCreditsInvested: campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.client.creditsCost, 0),

      avgCompletionRate: campaignsWithAdminStats.length > 0 ?
        Math.round(campaignsWithAdminStats.reduce((sum, c) => sum + c.adminStats.tasks.completionRate, 0) / campaignsWithAdminStats.length) : 0
    };

    return {
      campaigns: campaignsWithAdminStats,
      globalStats,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        pages: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  // =============== TASK LISTING METHODS ===============

  /**
   * Listar todas as tasks de um employee com filtros
   */
  async findEmployeeTasks(employeeId: string, query: QueryTasksDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 10);

    const whereConditions: any = {
      assignees: {
        some: {
          employeeId: employeeId
        }
      }
    };

    // Filtros
    if (query.campaignId) {
      whereConditions.campaignId = query.campaignId;
    }

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (!query.includeArchived) {
      whereConditions.status = {
        not: TaskStatus.ARQUIVADO
      };
    }

    if (query.search) {
      whereConditions.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.startDate || query.endDate) {
      whereConditions.createdAt = {};
      if (query.startDate) {
        whereConditions.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        whereConditions.createdAt.lte = new Date(query.endDate);
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereConditions,
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
              client: {
                select: {
                  id: true,
                  fullName: true,
                  companyName: true
                }
              }
            }
          },
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true
                }
              }
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          },
          files: {
            select: {
              id: true,
              fileName: true,
              uploadedAt: true
            },
            take: 3
          },
          comments: {
            select: {
              id: true,
              createdAt: true
            },
            take: 3
          }
        },
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        skip,
        take: query.limit || 10
      }),
      this.prisma.task.count({ where: whereConditions })
    ]);

    return {
      tasks,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total,
        pages: Math.ceil(total / (query.limit || 10))
      },
      summary: {
        total,
        byStatus: {
          backlog: tasks.filter(t => t.status === TaskStatus.BACKLOG).length,
          inProgress: tasks.filter(t => t.status === TaskStatus.ANDAMENTO).length,
          completed: tasks.filter(t => t.status === TaskStatus.CONCLUIDO).length,
          archived: tasks.filter(t => t.status === TaskStatus.ARQUIVADO).length
        }
      }
    };
  }

  /**
   * Listar todas as tasks do sistema para admin com filtros
   */
  async findAllTasks(query: QueryTasksDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 10);

    const whereConditions: any = {};

    // Filtros
    if (query.campaignId) {
      whereConditions.campaignId = query.campaignId;
    }

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (!query.includeArchived) {
      whereConditions.status = {
        not: TaskStatus.ARQUIVADO
      };
    }

    if (query.search) {
      whereConditions.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { campaign: { name: { contains: query.search, mode: 'insensitive' } } },
        { campaign: { client: { fullName: { contains: query.search, mode: 'insensitive' } } } }
      ];
    }

    if (query.startDate || query.endDate) {
      whereConditions.createdAt = {};
      if (query.startDate) {
        whereConditions.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        whereConditions.createdAt.lte = new Date(query.endDate);
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereConditions,
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
              client: {
                select: {
                  id: true,
                  fullName: true,
                  companyName: true,
                  user: {
                    select: {
                      email: true,
                      isActive: true
                    }
                  }
                }
              }
            }
          },
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  department: true,
                  user: {
                    select: {
                      email: true,
                      isActive: true
                    }
                  }
                }
              }
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              displayName: true,
              credits: true
            }
          },
          files: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              uploadedAt: true
            }
          },
          comments: {
            select: {
              id: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        skip,
        take: query.limit || 10
      }),
      this.prisma.task.count({ where: whereConditions })
    ]);

    // Estatísticas gerais para admin
    const stats = {
      total,
      byStatus: {
        backlog: tasks.filter(t => t.status === TaskStatus.BACKLOG).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.ANDAMENTO).length,
        inReview: tasks.filter(t => t.status === TaskStatus.REVISAO).length,
        completed: tasks.filter(t => t.status === TaskStatus.CONCLUIDO).length,
        overdue: tasks.filter(t => t.status === TaskStatus.ATRASADO).length,
        archived: tasks.filter(t => t.status === TaskStatus.ARQUIVADO).length
      },
      totalFiles: tasks.reduce((sum, task) => sum + task.files.length, 0),
      totalComments: tasks.reduce((sum, task) => sum + task.comments.length, 0),
      uniqueCampaigns: new Set(tasks.map(task => task.campaignId)).size,
      uniqueEmployees: new Set(tasks.flatMap(task => task.assignees.map(a => a.employeeId))).size
    };

    return {
      tasks,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total,
        pages: Math.ceil(total / (query.limit || 10))
      },
      stats
    };
  }

  /**
   * Listar todas as tasks vinculadas a um cliente com filtros
   */
  async findClientTasks(clientId: string, query: QueryTasksDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 10);

    const whereConditions: any = {
      clientId: clientId
    };

    // Filtros
    if (query.campaignId) {
      whereConditions.campaignId = query.campaignId;
    }

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (!query.includeArchived) {
      whereConditions.status = {
        not: TaskStatus.ARQUIVADO
      };
    }

    if (query.search) {
      whereConditions.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { campaign: { name: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    if (query.startDate || query.endDate) {
      whereConditions.createdAt = {};
      if (query.startDate) {
        whereConditions.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        whereConditions.createdAt.lte = new Date(query.endDate);
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereConditions,
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  position: true
                }
              }
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          },
          files: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              uploadedAt: true
            }
          },
          comments: {
            select: {
              id: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        skip,
        take: query.limit || 10
      }),
      this.prisma.task.count({ where: whereConditions })
    ]);

    return {
      tasks,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total,
        pages: Math.ceil(total / (query.limit || 10))
      },
      summary: {
        total,
        byStatus: {
          backlog: tasks.filter(t => t.status === TaskStatus.BACKLOG).length,
          inProgress: tasks.filter(t => t.status === TaskStatus.ANDAMENTO).length,
          completed: tasks.filter(t => t.status === TaskStatus.CONCLUIDO).length,
          archived: tasks.filter(t => t.status === TaskStatus.ARQUIVADO).length
        },
        byCampaign: tasks.reduce((acc, task) => {
          if (task.campaignId && task.campaign && !acc[task.campaignId]) {
            acc[task.campaignId] = {
              campaignName: task.campaign.name,
              count: 0
            };
          }
          if (task.campaignId && acc[task.campaignId]) {
            acc[task.campaignId].count++;
          }
          return acc;
        }, {} as Record<string, { campaignName: string; count: number }>)
      }
    };
  }
}