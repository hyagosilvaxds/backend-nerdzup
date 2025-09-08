import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';
import { SmtpService } from '../smtp/smtp.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface DatabaseEmailOptions {
  to: string;
  templateName: string;
  variables: Record<string, any>;
  smtpConfigId?: string; // ID da configuração SMTP a usar (opcional, usa a ativa por padrão)
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => SmtpService))
    private smtpService: SmtpService,
    @Inject(forwardRef(() => EmailTemplatesService))
    private emailTemplatesService: EmailTemplatesService,
  ) {
    this.createTransporter();
  }

  private createTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, template, context } = options;

    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'email',
      'templates',
      `${template}.hbs`,
    );

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateContent);
    const html = compiledTemplate(context);

    const fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'Nerdzup Marketing';
    const fromAddress = this.configService.get<string>('SMTP_FROM') || 'noreply@nerdzup.com';
    
    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Recuperação de Senha - Nerdzup',
      template: 'password-reset',
      context: {
        resetUrl,
        frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        companyName: 'Nerdzup Marketing Agency',
      },
    });
  }

  async sendPasswordlessLoginEmail(to: string, code: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Código de Acesso - Nerdzup',
      template: 'passwordless-login',
      context: {
        code,
        frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        companyName: 'Nerdzup Marketing Agency',
        expirationMinutes: 15,
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Bem-vindo à Nerdzup!',
      template: 'welcome',
      context: {
        name,
        frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        companyName: 'Nerdzup Marketing Agency',
      },
    });
  }

  // Novos métodos usando configurações do banco de dados
  async sendEmailWithTemplate(options: DatabaseEmailOptions): Promise<void> {
    const { to, templateName, variables, smtpConfigId } = options;

    try {
      // Renderiza o template do banco de dados
      const rendered = await this.emailTemplatesService.renderTemplateByName(templateName, variables);
      
      // Obtém o transporter e configuração SMTP
      const transporter = await this.smtpService.createTransporter(smtpConfigId);
      const { fromName, fromEmail } = await this.smtpService.getConfigurationInfo(smtpConfigId);

      // Envia o email
      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text || undefined,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar email com template do banco:', error);
      throw error;
    }
  }

  async sendPasswordResetEmailFromDB(to: string, resetUrl: string, smtpConfigId?: string): Promise<void> {
    await this.sendEmailWithTemplate({
      to,
      templateName: 'password-reset',
      variables: {
        resetUrl,
        frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        companyName: 'Nerdzup Marketing Agency',
      },
      smtpConfigId,
    });
  }

  async sendPasswordlessLoginEmailFromDB(to: string, code: string, smtpConfigId?: string): Promise<void> {
    await this.sendEmailWithTemplate({
      to,
      templateName: 'passwordless-login',
      variables: {
        code,
        frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        companyName: 'Nerdzup Marketing Agency',
        expirationMinutes: 15,
      },
      smtpConfigId,
    });
  }

  async sendWelcomeEmailFromDB(to: string, name: string, smtpConfigId?: string): Promise<void> {
    await this.sendEmailWithTemplate({
      to,
      templateName: 'welcome',
      variables: {
        name,
        frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        companyName: 'Nerdzup Marketing Agency',
      },
      smtpConfigId,
    });
  }
}