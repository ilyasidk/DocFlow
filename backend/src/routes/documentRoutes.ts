import { Router } from 'express';
import { DocumentController } from '../controllers/documentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload, handleUploadErrors } from '../middlewares/uploadMiddleware.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Обертка для асинхронных контроллеров
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Защищаем все маршруты с документами
router.use(authMiddleware);

// Маршруты для работы с документами
// @ts-ignore
router.post('/', upload.single('file'), handleUploadErrors, asyncHandler(DocumentController.createDocument));
// @ts-ignore
router.get('/', asyncHandler(DocumentController.getDocuments));
// @ts-ignore
router.get('/pending-approval', asyncHandler(DocumentController.getPendingApprovals));
// @ts-ignore
router.get('/:id', asyncHandler(DocumentController.getDocumentById));
// @ts-ignore
router.post('/:id/submit', asyncHandler(DocumentController.submitForApproval));
// @ts-ignore
router.post('/:id/approve', asyncHandler(DocumentController.approveDocument));
// @ts-ignore
router.post('/:id/reject', asyncHandler(DocumentController.rejectDocument));
// @ts-ignore
router.post('/:id/version', upload.single('file'), handleUploadErrors, asyncHandler(DocumentController.uploadNewVersion));
// @ts-ignore
router.post('/:id/comment', asyncHandler(DocumentController.addComment));
// @ts-ignore
router.post('/:id/archive', asyncHandler(DocumentController.archiveDocument));

export default router; 