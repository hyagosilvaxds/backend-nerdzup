export class UploadResponseDto {
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export class UploadErrorDto {
  error: string;
  message: string;
}