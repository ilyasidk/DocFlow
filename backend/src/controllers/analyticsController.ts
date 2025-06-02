import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';
import { Department } from '../models/User.js';

export class AnalyticsController {
  /**
   * Получить общую статистику по документам
   */
  static async getDocumentStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();
      
      const departmentFilter = req.query.department as Department | undefined;

      const stats = await AnalyticsService.getDocumentStats(startDate, endDate, departmentFilter);
      
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Получить статистику по типам документов
   */
  static async getDocumentsByType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();
      
      const departmentFilter = req.query.department as Department | undefined;

      const stats = await AnalyticsService.getDocumentsByType(startDate, endDate, departmentFilter);
      
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Получить статистику по времени одобрения документов
   */
  static async getApprovalTimeStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();
      
      const departmentFilter = req.query.department as Department | undefined;

      const stats = await AnalyticsService.getApprovalTimeStats(startDate, endDate, departmentFilter);
      
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Получить статистику по активности пользователей
   */
  static async getUserActivityStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();

      const stats = await AnalyticsService.getUserActivityStats(startDate, endDate);
      
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Получить статистику по департаментам
   */
  static async getDepartmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();

      const stats = await AnalyticsService.getDepartmentStats(startDate, endDate);
      
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
} 