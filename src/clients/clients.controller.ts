import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AddClientNoteDto } from './dto/add-client-note.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { QueryClientsDto } from './dto/query-clients.dto';
import { AdjustCreditsDto } from './dto/adjust-credits.dto';
import { UploadLibraryFileDto } from './dto/upload-library-file.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
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
  findAll(@Query() query: QueryClientsDto) {
    return this.clientsService.findAll(query);
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

  // =============== NEW ENDPOINTS ===============

  @Post('change-password')
  @Roles(Role.CLIENT)
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @User() user: any) {
    return this.clientsService.changePassword(user.id, changePasswordDto);
  }

  @Post(':id/notes')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_CLIENTS)
  addNote(@Param('id') id: string, @Body() addNoteDto: AddClientNoteDto, @User() user: any) {
    return this.clientsService.addNote(id, addNoteDto.note, user.id);
  }

  @Get(':id/notes')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.READ_CLIENTS)
  getNotes(@Param('id') id: string) {
    return this.clientsService.getNotes(id);
  }

  @Get(':id/files')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_CLIENTS)
  getFiles(@Param('id') id: string, @User() user: any) {
    if (user.role === Role.CLIENT && user.client?.id !== id) {
      throw new BadRequestException('Forbidden');
    }
    return this.clientsService.getFiles(id);
  }

  @Get(':id/service-requests-history')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_CLIENTS)
  getServiceRequestsHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @User() user?: any
  ) {
    if (user?.role === Role.CLIENT && user.client?.id !== id) {
      throw new BadRequestException('Forbidden');
    }
    const pageNum = parseInt(page || '1') || 1;
    const limitNum = parseInt(limit || '10') || 10;
    return this.clientsService.getServiceRequestsHistory(id, pageNum, limitNum, status);
  }

  @Patch(':id/suspend')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_CLIENTS)
  @HttpCode(HttpStatus.OK)
  suspendAccount(@Param('id') id: string, @User() user: any) {
    return this.clientsService.suspendAccount(id, user.id);
  }

  @Patch(':id/unsuspend')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_CLIENTS)
  @HttpCode(HttpStatus.OK)
  unsuspendAccount(@Param('id') id: string, @User() user: any) {
    return this.clientsService.unsuspendAccount(id, user.id);
  }

  @Post(':id/profile-photo')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @UseInterceptors(FileInterceptor('photo', {
    storage: require('multer').diskStorage({
      destination: './uploads/profile-photos',
      filename: (req, file, cb) => {
        const uniqueSuffix = require('uuid').v4();
        const fileExt = require('path').extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  @HttpCode(HttpStatus.OK)
  uploadProfilePhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @User() user: any,
  ) {
    // Verificar se o usuário pode alterar a foto
    if (user.role === Role.CLIENT && user.client?.id !== id) {
      throw new BadRequestException('Você só pode alterar sua própria foto de perfil');
    }
    
    if (!file) {
      throw new BadRequestException('Nenhuma imagem foi enviada');
    }

    return this.clientsService.updateProfilePhoto(id, file);
  }

  @Get(':id/wallet')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_CLIENTS)
  getWallet(@Param('id') id: string, @User() user: any) {
    if (user.role === Role.CLIENT && user.client?.id !== id) {
      throw new BadRequestException('Forbidden');
    }
    return this.clientsService.getWalletDetails(id);
  }

  @Patch(':id/adjust-credits')
  @Roles(Role.ADMIN)
  @Permissions(Permission.WRITE_CLIENTS)
  @HttpCode(HttpStatus.OK)
  adjustCredits(@Param('id') id: string, @Body() adjustCreditsDto: AdjustCreditsDto, @User() user: any) {
    return this.clientsService.adjustCredits(id, adjustCreditsDto, user.id);
  }

  @Post(':id/library/upload')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @UseInterceptors(FileInterceptor('file', {
    storage: require('multer').diskStorage({
      destination: './uploads/client-library',
      filename: (req, file, cb) => {
        const uniqueSuffix = require('uuid').v4();
        const fileExt = require('path').extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  }))
  @HttpCode(HttpStatus.CREATED)
  uploadLibraryFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadLibraryFileDto,
    @User() user: any,
  ) {
    // Verificar se o usuário pode fazer upload para este cliente
    if (user.role === Role.CLIENT && user.client?.id !== id) {
      throw new BadRequestException('Você só pode fazer upload para sua própria biblioteca');
    }
    
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    return this.clientsService.uploadLibraryFile(id, file, uploadDto, user.id);
  }

  @Delete(':id/library/:fileId')
  @Roles(Role.ADMIN)
  @Permissions(Permission.DELETE_CLIENTS)
  @HttpCode(HttpStatus.OK)
  deleteLibraryFile(@Param('id') id: string, @Param('fileId') fileId: string, @User() user: any) {
    return this.clientsService.deleteLibraryFile(id, fileId, user.id);
  }

  @Patch(':id/admin-change-password')
  @Roles(Role.ADMIN)
  @Permissions(Permission.WRITE_CLIENTS)
  @HttpCode(HttpStatus.OK)
  adminChangePassword(@Param('id') id: string, @Body() adminChangePasswordDto: AdminChangePasswordDto, @User() user: any) {
    return this.clientsService.adminChangePassword(id, adminChangePasswordDto, user.id);
  }

  @Get('export/csv')
  @Roles(Role.ADMIN)
  @Permissions(Permission.READ_CLIENTS)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="clients-export.csv"')
  async exportClientsCsv(@Query() query: QueryClientsDto, @Res() res: Response) {
    const csvData = await this.clientsService.exportClientsToCsv(query);
    res.send(csvData);
  }
}