import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadsPath = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
    if (!fs.existsSync(join(this.uploadsPath, 'documents'))) {
      fs.mkdirSync(join(this.uploadsPath, 'documents'), { recursive: true });
    }
    if (!fs.existsSync(join(this.uploadsPath, 'images'))) {
      fs.mkdirSync(join(this.uploadsPath, 'images'), { recursive: true });
    }
    if (!fs.existsSync(join(this.uploadsPath, 'profile-photos'))) {
      fs.mkdirSync(join(this.uploadsPath, 'profile-photos'), { recursive: true });
    }
    if (!fs.existsSync(join(this.uploadsPath, 'service-icons'))) {
      fs.mkdirSync(join(this.uploadsPath, 'service-icons'), { recursive: true });
    }
    if (!fs.existsSync(join(this.uploadsPath, 'service-request-documents'))) {
      fs.mkdirSync(join(this.uploadsPath, 'service-request-documents'), { recursive: true });
    }
  }

  getMulterConfig(destination: string = 'documents') {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(this.uploadsPath, destination);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = uuid();
          const fileExt = extname(file.originalname);
          const fileName = `${uniqueSuffix}${fileExt}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedMimes = [
          // Images
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          // Documents
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB limit
      },
    };
  }

  getFileUrl(filePath: string): string {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    
    // If filePath already starts with /uploads, use it as is
    if (filePath.startsWith('/uploads')) {
      return `${baseUrl}${filePath}`;
    }
    
    // Otherwise, treat it as a relative path from uploads directory
    const relativePath = filePath.replace(this.uploadsPath, '').replace(/\\/g, '/');
    const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${baseUrl}/uploads${normalizedPath}`;
  }

  deleteFile(filePath: string): boolean {
    try {
      const fullPath = join(this.uploadsPath, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async uploadFile(file: Express.Multer.File, destination: string = 'documents'): Promise<string> {
    const uploadPath = join(this.uploadsPath, destination);
    
    // Ensure destination directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const uniqueSuffix = uuid();
    const fileExt = extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExt}`;
    const fullPath = join(uploadPath, fileName);

    // Write file to disk
    await fs.promises.writeFile(fullPath, file.buffer);
    
    // Return the URL
    return this.getFileUrl(join(destination, fileName));
  }

  getFileInfo(filePath: string) {
    try {
      const fullPath = join(this.uploadsPath, filePath);
      const stats = fs.statSync(fullPath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      return {
        exists: false,
      };
    }
  }
}