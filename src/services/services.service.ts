import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServicesDto, UpdateServiceRatingDto } from './dto/query-services.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    // Verifica se a categoria existe
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: createServiceDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Categoria não encontrada');
    }

    const existingService = await this.prisma.service.findUnique({
      where: { name: createServiceDto.name },
    });

    if (existingService) {
      throw new BadRequestException('Serviço com este nome já existe');
    }

    return this.prisma.service.create({
      data: createServiceDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryServicesDto) {
    const where: any = {};
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Filtros básicos
    if (query.activeOnly) {
      where.isActive = true;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    if (query.featuredOnly) {
      where.isFeatured = true;
    }

    // Filtros de range
    if (query.minCredits !== undefined || query.maxCredits !== undefined) {
      where.credits = {};
      if (query.minCredits !== undefined) {
        where.credits.gte = query.minCredits;
      }
      if (query.maxCredits !== undefined) {
        where.credits.lte = query.maxCredits;
      }
    }

    if (query.minDays !== undefined || query.maxDays !== undefined) {
      where.estimatedDays = {};
      if (query.minDays !== undefined) {
        where.estimatedDays.gte = query.minDays;
      }
      if (query.maxDays !== undefined) {
        where.estimatedDays.lte = query.maxDays;
      }
    }

    if (query.minRating !== undefined) {
      where.rating = { gte: query.minRating };
    }

    // Busca por texto
    if (query.search) {
      where.OR = [
        {
          displayName: {
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
        {
          shortDescription: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            hasSome: [query.search.toLowerCase()],
          },
        },
      ];
    }

    // Filtro por tags
    if (query.tags) {
      const tagsArray = query.tags.split(',').map(tag => tag.trim().toLowerCase());
      where.tags = {
        hassome: tagsArray,
      };
    }

    // Ordenação
    const orderBy: any = [];
    
    if (query.sortBy === 'credits') {
      orderBy.push({ credits: query.sortOrder });
    } else if (query.sortBy === 'rating') {
      orderBy.push({ rating: query.sortOrder });
    } else if (query.sortBy === 'estimatedDays') {
      orderBy.push({ estimatedDays: query.sortOrder });
    } else if (query.sortBy === 'createdAt') {
      orderBy.push({ createdAt: query.sortOrder });
    } else {
      // Padrão: order
      orderBy.push({ order: 'asc' });
      orderBy.push({ displayName: 'asc' });
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              displayName: true,
              color: true,
            },
          },
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
            iconUrl: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }

    return service;
  }

  async findByName(name: string) {
    const service = await this.prisma.service.findUnique({
      where: { name },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
            iconUrl: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Serviço com nome '${name}' não encontrado`);
    }

    if (!service.isActive) {
      throw new BadRequestException('Serviço está inativo');
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id); // Verifica se existe

    if (updateServiceDto.name) {
      const existingService = await this.prisma.service.findUnique({
        where: { 
          name: updateServiceDto.name,
          NOT: { id },
        },
      });

      if (existingService) {
        throw new BadRequestException('Serviço com este nome já existe');
      }
    }

    if (updateServiceDto.categoryId) {
      const category = await this.prisma.serviceCategory.findUnique({
        where: { id: updateServiceDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Categoria não encontrada');
      }
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.service.delete({
      where: { id },
    });
  }

  async activate(id: string) {
    return this.prisma.service.update({
      where: { id },
      data: { isActive: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
    });
  }

  async deactivate(id: string) {
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
    });
  }

  async toggleFeatured(id: string) {
    const service = await this.findOne(id);
    
    return this.prisma.service.update({
      where: { id },
      data: { isFeatured: !service.isFeatured },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
    });
  }

  async updateRating(id: string, updateRatingDto: UpdateServiceRatingDto) {
    const service = await this.findOne(id);
    
    // Recalcula a média ponderada
    const totalRating = service.rating * service.ratingCount + updateRatingDto.rating;
    const newRatingCount = service.ratingCount + 1;
    const newRating = totalRating / newRatingCount;

    return this.prisma.service.update({
      where: { id },
      data: { 
        rating: Math.round(newRating * 10) / 10, // Arredonda para 1 casa decimal
        ratingCount: newRatingCount,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
    });
  }

  async reorderInCategory(categoryId: string, serviceIds: string[]) {
    // Verifica se a categoria existe
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException('Categoria não encontrada');
    }

    const operations = serviceIds.map((id, index) =>
      this.prisma.service.update({
        where: { id, categoryId },
        data: { order: index + 1 },
      })
    );

    await this.prisma.$transaction(operations);

    return { message: 'Serviços reordenados com sucesso' };
  }

  async getFeaturedServices(limit: number = 6) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { rating: 'desc' },
      ],
      take: limit,
    });
  }

  async getPopularServices(limit: number = 6) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        ratingCount: { gt: 0 },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { ratingCount: 'desc' },
      ],
      take: limit,
    });
  }

  async getServicesByDifficulty(difficulty: string) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        difficulty: difficulty as any,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { displayName: 'asc' },
      ],
    });
  }

  async getStats() {
    const [
      totalServices,
      activeServices,
      featuredServices,
      avgRating,
      totalCredits,
      avgCredits,
      servicesByDifficulty,
      topRatedServices,
    ] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.service.count({ where: { isActive: true, isFeatured: true } }),
      this.prisma.service.aggregate({
        where: { isActive: true },
        _avg: { rating: true },
      }),
      this.prisma.service.aggregate({
        where: { isActive: true },
        _sum: { credits: true },
      }),
      this.prisma.service.aggregate({
        where: { isActive: true },
        _avg: { credits: true },
      }),
      this.prisma.service.groupBy({
        by: ['difficulty'],
        where: { isActive: true },
        _count: { difficulty: true },
      }),
      this.prisma.service.findMany({
        where: { isActive: true, ratingCount: { gt: 0 } },
        select: {
          id: true,
          displayName: true,
          rating: true,
          ratingCount: true,
        },
        orderBy: { rating: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalServices,
      activeServices,
      featuredServices,
      avgRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
      totalCredits: totalCredits._sum.credits || 0,
      avgCredits: Math.round(avgCredits._avg.credits || 0),
      servicesByDifficulty: servicesByDifficulty.map(item => ({
        difficulty: item.difficulty,
        count: item._count.difficulty,
      })),
      topRatedServices,
    };
  }
}