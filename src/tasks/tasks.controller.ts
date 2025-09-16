import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskForEmployeeDto } from './dto/create-task-for-employee.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto, UpdateTaskStatusDto, UpdateTaskProgressDto, AssignTaskDto, CreateTaskCommentDto, CreateTaskFileDto } from './dto/query-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Role, TaskFileType, Permission } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly uploadService: UploadService
  ) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.WRITE_TASKS)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @User('id') userId: string
  ) {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Post('for-employee')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.CREATE_TASKS_FOR_OTHERS)
  @HttpCode(HttpStatus.CREATED)
  async createTaskForEmployee(
    @Body() createTaskDto: CreateTaskForEmployeeDto,
    @User() user: any
  ) {
    if (!user.employee?.id) {
      throw new BadRequestException('Employee profile not found');
    }
    return this.tasksService.createTaskForEmployee(createTaskDto, user.employee.id);
  }

  @Post('my-task')
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  async createMyTask(
    @Body() createTaskDto: Omit<CreateTaskForEmployeeDto, 'assignedToEmployeeId'>,
    @User() user: any
  ) {
    if (!user.employee?.id) {
      throw new BadRequestException('Employee profile not found');
    }

    const taskDto = {
      ...createTaskDto,
      assignedToEmployeeId: user.employee.id
    };

    return this.tasksService.createTaskForEmployee(taskDto, user.employee.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  findAll(@Query() query: QueryTasksDto) {
    return this.tasksService.findAll(query);
  }

  @Get('my-tasks')
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYEE)
  async getMyTasks(
    @Query() query: QueryTasksDto,
    @User('id') userId: string
  ) {
    // Find employee ID based on user ID
    const employee = await this.tasksService['prisma'].employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      throw new BadRequestException('Employee profile not found');
    }

    return this.tasksService.findEmployeeTasks(employee.id, query);
  }

  @Get('client')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  async getMyClientTasks(
    @Query() query: QueryTasksDto,
    @User('client') client: any
  ) {
    if (!client?.id) {
      throw new BadRequestException('Client profile not found');
    }

    return this.tasksService.findClientTasks(client.id, query);
  }

  @Get('client/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  async getClientTasks(
    @Param('clientId') clientId: string,
    @Query() query: QueryTasksDto,
    @User() user: any
  ) {
    // If user is client, they can only view their own tasks
    if (user.role === Role.CLIENT) {
      if (user.client?.id !== clientId) {
        throw new BadRequestException('You can only view your own tasks');
      }
    }

    return this.tasksService.findClientTasks(clientId, query);
  }

  @Get('kanban')
  getKanbanBoard(
    @Query('clientId') clientId?: string,
    @Query('employeeId') employeeId?: string
  ) {
    return this.tasksService.getKanbanBoard(clientId, employeeId);
  }

  @Get('stats')
  getStats(
    @Query('clientId') clientId?: string,
    @Query('employeeId') employeeId?: string
  ) {
    return this.tasksService.getStats(clientId, employeeId);
  }

  @Get('status-options')
  getStatusOptions() {
    return this.tasksService.getStatusOptions();
  }

  @Post('check-overdue')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async checkOverdueTasks() {
    return this.tasksService.checkAndUpdateOverdueTasks();
  }

  @Get('approval-center')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT, Role.EMPLOYEE)
  async getApprovalCenter(
    @Query() query: QueryTasksDto,
    @User('id') userId: string,
    @User('role') userRole: Role
  ) {
    return this.tasksService.getApprovalCenter(query, userId, userRole);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  @HttpCode(HttpStatus.OK)
  async approveTask(
    @Param('id') id: string,
    @Body() approvalDto: { comment?: string },
    @User('id') userId: string
  ) {
    return this.tasksService.approveTask(id, approvalDto.comment, userId);
  }

  @Post(':id/toggle-status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async toggleStatus(
    @Param('id') id: string,
    @User('id') userId: string,
    @User('role') userRole: Role
  ) {
    return this.tasksService.toggleStatus(id, userId, userRole);
  }

  @Post(':id/archive')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async archiveTask(
    @Param('id') id: string,
    @User('id') userId: string,
    @User('role') userRole: Role
  ) {
    return this.tasksService.archiveTask(id, userId, userRole);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTaskStatusDto,
    @User('id') userId: string,
    @User('role') userRole: Role
  ) {
    return this.tasksService.updateStatus(id, updateStatusDto, userId, userRole);
  }

  @Patch(':id/progress')
  @HttpCode(HttpStatus.OK)
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateTaskProgressDto
  ) {
    return this.tasksService.updateProgress(id, updateProgressDto);
  }

  @Post(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  assignEmployees(
    @Param('id') id: string,
    @Body() assignDto: AssignTaskDto,
    @User('id') userId: string
  ) {
    return this.tasksService.assignEmployees(id, assignDto, userId);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  addComment(
    @Param('id') id: string,
    @Body() commentDto: CreateTaskCommentDto,
    @User('id') userId: string
  ) {
    return this.tasksService.addComment(id, commentDto, userId);
  }

  @Post(':id/files/inspiration')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async addInspirationFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @User('id') userId: string,
    @Body('description') description?: string
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileUrl = await this.uploadService.uploadFile(file, 'task-files');
    
    const fileDto: CreateTaskFileDto = {
      fileName: file.originalname,
      fileUrl,
      description
    };

    return this.tasksService.addFile(id, fileDto, userId, TaskFileType.INSPIRATION);
  }

  @Post(':id/files/deliverable')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async addDeliverableFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @User('id') userId: string,
    @Body('description') description?: string
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileUrl = await this.uploadService.uploadFile(file, 'task-files');
    
    const fileDto: CreateTaskFileDto = {
      fileName: file.originalname,
      fileUrl,
      description
    };

    return this.tasksService.addFile(id, fileDto, userId, TaskFileType.DELIVERABLE);
  }

  @Post(':id/files/url')
  @HttpCode(HttpStatus.CREATED)
  addFileByUrl(
    @Param('id') id: string,
    @Body() fileDto: CreateTaskFileDto & { fileType: TaskFileType },
    @User('id') userId: string
  ) {
    return this.tasksService.addFile(id, fileDto, userId, fileDto.fileType);
  }

  @Delete(':id/files/:fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @User('id') userId: string,
    @User('role') userRole: Role
  ) {
    return this.tasksService.removeFile(id, fileId, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}