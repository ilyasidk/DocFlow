import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

// Обертка для асинхронных контроллеров
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/login', asyncHandler(AuthController.login));

export default router; 