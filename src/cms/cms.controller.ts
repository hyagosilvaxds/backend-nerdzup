import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CmsService } from './cms.service';
import { UpdateWebsiteConfigDto } from './dto/update-website-config.dto';
import { CreateServiceCardDto, UpdateServiceCardDto } from './dto/service-card.dto';
import { CreateProcessStepDto, UpdateProcessStepDto } from './dto/process-step.dto';
import { CreateSuccessCaseDto, UpdateSuccessCaseDto } from './dto/success-case.dto';
import { CreateClientLogoDto, UpdateClientLogoDto } from './dto/client-logo.dto';
import { CreateFaqItemDto, UpdateFaqItemDto } from './dto/faq-item.dto';

@Controller('cms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // =============== WEBSITE CONFIG ===============

  @Get('config')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async getWebsiteConfig() {
    return this.cmsService.getOrCreateWebsiteConfig();
  }

  @Put('config')
  @Roles(Role.ADMIN)
  async updateWebsiteConfig(@Body() updateDto: UpdateWebsiteConfigDto, @Request() req) {
    return this.cmsService.updateWebsiteConfig(updateDto, req.user.id);
  }

  @Get('config/public')
  async getPublicWebsiteConfig() {
    return this.cmsService.getPublicWebsiteConfig();
  }

  // =============== SERVICE CARDS ===============

  @Post('service-cards')
  @Roles(Role.ADMIN)
  async createServiceCard(@Body() createDto: CreateServiceCardDto) {
    return this.cmsService.createServiceCard(createDto);
  }

  @Put('service-cards/:id')
  @Roles(Role.ADMIN)
  async updateServiceCard(@Param('id') id: string, @Body() updateDto: UpdateServiceCardDto) {
    return this.cmsService.updateServiceCard(id, updateDto);
  }

  @Delete('service-cards/:id')
  @Roles(Role.ADMIN)
  async deleteServiceCard(@Param('id') id: string) {
    return this.cmsService.deleteServiceCard(id);
  }

  @Put('service-cards/reorder')
  @Roles(Role.ADMIN)
  async reorderServiceCards(@Body('ids') ids: string[]) {
    return this.cmsService.reorderServiceCards(ids);
  }

  // =============== PROCESS STEPS ===============

  @Post('process-steps')
  @Roles(Role.ADMIN)
  async createProcessStep(@Body() createDto: CreateProcessStepDto) {
    return this.cmsService.createProcessStep(createDto);
  }

  @Put('process-steps/:id')
  @Roles(Role.ADMIN)
  async updateProcessStep(@Param('id') id: string, @Body() updateDto: UpdateProcessStepDto) {
    return this.cmsService.updateProcessStep(id, updateDto);
  }

  @Delete('process-steps/:id')
  @Roles(Role.ADMIN)
  async deleteProcessStep(@Param('id') id: string) {
    return this.cmsService.deleteProcessStep(id);
  }

  @Put('process-steps/reorder')
  @Roles(Role.ADMIN)
  async reorderProcessSteps(@Body('ids') ids: string[]) {
    return this.cmsService.reorderProcessSteps(ids);
  }

  // =============== SUCCESS CASES ===============

  @Post('success-cases')
  @Roles(Role.ADMIN)
  async createSuccessCase(@Body() createDto: CreateSuccessCaseDto) {
    return this.cmsService.createSuccessCase(createDto);
  }

  @Put('success-cases/:id')
  @Roles(Role.ADMIN)
  async updateSuccessCase(@Param('id') id: string, @Body() updateDto: UpdateSuccessCaseDto) {
    return this.cmsService.updateSuccessCase(id, updateDto);
  }

  @Delete('success-cases/:id')
  @Roles(Role.ADMIN)
  async deleteSuccessCase(@Param('id') id: string) {
    return this.cmsService.deleteSuccessCase(id);
  }

  @Put('success-cases/reorder')
  @Roles(Role.ADMIN)
  async reorderSuccessCases(@Body('ids') ids: string[]) {
    return this.cmsService.reorderSuccessCases(ids);
  }

  // =============== CLIENT LOGOS ===============

  @Post('client-logos')
  @Roles(Role.ADMIN)
  async createClientLogo(@Body() createDto: CreateClientLogoDto) {
    return this.cmsService.createClientLogo(createDto);
  }

  @Put('client-logos/:id')
  @Roles(Role.ADMIN)
  async updateClientLogo(@Param('id') id: string, @Body() updateDto: UpdateClientLogoDto) {
    return this.cmsService.updateClientLogo(id, updateDto);
  }

  @Delete('client-logos/:id')
  @Roles(Role.ADMIN)
  async deleteClientLogo(@Param('id') id: string) {
    return this.cmsService.deleteClientLogo(id);
  }

  @Put('client-logos/reorder')
  @Roles(Role.ADMIN)
  async reorderClientLogos(@Body('ids') ids: string[]) {
    return this.cmsService.reorderClientLogos(ids);
  }

  // =============== FAQ ITEMS ===============

  @Post('faq-items')
  @Roles(Role.ADMIN)
  async createFaqItem(@Body() createDto: CreateFaqItemDto) {
    return this.cmsService.createFaqItem(createDto);
  }

  @Put('faq-items/:id')
  @Roles(Role.ADMIN)
  async updateFaqItem(@Param('id') id: string, @Body() updateDto: UpdateFaqItemDto) {
    return this.cmsService.updateFaqItem(id, updateDto);
  }

  @Delete('faq-items/:id')
  @Roles(Role.ADMIN)
  async deleteFaqItem(@Param('id') id: string) {
    return this.cmsService.deleteFaqItem(id);
  }

  @Put('faq-items/reorder')
  @Roles(Role.ADMIN)
  async reorderFaqItems(@Body('ids') ids: string[]) {
    return this.cmsService.reorderFaqItems(ids);
  }

  // =============== FAVICON MANAGEMENT ===============

  @Post('favicon')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('favicon', {
      storage: diskStorage({
        destination: './uploads/favicon',
        filename: (req, file, callback) => {
          const fileExtName = extname(file.originalname);
          const fileName = `favicon-${uuidv4()}${fileExtName}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.match(/\/(ico|png|jpeg|jpg|svg)$/)) {
          callback(null, true);
        } else {
          callback(new Error('Only ICO, PNG, JPEG, JPG and SVG files are allowed for favicon!'), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for favicon
    }),
  )
  async uploadFavicon(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new Error('No favicon file provided');
    }
    return this.cmsService.uploadFavicon(file, req.user.id);
  }

  @Get('favicon')
  async getCurrentFavicon() {
    return this.cmsService.getCurrentFavicon();
  }

  @Delete('favicon')
  @Roles(Role.ADMIN)
  async removeFavicon(@Request() req) {
    return this.cmsService.removeFavicon(req.user.id);
  }
}