import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignEmployeesToCampaignDto } from './dto/assign-employees-to-campaign.dto';
import { QueryCampaignsDto } from './dto/query-campaigns.dto';
import { Role } from '@prisma/client';

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
}