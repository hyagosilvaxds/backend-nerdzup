import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateWebsiteConfigDto {
  // Geral
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
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
  @IsUrl()
  processButtonLink?: string;

  // Seção do vídeo
  @IsOptional()
  @IsString()
  videoTitle?: string;

  @IsOptional()
  @IsString()
  videoButtonText?: string;

  @IsOptional()
  @IsUrl()
  videoButtonLink?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
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
  @IsUrl()
  instagramLink?: string;

  @IsOptional()
  @IsUrl()
  twitterLink?: string;

  @IsOptional()
  @IsUrl()
  facebookLink?: string;
}