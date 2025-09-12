import { IsString, IsOptional } from 'class-validator';

export class UpdateWebsiteConfigDto {
  // Geral
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  clientsCounter?: string;

  @IsOptional()
  @IsString()
  counterText?: string;

  // Hero
  @IsOptional()
  @IsString()
  heroTitle?: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @IsOptional()
  @IsString()
  heroDescription?: string;

  // Processo
  @IsOptional()
  @IsString()
  processTitle?: string;

  @IsOptional()
  @IsString()
  processButtonText?: string;

  @IsOptional()
  @IsString()
  processButtonLink?: string;

  // Seção do vídeo
  @IsOptional()
  @IsString()
  videoTitle?: string;

  @IsOptional()
  @IsString()
  videoButtonText?: string;

  @IsOptional()
  @IsString()
  videoButtonLink?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  videoPosterUrl?: string;

  // FAQ
  @IsOptional()
  @IsString()
  faqTitle?: string;

  // Footer
  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsString()
  footerCopyright?: string;

  @IsOptional()
  @IsString()
  instagramLink?: string;

  @IsOptional()
  @IsString()
  twitterLink?: string;

  @IsOptional()
  @IsString()
  facebookLink?: string;
}