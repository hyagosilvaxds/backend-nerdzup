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
import { BillingService } from './billing.service';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from './dto/subscription-plan.dto';
import { CreateCreditPackageDto, UpdateCreditPackageDto } from './dto/credit-package.dto';
import { UpdateWalletCreditsDto, PurchaseCreditsDto, CreateSubscriptionDto, QueryTransactionsDto, PurchaseSubscriptionDto, PurchaseCreditPackageDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // =============== SUBSCRIPTION PLANS ===============

  @Post('subscription-plans')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createSubscriptionPlan(@Body() createPlanDto: CreateSubscriptionPlanDto) {
    return this.billingService.createSubscriptionPlan(createPlanDto);
  }

  @Get('subscription-plans')
  findAllSubscriptionPlans(@Query('includeInactive') includeInactive?: string) {
    const activeOnly = includeInactive !== 'true';
    return this.billingService.findAllSubscriptionPlans(activeOnly);
  }

  @Get('subscription-plans/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findOneSubscriptionPlan(@Param('id') id: string) {
    return this.billingService.findOneSubscriptionPlan(id);
  }

  @Patch('subscription-plans/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateSubscriptionPlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdateSubscriptionPlanDto
  ) {
    return this.billingService.updateSubscriptionPlan(id, updatePlanDto);
  }

  @Delete('subscription-plans/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSubscriptionPlan(@Param('id') id: string) {
    return this.billingService.deleteSubscriptionPlan(id);
  }

  // =============== CREDIT PACKAGES ===============

  @Post('credit-packages')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createCreditPackage(@Body() createPackageDto: CreateCreditPackageDto) {
    return this.billingService.createCreditPackage(createPackageDto);
  }

  @Get('credit-packages')
  findAllCreditPackages(@Query('includeInactive') includeInactive?: string) {
    const activeOnly = includeInactive !== 'true';
    return this.billingService.findAllCreditPackages(activeOnly);
  }

  @Get('credit-packages/:id')
  findOneCreditPackage(@Param('id') id: string) {
    return this.billingService.findOneCreditPackage(id);
  }

  @Patch('credit-packages/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateCreditPackage(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdateCreditPackageDto
  ) {
    return this.billingService.updateCreditPackage(id, updatePackageDto);
  }

  @Delete('credit-packages/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCreditPackage(@Param('id') id: string) {
    return this.billingService.deleteCreditPackage(id);
  }

  // =============== CLIENT WALLET ===============

  @Get('wallet')
  getMyWallet(@User('clientId') clientId: string) {
    if (!clientId) {
      return { error: 'Only clients can access wallet' };
    }
    return this.billingService.getWalletBalance(clientId);
  }

  @Get('wallet/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getClientWallet(@Param('clientId') clientId: string) {
    return this.billingService.getWalletBalance(clientId);
  }

  @Patch('wallet/:clientId/credits')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateClientCredits(
    @Param('clientId') clientId: string,
    @Body() updateDto: UpdateWalletCreditsDto,
    @User('id') userId: string
  ) {
    return this.billingService.updateWalletCredits(clientId, updateDto, userId);
  }

  // =============== SUBSCRIPTIONS ===============

  @Post('subscriptions')
  createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @User('clientId') clientId: string
  ) {
    if (!clientId) {
      return { error: 'Only clients can create subscriptions' };
    }
    return this.billingService.createSubscription(clientId, createSubscriptionDto);
  }

  @Get('subscriptions')
  getMySubscriptions(@User('clientId') clientId: string) {
    if (!clientId) {
      return { error: 'Only clients can access subscriptions' };
    }
    return this.billingService.getClientSubscriptions(clientId);
  }

  @Get('subscriptions/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getClientSubscriptions(@Param('clientId') clientId: string) {
    return this.billingService.getClientSubscriptions(clientId);
  }

  @Post('subscriptions/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelSubscription(@Param('id') subscriptionId: string, @User('clientId') clientId: string) {
    if (!clientId) {
      return { error: 'Only clients can cancel subscriptions' };
    }
    return this.billingService.cancelSubscription(subscriptionId);
  }

  @Post('subscriptions/:id/change-plan')
  @HttpCode(HttpStatus.OK)
  changeSubscriptionPlan(
    @Param('id') subscriptionId: string,
    @Body() changeDto: PurchaseSubscriptionDto,
    @User('clientId') clientId: string
  ) {
    if (!clientId) {
      return { error: 'Only clients can change subscription plans' };
    }
    return this.billingService.changeSubscriptionPlan(subscriptionId, changeDto);
  }

  // =============== TRANSACTIONS ===============

  @Get('transactions')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  findAllTransactions(@Query() query: QueryTransactionsDto) {
    return this.billingService.findAllTransactions(query);
  }

  @Get('transactions/my')
  findMyTransactions(
    @Query() query: QueryTransactionsDto,
    @User('clientId') clientId: string
  ) {
    if (!clientId) {
      return { error: 'Only clients can access personal transactions' };
    }
    query.clientId = clientId;
    return this.billingService.findAllTransactions(query);
  }

  @Get('transactions/:id')
  findOneTransaction(@Param('id') id: string) {
    return this.billingService.getTransactionById(id);
  }

  // =============== CLIENT CREDIT STATS ===============

  @Get('my-stats')
  getMyCreditStats(@User('clientId') clientId: string) {
    if (!clientId) {
      return { error: 'Only clients can access credit stats' };
    }
    return this.billingService.getClientCreditStats(clientId);
  }

  @Get('my-history')
  getMyTransactionHistory(
    @User('clientId') clientId: string,
    @Query('months') months?: string
  ) {
    if (!clientId) {
      return { error: 'Only clients can access transaction history' };
    }
    const monthsNum = months ? parseInt(months) : 3;
    return this.billingService.getClientTransactionHistory(clientId, monthsNum);
  }

  @Get('my-usage-chart')
  getMyUsageChart(
    @User('clientId') clientId: string,
    @Query('months') months?: string
  ) {
    if (!clientId) {
      return { error: 'Only clients can access usage chart' };
    }
    const monthsNum = months ? parseInt(months) : 6;
    return this.billingService.getClientMonthlyUsageChart(clientId, monthsNum);
  }

  @Get('my-service-usage')
  getMyServiceUsage(
    @User('clientId') clientId: string,
    @Query('months') months?: string
  ) {
    if (!clientId) {
      return { error: 'Only clients can access service usage' };
    }
    const monthsNum = months ? parseInt(months) : 1;
    return this.billingService.getClientServiceUsage(clientId, monthsNum);
  }

  @Get('client-stats/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getClientStats(@Param('clientId') clientId: string) {
    return this.billingService.getClientCreditStats(clientId);
  }

  @Get('client-history/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getClientHistory(
    @Param('clientId') clientId: string,
    @Query('months') months?: string
  ) {
    const monthsNum = months ? parseInt(months) : 3;
    return this.billingService.getClientTransactionHistory(clientId, monthsNum);
  }

  @Get('client-usage-chart/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getClientUsageChart(
    @Param('clientId') clientId: string,
    @Query('months') months?: string
  ) {
    const monthsNum = months ? parseInt(months) : 6;
    return this.billingService.getClientMonthlyUsageChart(clientId, monthsNum);
  }

  @Get('client-service-usage/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getClientServiceUsage(
    @Param('clientId') clientId: string,
    @Query('months') months?: string
  ) {
    const monthsNum = months ? parseInt(months) : 1;
    return this.billingService.getClientServiceUsage(clientId, monthsNum);
  }

  // =============== ADMIN STATISTICS ===============

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getStats() {
    return this.billingService.getBillingStats();
  }

  // =============== CLIENT PURCHASES ===============

  @Post('purchase/subscription')
  @HttpCode(HttpStatus.OK)
  purchaseSubscription(
    @Body() purchaseDto: PurchaseSubscriptionDto,
    @User('clientId') clientId: string
  ) {
    if (!clientId) {
      return { error: 'Only clients can purchase subscriptions' };
    }
    return this.billingService.purchaseSubscription(clientId, purchaseDto);
  }

  @Post('purchase/credits')
  @HttpCode(HttpStatus.OK)
  purchaseCreditPackage(
    @Body() purchaseDto: PurchaseCreditPackageDto,
    @User('clientId') clientId: string
  ) {
    if (!clientId) {
      return { error: 'Only clients can purchase credit packages' };
    }
    return this.billingService.purchaseCreditPackage(clientId, purchaseDto);
  }
}