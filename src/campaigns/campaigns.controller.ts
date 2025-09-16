import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CampaignsService } from './campaigns.service';
import { AssignEmployeesToCampaignDto } from './dto/assign-employees-to-campaign.dto';
import { QueryCampaignsDto } from './dto/query-campaigns.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { CreateCampaignTaskDto } from './dto/create-campaign-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { CreateCampaignCommentDto } from './dto/create-campaign-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Role, Permission } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly uploadService: UploadService
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getAllCampaigns(@Query() query: QueryCampaignsDto) {
    return this.campaignsService.findAllCampaigns(query);
  }

  @Get('admin/overview')
  @Roles(Role.ADMIN)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getAdminCampaignsOverview(@Query() query: QueryCampaignsDto) {
    return this.campaignsService.getAdminCampaignsOverview(query);
  }

  @Get('my-campaigns')
  @Roles(Role.EMPLOYEE)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getMyCampaigns(
    @Query() query: QueryCampaignsDto,
    @Request() req: any
  ) {
    const user = req.user;
    
    // Buscar o employee ID baseado no user ID
    const employee = await this.campaignsService['prisma'].employee.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      throw new BadRequestException('Employee profile not found');
    }

    return this.campaignsService.findEmployeeCampaigns(employee.id, query);
  }

  @Get('client/:clientId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getClientCampaigns(
    @Param('clientId') clientId: string,
    @Query() query: QueryCampaignsDto,
    @Request() req: any
  ) {
    const user = req.user;
    
    // Se for cliente, só pode ver suas próprias campanhas
    if (user.role === Role.CLIENT) {
      if (user.client?.id !== clientId) {
        throw new BadRequestException('You can only view your own campaigns');
      }
    }

    return this.campaignsService.findClientCampaigns(clientId, query);
  }

  @Get('client')
  @Roles(Role.CLIENT)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getMyClientCampaigns(
    @Query() query: QueryCampaignsDto,
    @Request() req: any
  ) {
    const user = req.user;
    
    if (!user.client?.id) {
      throw new BadRequestException('Client profile not found');
    }

    return this.campaignsService.findClientCampaigns(user.client.id, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getCampaignById(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const campaign = await this.campaignsService.findCampaignWithAssignees(id);
    const user = req.user;
    
    // Se for cliente, verificar se é dono da campanha
    if (user.role === Role.CLIENT) {
      if (campaign.clientId !== user.client?.id) {
        throw new BadRequestException('You can only view your own campaigns');
      }
    }

    return campaign;
  }

  @Post(':id/assign-employees')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_CAMPAIGNS)
  @HttpCode(HttpStatus.OK)
  async assignEmployeesToCampaign(
    @Param('id') campaignId: string,
    @Body() assignDto: AssignEmployeesToCampaignDto,
    @Request() req: any
  ) {
    const assignedBy = req.user.id;
    return this.campaignsService.assignEmployeesToCampaign(campaignId, assignDto, assignedBy);
  }

  @Delete(':id/employees')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_CAMPAIGNS)
  @HttpCode(HttpStatus.OK)
  async removeEmployeesFromCampaign(
    @Param('id') campaignId: string,
    @Body() body: { employeeIds: string[] },
    @Request() req: any
  ) {
    if (!body.employeeIds || !Array.isArray(body.employeeIds)) {
      throw new BadRequestException('employeeIds must be an array');
    }

    const removedBy = req.user.id;
    return this.campaignsService.removeEmployeesFromCampaign(
      campaignId,
      body.employeeIds,
      removedBy
    );
  }

  // =============== TASK MANAGEMENT ENDPOINTS ===============

  @Post(':id/tasks')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_TASKS)
  async createCampaignTask(
    @Param('id') campaignId: string,
    @Body() createTaskDto: CreateCampaignTaskDto,
    @Request() req: any
  ) {
    const user = req.user;
    let createdByEmployeeId: string | undefined = undefined;

    // Buscar o employeeId se o usuário tiver um perfil de employee
    const employee = await this.campaignsService['prisma'].employee.findUnique({
      where: { userId: user.id }
    });

    if (employee) {
      createdByEmployeeId = employee.id;
    } else if (user.role === Role.EMPLOYEE) {
      // Se é EMPLOYEE mas não tem perfil, é um erro
      throw new BadRequestException('Employee profile not found');
    }
    // Se for ADMIN sem perfil de employee, pode criar task normalmente

    return this.campaignsService.createCampaignTask(campaignId, createTaskDto, createdByEmployeeId);
  }

  @Get(':id/tasks')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_TASKS)
  async getCampaignTasks(
    @Param('id') campaignId: string,
    @Request() req: any
  ) {
    const user = req.user;

    // Se for cliente, verificar se é dono da campanha
    if (user.role === Role.CLIENT) {
      const campaign = await this.campaignsService['prisma'].campaign.findUnique({
        where: { id: campaignId }
      });

      if (!campaign || campaign.clientId !== user.client?.id) {
        throw new BadRequestException('You can only view tasks from your own campaigns');
      }
    }

    return this.campaignsService.getCampaignTasks(campaignId);
  }

  @Patch(':campaignId/tasks/:taskId/status')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_TASKS)
  async updateTaskStatus(
    @Param('campaignId') campaignId: string,
    @Param('taskId') taskId: string,
    @Body() updateStatusDto: UpdateTaskStatusDto,
    @Request() req: any
  ) {
    const user = req.user;
    let updatedByEmployeeId: string | undefined = undefined;

    console.log('updateTaskStatus controller called by user:', {
      userId: user.id,
      role: user.role,
      hasEmployee: !!user.employee
    });

    // Buscar o employeeId se o usuário tiver um perfil de employee
    const employee = await this.campaignsService['prisma'].employee.findUnique({
      where: { userId: user.id },
      include: {
        permissions: true
      }
    });

    console.log('Employee found:', {
      employee: employee ? {
        id: employee.id,
        permissions: employee.permissions.map(p => p.permission)
      } : null
    });

    if (employee) {
      updatedByEmployeeId = employee.id;
    } else if (user.role === Role.EMPLOYEE) {
      // Se é EMPLOYEE mas não tem perfil, é um erro
      throw new BadRequestException('Employee profile not found');
    }
    // Se for ADMIN sem perfil de employee, pode atualizar task normalmente

    return this.campaignsService.updateTaskStatus(campaignId, taskId, updateStatusDto, updatedByEmployeeId, user.role);
  }

  // =============== FILE UPLOAD ENDPOINTS ===============

  @Post(':campaignId/tasks/:taskId/files')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_TASKS)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadTaskFiles(
    @Param('campaignId') campaignId: string,
    @Param('taskId') taskId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { description?: string },
    @Request() req: any
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const user = req.user;

    // Verificar se o usuário é employee para pegar o employeeId
    const employee = await this.campaignsService['prisma'].employee.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      throw new BadRequestException('Employee profile not found');
    }

    // Validar tamanho dos arquivos
    for (const file of files) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        throw new BadRequestException(`File ${file.originalname} is too large. Maximum size is 100MB`);
      }
    }

    // Upload dos arquivos
    const uploadedFiles: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      description?: string;
    }> = [];
    for (const file of files) {
      try {
        const fileUrl = await this.uploadService.uploadFile(file, 'campaign-task-files');
        uploadedFiles.push({
          fileName: file.originalname,
          fileUrl,
          fileType: file.mimetype,
          fileSize: file.size,
          description: body.description
        });
      } catch (error) {
        throw new BadRequestException(`Failed to upload file ${file.originalname}: ${error.message}`);
      }
    }

    return this.campaignsService.addTaskFiles(campaignId, taskId, uploadedFiles, employee.id);
  }

  @Get(':campaignId/tasks/:taskId/files')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_TASKS)
  async getTaskFiles(
    @Param('campaignId') campaignId: string,
    @Param('taskId') taskId: string,
    @Request() req: any
  ) {
    const user = req.user;

    // Se for cliente, verificar se é dono da campanha
    if (user.role === Role.CLIENT) {
      const campaign = await this.campaignsService['prisma'].campaign.findUnique({
        where: { id: campaignId }
      });

      if (!campaign || campaign.clientId !== user.client?.id) {
        throw new BadRequestException('You can only view files from your own campaigns');
      }
    }

    return this.campaignsService.getTaskFiles(campaignId, taskId);
  }

  @Delete(':campaignId/tasks/:taskId/files/:fileId')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_TASKS)
  @HttpCode(HttpStatus.OK)
  async deleteTaskFile(
    @Param('campaignId') campaignId: string,
    @Param('taskId') taskId: string,
    @Param('fileId') fileId: string,
    @Request() req: any
  ) {
    const user = req.user;

    // Verificar se o usuário é employee para pegar o employeeId
    const employee = await this.campaignsService['prisma'].employee.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      throw new BadRequestException('Employee profile not found');
    }

    return this.campaignsService.deleteTaskFile(campaignId, taskId, fileId, employee.id);
  }

  // =============== CAMPAIGN DOCUMENTS AND DETAILS ===============

  @Get(':id/documents')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getCampaignDocuments(@Param('id') campaignId: string) {
    return this.campaignsService.getCampaignDocuments(campaignId);
  }

  @Get(':campaignId/tasks/:taskId/details')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_TASKS)
  async getTaskDetails(
    @Param('campaignId') campaignId: string,
    @Param('taskId') taskId: string
  ) {
    return this.campaignsService.getTaskDetails(campaignId, taskId);
  }

  // =============== TASK COMMENTS ===============

  @Post(':campaignId/tasks/:taskId/comments')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.WRITE_TASKS)
  async createTaskComment(
    @Param('campaignId') campaignId: string,
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateTaskCommentDto,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return this.campaignsService.createTaskComment(campaignId, taskId, createCommentDto, userId);
  }

  @Get(':campaignId/tasks/:taskId/comments')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_TASKS)
  async getTaskComments(
    @Param('campaignId') campaignId: string,
    @Param('taskId') taskId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.campaignsService.getTaskComments(campaignId, taskId, page, limit);
  }

  @Delete(':campaignId/tasks/:taskId/comments/:commentId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.WRITE_TASKS)
  @HttpCode(HttpStatus.OK)
  async deleteTaskComment(
    @Param('campaignId') campaignId: string,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return this.campaignsService.deleteTaskComment(campaignId, taskId, commentId, userId);
  }

  // =============== CAMPAIGN COMMENTS ===============

  @Post(':id/comments')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.WRITE_CAMPAIGNS)
  async createCampaignComment(
    @Param('id') campaignId: string,
    @Body() createCommentDto: CreateCampaignCommentDto,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return this.campaignsService.createCampaignComment(campaignId, createCommentDto, userId);
  }

  @Get(':id/comments')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getCampaignComments(
    @Param('id') campaignId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.campaignsService.getCampaignComments(campaignId, page, limit);
  }

  @Delete(':id/comments/:commentId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  @Permissions(Permission.WRITE_CAMPAIGNS)
  @HttpCode(HttpStatus.OK)
  async deleteCampaignComment(
    @Param('id') campaignId: string,
    @Param('commentId') commentId: string,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return this.campaignsService.deleteCampaignComment(campaignId, commentId, userId);
  }

  // =============== TASK LISTING ENDPOINTS ===============

  @Get('tasks/my-tasks')
  @Roles(Role.EMPLOYEE)
  @Permissions(Permission.READ_TASKS)
  async getMyTasks(
    @Query() query: QueryTasksDto,
    @Request() req: any
  ) {
    const user = req.user;

    // Buscar o employee ID baseado no user ID
    const employee = await this.campaignsService['prisma'].employee.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      throw new BadRequestException('Employee profile not found');
    }

    return this.campaignsService.findEmployeeTasks(employee.id, query);
  }

  @Get('tasks/admin/all')
  @Roles(Role.ADMIN)
  @Permissions(Permission.READ_TASKS)
  async getAllTasks(@Query() query: QueryTasksDto) {
    return this.campaignsService.findAllTasks(query);
  }

  @Get('tasks/client')
  @Roles(Role.CLIENT)
  @Permissions(Permission.READ_TASKS)
  async getMyClientTasks(
    @Query() query: QueryTasksDto,
    @Request() req: any
  ) {
    const user = req.user;

    if (!user.client?.id) {
      throw new BadRequestException('Client profile not found');
    }

    return this.campaignsService.findClientTasks(user.client.id, query);
  }

  @Get('tasks/client/:clientId')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.READ_TASKS)
  async getClientTasks(
    @Param('clientId') clientId: string,
    @Query() query: QueryTasksDto
  ) {
    return this.campaignsService.findClientTasks(clientId, query);
  }
}