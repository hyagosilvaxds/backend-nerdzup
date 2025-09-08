import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmtpConfigurationDto } from './dto/create-smtp-configuration.dto';
import { UpdateSmtpConfigurationDto } from './dto/update-smtp-configuration.dto';
import { TestSmtpConfigurationDto } from './dto/test-smtp-configuration.dto';
import * as nodemailer from 'nodemailer';
import { SmtpConfiguration } from '@prisma/client';

@Injectable()
export class SmtpService {
  constructor(private prisma: PrismaService) {}

  async create(createSmtpConfigurationDto: CreateSmtpConfigurationDto) {
    // Se esta configuração deve ser ativa, desativa todas as outras
    if (createSmtpConfigurationDto.isActive) {
      await this.prisma.smtpConfiguration.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    // Se esta configuração deve ser padrão, remove o padrão de todas as outras
    if (createSmtpConfigurationDto.isDefault) {
      await this.prisma.smtpConfiguration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.smtpConfiguration.create({
      data: createSmtpConfigurationDto,
    });
  }

  async findAll() {
    return this.prisma.smtpConfiguration.findMany({
      orderBy: [
        { isActive: 'desc' },
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const config = await this.prisma.smtpConfiguration.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Configuração SMTP com ID ${id} não encontrada`);
    }

    return config;
  }

  async findActiveConfiguration(): Promise<SmtpConfiguration | null> {
    return this.prisma.smtpConfiguration.findFirst({
      where: { isActive: true },
    });
  }

  async findDefaultConfiguration(): Promise<SmtpConfiguration | null> {
    return this.prisma.smtpConfiguration.findFirst({
      where: { isDefault: true },
    });
  }

  async update(id: string, updateSmtpConfigurationDto: UpdateSmtpConfigurationDto) {
    const existingConfig = await this.findOne(id);

    // Se esta configuração deve ser ativa, desativa todas as outras
    if (updateSmtpConfigurationDto.isActive) {
      await this.prisma.smtpConfiguration.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false },
      });
    }

    // Se esta configuração deve ser padrão, remove o padrão de todas as outras
    if (updateSmtpConfigurationDto.isDefault) {
      await this.prisma.smtpConfiguration.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.smtpConfiguration.update({
      where: { id },
      data: updateSmtpConfigurationDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.smtpConfiguration.delete({
      where: { id },
    });
  }

  async activate(id: string) {
    await this.findOne(id); // Verifica se existe

    // Desativa todas as outras configurações
    await this.prisma.smtpConfiguration.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Ativa a configuração especificada
    return this.prisma.smtpConfiguration.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async setAsDefault(id: string) {
    await this.findOne(id); // Verifica se existe

    // Remove padrão de todas as outras configurações
    await this.prisma.smtpConfiguration.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    // Define como padrão a configuração especificada
    return this.prisma.smtpConfiguration.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async testConfiguration(id: string, testData: TestSmtpConfigurationDto) {
    const config = await this.findOne(id);

    try {
      // Cria transporter com a configuração
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });

      // Verifica a conexão
      await transporter.verify();

      // Envia email de teste
      const info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: testData.testEmail,
        subject: testData.subject,
        text: testData.message,
        html: `<p>${testData.message}</p>`,
      });

      return {
        success: true,
        message: 'Configuração SMTP testada com sucesso',
        messageId: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Erro ao testar configuração SMTP',
        error: error.message,
      });
    }
  }

  async createTransporter(configId?: string): Promise<nodemailer.Transporter> {
    let config: SmtpConfiguration;

    if (configId) {
      config = await this.findOne(configId);
    } else {
      // Tenta usar a configuração ativa primeiro, depois a padrão
      const activeConfig = await this.findActiveConfiguration();
      const defaultConfig = await this.findDefaultConfiguration();
      const foundConfig = activeConfig || defaultConfig;
      
      if (!foundConfig) {
        throw new BadRequestException('Nenhuma configuração SMTP ativa ou padrão encontrada');
      }
      
      config = foundConfig;
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  async getConfigurationInfo(configId?: string): Promise<{ fromName: string; fromEmail: string; config: SmtpConfiguration }> {
    let config: SmtpConfiguration;

    if (configId) {
      config = await this.findOne(configId);
    } else {
      const activeConfig = await this.findActiveConfiguration();
      const defaultConfig = await this.findDefaultConfiguration();
      const foundConfig = activeConfig || defaultConfig;
      
      if (!foundConfig) {
        throw new BadRequestException('Nenhuma configuração SMTP ativa ou padrão encontrada');
      }
      
      config = foundConfig;
    }

    return {
      fromName: config.fromName,
      fromEmail: config.fromEmail,
      config,
    };
  }
}