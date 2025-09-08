import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

  async findAll() {
    return this.prisma.client.findMany({
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
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            budget: true,
          },
        },
      },
    });
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
}