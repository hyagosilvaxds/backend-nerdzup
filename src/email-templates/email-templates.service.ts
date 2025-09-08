import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmailTemplateDto: CreateEmailTemplateDto) {
    // Verifica se já existe um template com esse name
    const existing = await this.prisma.emailTemplate.findUnique({
      where: { name: createEmailTemplateDto.name },
    });

    if (existing) {
      throw new BadRequestException(`Template com nome '${createEmailTemplateDto.name}' já existe`);
    }

    return this.prisma.emailTemplate.create({
      data: createEmailTemplateDto,
    });
  }

  async findAll(category?: string) {
    const where = category ? { category } : {};
    
    return this.prisma.emailTemplate.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { category: 'asc' },
        { displayName: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template com ID ${id} não encontrado`);
    }

    return template;
  }

  async findByName(name: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { name },
    });

    if (!template) {
      throw new NotFoundException(`Template com nome '${name}' não encontrado`);
    }

    return template;
  }

  async getCategories() {
    const result = await this.prisma.emailTemplate.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return result.map(item => ({
      category: item.category,
      count: item._count.category,
    }));
  }

  async update(id: string, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    await this.findOne(id); // Verifica se existe

    // Se está tentando mudar o nome, verifica se não existe outro com o mesmo nome
    if (updateEmailTemplateDto.name) {
      const existing = await this.prisma.emailTemplate.findFirst({
        where: { 
          name: updateEmailTemplateDto.name,
          id: { not: id }
        },
      });

      if (existing) {
        throw new BadRequestException(`Template com nome '${updateEmailTemplateDto.name}' já existe`);
      }
    }

    return this.prisma.emailTemplate.update({
      where: { id },
      data: updateEmailTemplateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.emailTemplate.delete({
      where: { id },
    });
  }

  async activate(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.emailTemplate.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.emailTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async renderTemplate(templateId: string, variables: Record<string, any> = {}) {
    const template = await this.findOne(templateId);

    if (!template.isActive) {
      throw new BadRequestException('Template está inativo');
    }

    try {
      // Compila o template do subject
      const subjectTemplate = Handlebars.compile(template.subject);
      const renderedSubject = subjectTemplate(variables);

      // Compila o template HTML
      const htmlTemplate = Handlebars.compile(template.htmlContent);
      const renderedHtml = htmlTemplate(variables);

      // Compila o template de texto se existir
      let renderedText: string | null = null;
      if (template.textContent) {
        const textTemplate = Handlebars.compile(template.textContent);
        renderedText = textTemplate(variables);
      }

      return {
        subject: renderedSubject,
        html: renderedHtml,
        text: renderedText,
        template: {
          id: template.id,
          name: template.name,
          displayName: template.displayName,
          category: template.category,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Erro ao renderizar template',
        error: error.message,
      });
    }
  }

  async renderTemplateByName(templateName: string, variables: Record<string, any> = {}) {
    const template = await this.findByName(templateName);

    if (!template.isActive) {
      throw new BadRequestException('Template está inativo');
    }

    return this.renderTemplate(template.id, variables);
  }

  async validateTemplate(htmlContent: string, textContent?: string, variables: string[] = []) {
    const sampleVariables: Record<string, string> = {};
    variables.forEach(variable => {
      sampleVariables[variable] = `{{${variable}}}`;
    });

    try {
      // Testa compilação do HTML
      const htmlTemplate = Handlebars.compile(htmlContent);
      htmlTemplate(sampleVariables);

      // Testa compilação do texto se fornecido
      if (textContent) {
        const textTemplate = Handlebars.compile(textContent);
        textTemplate(sampleVariables);
      }

      return {
        valid: true,
        message: 'Template válido',
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Template inválido',
        error: error.message,
      };
    }
  }

  async previewTemplate(templateId: string, variables: Record<string, any> = {}) {
    const rendered = await this.renderTemplate(templateId, variables);
    
    return {
      ...rendered,
      preview: {
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text || 'Sem versão em texto',
        variables: Object.keys(variables),
      },
    };
  }
}