import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash da senha padrão para todos os usuários
  const defaultPassword = await bcrypt.hash('123456', 10);

  // 1. Criar usuário ADMIN
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nerdzup.com' },
    update: {},
    create: {
      email: 'admin@nerdzup.com',
      password: defaultPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✓ Admin user created:', adminUser.email);

  // 2. Criar usuário FUNCIONÁRIO
  const employeeUser = await prisma.user.upsert({
    where: { email: 'funcionario@nerdzup.com' },
    update: {},
    create: {
      email: 'funcionario@nerdzup.com',
      password: defaultPassword,
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  // Criar perfil de funcionário
  const employee = await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: {},
    create: {
      userId: employeeUser.id,
      name: 'João Silva',
      position: 'Desenvolvedor Full Stack',
      department: 'Tecnologia',
      phone: '+55 11 99999-0001',
      isActive: true,
      hireDate: new Date('2024-01-15'),
    },
  });

  console.log('✓ Employee user and profile created:', employeeUser.email);

  // 3. Criar usuário CLIENTE
  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@empresa.com' },
    update: {},
    create: {
      email: 'cliente@empresa.com',
      password: defaultPassword,
      role: 'CLIENT',
      isActive: true,
    },
  });

  // Criar perfil de cliente
  const client = await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      fullName: 'Maria Oliveira',
      companyName: 'Tech Solutions Ltda',
      phone: '+55 11 88888-0001',
      taxDocument: '12.345.678/0001-90',
      personType: 'BUSINESS',
      street: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-000',
      country: 'Brasil',
    },
  });

  // Criar carteira para o cliente com alguns créditos iniciais
  const clientWallet = await prisma.clientWallet.upsert({
    where: { clientId: client.id },
    update: {},
    create: {
      clientId: client.id,
      availableCredits: 1000, // 1000 créditos iniciais
      totalEarned: 1000,
      totalSpent: 0,
    },
  });

  console.log('✓ Client user, profile and wallet created:', clientUser.email);

  // 4. Criar categorias de serviços
  const webCategory = await prisma.serviceCategory.upsert({
    where: { name: 'Desenvolvimento Web' },
    update: {},
    create: {
      name: 'Desenvolvimento Web',
      displayName: 'Desenvolvimento Web',
      description: 'Criação de sites, sistemas web e aplicações online',
      color: '#3B82F6',
      iconUrl: 'https://via.placeholder.com/64x64.png?text=WEB',
      isActive: true,
      order: 1,
    },
  });

  const marketingCategory = await prisma.serviceCategory.upsert({
    where: { name: 'Marketing Digital' },
    update: {},
    create: {
      name: 'Marketing Digital',
      displayName: 'Marketing Digital',
      description: 'Estratégias de marketing online e gestão de redes sociais',
      color: '#10B981',
      iconUrl: 'https://via.placeholder.com/64x64.png?text=MKT',
      isActive: true,
      order: 2,
    },
  });

  console.log('✓ Service categories created');

  // 5. Criar serviços
  const websiteService = await prisma.service.upsert({
    where: { name: 'desenvolvimento-site-institucional' },
    update: {},
    create: {
      name: 'desenvolvimento-site-institucional',
      displayName: 'Site Institucional',
      shortDescription: 'Desenvolvimento de site institucional profissional',
      description: 'Criação de site institucional completo com design moderno e responsivo',
      categoryId: webCategory.id,
      credits: 500,
      estimatedDays: 15,
      difficulty: 'INTERMEDIARIO',
      isActive: true,
      order: 1,
      features: ['Design Responsivo', 'SEO Otimizado', 'Painel Administrativo', 'Formulário de Contato'],
      benefits: ['Presença Digital Profissional', 'Aumento da Credibilidade', 'Geração de Leads'],
      iconUrl: 'https://via.placeholder.com/128x128.png?text=SITE',
    },
  });

  const socialMediaService = await prisma.service.upsert({
    where: { name: 'gestao-redes-sociais' },
    update: {},
    create: {
      name: 'gestao-redes-sociais',
      displayName: 'Gestão de Redes Sociais',
      shortDescription: 'Gestão completa das suas redes sociais',
      description: 'Planejamento, criação de conteúdo e gestão de redes sociais',
      categoryId: marketingCategory.id,
      credits: 300,
      estimatedDays: 30,
      difficulty: 'BASICO',
      isActive: true,
      order: 1,
      features: ['Criação de Conteúdo', 'Agendamento de Posts', 'Relatórios Mensais', 'Interação com Seguidores'],
      benefits: ['Aumento do Engajamento', 'Crescimento de Seguidores', 'Maior Visibilidade'],
      iconUrl: 'https://via.placeholder.com/128x128.png?text=SOCIAL',
    },
  });

  console.log('✓ Services created');

  // 6. Criar um plano de assinatura
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'basico' },
    update: {},
    create: {
      name: 'basico',
      displayName: 'Plano Básico',
      description: 'Ideal para pequenas empresas que estão começando',
      monthlyPrice: 299.99,
      monthlyCredits: 500,
      benefits: ['500 créditos mensais', 'Suporte via email', 'Relatórios mensais'],
      isActive: true,
      order: 1,
    },
  });

  console.log('✓ Subscription plan created');

  // 7. Criar algumas transações de exemplo para o cliente
  await prisma.transaction.create({
    data: {
      clientId: client.id,
      type: 'CREDIT_ADJUSTMENT',
      amount: 0,
      credits: 1000,
      description: 'Créditos iniciais de boas-vindas',
      status: 'COMPLETED',
      processedAt: new Date(),
    },
  });

  console.log('✓ Initial transaction created');

  // 8. Criar uma solicitação de serviço de exemplo
  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      serviceId: websiteService.id,
      clientId: client.id,
      creditsCost: websiteService.credits,
      projectName: 'Site Institucional TechCorp',
      description: 'Preciso de um site institucional para minha empresa de tecnologia',
      targetAudience: 'Empresas do setor de tecnologia',
      projectObjectives: 'Aumentar visibilidade online e captar novos clientes',
      brandGuidelines: 'Estilo moderno, cores azul e branco, logo já definido',
      preferredColors: ['#0066CC', '#FFFFFF', '#F5F5F5'],
      technicalRequirements: 'Responsivo, otimizado para SEO, integração com CRM',
      references: 'Apple.com, Microsoft.com - design limpo e profissional',
      observations: 'Prazo flexível, mas preferência por entrega antes do fim do ano',
      priority: 'MEDIA',
      dueDate: new Date('2024-12-31'),
      status: 'PENDING',
    },
  });

  console.log('✓ Sample service request created');

  // 9. Criar templates de email básicos
  const welcomeTemplate = await prisma.emailTemplate.upsert({
    where: { name: 'Bem-vindo Cliente' },
    update: {},
    create: {
      name: 'Bem-vindo Cliente',
      displayName: 'Bem-vindo Cliente',
      subject: 'Bem-vindo à Nerdzup!',
      htmlContent: `
        <h1>Bem-vindo à Nerdzup, {{clientName}}!</h1>
        <p>É um prazer tê-lo conosco. Sua conta foi criada com sucesso.</p>
        <p>Você recebeu <strong>{{initialCredits}} créditos</strong> para começar a usar nossos serviços.</p>
        <p>Entre em sua conta e explore nossas soluções digitais.</p>
        <br>
        <p>Atenciosamente,<br>Equipe Nerdzup</p>
      `,
      textContent: 'Bem-vindo à Nerdzup, {{clientName}}! É um prazer tê-lo conosco.',
      isActive: true,
    },
  });

  console.log('✓ Email templates created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Created users:');
  console.log('👑 Admin: admin@nerdzup.com (password: 123456)');
  console.log('👨‍💼 Employee: funcionario@nerdzup.com (password: 123456)');
  console.log('👤 Client: cliente@empresa.com (password: 123456)');
  console.log('\n💰 Client wallet: 1000 credits');
  console.log('🛍️ Services available: Website Development, Social Media Management');
  console.log('📄 Sample service request created (PENDING status)');
  console.log('\n🚀 You can now start testing the API!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });