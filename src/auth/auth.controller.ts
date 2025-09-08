import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterClientDto, RegisterEmployeeDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto, RequestLoginCodeDto, VerifyLoginCodeDto } from './dto/password-recovery.dto';
import { UpdateProfilePhotoDto } from './dto/update-profile-photo.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { User } from './decorators/user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private uploadService: UploadService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register/client')
  async registerClient(@Body() registerClientDto: RegisterClientDto) {
    return this.authService.registerClient(registerClientDto);
  }

  @Post('register/employee')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async registerEmployee(@Body() registerEmployeeDto: RegisterEmployeeDto) {
    return this.authService.registerEmployee(registerEmployeeDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@User('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('request-login-code')
  @HttpCode(HttpStatus.OK)
  async requestLoginCode(@Body() requestLoginCodeDto: RequestLoginCodeDto) {
    return this.authService.requestLoginCode(requestLoginCodeDto);
  }

  @Post('verify-login-code')
  @HttpCode(HttpStatus.OK)
  async verifyLoginCode(@Body() verifyLoginCodeDto: VerifyLoginCodeDto) {
    return this.authService.verifyLoginCode(verifyLoginCodeDto);
  }

  @Post('profile-photo/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadProfilePhoto(
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB');
    }

    const fileUrl = await this.uploadService.uploadFile(file, 'profile-photos');
    return this.authService.updateProfilePhoto(userId, fileUrl);
  }

  @Patch('profile-photo')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfilePhoto(
    @User('id') userId: string,
    @Body() updateProfilePhotoDto: UpdateProfilePhotoDto
  ) {
    return this.authService.updateProfilePhoto(userId, updateProfilePhotoDto.profilePhoto);
  }

  @Post('profile-photo/remove')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeProfilePhoto(@User('id') userId: string) {
    return this.authService.removeProfilePhoto(userId);
  }
}