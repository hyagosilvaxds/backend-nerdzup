import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { QueryClientsDto } from './dto/query-clients.dto';
import { AdjustCreditsDto } from './dto/adjust-credits.dto';
import { UploadLibraryFileDto } from './dto/upload-library-file.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createClientDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createClientDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: createClientDto.email,
        password: hashedPassword,
        role: Role.CLIENT,
        client: {
          create: {
            fullName: createClientDto.fullName,
            personType: createClientDto.personType,
            taxDocument: createClientDto.taxDocument,
            position: createClientDto.position,
            companyName: createClientDto.companyName,
            tradeName: createClientDto.tradeName,
            sector: createClientDto.sector,
            companySize: createClientDto.companySize,
            website: createClientDto.website,
            phone: createClientDto.phone,
            street: createClientDto.street,
            city: createClientDto.city,
            state: createClientDto.state,
            zipCode: createClientDto.zipCode,
            country: createClientDto.country || 'Brasil',
          },
        },
      },
      include: {
        client: true,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll(query: QueryClientsDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    // Construir filtros de busca
    const where: any = {};
    
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { tradeName: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    // Configurar ordenação
    const orderBy: any = {};
    switch (query.sortBy) {
      case 'fullName':
        orderBy.fullName = query.sortOrder;
        break;
      case 'companyName':
        orderBy.companyName = query.sortOrder;
        break;
      case 'createdAt':
      default:
        orderBy.createdAt = query.sortOrder;
        break;
    }

    // Executar queries em paralelo para obter dados e contagem total
    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
              profilePhoto: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          wallet: true,
          subscriptions: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                  monthlyPrice: true,
                  monthlyCredits: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.client.count({ where })
    ]);

    // Calculate total spent for each client
    const clientsWithTotalSpent = await Promise.all(
      clients.map(async (client) => {
        const totalSpent = await this.prisma.transaction.aggregate({
          where: {
            clientId: client.id,
            type: 'SERVICE_CONSUMPTION',
          },
          _sum: {
            amount: true,
          },
        });

        return {
          ...client,
          totalSpent: totalSpent._sum.amount?.toNumber() || 0,
          currentPlan: client.subscriptions[0] || null,
        };
      })
    );

    // Se a ordenação for por totalSpent, ordenar em memória
    if (query.sortBy === 'totalSpent') {
      clientsWithTotalSpent.sort((a, b) => {
        const aValue = a.totalSpent;
        const bValue = b.totalSpent;
        return query.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    }

    return {
      clients: clientsWithTotalSpent,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            profilePhoto: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        campaigns: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                position: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Delete the user (cascade will delete client)
    await this.prisma.user.delete({
      where: { id: client.userId },
    });

    return { message: 'Client deleted successfully' };
  }

  async toggleStatus(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: client.userId },
      data: { isActive: !client.user.isActive },
      include: {
        client: true,
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  // =============== NEW METHODS ===============

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async addNote(clientId: string, note: string, authorId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const clientNote = await this.prisma.clientNote.create({
      data: {
        clientId,
        note,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return clientNote;
  }

  async getNotes(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.clientNote.findMany({
      where: { clientId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFiles(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Get files from service requests (documents uploaded by client)
    const serviceRequestFiles = await this.prisma.serviceRequest.findMany({
      where: { clientId },
      select: {
        id: true,
        projectName: true,
        documentUrls: true,
        createdAt: true,
        service: {
          select: {
            displayName: true,
          },
        },
      },
    });

    // Get files from tasks (deliverables sent to client)
    const taskFiles = await this.prisma.taskFile.findMany({
      where: {
        task: {
          clientId: clientId,
        },
        fileType: 'DELIVERABLE',
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // Format service request files
    const clientUploadedFiles = serviceRequestFiles.flatMap((sr) =>
      sr.documentUrls.map((url) => ({
        id: `${sr.id}-${url}`,
        fileName: url.split('/').pop(),
        fileUrl: url,
        fileType: 'CLIENT_UPLOAD',
        uploadedAt: sr.createdAt,
        source: {
          type: 'service_request',
          id: sr.id,
          name: sr.projectName,
          service: sr.service.displayName,
        },
      }))
    );

    // Format task deliverable files
    const deliverableFiles = taskFiles.map((tf) => ({
      id: tf.id,
      fileName: tf.fileName,
      fileUrl: tf.fileUrl,
      fileType: tf.fileType,
      uploadedAt: tf.uploadedAt,
      description: tf.description,
      uploadedBy: tf.uploadedBy,
      source: {
        type: 'task_deliverable',
        id: tf.taskId,
        name: tf.task.title,
      },
    }));

    // Get library files
    const libraryFiles = await this.prisma.clientLibraryFile.findMany({
      where: { clientId },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                name: true,
              },
            },
            client: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // Format library files
    const formattedLibraryFiles = libraryFiles.map((lf) => ({
      id: lf.id,
      fileName: lf.originalName,
      fileUrl: lf.fileUrl,
      fileType: 'LIBRARY',
      fileSize: lf.fileSize,
      mimeType: lf.mimeType,
      uploadedAt: lf.uploadedAt,
      description: lf.description,
      uploadedBy: lf.uploader.employee?.name || lf.uploader.client?.fullName || lf.uploader.email,
      libraryFileType: lf.fileType,
      source: {
        type: 'client_library',
        id: lf.id,
        name: 'Client Library',
      },
    }));

    return {
      clientUploads: clientUploadedFiles,
      deliverables: deliverableFiles,
      libraryFiles: formattedLibraryFiles,
      totalFiles: clientUploadedFiles.length + deliverableFiles.length + formattedLibraryFiles.length,
    };
  }

  async getServiceRequestsHistory(clientId: string, page: number, limit: number, status?: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const where: any = { clientId };
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [serviceRequests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              displayName: true,
              category: {
                select: {
                  name: true,
                  displayName: true,
                },
              },
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              progress: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return {
      requests: serviceRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async suspendAccount(clientId: string, suspendedBy: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: client.userId },
      data: { isActive: false },
      include: {
        client: true,
      },
    });

    // Add note about suspension
    await this.prisma.clientNote.create({
      data: {
        clientId,
        note: `Account suspended by admin/employee`,
        authorId: suspendedBy,
      },
    });

    const { password, ...result } = updatedUser;
    return { ...result, message: 'Account suspended successfully' };
  }

  async unsuspendAccount(clientId: string, unsuspendedBy: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: client.userId },
      data: { isActive: true },
      include: {
        client: true,
      },
    });

    // Add note about unsuspension
    await this.prisma.clientNote.create({
      data: {
        clientId,
        note: `Account reactivated by admin/employee`,
        authorId: unsuspendedBy,
      },
    });

    const { password, ...result } = updatedUser;
    return { ...result, message: 'Account reactivated successfully' };
  }

  async getWalletDetails(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        wallet: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: {
            plan: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const totalSpent = await this.prisma.transaction.aggregate({
      where: {
        clientId: client.id,
        type: 'SERVICE_CONSUMPTION',
      },
      _sum: {
        amount: true,
      },
    });

    return {
      wallet: client.wallet,
      recentTransactions: client.transactions || [],
      currentPlan: client.subscriptions[0] || null,
      totalSpent: totalSpent._sum.amount?.toNumber() || 0,
    };
  }

  async updateProfilePhoto(clientId: string, file: Express.Multer.File) {
    // Verificar se o cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Gerar URL da foto
    const photoUrl = `/uploads/profile-photos/${file.filename}`;

    // Atualizar a foto de perfil do usuário
    const updatedUser = await this.prisma.user.update({
      where: { id: client.userId },
      data: { profilePhoto: photoUrl },
      select: {
        id: true,
        email: true,
        profilePhoto: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Foto de perfil atualizada com sucesso',
      profilePhoto: updatedUser.profilePhoto,
      fileName: file.filename,
      originalName: file.originalname,
      uploadedAt: new Date(),
    };
  }

  async adjustCredits(clientId: string, adjustCreditsDto: AdjustCreditsDto, adminId: string) {
    const { credits, reason } = adjustCreditsDto;

    // Verificar se o cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { wallet: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Se não há wallet, criar um
    let wallet = client.wallet;
    if (!wallet) {
      wallet = await this.prisma.clientWallet.create({
        data: {
          clientId: clientId,
          availableCredits: 0,
          totalEarned: 0,
          totalSpent: 0,
        },
      });
    }

    // Atualizar os créditos da carteira
    const updatedWallet = await this.prisma.clientWallet.update({
      where: { id: wallet.id },
      data: {
        availableCredits: wallet.availableCredits + credits,
        totalEarned: wallet.totalEarned + credits,
      },
    });

    // Criar registro na transação
    const transaction = await this.prisma.transaction.create({
      data: {
        clientId: clientId,
        type: 'CREDIT_ADJUSTMENT',
        amount: new Prisma.Decimal(0), // Ajuste manual não tem valor monetário
        credits: credits,
        description: reason || 'Ajuste manual de créditos pelo administrador',
        paymentMethod: 'CREDIT_CARD', // Campo obrigatório, mas não relevante para ajustes
        status: 'COMPLETED',
      },
    });

    // Adicionar nota no cliente sobre o ajuste
    await this.prisma.clientNote.create({
      data: {
        clientId,
        note: `Créditos ajustados: +${credits} créditos. Motivo: ${reason || 'Ajuste manual'}`,
        authorId: adminId,
      },
    });

    return {
      message: 'Créditos ajustados com sucesso',
      wallet: updatedWallet,
      transaction: {
        id: transaction.id,
        credits: transaction.credits,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
      adjustment: {
        credits: credits,
        reason: reason || 'Ajuste manual',
        adjustedBy: adminId,
        adjustedAt: new Date(),
      },
    };
  }

  async uploadLibraryFile(clientId: string, file: Express.Multer.File, uploadDto: UploadLibraryFileDto, uploadedBy: string) {
    // Verificar se o cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Gerar URL do arquivo
    const fileUrl = `/uploads/client-library/${file.filename}`;

    // Criar registro do arquivo na biblioteca
    const libraryFile = await this.prisma.clientLibraryFile.create({
      data: {
        clientId: clientId,
        fileName: file.filename,
        originalName: file.originalname,
        fileUrl: fileUrl,
        fileType: uploadDto.fileType || 'OTHER',
        fileSize: file.size,
        mimeType: file.mimetype,
        description: uploadDto.description,
        uploadedBy: uploadedBy,
      },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                name: true,
              },
            },
            client: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Arquivo adicionado à biblioteca com sucesso',
      file: {
        id: libraryFile.id,
        fileName: libraryFile.fileName,
        originalName: libraryFile.originalName,
        fileUrl: libraryFile.fileUrl,
        fileType: libraryFile.fileType,
        fileSize: libraryFile.fileSize,
        mimeType: libraryFile.mimeType,
        description: libraryFile.description,
        uploadedAt: libraryFile.uploadedAt,
        uploadedBy: {
          id: libraryFile.uploader.id,
          email: libraryFile.uploader.email,
          name: libraryFile.uploader.employee?.name || libraryFile.uploader.client?.fullName || 'Unknown',
        },
      },
    };
  }

  async deleteLibraryFile(clientId: string, fileId: string, deletedBy: string) {
    // Verificar se o cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Verificar se o arquivo existe e pertence ao cliente
    const libraryFile = await this.prisma.clientLibraryFile.findFirst({
      where: {
        id: fileId,
        clientId: clientId,
      },
    });

    if (!libraryFile) {
      throw new NotFoundException('Arquivo não encontrado na biblioteca do cliente');
    }

    // Tentar deletar o arquivo físico
    const filePath = path.join(process.cwd(), 'uploads', 'client-library', libraryFile.fileName);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Não foi possível deletar o arquivo físico: ${filePath}`, error);
      // Continua mesmo se não conseguir deletar o arquivo físico
    }

    // Deletar o registro do banco de dados
    await this.prisma.clientLibraryFile.delete({
      where: { id: fileId },
    });

    // Adicionar nota no cliente sobre a exclusão
    await this.prisma.clientNote.create({
      data: {
        clientId,
        note: `Arquivo da biblioteca removido: "${libraryFile.originalName}" (${libraryFile.fileType})`,
        authorId: deletedBy,
      },
    });

    return {
      message: 'Arquivo removido da biblioteca com sucesso',
      deletedFile: {
        id: libraryFile.id,
        originalName: libraryFile.originalName,
        fileType: libraryFile.fileType,
        fileSize: libraryFile.fileSize,
        deletedAt: new Date(),
        deletedBy: deletedBy,
      },
    };
  }

  async adminChangePassword(clientId: string, adminChangePasswordDto: AdminChangePasswordDto, adminId: string) {
    const { newPassword } = adminChangePasswordDto;

    // Verificar se o cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar a senha do usuário
    await this.prisma.user.update({
      where: { id: client.userId },
      data: { password: hashedNewPassword },
    });

    // Adicionar nota no cliente sobre a alteração de senha
    await this.prisma.clientNote.create({
      data: {
        clientId,
        note: `Senha alterada pelo administrador`,
        authorId: adminId,
      },
    });

    return {
      message: 'Senha alterada com sucesso pelo administrador',
      clientId: clientId,
      userId: client.userId,
      changedBy: adminId,
      changedAt: new Date(),
    };
  }
}