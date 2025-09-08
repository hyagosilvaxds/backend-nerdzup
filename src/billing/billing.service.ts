import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from './dto/subscription-plan.dto';
import { CreateCreditPackageDto, UpdateCreditPackageDto } from './dto/credit-package.dto';
import { UpdateWalletCreditsDto, PurchaseCreditsDto, CreateSubscriptionDto, QueryTransactionsDto } from './dto/wallet.dto';
import { TransactionType, SubscriptionStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  // =============== SUBSCRIPTION PLANS ===============

  async createSubscriptionPlan(createPlanDto: CreateSubscriptionPlanDto) {
    return this.prisma.subscriptionPlan.create({
      data: createPlanDto,
    });
  }

  async findAllSubscriptionPlans(activeOnly: boolean = true) {
    return this.prisma.subscriptionPlan.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: 'asc' },
    });
  }

  async findOneSubscriptionPlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            client: { include: { user: true } }
          }
        }
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  async updateSubscriptionPlan(id: string, updatePlanDto: UpdateSubscriptionPlanDto) {
    const plan = await this.findOneSubscriptionPlan(id);

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  async deleteSubscriptionPlan(id: string) {
    const plan = await this.findOneSubscriptionPlan(id);

    // Verificar se há assinaturas ativas
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planId: id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException('Cannot delete plan with active subscriptions');
    }

    await this.prisma.subscriptionPlan.delete({
      where: { id },
    });

    return { message: 'Subscription plan deleted successfully' };
  }

  // =============== CREDIT PACKAGES ===============

  async createCreditPackage(createPackageDto: CreateCreditPackageDto) {
    return this.prisma.creditPackage.create({
      data: createPackageDto,
    });
  }

  async findAllCreditPackages(activeOnly: boolean = true) {
    return this.prisma.creditPackage.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: 'asc' },
    });
  }

  async findOneCreditPackage(id: string) {
    const package_ = await this.prisma.creditPackage.findUnique({
      where: { id },
    });

    if (!package_) {
      throw new NotFoundException('Credit package not found');
    }

    return package_;
  }

  async updateCreditPackage(id: string, updatePackageDto: UpdateCreditPackageDto) {
    const package_ = await this.findOneCreditPackage(id);

    return this.prisma.creditPackage.update({
      where: { id },
      data: updatePackageDto,
    });
  }

  async deleteCreditPackage(id: string) {
    const package_ = await this.findOneCreditPackage(id);

    await this.prisma.creditPackage.delete({
      where: { id },
    });

    return { message: 'Credit package deleted successfully' };
  }

  // =============== CLIENT WALLET ===============

  async getOrCreateWallet(clientId: string) {
    let wallet = await this.prisma.clientWallet.findUnique({
      where: { clientId },
      include: {
        client: { include: { user: true } }
      }
    });

    if (!wallet) {
      wallet = await this.prisma.clientWallet.create({
        data: { clientId },
        include: {
          client: { include: { user: true } }
        }
      });
    }

    return wallet;
  }

  async updateWalletCredits(clientId: string, updateDto: UpdateWalletCreditsDto, updatedBy: string) {
    const wallet = await this.getOrCreateWallet(clientId);

    const newCredits = wallet.availableCredits + updateDto.credits;

    if (newCredits < 0) {
      throw new BadRequestException('Insufficient credits');
    }

    // Atualizar carteira
    const updatedWallet = await this.prisma.clientWallet.update({
      where: { clientId },
      data: {
        availableCredits: newCredits,
        totalEarned: updateDto.credits > 0 ? wallet.totalEarned + updateDto.credits : wallet.totalEarned,
        totalSpent: updateDto.credits < 0 ? wallet.totalSpent + Math.abs(updateDto.credits) : wallet.totalSpent,
        lastTransaction: new Date(),
      },
      include: {
        client: { include: { user: true } }
      }
    });

    // Registrar transação
    await this.prisma.transaction.create({
      data: {
        clientId,
        type: TransactionType.CREDIT_ADJUSTMENT,
        amount: 0,
        credits: updateDto.credits,
        description: updateDto.description,
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    return updatedWallet;
  }

  async getWalletBalance(clientId: string) {
    return this.getOrCreateWallet(clientId);
  }

  async consumeCredits(clientId: string, credits: number, serviceId: string, taskId?: string) {
    const wallet = await this.getOrCreateWallet(clientId);

    if (wallet.availableCredits < credits) {
      throw new BadRequestException('Insufficient credits');
    }

    // Atualizar carteira
    const updatedWallet = await this.prisma.clientWallet.update({
      where: { clientId },
      data: {
        availableCredits: wallet.availableCredits - credits,
        totalSpent: wallet.totalSpent + credits,
        lastTransaction: new Date(),
      },
    });

    // Registrar transação de consumo
    await this.prisma.transaction.create({
      data: {
        clientId,
        type: TransactionType.SERVICE_CONSUMPTION,
        amount: 0,
        credits: -credits,
        description: `Credits consumed for service`,
        serviceId,
        taskId,
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    return updatedWallet;
  }

  // =============== SUBSCRIPTIONS ===============

  async createSubscription(clientId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const plan = await this.findOneSubscriptionPlan(createSubscriptionDto.planId);

    // Verificar se cliente já tem assinatura ativa
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        clientId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('Client already has an active subscription');
    }

    // Calcular próxima data de cobrança (30 dias)
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);

    const subscription = await this.prisma.subscription.create({
      data: {
        clientId,
        planId: createSubscriptionDto.planId,
        paymentMethod: createSubscriptionDto.paymentMethod,
        nextBillingDate,
      },
      include: {
        plan: true,
        client: { include: { user: true } }
      }
    });

    // Adicionar créditos iniciais
    await this.updateWalletCredits(
      clientId,
      {
        credits: plan.monthlyCredits,
        description: `Initial credits from subscription: ${plan.displayName}`,
      },
      'system'
    );

    return subscription;
  }

  async getClientSubscriptions(clientId: string) {
    return this.prisma.subscription.findMany({
      where: { clientId },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.CANCELLED,
        endDate: new Date(),
      },
      include: {
        plan: true,
        client: { include: { user: true } }
      }
    });
  }

  // =============== TRANSACTIONS ===============

  async findAllTransactions(query: QueryTransactionsDto) {
    const where: any = {};
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { include: { user: true } }
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } }
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  // =============== CLIENT CREDIT STATS ===============

  async getClientCreditStats(clientId: string) {
    // Obter carteira do cliente
    const wallet = await this.getOrCreateWallet(clientId);

    // Obter assinatura ativa
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        clientId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    // Calcular uso de créditos no mês atual
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyUsage = await this.prisma.transaction.aggregate({
      where: {
        clientId,
        credits: { lt: 0 }, // Apenas transações de consumo (créditos negativos)
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'COMPLETED',
      },
      _sum: { credits: true },
    });

    // Última cobrança
    const lastBilling = await this.prisma.transaction.findFirst({
      where: {
        clientId,
        type: {
          in: [TransactionType.SUBSCRIPTION_PAYMENT, TransactionType.CREDIT_PURCHASE],
        },
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      availableCredits: wallet.availableCredits,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      currentPlan: activeSubscription ? {
        id: activeSubscription.plan.id,
        name: activeSubscription.plan.name,
        displayName: activeSubscription.plan.displayName,
        monthlyCredits: activeSubscription.plan.monthlyCredits,
        price: activeSubscription.plan.monthlyPrice,
        nextBillingDate: activeSubscription.nextBillingDate,
      } : null,
      monthlyUsage: {
        month: currentMonth.toISOString().slice(0, 7), // YYYY-MM
        creditsUsed: Math.abs(monthlyUsage._sum.credits || 0),
        creditsRemaining: activeSubscription 
          ? Math.max(0, activeSubscription.plan.monthlyCredits - Math.abs(monthlyUsage._sum.credits || 0))
          : wallet.availableCredits,
      },
      lastBilling: lastBilling ? {
        date: lastBilling.createdAt,
        amount: lastBilling.amount,
        credits: lastBilling.credits,
        description: lastBilling.description,
        type: lastBilling.type,
      } : null,
      lastTransaction: wallet.lastTransaction,
    };
  }

  async getClientTransactionHistory(clientId: string, months: number = 3) {
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - months);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        clientId,
        createdAt: { gte: monthsAgo },
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limitar a 50 transações
    });

    return transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      credits: transaction.credits,
      description: transaction.description,
      date: transaction.createdAt,
      status: transaction.status,
    }));
  }

  async getClientMonthlyUsageChart(clientId: string, months: number = 6) {
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - months);

    // Buscar transações de consumo (créditos negativos) por mês
    const monthlyData = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(ABS(credits)) as credits_used,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE "clientId" = ${clientId}
        AND credits < 0 
        AND status = 'COMPLETED'
        AND "createdAt" >= ${monthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    ` as Array<{ month: Date; credits_used: bigint; transaction_count: bigint }>;

    return monthlyData.map(data => ({
      month: data.month.toISOString().slice(0, 7), // YYYY-MM
      creditsUsed: Number(data.credits_used),
      transactionCount: Number(data.transaction_count),
    }));
  }

  async getClientServiceUsage(clientId: string, months: number = 1) {
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - months);

    const serviceUsage = await this.prisma.transaction.findMany({
      where: {
        clientId,
        serviceId: { not: null },
        credits: { lt: 0 }, // Apenas consumo
        createdAt: { gte: monthsAgo },
        status: 'COMPLETED',
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            displayName: true,
            categoryId: true,
          },
        },
      },
    });

    // Agrupar por serviço
    const serviceMap = new Map();
    serviceUsage.forEach(transaction => {
      if (transaction.service) {
        const serviceId = transaction.service.id;
        if (!serviceMap.has(serviceId)) {
          serviceMap.set(serviceId, {
            service: transaction.service,
            creditsUsed: 0,
            transactionCount: 0,
          });
        }
        const serviceData = serviceMap.get(serviceId);
        serviceData.creditsUsed += Math.abs(transaction.credits);
        serviceData.transactionCount += 1;
      }
    });

    return Array.from(serviceMap.values()).sort((a, b) => b.creditsUsed - a.creditsUsed);
  }

  // =============== CREDIT DEDUCTION FOR SERVICE REQUESTS ===============

  async getClientWallet(clientId: string) {
    return this.getOrCreateWallet(clientId);
  }

  async deductCredits(clientId: string, credits: number, description: string, tx?: any) {
    const prisma = tx || this.prisma;
    
    const wallet = await prisma.clientWallet.findUnique({
      where: { clientId }
    });

    if (!wallet) {
      throw new NotFoundException('Client wallet not found');
    }

    if (wallet.availableCredits < credits) {
      throw new BadRequestException('Insufficient credits');
    }

    const updatedWallet = await prisma.clientWallet.update({
      where: { clientId },
      data: {
        availableCredits: wallet.availableCredits - credits,
        totalSpent: wallet.totalSpent + credits,
        lastTransaction: new Date(),
      },
    });

    await prisma.transaction.create({
      data: {
        clientId,
        type: TransactionType.SERVICE_CONSUMPTION,
        amount: 0,
        credits: -credits,
        description,
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    return updatedWallet;
  }

  // =============== ADMIN STATISTICS ===============

  async getBillingStats() {
    const [
      totalClients,
      activeSubscriptions,
      totalRevenue,
      creditsInCirculation,
      transactionsByType
    ] = await Promise.all([
      this.prisma.client.count(),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE }
      }),
      this.prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      this.prisma.clientWallet.aggregate({
        _sum: { availableCredits: true }
      }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        _count: { type: true },
        _sum: { amount: true }
      }),
    ]);

    return {
      totalClients,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      creditsInCirculation: creditsInCirculation._sum.availableCredits || 0,
      transactionsByType: transactionsByType.reduce((acc, item) => {
        acc[item.type] = {
          count: item._count.type,
          revenue: item._sum.amount || 0,
        };
        return acc;
      }, {}),
    };
  }
}