import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileData } from '../types/application';

export class FileUploadService {
  private uploadDir: string;
  private maxFileSize: number;
  private allowedTypes: string[];

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './public/uploads';
    this.maxFileSize = parseInt(process.env.UPLOAD_MAX_SIZE || '104857600'); // 100MB
    this.allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
  }

  async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
      throw new Error('Failed to create upload directory');
    }
  }

  async saveFile(file: any, applicationId: string): Promise<FileData> {
    await this.ensureUploadDir();

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    const fileExtension = path.extname(file.name);
    const fileName = `${applicationId}_${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);
    const publicPath = `/uploads/${fileName}`;

    try {
      // Move file to uploads directory
      await fs.rename(file.path, filePath);

      return {
        application_id: applicationId,
        file_name: fileName,
        original_name: file.name,
        file_path: publicPath,
        file_size: file.size,
        file_type: file.type,
      };
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async saveMultipleFiles(files: any[], applicationId: string): Promise<FileData[]> {
    const savedFiles: FileData[] = [];

    for (const file of files) {
      try {
        const fileData = await this.saveFile(file, applicationId);
        savedFiles.push(fileData);
      } catch (error) {
        console.error(`Error saving file ${file.name}:`, error);
        // Continue with other files
      }
    }

    return savedFiles;
  }
}
