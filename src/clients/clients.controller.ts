import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';
import { Role, Permission } from '@prisma/client';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_CLIENTS)
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.READ_CLIENTS)
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_CLIENTS)
  findOne(@Param('id') id: string, @User() user: any) {
    // Clients can only see their own data
    if (user.role === Role.CLIENT && user.client?.id !== id) {
      throw new Error('Forbidden');
    }
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.WRITE_CLIENTS)
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @User() user: any) {
    // Clients can only update their own data
    if (user.role === Role.CLIENT && user.client?.id !== id) {
      throw new Error('Forbidden');
    }
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.DELETE_CLIENTS)
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_CLIENTS)
  toggleStatus(@Param('id') id: string) {
    return this.clientsService.toggleStatus(id);
  }
}