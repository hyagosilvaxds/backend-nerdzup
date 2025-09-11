import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { ApproveServiceRequestDto, RejectServiceRequestDto } from './dto/approve-service-request.dto';
import { AssignServiceRequestDto } from './dto/assign-service-request.dto';
import { QueryServiceRequestsDto } from './dto/query-service-requests.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Controller('service-requests')
@UseGuards(JwtAuthGuard)
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly uploadService: UploadService
  ) {}

  // =============== CLIENT ENDPOINTS ===============

  @Get('can-request/:serviceId')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  async canRequestService(
    @Param('serviceId') serviceId: string,
    @Request() req: any
  ) {
    const clientId = req.user.client?.id;
    if (!clientId) {
      throw new BadRequestException('Client profile not found');
    }
    return this.serviceRequestsService.canRequestService(serviceId, clientId);
  }

  @Post()
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('documents', 10)) // Máximo 10 documentos
  async createServiceRequest(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req: any
  ) {
    const clientId = req.user.client?.id;
    if (!clientId) {
      throw new BadRequestException('Client profile not found');
    }

    // Validate required fields
    if (!body.serviceId || !body.projectName || !body.description) {
      throw new BadRequestException('Missing required fields: serviceId, projectName, description');
    }

    let createDto: CreateServiceRequestDto;
    try {
      // Convert form data to proper types
      createDto = {
        serviceId: body.serviceId,
        projectName: body.projectName,
        description: body.description,
        desiredDeadline: body.desiredDeadline,
        targetAudience: body.targetAudience,
        projectObjectives: body.projectObjectives,
        brandGuidelines: body.brandGuidelines,
        preferredColors: body.preferredColors ? JSON.parse(body.preferredColors) : [],
        technicalRequirements: body.technicalRequirements,
        references: body.references,
        observations: body.observations,
        priority: body.priority,
        dueDate: body.dueDate,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Invalid JSON format in preferredColors');
      }
      throw error;
    }

    // Process file uploads
    const documentUrls: string[] = [];
    if (files && files.length > 0) {
      // Validate file types and sizes
      for (const file of files) {
        if (file.size > 1024 * 1024 * 1024) { // 1GB limit
          throw new BadRequestException(`File ${file.originalname} is too large. Maximum size is 1GB`);
        }
      }

      // Upload files
      for (const file of files) {
        try {
          const documentUrl = await this.uploadService.uploadFile(file, 'service-request-documents');
          documentUrls.push(documentUrl);
        } catch (error) {
          throw new BadRequestException(`Failed to upload file ${file.originalname}: ${error.message}`);
        }
      }
    }

    createDto.documentUrls = documentUrls;
    return this.serviceRequestsService.createServiceRequest(createDto, clientId);
  }

  @Get('my-requests')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  async getMyServiceRequests(
    @Query() query: QueryServiceRequestsDto,
    @Request() req: any
  ) {
    const clientId = req.user.client?.id;
    if (!clientId) {
      throw new Error('Client profile not found');
    }
    return this.serviceRequestsService.getMyServiceRequests(clientId, query);
  }

  @Get('my-requests/:id')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  async getMyServiceRequest(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const clientId = req.user.client?.id;
    if (!clientId) {
      throw new Error('Client profile not found');
    }
    return this.serviceRequestsService.getServiceRequest(id, clientId);
  }

  @Patch('my-requests/:id')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  async updateMyServiceRequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceRequestDto,
    @Request() req: any
  ) {
    const clientId = req.user.client?.id;
    if (!clientId) {
      throw new Error('Client profile not found');
    }
    return this.serviceRequestsService.updateServiceRequest(id, updateDto, clientId);
  }

  @Delete('my-requests/:id')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async cancelMyServiceRequest(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const clientId = req.user.client?.id;
    if (!clientId) {
      throw new Error('Client profile not found');
    }
    return this.serviceRequestsService.cancelServiceRequest(id, clientId);
  }

  @Get('my-stats')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  async getMyStats(@Request() req: any) {
    const clientId = req.user.client?.id;
    if (!clientId) {
      throw new Error('Client profile not found');
    }
    return this.serviceRequestsService.getClientServiceRequestStats(clientId);
  }

  // =============== ADMIN/EMPLOYEE ENDPOINTS ===============

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  async getAllServiceRequests(@Query() query: QueryServiceRequestsDto) {
    return this.serviceRequestsService.getAllServiceRequests(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  async getServiceRequestStats() {
    return this.serviceRequestsService.getServiceRequestStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  async getServiceRequestById(@Param('id') id: string) {
    return this.serviceRequestsService.getServiceRequest(id);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  async approveServiceRequest(
    @Param('id') id: string,
    @Body() approveDto: ApproveServiceRequestDto,
    @Request() req: any
  ) {
    const approvedBy = req.user.id;
    return this.serviceRequestsService.approveServiceRequest(id, approveDto, approvedBy);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(RolesGuard)
  async rejectServiceRequest(
    @Param('id') id: string,
    @Body() rejectDto: RejectServiceRequestDto,
    @Request() req: any
  ) {
    const rejectedBy = req.user.id;
    return this.serviceRequestsService.rejectServiceRequest(id, rejectDto, rejectedBy);
  }

  @Post(':id/assign')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async assignServiceRequest(
    @Param('id') id: string,
    @Body() assignDto: AssignServiceRequestDto,
    @Request() req: any
  ) {
    const assignedBy = req.user.id;
    return this.serviceRequestsService.assignServiceRequest(id, assignDto, assignedBy);
  }
}