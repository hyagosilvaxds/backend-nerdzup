import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { QueryServiceCategoriesDto } from './dto/query-services.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto) {
    const existingCategory = await this.prisma.serviceCategory.findUnique({
      where: { name: createServiceCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException('Categoria com este nome já existe');
    }

    return this.prisma.serviceCategory.create({
      data: createServiceCategoryDto,
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryServiceCategoriesDto) {
    const where: any = {};

    if (query.activeOnly) {
      where.isActive = true;
    }

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
      ];
    }

    return this.prisma.serviceCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            services: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { displayName: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            displayName: true,
            shortDescription: true,
            credits: true,
            estimatedDays: true,
            difficulty: true,
            rating: true,
            iconUrl: true,
            isActive: true,
            isFeatured: true,
            order: true,
          },
          orderBy: [
            { order: 'asc' },
            { displayName: 'asc' },
          ],
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    return category;
  }

  async findByName(name: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { name },
      include: {
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            displayName: true,
            shortDescription: true,
            credits: true,
            estimatedDays: true,
            difficulty: true,
            rating: true,
            iconUrl: true,
            isActive: true,
            isFeatured: true,
            order: true,
          },
          orderBy: [
            { order: 'asc' },
            { displayName: 'asc' },
          ],
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com nome '${name}' não encontrada`);
    }

    return category;
  }

  async update(id: string, updateServiceCategoryDto: UpdateServiceCategoryDto) {
    await this.findOne(id); // Verifica se existe

    if (updateServiceCategoryDto.name) {
      const existingCategory = await this.prisma.serviceCategory.findUnique({
        where: { 
          name: updateServiceCategoryDto.name,
          NOT: { id },
        },
      });

      if (existingCategory) {
        throw new BadRequestException('Categoria com este nome já existe');
      }
    }

    return this.prisma.serviceCategory.update({
      where: { id },
      data: updateServiceCategoryDto,
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    // Verifica se há serviços vinculados
    const servicesCount = await this.prisma.service.count({
      where: { categoryId: id },
    });

    if (servicesCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir a categoria. Existem ${servicesCount} serviços vinculados a ela.`
      );
    }

    return this.prisma.serviceCategory.delete({
      where: { id },
    });
  }

  async activate(id: string) {
    return this.prisma.serviceCategory.update({
      where: { id },
      data: { isActive: true },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });
  }

  async deactivate(id: string) {
    return this.prisma.serviceCategory.update({
      where: { id },
      data: { isActive: false },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });
  }

  async reorder(categoryIds: string[]) {
    const operations = categoryIds.map((id, index) =>
      this.prisma.serviceCategory.update({
        where: { id },
        data: { order: index + 1 },
      })
    );

    await this.prisma.$transaction(operations);

    return { message: 'Categorias reordenadas com sucesso' };
  }

  async getStats() {
    const [
      totalCategories,
      activeCategories,
      totalServices,
      activeServices,
      categoriesWithMostServices,
    ] = await Promise.all([
      this.prisma.serviceCategory.count(),
      this.prisma.serviceCategory.count({ where: { isActive: true } }),
      this.prisma.service.count(),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.serviceCategory.findMany({
        take: 5,
        include: {
          _count: {
            select: {
              services: {
                where: { isActive: true },
              },
            },
          },
        },
        orderBy: {
          services: {
            _count: 'desc',
          },
        },
      }),
    ]);

    return {
      totalCategories,
      activeCategories,
      totalServices,
      activeServices,
      categoriesWithMostServices: categoriesWithMostServices.map(category => ({
        id: category.id,
        name: category.displayName,
        servicesCount: category._count.services,
      })),
    };
  }
}