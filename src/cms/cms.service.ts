import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWebsiteConfigDto } from './dto/update-website-config.dto';
import { CreateServiceCardDto, UpdateServiceCardDto } from './dto/service-card.dto';
import { CreateProcessStepDto, UpdateProcessStepDto } from './dto/process-step.dto';
import { CreateSuccessCaseDto, UpdateSuccessCaseDto } from './dto/success-case.dto';
import { CreateClientLogoDto, UpdateClientLogoDto } from './dto/client-logo.dto';
import { CreateFaqItemDto, UpdateFaqItemDto } from './dto/faq-item.dto';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // =============== WEBSITE CONFIG ===============

  async getOrCreateWebsiteConfig(userId?: string) {
    let config = await this.prisma.websiteConfig.findFirst({
      include: {
        serviceCards: { 
          include: { service: true },
          orderBy: { order: 'asc' } 
        },
        processSteps: { orderBy: { order: 'asc' } },
        successCases: { orderBy: { order: 'asc' } },
        clientLogos: { orderBy: { order: 'asc' } },
        faqItems: { orderBy: { order: 'asc' } },
      },
    });

    if (!config && userId) {
      // Create default config if none exists
      config = await this.prisma.websiteConfig.create({
        data: {
          updatedBy: userId,
        },
        include: {
          serviceCards: { 
          include: { service: true },
          orderBy: { order: 'asc' } 
        },
          processSteps: { orderBy: { order: 'asc' } },
          successCases: { orderBy: { order: 'asc' } },
          clientLogos: { orderBy: { order: 'asc' } },
          faqItems: { orderBy: { order: 'asc' } },
        },
      });
    }

    if (!config) {
      throw new Error('Website configuration not found and cannot be created without user ID');
    }
    
    return config;
  }

  async updateWebsiteConfig(updateDto: UpdateWebsiteConfigDto, updatedBy: string) {
    const config = await this.getOrCreateWebsiteConfig(updatedBy);

    return this.prisma.websiteConfig.update({
      where: { id: config.id },
      data: {
        ...updateDto,
        updatedBy,
      },
      include: {
        serviceCards: { 
          include: { service: true },
          orderBy: { order: 'asc' } 
        },
        processSteps: { orderBy: { order: 'asc' } },
        successCases: { orderBy: { order: 'asc' } },
        clientLogos: { orderBy: { order: 'asc' } },
        faqItems: { orderBy: { order: 'asc' } },
      },
    });
  }

  async getPublicWebsiteConfig() {
    return this.prisma.websiteConfig.findFirst({
      include: {
        serviceCards: { 
          include: { service: true },
          orderBy: { order: 'asc' } 
        },
        processSteps: { orderBy: { order: 'asc' } },
        successCases: { orderBy: { order: 'asc' } },
        clientLogos: { orderBy: { order: 'asc' } },
        faqItems: { orderBy: { order: 'asc' } },
      },
    });
  }

  // =============== SERVICE CARDS ===============

  async getServiceCards() {
    return this.prisma.serviceCard.findMany({
      include: {
        service: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async createServiceCard(createDto: CreateServiceCardDto, userId: string) {
    const config = await this.getOrCreateWebsiteConfig(userId);

    return this.prisma.serviceCard.create({
      data: {
        ...createDto,
        websiteConfigId: config.id,
      },
    });
  }

  async updateServiceCard(id: string, updateDto: UpdateServiceCardDto) {
    const card = await this.prisma.serviceCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Service card not found');
    }

    return this.prisma.serviceCard.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteServiceCard(id: string) {
    const card = await this.prisma.serviceCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Service card not found');
    }

    await this.prisma.serviceCard.delete({
      where: { id },
    });

    return { message: 'Service card deleted successfully' };
  }

  // =============== PROCESS STEPS ===============

  async createProcessStep(createDto: CreateProcessStepDto, userId: string) {
    const config = await this.getOrCreateWebsiteConfig(userId);

    return this.prisma.processStep.create({
      data: {
        ...createDto,
        websiteConfigId: config.id,
      },
    });
  }

  async updateProcessStep(id: string, updateDto: UpdateProcessStepDto) {
    const step = await this.prisma.processStep.findUnique({
      where: { id },
    });

    if (!step) {
      throw new NotFoundException('Process step not found');
    }

    return this.prisma.processStep.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteProcessStep(id: string) {
    const step = await this.prisma.processStep.findUnique({
      where: { id },
    });

    if (!step) {
      throw new NotFoundException('Process step not found');
    }

    await this.prisma.processStep.delete({
      where: { id },
    });

    return { message: 'Process step deleted successfully' };
  }

  // =============== SUCCESS CASES ===============

  async createSuccessCase(createDto: CreateSuccessCaseDto, userId: string) {
    const config = await this.getOrCreateWebsiteConfig(userId);

    return this.prisma.successCase.create({
      data: {
        ...createDto,
        websiteConfigId: config.id,
      },
    });
  }

  async updateSuccessCase(id: string, updateDto: UpdateSuccessCaseDto) {
    const successCase = await this.prisma.successCase.findUnique({
      where: { id },
    });

    if (!successCase) {
      throw new NotFoundException('Success case not found');
    }

    return this.prisma.successCase.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteSuccessCase(id: string) {
    const successCase = await this.prisma.successCase.findUnique({
      where: { id },
    });

    if (!successCase) {
      throw new NotFoundException('Success case not found');
    }

    await this.prisma.successCase.delete({
      where: { id },
    });

    return { message: 'Success case deleted successfully' };
  }

  // =============== CLIENT LOGOS ===============

  async createClientLogo(createDto: CreateClientLogoDto, userId: string) {
    const config = await this.getOrCreateWebsiteConfig(userId);

    return this.prisma.clientLogo.create({
      data: {
        ...createDto,
        websiteConfigId: config.id,
      },
    });
  }

  async updateClientLogo(id: string, updateDto: UpdateClientLogoDto) {
    const logo = await this.prisma.clientLogo.findUnique({
      where: { id },
    });

    if (!logo) {
      throw new NotFoundException('Client logo not found');
    }

    return this.prisma.clientLogo.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteClientLogo(id: string) {
    const logo = await this.prisma.clientLogo.findUnique({
      where: { id },
    });

    if (!logo) {
      throw new NotFoundException('Client logo not found');
    }

    await this.prisma.clientLogo.delete({
      where: { id },
    });

    return { message: 'Client logo deleted successfully' };
  }

  // =============== FAQ ITEMS ===============

  async createFaqItem(createDto: CreateFaqItemDto, userId: string) {
    const config = await this.getOrCreateWebsiteConfig(userId);

    return this.prisma.faqItem.create({
      data: {
        ...createDto,
        websiteConfigId: config.id,
      },
    });
  }

  async updateFaqItem(id: string, updateDto: UpdateFaqItemDto) {
    const faqItem = await this.prisma.faqItem.findUnique({
      where: { id },
    });

    if (!faqItem) {
      throw new NotFoundException('FAQ item not found');
    }

    return this.prisma.faqItem.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteFaqItem(id: string) {
    const faqItem = await this.prisma.faqItem.findUnique({
      where: { id },
    });

    if (!faqItem) {
      throw new NotFoundException('FAQ item not found');
    }

    await this.prisma.faqItem.delete({
      where: { id },
    });

    return { message: 'FAQ item deleted successfully' };
  }

  // =============== REORDER ITEMS ===============

  async reorderServiceCards(ids: string[]) {
    const updatePromises = ids.map((id, index) =>
      this.prisma.serviceCard.update({
        where: { id },
        data: { order: index },
      }),
    );

    await Promise.all(updatePromises);
    return { message: 'Service cards reordered successfully' };
  }

  async reorderProcessSteps(ids: string[]) {
    const updatePromises = ids.map((id, index) =>
      this.prisma.processStep.update({
        where: { id },
        data: { order: index },
      }),
    );

    await Promise.all(updatePromises);
    return { message: 'Process steps reordered successfully' };
  }

  async reorderSuccessCases(ids: string[]) {
    const updatePromises = ids.map((id, index) =>
      this.prisma.successCase.update({
        where: { id },
        data: { order: index },
      }),
    );

    await Promise.all(updatePromises);
    return { message: 'Success cases reordered successfully' };
  }

  async reorderClientLogos(ids: string[]) {
    const updatePromises = ids.map((id, index) =>
      this.prisma.clientLogo.update({
        where: { id },
        data: { order: index },
      }),
    );

    await Promise.all(updatePromises);
    return { message: 'Client logos reordered successfully' };
  }

  async reorderFaqItems(ids: string[]) {
    const updatePromises = ids.map((id, index) =>
      this.prisma.faqItem.update({
        where: { id },
        data: { order: index },
      }),
    );

    await Promise.all(updatePromises);
    return { message: 'FAQ items reordered successfully' };
  }

  // =============== UPLOAD MANAGEMENT ===============

  async uploadLogo(file: Express.Multer.File, updatedBy: string) {
    const logoUrl = `/uploads/logo/${file.filename}`;
    
    // Get current config to check if there's an existing logo
    const config = await this.getOrCreateWebsiteConfig(updatedBy);
    
    // Delete old logo file if exists
    if (config.logoUrl) {
      const oldFilePath = path.join('.', config.logoUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Update config with new logo URL
    const updatedConfig = await this.prisma.websiteConfig.update({
      where: { id: config.id },
      data: {
        logoUrl,
        updatedBy,
        updatedAt: new Date(),
      },
    });
    
    return {
      message: 'Logo uploaded successfully',
      logoUrl,
      config: updatedConfig,
    };
  }

  async uploadFavicon(file: Express.Multer.File, updatedBy: string) {
    const faviconUrl = `/uploads/favicon/${file.filename}`;
    
    // Get current config to check if there's an existing favicon
    const config = await this.getOrCreateWebsiteConfig(updatedBy);
    
    // Delete old favicon file if exists
    if (config.faviconUrl) {
      const oldFilePath = path.join('.', config.faviconUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Update config with new favicon URL
    const updatedConfig = await this.prisma.websiteConfig.update({
      where: { id: config.id },
      data: {
        faviconUrl,
        updatedBy,
      },
    });
    
    return {
      message: 'Favicon uploaded successfully',
      faviconUrl,
      config: updatedConfig,
    };
  }

  async uploadImage(file: Express.Multer.File, updatedBy: string) {
    const imageUrl = `/uploads/cms/${file.filename}`;
    
    // Return the uploaded image URL - this is a generic upload that doesn't update any specific config
    return {
      message: 'Image uploaded successfully',
      imageUrl,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: updatedBy,
    };
  }

  async getCurrentFavicon() {
    const config = await this.prisma.websiteConfig.findFirst();
    return {
      faviconUrl: config?.faviconUrl || null,
    };
  }

  async removeFavicon(updatedBy: string) {
    const config = await this.getOrCreateWebsiteConfig(updatedBy);
    
    if (!config.faviconUrl) {
      throw new NotFoundException('No favicon found');
    }
    
    // Delete favicon file
    const filePath = path.join('.', config.faviconUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Update config to remove favicon URL
    const updatedConfig = await this.prisma.websiteConfig.update({
      where: { id: config.id },
      data: {
        faviconUrl: null,
        updatedBy,
      },
    });
    
    return {
      message: 'Favicon removed successfully',
      config: updatedConfig,
    };
  }
}