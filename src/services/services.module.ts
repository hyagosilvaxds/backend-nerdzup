import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceCategoriesService } from './service-categories.service';
import { ServicesController } from './services.controller';
import { ServiceCategoriesController } from './service-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [ServicesController, ServiceCategoriesController],
  providers: [ServicesService, ServiceCategoriesService],
  exports: [ServicesService, ServiceCategoriesService],
})
export class ServicesModule {}