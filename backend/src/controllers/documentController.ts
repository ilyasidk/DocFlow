import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/documentService.js';
import { FileService } from '../services/fileService.js';
import { DocumentStatus, DocumentType } from '../models/Document.js';
import { Department } from '../models/User.js';

export class DocumentController {
  /**
   * Создает новый документ
   */
  static async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'Необходимо загрузить файл документа' });
      }

      const fileService = new FileService();
      const fileUrl = await fileService.uploadFile(req.file, 'documents');

      const document = await DocumentService.createDocument(
        req.user,
        req.body,
        fileUrl
      );

      res.status(201).json(document);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Получает список документов с фильтрацией
   */
  static async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const filters: {
        status?: DocumentStatus;
        type?: DocumentType;
        department?: Department;
        createdBy?: string;
        search?: string;
        tags?: string[];
      } = {};

      // Применяем фильтры из запроса
      if (req.query.status) filters.status = req.query.status as DocumentStatus;
      if (req.query.type) filters.type = req.query.type as DocumentType;
      if (req.query.department) filters.department = req.query.department as Department;
      if (req.query.createdBy) filters.createdBy = req.query.createdBy as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.tags) {
        filters.tags = Array.isArray(req.query.tags) 
          ? req.query.tags as string[]
          : [req.query.tags as string];
      }

      // Настройки пагинации
      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        sortBy: req.query.sortBy as string,
        sortDirection: (req.query.sortDirection as 'asc' | 'desc') || 'desc'
      };

      const result = await DocumentService.getDocuments(filters, pagination);
      
      res.json({
        documents: result.documents,
        total: result.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(result.total / pagination.limit)
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Получает документ по ID
   */
  static async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const document = await DocumentService.getDocumentById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ error: 'Документ не найден' });
      }

      res.json(document);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Отправляет документ на согласование
   */
  static async submitForApproval(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const document = await DocumentService.submitForApproval(req.params.id, req.user);
      res.json(document);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Утверждает документ текущим пользователем
   */
  static async approveDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const document = await DocumentService.approveDocument(
        req.params.id, 
        req.user, 
        req.body.comment
      );
      
      res.json(document);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Отклоняет документ текущим пользователем
   */
  static async rejectDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      if (!req.body.comment) {
        return res.status(400).json({ error: 'Необходимо указать причину отклонения' });
      }

      const document = await DocumentService.rejectDocument(
        req.params.id, 
        req.user, 
        req.body.comment
      );
      
      res.json(document);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Загружает новую версию документа
   */
  static async uploadNewVersion(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Необходимо загрузить файл документа' });
      }

      const fileService = new FileService();
      const fileUrl = await fileService.uploadFile(req.file, 'documents');

      const document = await DocumentService.addNewVersion(
        req.params.id,
        req.user,
        fileUrl,
        req.body.comment
      );
      
      res.json(document);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Получает список документов, ожидающих согласования пользователем
   */
  static async getPendingApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      };

      const result = await DocumentService.getDocumentsPendingApprovalByUser(req.user, pagination);
      
      res.json({
        documents: result.documents,
        total: result.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(result.total / pagination.limit)
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Добавляет комментарий к документу
   */
  static async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      if (!req.body.text) {
        return res.status(400).json({ error: 'Текст комментария не может быть пустым' });
      }

      const document = await DocumentService.addComment(
        req.params.id,
        req.user,
        req.body.text
      );
      
      res.json(document);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Архивирует документ
   */
  static async archiveDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const document = await DocumentService.archiveDocument(req.params.id, req.user);
      res.json(document);
    } catch (err) {
      next(err);
    }
  }
} 