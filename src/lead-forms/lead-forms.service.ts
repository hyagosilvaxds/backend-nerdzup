import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadFormDto } from './dto/create-lead-form.dto';
import { UpdateLeadFormDto } from './dto/update-lead-form.dto';

@Injectable()
export class LeadFormsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadFormDto: CreateLeadFormDto) {
    const { steps, ...formData } = createLeadFormDto;

    return this.prisma.$transaction(async (tx) => {
      // Cria o formulário
      const form = await tx.leadForm.create({
        data: formData,
      });

      // Cria os steps e inputs
      for (let i = 0; i < steps.length; i++) {
        const stepData = steps[i];
        const { inputs, ...stepInfo } = stepData;

        const step = await tx.leadFormStep.create({
          data: {
            ...stepInfo,
            formId: form.id,
            stepNumber: i + 1,
          },
        });

        // Cria os inputs do step
        for (const inputData of inputs) {
          await tx.leadFormInput.create({
            data: {
              ...inputData,
              stepId: step.id,
            },
          });
        }
      }

      // Retorna o formulário completo
      return this.findOne(form.id);
    });
  }

  async findAll(activeOnly: boolean = true) {
    const where = activeOnly ? { isActive: true } : {};

    return this.prisma.leadForm.findMany({
      where,
      include: {
        steps: {
          include: {
            inputs: true,
          },
          orderBy: {
            stepNumber: 'asc',
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const form = await this.prisma.leadForm.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            inputs: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            stepNumber: 'asc',
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Formulário com ID ${id} não encontrado`);
    }

    return form;
  }

  async findByName(name: string) {
    const form = await this.prisma.leadForm.findUnique({
      where: { name },
      include: {
        steps: {
          include: {
            inputs: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Formulário com nome '${name}' não encontrado`);
    }

    if (!form.isActive) {
      throw new BadRequestException('Formulário está inativo');
    }

    return form;
  }

  async update(id: string, updateLeadFormDto: UpdateLeadFormDto) {
    const existingForm = await this.findOne(id);
    const { steps, ...formData } = updateLeadFormDto;

    return this.prisma.$transaction(async (tx) => {
      // Atualiza o formulário base
      const form = await tx.leadForm.update({
        where: { id },
        data: formData,
      });

      // Se há steps para atualizar, remove os existentes e cria novos
      if (steps && steps.length > 0) {
        // Remove steps existentes (cascade irá remover inputs)
        await tx.leadFormStep.deleteMany({
          where: { formId: id },
        });

        // Cria os novos steps e inputs
        for (let i = 0; i < steps.length; i++) {
          const stepData = steps[i];
          const { inputs, ...stepInfo } = stepData;

          const step = await tx.leadFormStep.create({
            data: {
              ...stepInfo,
              formId: form.id,
              stepNumber: i + 1,
            },
          });

          // Cria os inputs do step
          for (const inputData of inputs) {
            await tx.leadFormInput.create({
              data: {
                ...inputData,
                stepId: step.id,
              },
            });
          }
        }
      }

      return this.findOne(id);
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.leadForm.delete({
      where: { id },
    });
  }

  async activate(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.leadForm.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.leadForm.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getFormAnalytics(id: string) {
    const form = await this.findOne(id);

    const [
      totalSubmissions,
      completedSubmissions,
      abandonedSubmissions,
      uniqueEmails,
    ] = await Promise.all([
      this.prisma.leadSubmission.count({
        where: { formId: id },
      }),
      this.prisma.leadSubmission.count({
        where: { formId: id, isCompleted: true },
      }),
      this.prisma.leadSubmission.count({
        where: { formId: id, isCompleted: false },
      }),
      this.prisma.leadSubmission.groupBy({
        by: ['email'],
        where: { formId: id, email: { not: null } },
        _count: { email: true },
      }).then(groups => groups.length),
    ]);

    const conversionRate = totalSubmissions > 0 
      ? (completedSubmissions / totalSubmissions) * 100 
      : 0;

    return {
      form: {
        id: form.id,
        name: form.name,
        displayName: form.displayName,
      },
      analytics: {
        totalSubmissions,
        completedSubmissions,
        abandonedSubmissions,
        uniqueEmails,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
    };
  }

  async duplicateForm(id: string, newName: string, newDisplayName: string) {
    const originalForm = await this.findOne(id);

    const { id: _, createdAt, updatedAt, _count, ...formData } = originalForm;
    const stepsData = originalForm.steps.map(step => {
      const { id: stepId, formId, createdAt, updatedAt, ...stepInfo } = step;
      const inputsData = step.inputs.map(input => {
        const { id: inputId, stepId, createdAt, updatedAt, ...inputInfo } = input;
        return {
          ...inputInfo,
          placeholder: inputInfo.placeholder || undefined,
          validationRegex: inputInfo.validationRegex || undefined,
          helpText: inputInfo.helpText || undefined,
        };
      });
      
      return {
        ...stepInfo,
        description: stepInfo.description || undefined,
        inputs: inputsData,
      };
    });

    return this.create({
      ...formData,
      description: formData.description || undefined,
      name: newName,
      displayName: newDisplayName,
      steps: stepsData,
    });
  }
}