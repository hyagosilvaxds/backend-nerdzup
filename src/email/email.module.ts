import { Global, Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmtpModule } from '../smtp/smtp.module';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';

@Global()
@Module({
  imports: [
    forwardRef(() => SmtpModule),
    forwardRef(() => EmailTemplatesModule),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}