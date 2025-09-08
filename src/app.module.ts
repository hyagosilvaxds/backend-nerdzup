import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { ClientsModule } from './clients/clients.module';
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { SmtpModule } from './smtp/smtp.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { LeadFormsModule } from './lead-forms/lead-forms.module';
import { ServicesModule } from './services/services.module';
import { TasksModule } from './tasks/tasks.module';
import { BillingModule } from './billing/billing.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { CmsModule } from './cms/cms.module';
import { ChatModule } from './chat/chat.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EmailModule,
    AuthModule,
    EmployeesModule,
    ClientsModule,
    UploadModule,
    SmtpModule,
    EmailTemplatesModule,
    LeadFormsModule,
    ServicesModule,
    TasksModule,
    BillingModule,
    ApiKeysModule,
    CmsModule,
    // ChatModule, // Temporarily disabled due to circular dependencies
    ServiceRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
