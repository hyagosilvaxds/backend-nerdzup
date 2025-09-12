import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { AssignEmployeesToCampaignDto } from './dto/assign-employees-to-campaign.dto';
import { QueryCampaignsDto } from './dto/query-campaigns.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Role, Permission } from '@prisma/client';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.READ_CAMPAIGNS)
  async getAllCampaigns(@Query() query: QueryCampaignsDto) {
    return this.campaignsService.findAllCampaigns(query);
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
}