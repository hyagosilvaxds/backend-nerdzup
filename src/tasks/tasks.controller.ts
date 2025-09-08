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
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto, UpdateTaskStatusDto, UpdateTaskProgressDto, AssignTaskDto, CreateTaskCommentDto, CreateTaskFileDto } from './dto/query-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, TaskFileType } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly uploadService: UploadService
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @User('id') userId: string
  ) {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  findAll(@Query() query: QueryTasksDto) {
    return this.tasksService.findAll(query);
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
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTaskStatusDto
  ) {
    return this.tasksService.updateStatus(id, updateStatusDto);
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