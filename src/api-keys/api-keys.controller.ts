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
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { QueryApiKeysDto } from './dto/query-api-keys.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Apenas administradores podem gerenciar chaves de API
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @User('id') userId: string
  ) {
    return this.apiKeysService.create(createApiKeyDto, userId);
  }

  @Get()
  findAll(@Query() query: QueryApiKeysDto) {
    return this.apiKeysService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.apiKeysService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiKeysService.findOne(id);
  }

  @Get(':id/reveal')
  @HttpCode(HttpStatus.OK)
  revealKey(@Param('id') id: string) {
    return this.apiKeysService.findOne(id, true);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto
  ) {
    return this.apiKeysService.update(id, updateApiKeyDto);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggleActive(@Param('id') id: string) {
    return this.apiKeysService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.apiKeysService.remove(id);
  }
}