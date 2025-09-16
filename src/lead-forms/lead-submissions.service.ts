import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadFormsService } from './lead-forms.service';
import { SubmitLeadFormDto, StartLeadFormDto, CompleteLeadFormDto } from './dto/submit-lead-form.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class LeadSubmissionsService {
  constructor(
    private prisma: PrismaService,
    private leadFormsService: LeadFormsService,
    private uploadService: UploadService,
  ) {}

  async startSubmission(startLeadFormDto: StartLeadFormDto) {
    const { formId, ipAddress, userAgent } = startLeadFormDto;

    // Verifica se o formulário existe e está ativo
    const form = await this.leadFormsService.findByName(formId) || 
                  await this.leadFormsService.findOne(formId);

    // Cria uma nova submissão
    const submission = await this.prisma.leadSubmission.create({
      data: {
        formId: form.id,
        ipAddress,
        userAgent,
      },
    });

    return {
      submissionId: submission.id,
      form: {
        id: form.id,
        name: form.name,
        displayName: form.displayName,
        description: form.description,
        initialText: form.initialText,
        steps: form.steps.map(step => ({
          id: step.id,
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          isRequired: step.isRequired,
          inputs: step.inputs,
        })),
      },
    };
  }

  async submitResponses(submitLeadFormDto: SubmitLeadFormDto) {
    const { formId, submissionId, email, responses } = submitLeadFormDto;

    let submission;

    if (submissionId) {
      // Continua submissão existente
      submission = await this.prisma.leadSubmission.findUnique({
        where: { id: submissionId },
        include: {
          form: true,
          responses: true,
        },
      });

      if (!submission) {
        throw new NotFoundException(`Submissão com ID ${submissionId} não encontrada`);
      }

      if (submission.isCompleted) {
        throw new BadRequestException('Esta submissão já foi completada');
      }
    } else {
      // Cria nova submissão
      const form = await this.leadFormsService.findOne(formId);
      submission = await this.prisma.leadSubmission.create({
        data: {
          formId,
          email,
        },
        include: {
          form: true,
          responses: true,
        },
      });
    }

    // Valida e processa as respostas
    const validatedResponses = await this.validateResponses(submission.form.id, responses);

    // Salva as respostas
    const savedResponses: any[] = [];
    for (const response of validatedResponses) {
      // Remove resposta existente se houver (permite atualizar)
      await this.prisma.leadSubmissionResponse.deleteMany({
        where: {
          submissionId: submission.id,
          stepId: response.stepId,
          inputKey: response.inputKey,
        },
      });

      // Salva nova resposta
      const savedResponse = await this.prisma.leadSubmissionResponse.create({
        data: {
          submissionId: submission.id,
          stepId: response.stepId,
          inputKey: response.inputKey,
          value: response.value,
          fileUrl: response.fileUrl,
        },
      });

      savedResponses.push(savedResponse);
    }

    // Atualiza email se fornecido
    if (email && email !== submission.email) {
      await this.prisma.leadSubmission.update({
        where: { id: submission.id },
        data: { email },
      });
    }

    return {
      submissionId: submission.id,
      responses: savedResponses,
      message: 'Respostas salvas com sucesso',
    };
  }

  async completeSubmission(completeLeadFormDto: CompleteLeadFormDto) {
    const { submissionId } = completeLeadFormDto;

    const submission = await this.prisma.leadSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: {
          include: {
            steps: {
              include: {
                inputs: true,
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submissão com ID ${submissionId} não encontrada`);
    }

    if (submission.isCompleted) {
      throw new BadRequestException('Esta submissão já foi completada');
    }

    // Valida se todos os campos obrigatórios foram preenchidos
    const validationErrors = this.validateRequiredFields(submission);
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Campos obrigatórios não preenchidos',
        errors: validationErrors,
      });
    }

    // Marca como completa
    const completedSubmission = await this.prisma.leadSubmission.update({
      where: { id: submissionId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
      include: {
        form: true,
        responses: true,
      },
    });

    return {
      submissionId: completedSubmission.id,
      message: 'Formulário completado com sucesso',
      completedAt: completedSubmission.completedAt,
    };
  }

  async findSubmissions(filters: {
    formId?: string;
    completedOnly?: boolean;
    email?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = {};

    if (filters.formId) {
      where.formId = filters.formId;
    }

    if (filters.completedOnly !== undefined) {
      where.isCompleted = filters.completedOnly;
    }

    if (filters.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    return this.prisma.leadSubmission.findMany({
      where,
      include: {
        form: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        responses: true,
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findSubmission(id: string) {
    const submission = await this.prisma.leadSubmission.findUnique({
      where: { id },
      include: {
        form: {
          include: {
            steps: {
              include: {
                inputs: true,
              },
              orderBy: {
                stepNumber: 'asc',
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submissão com ID ${id} não encontrada`);
    }

    return submission;
  }

  async deleteSubmission(id: string) {
    await this.findSubmission(id); // Verifica se existe

    return this.prisma.leadSubmission.delete({
      where: { id },
    });
  }

  private async validateResponses(formId: string, responses: any[]) {
    const form = await this.leadFormsService.findOne(formId);
    const validatedResponses: any[] = [];

    for (const response of responses) {
      const step = form.steps.find(s => s.id === response.stepId);
      if (!step) {
        throw new BadRequestException(`Step com ID ${response.stepId} não encontrado`);
      }

      const input = step.inputs.find(i => i.inputKey === response.inputKey);
      if (!input) {
        throw new BadRequestException(`Input '${response.inputKey}' não encontrado no step ${step.stepNumber}`);
      }

      // Valida tipos específicos
      let value = response.value;
      let fileUrl = response.fileUrl;

      if (input.inputType === 'EMAIL' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new BadRequestException(`Email inválido para o campo '${input.label}'`);
        }
      }

      if (input.inputType === 'NUMBER' && value) {
        if (isNaN(Number(value))) {
          throw new BadRequestException(`Valor numérico inválido para o campo '${input.label}'`);
        }
      }

      if (input.inputType.startsWith('SELECT_') && value) {
        if (!input.options.includes(value)) {
          throw new BadRequestException(`Opção inválida para o campo '${input.label}'`);
        }
      }

      // Valida regex personalizada
      if (input.validationRegex && value) {
        const regex = new RegExp(input.validationRegex);
        if (!regex.test(value)) {
          throw new BadRequestException(`Formato inválido para o campo '${input.label}'`);
        }
      }

      validatedResponses.push({
        stepId: response.stepId,
        inputKey: response.inputKey,
        value,
        fileUrl,
      });
    }

    return validatedResponses;
  }

  private validateRequiredFields(submission: any) {
    const errors: any[] = [];
    const responseMap = new Map();

    // Cria mapa das respostas
    submission.responses.forEach((response: any) => {
      const key = `${response.stepId}-${response.inputKey}`;
      responseMap.set(key, response.value);
    });

    // Verifica campos obrigatórios
    submission.form.steps.forEach((step: any) => {
      if (step.isRequired) {
        step.inputs.forEach((input: any) => {
          if (input.isRequired) {
            const key = `${step.id}-${input.inputKey}`;
            const value = responseMap.get(key);
            
            if (!value || value.trim() === '') {
              errors.push({
                stepId: step.id,
                stepNumber: step.stepNumber,
                stepTitle: step.title,
                inputKey: input.inputKey,
                inputLabel: input.label,
                message: `Campo '${input.label}' é obrigatório`,
              });
            }
          }
        });
      }
    });

    return errors;
  }

  async getSubmissionStats(formId?: string) {
    const where = formId ? { formId } : {};

    const [total, completed, withEmail, last24h] = await Promise.all([
      this.prisma.leadSubmission.count({ where }),
      this.prisma.leadSubmission.count({ where: { ...where, isCompleted: true } }),
      this.prisma.leadSubmission.count({ where: { ...where, email: { not: null } } }),
      this.prisma.leadSubmission.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      completed,
      abandoned: total - completed,
      withEmail,
      last24h,
      conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}