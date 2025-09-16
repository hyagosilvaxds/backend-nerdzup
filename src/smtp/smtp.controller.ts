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
import { SmtpService } from './smtp.service';
import { CreateSmtpConfigurationDto } from './dto/create-smtp-configuration.dto';
import { UpdateSmtpConfigurationDto } from './dto/update-smtp-configuration.dto';
import { TestSmtpConfigurationDto } from './dto/test-smtp-configuration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('smtp')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Apenas admins podem gerenciar configurações SMTP
export class SmtpController {
  constructor(private readonly smtpService: SmtpService) {}

  @Post()
  async create(@Body() createSmtpConfigurationDto: CreateSmtpConfigurationDto) {
    return this.smtpService.create(createSmtpConfigurationDto);
  }

  @Get()
  async findAll() {
    return this.smtpService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.smtpService.findActiveConfiguration();
  }

  @Get('default')
  async findDefault() {
    return this.smtpService.findDefaultConfiguration();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.smtpService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSmtpConfigurationDto: UpdateSmtpConfigurationDto,
  ) {
    return this.smtpService.update(id, updateSmtpConfigurationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.smtpService.remove(id);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return this.smtpService.activate(id);
  }

  @Post(':id/set-default')
  async setAsDefault(@Param('id') id: string) {
    return this.smtpService.setAsDefault(id);
  }

  @Post(':id/test')
  async testConfiguration(
    @Param('id') id: string,
    @Body() testSmtpConfigurationDto: TestSmtpConfigurationDto,
  ) {
    return this.smtpService.testConfiguration(id, testSmtpConfigurationDto);
  }
}