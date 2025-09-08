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
  HttpStatus
} from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { ApproveServiceRequestDto, RejectServiceRequestDto } from './dto/approve-service-request.dto';
import { QueryServiceRequestsDto } from './dto/query-service-requests.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('service-requests')
@UseGuards(JwtAuthGuard)
export class ServiceRequestsController {
  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  // =============== CLIENT ENDPOINTS ===============

  @Post()
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  async createServiceRequest(
    @Body() createDto: CreateServiceRequestDto,
    @Request() req: any
  ) {
    const clientId = req.user.client?.id;
    if (!clientId) {
      throw new Error('Client profile not found');
    }
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
    return this.serviceRequestsService.getServiceRequest(id, '');
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
}