// @ts-ignore
import { Storage } from '@google-cloud/storage';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class FileService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    if (!process.env.GCP_PROJECT_ID || !process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY) {
      throw new Error('Google Cloud Storage credentials are not configured');
    }

    if (!process.env.GCS_BUCKET_NAME) {
      throw new Error('Google Cloud Storage bucket name is not configured');
    }

    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    this.bucketName = process.env.GCS_BUCKET_NAME;
  }

  /**
   * Загружает файл в Google Cloud Storage
   * @param file - Express файл с буфером
   * @param directory - Директория внутри бакета
   * @returns URL загруженного файла
   */
  // @ts-ignore
  async uploadFile(file: Express.Multer.File, directory: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${directory}/${uuidv4()}${fileExtension}`;
      
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
          },
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err: Error) => {
          console.error('Error during blobStream:', err);
          reject(err);
        });

        blobStream.on('finish', async () => {
          // Делаем файл публично доступным - УДАЛЕНО, так как бакет использует Uniform Bucket-Level Access
          // await blob.makePublic(); 
          
          // Возвращаем публичный URL
          // Убедитесь, что бакет настроен на публичный доступ через IAM, если это необходимо
          const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Error in uploadFile function:', error);
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  }

  /**
   * Удаляет файл из Google Cloud Storage
   * @param fileUrl - Полный URL файла
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Извлекаем имя файла из URL
      const urlPath = new URL(fileUrl).pathname;
      // Ensure correct parsing of filename from URL, especially if bucket name could be in path
      const prefix = `/storage/v1/b/${this.bucketName}/o/`;
      let objectName = '';
      if (urlPath.startsWith(prefix)) {
        objectName = urlPath.substring(prefix.length);
      } else if (urlPath.startsWith(`/${this.bucketName}/`)) { // Alternative if URL is direct path
        objectName = urlPath.substring(`/${this.bucketName}/`.length);
      } else {
        // Fallback or error if structure is unexpected
        console.warn(`Unexpected file URL structure: ${fileUrl}. Attempting to use full path after first slash.`);
        objectName = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
      }
      
      await this.storage.bucket(this.bucketName).file(decodeURIComponent(objectName)).delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }
} 