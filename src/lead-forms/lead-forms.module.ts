import { Module } from '@nestjs/common';
import { LeadFormsService } from './lead-forms.service';
import { LeadSubmissionsService } from './lead-submissions.service';
import { LeadFormsController } from './lead-forms.controller';
import { LeadSubmissionsController } from './lead-submissions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [LeadFormsController, LeadSubmissionsController],
  providers: [LeadFormsService, LeadSubmissionsService],
  exports: [LeadFormsService, LeadSubmissionsService],
})
export class LeadFormsModule {}