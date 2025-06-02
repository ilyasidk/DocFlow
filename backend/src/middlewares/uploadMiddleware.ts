// @ts-ignore
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Расширяем тип MulterError для включения code
interface MulterError extends Error {
  code: string;
  field?: string;
}

// Настройка multer для загрузки файлов в память
const storage = multer.memoryStorage();

// Настройка ограничений для загрузки файлов
const limits = {
  fileSize: 10 * 1024 * 1024, // 10 МБ
};

// Фильтрация файлов по типу
// @ts-ignore
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Разрешенные типы файлов
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Неподдерживаемый тип файла: ${file.mimetype}. Разрешены только: ${allowedMimeTypes.join(', ')}`));
  }
};

// Создаем middleware multer с настройками
export const upload = multer({ storage, limits, fileFilter });

// Middleware для обработки ошибок загрузки файлов
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error && 'code' in err) {
    const multerErr = err as MulterError;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Размер файла превышает 10 МБ' });
    }
    return res.status(400).json({ error: `Ошибка загрузки файла: ${multerErr.message}` });
  }

  if (err) {
    return res.status(400).json({ error: err.message });
  }

  next();
}; 