import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Обертка для асинхронных контроллеров
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.use(asyncHandler(authMiddleware));

router.get('/', asyncHandler(UserController.getUsersByRole));
router.post('/', asyncHandler(UserController.addUser));
router.delete('/:id', asyncHandler(UserController.deleteUser));
router.patch('/:id', asyncHandler(UserController.updateUser));

export default router; 