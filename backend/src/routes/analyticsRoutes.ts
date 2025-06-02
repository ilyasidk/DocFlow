import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Обертка для асинхронных контроллеров
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Защищаем все маршруты аналитики
router.use(authMiddleware);

// Маршруты для аналитики
// @ts-ignore
router.get('/documents/stats', asyncHandler(AnalyticsController.getDocumentStats));
// @ts-ignore
router.get('/documents/by-type', asyncHandler(AnalyticsController.getDocumentsByType));
// @ts-ignore
router.get('/documents/approval-time', asyncHandler(AnalyticsController.getApprovalTimeStats));
// @ts-ignore
router.get('/users/activity', asyncHandler(AnalyticsController.getUserActivityStats));
// @ts-ignore
router.get('/departments/stats', asyncHandler(AnalyticsController.getDepartmentStats));

export default router; 