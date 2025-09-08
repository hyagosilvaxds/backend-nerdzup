import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', {
    storage: require('multer').diskStorage({
      destination: (req, file, cb) => {
        const destination = req.query.destination || 'documents';
        cb(null, `./uploads/${destination}`);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = require('uuid').v4();
        const fileExt = require('path').extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('destination') destination?: string,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const response: UploadResponseDto = {
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileUrl: this.uploadService.getFileUrl(file.path),
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };

    return response;
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image', {
    storage: require('multer').diskStorage({
      destination: './uploads/images',
      filename: (req, file, cb) => {
        const uniqueSuffix = require('uuid').v4();
        const fileExt = require('path').extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos'), false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Nenhuma imagem foi enviada');
    }

    const response: UploadResponseDto = {
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileUrl: this.uploadService.getFileUrl(file.path),
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };

    return response;
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('document', {
    storage: require('multer').diskStorage({
      destination: './uploads/documents',
      filename: (req, file, cb) => {
        const uniqueSuffix = require('uuid').v4();
        const fileExt = require('path').extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de documento não permitido'), false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Nenhum documento foi enviado');
    }

    const response: UploadResponseDto = {
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileUrl: this.uploadService.getFileUrl(file.path),
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };

    return response;
  }

  private getDestinationByMimeType(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'images';
    }
    return 'documents';
  }
}