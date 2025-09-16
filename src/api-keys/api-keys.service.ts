import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { QueryApiKeysDto } from './dto/query-api-keys.dto';
import { ApiKeyProvider } from '@prisma/client';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class ApiKeysService {
  private readonly encryptionKey: string;

  constructor(private prisma: PrismaService) {
    this.encryptionKey = process.env.API_KEY_ENCRYPTION_SECRET || 'default-secret-key-change-in-production';
  }

  private encryptApiKey(apiKey: string): string {
    return CryptoJS.AES.encrypt(apiKey, this.encryptionKey).toString();
  }

  private decryptApiKey(encryptedApiKey: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedApiKey, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new BadRequestException('Failed to decrypt API key');
    }
  }

  async create(createApiKeyDto: CreateApiKeyDto, createdBy: string) {
    // Verificar se já existe uma chave ativa para o mesmo provedor e ambiente
    const existingActiveKey = await this.prisma.apiKey.findFirst({
      where: {
        provider: createApiKeyDto.provider,
        environment: createApiKeyDto.environment || 'production',
        isActive: true,
      },
    });

    if (existingActiveKey) {
      throw new BadRequestException(
        `An active ${createApiKeyDto.provider} key already exists for ${createApiKeyDto.environment || 'production'} environment`
      );
    }

    // Criptografar a chave antes de salvar
    const encryptedKey = this.encryptApiKey(createApiKeyDto.keyValue);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        ...createApiKeyDto,
        keyValue: encryptedKey,
        createdBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Não retornar a chave descriptografada na resposta
    return {
      ...apiKey,
      keyValue: '***ENCRYPTED***',
    };
  }

  async findAll(query: QueryApiKeysDto) {
    const where: any = {};
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    if (query.provider) {
      where.provider = query.provider;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.environment) {
      where.environment = query.environment;
    }

    if (query.search) {
      where.OR = [
        {
          name: {
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

    const [apiKeys, total] = await Promise.all([
      this.prisma.apiKey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.apiKey.count({ where }),
    ]);

    // Mascarar as chaves na listagem
    const maskedApiKeys = apiKeys.map(key => ({
      ...key,
      keyValue: '***ENCRYPTED***',
    }));

    return {
      apiKeys: maskedApiKeys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, includeKey: boolean = false) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (includeKey) {
      return {
        ...apiKey,
        keyValue: this.decryptApiKey(apiKey.keyValue),
      };
    }

    return {
      ...apiKey,
      keyValue: '***ENCRYPTED***',
    };
  }

  async update(id: string, updateApiKeyDto: UpdateApiKeyDto) {
    const apiKey = await this.findOne(id);

    const updateData: any = { ...updateApiKeyDto };

    // Se uma nova chave está sendo fornecida, criptografá-la
    if (updateApiKeyDto.keyValue) {
      updateData.keyValue = this.encryptApiKey(updateApiKeyDto.keyValue);
    }

    const updatedApiKey = await this.prisma.apiKey.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      ...updatedApiKey,
      keyValue: '***ENCRYPTED***',
    };
  }

  async remove(id: string) {
    const apiKey = await this.findOne(id);

    await this.prisma.apiKey.delete({
      where: { id },
    });

    return { message: 'API key deleted successfully' };
  }

  async toggleActive(id: string) {
    const apiKey = await this.findOne(id);

    const updatedApiKey = await this.prisma.apiKey.update({
      where: { id },
      data: { isActive: !apiKey.isActive },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      ...updatedApiKey,
      keyValue: '***ENCRYPTED***',
    };
  }

  async getActiveKey(provider: ApiKeyProvider, environment: string = 'production'): Promise<string | null> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        provider,
        environment,
        isActive: true,
      },
    });

    if (!apiKey) {
      return null;
    }

    // Atualizar contador de uso e data de último uso
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    return this.decryptApiKey(apiKey.keyValue);
  }

  async getStats() {
    const [total, byProvider, active, recentlyUsed] = await Promise.all([
      this.prisma.apiKey.count(),
      this.prisma.apiKey.groupBy({
        by: ['provider'],
        _count: { provider: true },
      }),
      this.prisma.apiKey.count({
        where: { isActive: true },
      }),
      this.prisma.apiKey.count({
        where: {
          lastUsed: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 dias
          },
        },
      }),
    ]);

    return {
      total,
      active,
      recentlyUsed,
      byProvider: byProvider.reduce((acc, item) => {
        acc[item.provider] = item._count.provider;
        return acc;
      }, {}),
    };
  }
}