import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { RegisterClientDto, RegisterEmployeeDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto, RequestLoginCodeDto, VerifyLoginCodeDto } from './dto/password-recovery.dto';
import { EmailService } from '../email/email.service';
import { UploadService } from '../upload/upload.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private uploadService: UploadService,
    private billingService: BillingService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        client: true,
        employee: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas, verifique seu e-mail e senha');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta de usuário desativada');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto && !user.profilePhoto.startsWith('http') ? this.uploadService.getFileUrl(user.profilePhoto) : user.profilePhoto,
        client: user.client,
        employee: user.employee,
      },
    };
  }

  async registerClient(registerClientDto: RegisterClientDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerClientDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerClientDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerClientDto.email,
        password: hashedPassword,
        role: Role.CLIENT,
        profilePhoto: registerClientDto.profilePhoto,
        client: {
          create: {
            fullName: registerClientDto.fullName,
            personType: registerClientDto.personType,
            taxDocument: registerClientDto.taxDocument,
            position: registerClientDto.position,
            companyName: registerClientDto.companyName,
            tradeName: registerClientDto.tradeName,
            sector: registerClientDto.sector,
            companySize: registerClientDto.companySize,
            website: registerClientDto.website,
            phone: registerClientDto.phone,
            street: registerClientDto.street,
            city: registerClientDto.city,
            state: registerClientDto.state,
            zipCode: registerClientDto.zipCode,
            country: registerClientDto.country || 'Brasil',
          },
        },
      },
      include: {
        client: true,
      },
    });

    // Criar wallet automaticamente para o novo cliente
    if (user.client?.id) {
      await this.billingService.getOrCreateWallet(user.client.id);
    }

    const { password, ...result } = user;
    return result;
  }

  async registerEmployee(registerEmployeeDto: RegisterEmployeeDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerEmployeeDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerEmployeeDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerEmployeeDto.email,
        password: hashedPassword,
        role: Role.EMPLOYEE,
        profilePhoto: registerEmployeeDto.profilePhoto,
        employee: {
          create: {
            name: registerEmployeeDto.name,
            position: registerEmployeeDto.position,
            department: registerEmployeeDto.department,
            phone: registerEmployeeDto.phone,
          },
        },
      },
      include: {
        employee: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        employee: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      profilePhoto: userWithoutPassword.profilePhoto && !userWithoutPassword.profilePhoto.startsWith('http') ? this.uploadService.getFileUrl(userWithoutPassword.profilePhoto) : userWithoutPassword.profilePhoto,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If this email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // Save token to database
    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt,
      },
    });

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(email, resetUrl);

    return { message: 'If this email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    return { message: 'Password has been reset successfully' };
  }

  async requestLoginCode(requestLoginCodeDto: RequestLoginCodeDto): Promise<{ message: string }> {
    const { email } = requestLoginCodeDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If this email exists, a login code has been sent.' };
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiration

    // Save code to database
    await this.prisma.loginCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendPasswordlessLoginEmail(email, code);

    return { message: 'If this email exists, a login code has been sent.' };
  }

  async verifyLoginCode(verifyLoginCodeDto: VerifyLoginCodeDto) {
    const { email, code } = verifyLoginCodeDto;

    const loginCode = await this.prisma.loginCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!loginCode) {
      throw new BadRequestException('Invalid or expired login code');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        client: true,
        employee: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account disabled');
    }

    // Mark code as used
    await this.prisma.loginCode.update({
      where: { id: loginCode.id },
      data: { used: true },
    });

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        client: user.client,
        employee: user.employee,
      },
    };
  }

  async updateProfilePhoto(userId: string, profilePhotoUrl?: string | null) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: profilePhotoUrl || null },
      include: {
        client: true,
        employee: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async removeProfilePhoto(userId: string) {
    return this.updateProfilePhoto(userId, null);
  }

  // Clean up expired tokens (should be called by a cron job)
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { used: true },
        ],
      },
    });

    await this.prisma.loginCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { used: true },
        ],
      },
    });
  }
}