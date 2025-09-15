import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { ApproveServiceRequestDto, RejectServiceRequestDto } from './dto/approve-service-request.dto';
import { AssignServiceRequestDto } from './dto/assign-service-request.dto';
import { AssignEmployeesToRequestDto } from './dto/assign-employees-to-request.dto';
import { QueryServiceRequestsDto } from './dto/query-service-requests.dto';
import { ServiceRequestStatus, TaskStatus } from '@prisma/client';

@Injectable()
export class ServiceRequestsService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
    private notificationsService: NotificationsService
  ) {}

  // =============== CLIENT METHODS ===============

  async canRequestService(serviceId: string, clientId: string) {
    // Verificar se o serviço existe e está ativo
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        isActive: true
      },
      select: {
        id: true,
        displayName: true,
        credits: true,
        isActive: true
      }
    });

    if (!service) {
      throw new NotFoundException('Service not found or inactive');
    }

    // Verificar se o cliente tem créditos suficientes
    const wallet = await this.billingService.getClientWallet(clientId);
    const hasEnoughCredits = wallet.availableCredits >= service.credits;

    return {
      canRequest: hasEnoughCredits,
      service: {
        id: service.id,
        displayName: service.displayName,
        requiredCredits: service.credits
      },
      wallet: {
        availableCredits: wallet.availableCredits
      },
      message: hasEnoughCredits 
        ? 'You can request this service' 
        : `Insufficient credits. Required: ${service.credits}, Available: ${wallet.availableCredits}`
    };
  }

  async createServiceRequest(createDto: CreateServiceRequestDto, clientId: string) {
    // Verificar se o serviço existe e está ativo
    const service = await this.prisma.service.findFirst({
      where: {
        id: createDto.serviceId,
        isActive: true
      }
    });

    if (!service) {
      throw new NotFoundException('Service not found or inactive');
    }

    // Verificar se o cliente tem créditos suficientes
    const wallet = await this.billingService.getClientWallet(clientId);
    if (wallet.availableCredits < service.credits) {
      throw new BadRequestException(
        `Insufficient credits. Required: ${service.credits}, Available: ${wallet.availableCredits}`
      );
    }

    // Criar solicitação
    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        serviceId: createDto.serviceId,
        clientId,
        creditsCost: service.credits, // Snapshot do preço atual
        projectName: createDto.projectName,
        description: createDto.description,
        desiredDeadline: createDto.desiredDeadline ? new Date(createDto.desiredDeadline) : null,
        targetAudience: createDto.targetAudience,
        projectObjectives: createDto.projectObjectives,
        brandGuidelines: createDto.brandGuidelines,
        preferredColors: createDto.preferredColors || [],
        technicalRequirements: createDto.technicalRequirements,
        references: createDto.references,
        documentUrls: createDto.documentUrls || [],
        observations: createDto.observations,
        priority: createDto.priority,
        dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            credits: true,
            estimatedDays: true,
            difficulty: true
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    return serviceRequest;
  }

  async getMyServiceRequests(clientId: string, query: QueryServiceRequestsDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);

    const whereConditions: any = {
      clientId
    };

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.serviceId) {
      whereConditions.serviceId = query.serviceId;
    }

    if (query.search) {
      whereConditions.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { service: { displayName: { contains: query.search, mode: 'insensitive' } } },
        { service: { description: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const [serviceRequests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where: whereConditions,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              displayName: true,
              description: true,
              shortDescription: true,
              credits: true,
              estimatedDays: true,
              difficulty: true,
              iconUrl: true
            }
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              progress: true,
              dueDate: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit || 20
      }),
      this.prisma.serviceRequest.count({
        where: whereConditions
      })
    ]);

    return {
      serviceRequests,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  async getServiceRequest(id: string, clientId?: string) {
    const where: any = { id };
    
    // Se clientId for fornecido, filtrar por ele (para clientes)
    // Se não for fornecido, admin/employee pode ver qualquer solicitação
    if (clientId) {
      where.clientId = clientId;
    }

    const serviceRequest = await this.prisma.serviceRequest.findFirst({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            shortDescription: true,
            credits: true,
            estimatedDays: true,
            difficulty: true,
            iconUrl: true,
            features: true,
            benefits: true
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            progress: true,
            dueDate: true,
            completedAt: true,
            assignees: {
              include: {
                employee: {
                  select: {
                    id: true,
                    name: true,
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

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    return serviceRequest;
  }

  async updateServiceRequest(id: string, updateDto: UpdateServiceRequestDto, clientId: string) {
    // Verificar se a solicitação existe e pertence ao cliente
    const serviceRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        id,
        clientId,
        status: ServiceRequestStatus.PENDING // Só pode editar se estiver pendente
      }
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found or cannot be modified');
    }

    const updatedRequest = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        description: updateDto.description,
        priority: updateDto.priority,
        dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : null
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            credits: true,
            estimatedDays: true,
            difficulty: true
          }
        }
      }
    });

    return updatedRequest;
  }

  async cancelServiceRequest(id: string, clientId: string) {
    // Verificar se a solicitação existe e pertence ao cliente
    const serviceRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        id,
        clientId,
        status: ServiceRequestStatus.PENDING // Só pode cancelar se estiver pendente
      }
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found or cannot be cancelled');
    }

    const cancelledRequest = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        status: ServiceRequestStatus.CANCELLED
      }
    });

    return { message: 'Service request cancelled successfully' };
  }

  // =============== ADMIN/EMPLOYEE METHODS ===============

  async getAllServiceRequests(query: QueryServiceRequestsDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);

    const whereConditions: any = {};

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.serviceId) {
      whereConditions.serviceId = query.serviceId;
    }

    if (query.clientId) {
      whereConditions.clientId = query.clientId;
    }

    if (query.search) {
      whereConditions.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { service: { displayName: { contains: query.search, mode: 'insensitive' } } },
        { client: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { client: { user: { email: { contains: query.search, mode: 'insensitive' } } } }
      ];
    }

    const [serviceRequests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where: whereConditions,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              displayName: true,
              description: true,
              shortDescription: true,
              credits: true,
              estimatedDays: true,
              difficulty: true,
              iconUrl: true
            }
          },
          client: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            }
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              progress: true,
              dueDate: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit || 20
      }),
      this.prisma.serviceRequest.count({
        where: whereConditions
      })
    ]);

    return {
      serviceRequests,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  async approveServiceRequest(id: string, approveDto: ApproveServiceRequestDto, approvedBy: string) {
    // Verificar se a solicitação existe e está pendente
    const serviceRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        id,
        status: ServiceRequestStatus.PENDING
      },
      include: {
        service: true,
        client: {
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
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found or already processed');
    }

    // Verificar novamente se o cliente tem créditos suficientes
    const wallet = await this.billingService.getClientWallet(serviceRequest.clientId);
    if (wallet.availableCredits < serviceRequest.creditsCost) {
      throw new BadRequestException(
        `Client has insufficient credits. Required: ${serviceRequest.creditsCost}, Available: ${wallet.availableCredits}`
      );
    }

    // Usar transação para garantir consistência
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Deduzir créditos do cliente
      await this.billingService.deductCredits(
        serviceRequest.clientId,
        serviceRequest.creditsCost,
        `Service: ${serviceRequest.service.displayName}`,
        tx
      );

      // 2. Criar campanha automaticamente
      const campaign = await tx.campaign.create({
        data: {
          name: `${serviceRequest.service.displayName} - ${serviceRequest.client.fullName || serviceRequest.client.user?.email || 'Cliente'}`,
          description: serviceRequest.description,
          startDate: new Date(),
          endDate: approveDto.dueDate ? new Date(approveDto.dueDate) : (serviceRequest.dueDate || null),
          status: 'ACTIVE',
          clientId: serviceRequest.clientId,
          serviceRequestId: serviceRequest.id
        }
      });

      // 3. Criar task automática vinculada à campanha
      const task = await tx.task.create({
        data: {
          title: `${serviceRequest.service.displayName} - ${serviceRequest.client.fullName || 'Cliente'}`,
          description: serviceRequest.description,
          serviceId: serviceRequest.serviceId,
          clientId: serviceRequest.clientId,
          campaignId: campaign.id,
          status: TaskStatus.BACKLOG,
          priority: approveDto.priority || serviceRequest.priority,
          dueDate: approveDto.dueDate ? new Date(approveDto.dueDate) : serviceRequest.dueDate
        }
      });

      // 4. Aprovar solicitação e vincular task e campanha
      const updatedRequest = await tx.serviceRequest.update({
        where: { id },
        data: {
          status: ServiceRequestStatus.APPROVED,
          taskId: task.id,
          campaignId: campaign.id,
          approvedBy,
          approvedAt: new Date(),
          notes: approveDto.notes,
          priority: approveDto.priority || serviceRequest.priority,
          dueDate: approveDto.dueDate ? new Date(approveDto.dueDate) : serviceRequest.dueDate
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              displayName: true,
              description: true,
              credits: true,
              estimatedDays: true,
              difficulty: true
            }
          },
          client: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            }
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true
            }
          }
        }
      });

      return { serviceRequest: updatedRequest, task, campaign };
    });

    // Enviar notificação para o cliente sobre a aprovação
    try {
      await this.notificationsService.notifyServiceRequestApproved(
        result.serviceRequest.id,
        result.serviceRequest.client.user.id, // ✅ Usar userId do cliente
        result.serviceRequest.service.displayName
      );
    } catch (error) {
      console.error('Erro ao enviar notificação de aprovação:', error);
      // Não falha a operação se a notificação falhar
    }

    return result;
  }

  async rejectServiceRequest(id: string, rejectDto: RejectServiceRequestDto, rejectedBy: string) {
    // Verificar se a solicitação existe e está pendente
    const serviceRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        id,
        status: ServiceRequestStatus.PENDING
      }
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found or already processed');
    }

    const rejectedRequest = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        status: ServiceRequestStatus.REJECTED,
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: rejectDto.rejectionReason,
        notes: rejectDto.notes
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            credits: true,
            estimatedDays: true,
            difficulty: true
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Enviar notificação para o cliente sobre a rejeição
    try {
      await this.notificationsService.notifyServiceRequestRejected(
        rejectedRequest.id,
        rejectedRequest.client.user.id, // ✅ Usar userId do cliente
        rejectedRequest.service.displayName,
        rejectDto.rejectionReason
      );
    } catch (error) {
      console.error('Erro ao enviar notificação de rejeição:', error);
      // Não falha a operação se a notificação falhar
    }

    return rejectedRequest;
  }

  // =============== STATISTICS ===============

  async getServiceRequestStats() {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests
    ] = await Promise.all([
      this.prisma.serviceRequest.count(),
      this.prisma.serviceRequest.count({ where: { status: ServiceRequestStatus.PENDING } }),
      this.prisma.serviceRequest.count({ where: { status: ServiceRequestStatus.APPROVED } }),
      this.prisma.serviceRequest.count({ where: { status: ServiceRequestStatus.REJECTED } }),
      this.prisma.serviceRequest.count({ where: { status: ServiceRequestStatus.CANCELLED } })
    ]);

    return {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      cancelled: cancelledRequests
    };
  }

  async getClientServiceRequestStats(clientId: string) {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests
    ] = await Promise.all([
      this.prisma.serviceRequest.count({ where: { clientId } }),
      this.prisma.serviceRequest.count({ where: { clientId, status: ServiceRequestStatus.PENDING } }),
      this.prisma.serviceRequest.count({ where: { clientId, status: ServiceRequestStatus.APPROVED } }),
      this.prisma.serviceRequest.count({ where: { clientId, status: ServiceRequestStatus.REJECTED } }),
      this.prisma.serviceRequest.count({ where: { clientId, status: ServiceRequestStatus.CANCELLED } })
    ]);

    return {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      cancelled: cancelledRequests
    };
  }

  async assignServiceRequest(id: string, assignDto: AssignServiceRequestDto, assignedBy: string) {
    // Verificar se a solicitação existe e está pendente
    const serviceRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        id,
        status: ServiceRequestStatus.PENDING
      },
      include: {
        service: true,
        client: {
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
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found or already processed');
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

    // Verificar se o cliente tem créditos suficientes
    const wallet = await this.billingService.getClientWallet(serviceRequest.clientId);
    if (wallet.availableCredits < serviceRequest.creditsCost) {
      throw new BadRequestException(
        `Client has insufficient credits. Required: ${serviceRequest.creditsCost}, Available: ${wallet.availableCredits}`
      );
    }

    // Usar transação para garantir consistência
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Deduzir créditos do cliente
      await this.billingService.deductCredits(
        serviceRequest.clientId,
        serviceRequest.creditsCost,
        `Service: ${serviceRequest.service.displayName}`,
        tx
      );

      // 2. Criar campanha automaticamente
      const campaign = await tx.campaign.create({
        data: {
          name: `${serviceRequest.service.displayName} - ${serviceRequest.client.fullName || serviceRequest.client.user?.email || 'Cliente'}`,
          description: serviceRequest.description,
          startDate: new Date(),
          endDate: assignDto.dueDate ? new Date(assignDto.dueDate) : (serviceRequest.dueDate || null),
          status: 'ACTIVE',
          clientId: serviceRequest.clientId,
          serviceRequestId: serviceRequest.id
        }
      });

      // 3. Criar task automática vinculada à campanha
      const task = await tx.task.create({
        data: {
          title: `${serviceRequest.service.displayName} - ${serviceRequest.client.fullName || 'Cliente'}`,
          description: serviceRequest.description,
          serviceId: serviceRequest.serviceId,
          clientId: serviceRequest.clientId,
          campaignId: campaign.id,
          status: TaskStatus.BACKLOG,
          priority: assignDto.priority || serviceRequest.priority,
          dueDate: assignDto.dueDate ? new Date(assignDto.dueDate) : serviceRequest.dueDate
        }
      });

      // 4. Atribuir funcionários à task
      const taskAssignments = assignDto.employeeIds.map(employeeId => ({
        taskId: task.id,
        employeeId,
        assignedBy
      }));

      await tx.taskAssignee.createMany({
        data: taskAssignments
      });

      // 5. Atribuir funcionários à campanha (atribuição bidirecional)
      const campaignAssignments = assignDto.employeeIds.map(employeeId => ({
        campaignId: campaign.id,
        employeeId,
        assignedBy
      }));

      await tx.campaignAssignee.createMany({
        data: campaignAssignments
      });

      // 6. Aprovar solicitação e vincular task e campanha
      const updatedRequest = await tx.serviceRequest.update({
        where: { id },
        data: {
          status: ServiceRequestStatus.APPROVED,
          taskId: task.id,
          campaignId: campaign.id,
          approvedBy: assignedBy,
          approvedAt: new Date(),
          notes: assignDto.notes,
          priority: assignDto.priority || serviceRequest.priority,
          dueDate: assignDto.dueDate ? new Date(assignDto.dueDate) : serviceRequest.dueDate
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              displayName: true,
              description: true,
              credits: true,
              estimatedDays: true,
              difficulty: true
            }
          },
          client: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            }
          },
          task: {
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

      return { updatedRequest, campaign };
    });

    return {
      message: 'Service request assigned, task and campaign created successfully',
      serviceRequest: result.updatedRequest,
      campaign: result.campaign,
      assignedEmployees: employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        email: emp.user.email
      }))
    };
  }

  async assignEmployeesToServiceRequest(id: string, assignDto: AssignEmployeesToRequestDto, assignedBy: string) {
    // Verificar se a service request existe (independente do status)
    const serviceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: true,
        client: { include: { user: true } },
        assignedEmployees: {
          include: {
            employee: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    // Verificar se todos os employees existem e estão ativos
    const employees = await this.prisma.employee.findMany({
      where: {
        id: { in: assignDto.employeeIds },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        position: true,
        user: { select: { email: true } }
      }
    });

    if (employees.length !== assignDto.employeeIds.length) {
      throw new BadRequestException('One or more employees not found or inactive');
    }

    // Filtrar employees que já estão atribuídos
    const alreadyAssigned = serviceRequest.assignedEmployees.map(ae => ae.employeeId);
    const newEmployeeIds = assignDto.employeeIds.filter(id => !alreadyAssigned.includes(id));

    if (newEmployeeIds.length === 0) {
      throw new BadRequestException('All specified employees are already assigned to this service request');
    }

    // Criar as atribuições
    const assignments = newEmployeeIds.map(employeeId => ({
      serviceRequestId: id,
      employeeId,
      assignedBy,
      notes: assignDto.notes
    }));

    await this.prisma.serviceRequestEmployee.createMany({
      data: assignments
    });

    // Buscar dados atualizados
    const updatedServiceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: { select: { displayName: true } },
        client: { select: { fullName: true } },
        assignedEmployees: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                position: true,
                user: { select: { email: true } }
              }
            }
          }
        }
      }
    });

    // Notificar employees atribuídos
    const newlyAssignedEmployees = employees.filter(emp => newEmployeeIds.includes(emp.id));
    for (const employee of newlyAssignedEmployees) {
      const employeeUser = await this.prisma.employee.findUnique({
        where: { id: employee.id },
        include: { user: true }
      });

      if (employeeUser) {
        await this.notificationsService.createNotification({
          recipientId: employeeUser.user.id,
          type: 'SERVICE_REQUEST_ASSIGNED',
          title: 'Nova Atribuição de Service Request',
          message: `Você foi atribuído à service request: ${serviceRequest.service.displayName}`,
          data: { serviceRequestId: id }
        });
      }
    }

    if (!updatedServiceRequest) {
      throw new NotFoundException('Service request not found after assignment');
    }

    return {
      message: `${newlyAssignedEmployees.length} employee(s) assigned to service request successfully`,
      serviceRequest: {
        id: updatedServiceRequest.id,
        title: updatedServiceRequest.service.displayName,
        clientName: updatedServiceRequest.client.fullName,
        status: updatedServiceRequest.status
      },
      assignedEmployees: updatedServiceRequest.assignedEmployees.map(ae => ({
        id: ae.employee.id,
        name: ae.employee.name,
        position: ae.employee.position,
        email: ae.employee.user.email,
        assignedAt: ae.assignedAt,
        notes: ae.notes
      }))
    };
  }

  async removeEmployeeFromServiceRequest(serviceRequestId: string, employeeId: string, removedBy: string) {
    // Verificar se existe a atribuição
    const assignment = await this.prisma.serviceRequestEmployee.findFirst({
      where: {
        serviceRequestId,
        employeeId
      },
      include: {
        serviceRequest: {
          select: { id: true, projectName: true, status: true }
        },
        employee: {
          select: { id: true, name: true, user: { select: { id: true } } }
        }
      }
    });

    if (!assignment) {
      throw new NotFoundException('Employee assignment not found');
    }

    // Remover a atribuição
    await this.prisma.serviceRequestEmployee.delete({
      where: { id: assignment.id }
    });

    // Notificar o employee removido
    await this.notificationsService.createNotification({
      recipientId: assignment.employee.user.id,
      type: 'SERVICE_REQUEST_UNASSIGNED',
      title: 'Atribuição de Service Request Removida',
      message: `Você foi removido da service request: ${assignment.serviceRequest.projectName}`,
      data: { serviceRequestId }
    });

    return {
      message: 'Employee removed from service request successfully',
      removedEmployee: {
        id: assignment.employee.id,
        name: assignment.employee.name
      }
    };
  }

  async getServiceRequestEmployees(id: string) {
    const serviceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id },
      select: {
        id: true,
        projectName: true,
        status: true,
        assignedEmployees: {
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
                    profilePhoto: true
                  }
                }
              }
            }
          },
          orderBy: { assignedAt: 'desc' }
        }
      }
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    return {
      serviceRequestId: serviceRequest.id,
      projectName: serviceRequest.projectName,
      status: serviceRequest.status,
      employees: serviceRequest.assignedEmployees.map(ae => ({
        id: ae.employee.id,
        name: ae.employee.name,
        position: ae.employee.position,
        department: ae.employee.department,
        email: ae.employee.user.email,
        profilePhoto: ae.employee.user.profilePhoto,
        assignedAt: ae.assignedAt,
        notes: ae.notes
      })),
      totalEmployees: serviceRequest.assignedEmployees.length
    };
  }
}