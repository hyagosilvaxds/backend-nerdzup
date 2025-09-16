import { PartialType } from '@nestjs/mapped-types';
import { CreateSmtpConfigurationDto } from './create-smtp-configuration.dto';

export class UpdateSmtpConfigurationDto extends PartialType(CreateSmtpConfigurationDto) {}