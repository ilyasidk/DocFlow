import { DocumentModel, IDocument, DocumentStatus, DocumentType, IApprovalStep, IComment } from '../models/Document.js';
import { UserRole, Department, IUser } from '../models/User.js';
import { Types } from 'mongoose';

export class DocumentService {
  /**
   * Создает новый документ
   */
  static async createDocument(
    user: IUser,
    documentData: {
      title: string;
      description?: string;
      type: DocumentType;
      department: string;
      approvalSteps: {
        position: number;
        role?: UserRole;
        department?: Department;
        assignedTo?: string[];
      }[];
      tags?: string[];
      metadata?: Record<string, any>;
      expiresAt?: Date;
    },
    fileUrl: string
  ): Promise<IDocument> {
    // Преобразуем шаги согласования
    const approvalSteps: IApprovalStep[] = documentData.approvalSteps.map(step => {
      return {
        position: step.position,
        role: step.role,
        department: step.department,
        assignedTo: step.assignedTo?.map(id => new Types.ObjectId(id)),
        approvers: [], // Будет заполнено позже
        status: DocumentStatus.PENDING_REVIEW,
        allApproversRequired: true
      };
    });

    // Сортируем шаги по позиции
    approvalSteps.sort((a, b) => a.position - b.position);

    // Создаем документ
    const document = await DocumentModel.create({
      title: documentData.title,
      description: documentData.description,
      type: documentData.type,
      status: DocumentStatus.DRAFT,
      department: documentData.department,
      createdBy: user._id as Types.ObjectId,
      currentVersion: 1,
      versions: [{
        version: 1,
        fileUrl,
        createdAt: new Date(),
        createdBy: user._id as Types.ObjectId
      }],
      approvals: [],
      tags: documentData.tags,
      metadata: documentData.metadata,
      expiresAt: documentData.expiresAt,
      currentStep: 0,
      approvalSteps
    });

    return document;
  }

  /**
   * Отправляет документ на согласование
   */
  static async submitForApproval(documentId: string, user: IUser): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Документ не найден');
    }

    // Проверка, что пользователь является автором документа
    if (document.createdBy.toString() !== (user._id as Types.ObjectId).toString()) {
      throw new Error('Только автор документа может отправить его на согласование');
    }

    // Проверка, что документ в статусе черновика
    if (document.status !== DocumentStatus.DRAFT) {
      throw new Error('Только документы в статусе черновика могут быть отправлены на согласование');
    }

    // Обновляем статус документа
    document.status = DocumentStatus.PENDING_REVIEW;
    document.currentStep = 1;

    await document.save();
    return document;
  }

  /**
   * Утверждает документ текущим пользователем
   */
  static async approveDocument(documentId: string, user: IUser, comment?: string): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Документ не найден');
    }

    // Проверка, что документ находится на этапе согласования
    if (document.status !== DocumentStatus.PENDING_REVIEW) {
      throw new Error('Документ не находится на этапе согласования');
    }

    // Получаем текущий шаг согласования
    const currentStepIndex = document.currentStep - 1;
    if (currentStepIndex < 0 || currentStepIndex >= document.approvalSteps.length) {
      throw new Error('Некорректный шаг согласования');
    }

    const currentStep = document.approvalSteps[currentStepIndex];

    // Проверяем, может ли пользователь согласовать на этом шаге
    const canApprove = 
      // Если пользователь назначен напрямую
      (currentStep.assignedTo && currentStep.assignedTo.some(id => id.toString() === (user._id as Types.ObjectId).toString())) ||
      // Или по роли и департаменту
      (currentStep.role === user.role && 
        (!currentStep.department || currentStep.department === user.department));

    if (!canApprove) {
      throw new Error('У вас нет прав для согласования на этом шаге');
    }

    // Проверяем, не согласовывал ли пользователь уже на этом шаге
    const alreadyApproved = currentStep.approvers.some(
      approver => approver.userId.toString() === (user._id as Types.ObjectId).toString()
    );

    if (alreadyApproved) {
      throw new Error('Вы уже согласовали этот документ на текущем шаге');
    }

    // Добавляем пользователя в список согласовавших
    currentStep.approvers.push({
      userId: user._id as Types.ObjectId,
      status: DocumentStatus.APPROVED,
      comment,
      approvedAt: new Date()
    });

    // Проверяем, все ли необходимые согласователи утвердили документ
    const isStepApproved = this.isStepFullyApproved(currentStep);

    if (isStepApproved) {
      currentStep.status = DocumentStatus.APPROVED;
      currentStep.approvedAt = new Date();

      // Переходим к следующему шагу или завершаем согласование
      if (currentStepIndex + 1 < document.approvalSteps.length) {
        document.currentStep += 1;
      } else {
        // Все шаги согласованы, документ утвержден
        document.status = DocumentStatus.APPROVED;
      }
    }

    await document.save();
    return document;
  }

  /**
   * Отклоняет документ текущим пользователем
   */
  static async rejectDocument(documentId: string, user: IUser, comment: string): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Документ не найден');
    }

    // Проверка, что документ находится на этапе согласования
    if (document.status !== DocumentStatus.PENDING_REVIEW) {
      throw new Error('Документ не находится на этапе согласования');
    }

    // Получаем текущий шаг согласования
    const currentStepIndex = document.currentStep - 1;
    if (currentStepIndex < 0 || currentStepIndex >= document.approvalSteps.length) {
      throw new Error('Некорректный шаг согласования');
    }

    const currentStep = document.approvalSteps[currentStepIndex];

    // Проверяем, может ли пользователь отклонить на этом шаге
    const canReject = 
      (currentStep.assignedTo && currentStep.assignedTo.some(id => id.toString() === (user._id as Types.ObjectId).toString())) ||
      (currentStep.role === user.role && 
        (!currentStep.department || currentStep.department === user.department));

    if (!canReject) {
      throw new Error('У вас нет прав для отклонения на этом шаге');
    }

    // Добавляем отклонение пользователя
    currentStep.approvers.push({
      userId: user._id as Types.ObjectId,
      status: DocumentStatus.REJECTED,
      comment,
      rejectedAt: new Date()
    });

    // Обновляем статус шага и документа
    currentStep.status = DocumentStatus.REJECTED;
    currentStep.rejectedAt = new Date();
    currentStep.comment = comment;
    document.status = DocumentStatus.REJECTED;

    await document.save();
    return document;
  }

  /**
   * Добавляет новую версию документа
   */
  static async addNewVersion(
    documentId: string, 
    user: IUser, 
    fileUrl: string, 
    comment?: string
  ): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Документ не найден');
    }

    // Только автор или администратор может добавлять новые версии
    if (document.createdBy.toString() !== (user._id as Types.ObjectId).toString() && 
        user.role !== UserRole.ADMIN && 
        user.role !== UserRole.DIRECTOR) {
      throw new Error('Только автор документа, администратор или директор может добавлять новые версии');
    }

    // Если документ был отклонен, переводим его обратно в черновик
    if (document.status === DocumentStatus.REJECTED) {
      document.status = DocumentStatus.DRAFT;
      document.currentStep = 0;
      
      // Сбрасываем статусы всех шагов согласования
      document.approvalSteps.forEach(step => {
        step.status = DocumentStatus.PENDING_REVIEW;
        step.approvers = [];
        step.approvedAt = undefined;
        step.rejectedAt = undefined;
        step.comment = undefined;
      });
    }

    // Увеличиваем версию
    document.currentVersion += 1;

    // Добавляем новую версию
    document.versions.push({
      version: document.currentVersion,
      fileUrl,
      createdAt: new Date(),
      createdBy: user._id as Types.ObjectId,
      comment
    });

    await document.save();
    return document;
  }

  /**
   * Получает список документов с фильтрацией
   */
  static async getDocuments(
    filters: {
      status?: DocumentStatus;
      type?: DocumentType;
      department?: Department;
      createdBy?: string;
      search?: string;
      tags?: string[];
    } = {},
    pagination: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<{ documents: IDocument[]; total: number }> {
    const query: any = {};

    // Применяем фильтры
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.department) query.department = filters.department;
    if (filters.createdBy) query.createdBy = new Types.ObjectId(filters.createdBy);
    
    // Поиск по тегам
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Полнотекстовый поиск
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Настройки пагинации
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    // Настройки сортировки
    const sort: any = {};
    if (pagination.sortBy) {
      sort[pagination.sortBy] = pagination.sortDirection === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // По умолчанию сортируем по дате создания (убывание)
    }

    // Выполняем запрос
    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name username email role department')
        .exec(),
      DocumentModel.countDocuments(query)
    ]);

    return { documents, total };
  }

  /**
   * Получает документ по ID с детальной информацией
   */
  static async getDocumentById(documentId: string): Promise<IDocument | null> {
    return DocumentModel.findById(documentId)
      .populate('createdBy', 'name username email role department')
      .populate('approvalSteps.assignedTo', 'name username email role department')
      .populate('approvalSteps.approvers.userId', 'name username email role department')
      .populate('versions.createdBy', 'name username email')
      .populate('comments.createdBy', 'name username email')
      .exec();
  }

  /**
   * Получает список документов, ожидающих утверждения пользователем
   */
  static async getDocumentsPendingApprovalByUser(
    user: IUser,
    pagination: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ documents: IDocument[]; total: number }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    // Строим запрос для поиска документов, где текущий пользователь
    // может быть согласующим на текущем шаге
    const query = {
      status: DocumentStatus.PENDING_REVIEW,
      $or: [
        // Пользователь назначен напрямую
        { 'approvalSteps.position': { $eq: { $literal: '$currentStep' } }, 'approvalSteps.assignedTo': user._id as Types.ObjectId },
        // Или по роли и департаменту
        {
          'approvalSteps.position': { $eq: { $literal: '$currentStep' } },
          'approvalSteps.role': user.role,
          $or: [
            { 'approvalSteps.department': { $exists: false } },
            { 'approvalSteps.department': user.department }
          ]
        }
      ],
      // Исключаем документы, где пользователь уже выполнил действие
      'approvalSteps.approvers.userId': { $ne: user._id as Types.ObjectId }
    };

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name username email role department')
        .exec(),
      DocumentModel.countDocuments(query)
    ]);

    return { documents, total };
  }

  /**
   * Добавляет комментарий к документу
   */
  static async addComment(
    documentId: string,
    user: IUser,
    text: string
  ): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Документ не найден');
    }

    // Initialize comments array if it doesn't exist
    if (!document.comments) {
      document.comments = [] as any;
    }

    // Add the new comment
    const comment = {
      text,
      createdBy: user._id as Types.ObjectId,
      createdAt: new Date(),
      documentId: new Types.ObjectId(documentId)
    };
    
    // @ts-ignore - Push comment to array
    document.comments.push(comment);

    await document.save();
    return document;
  }

  /**
   * Архивирует документ
   */
  static async archiveDocument(documentId: string, user: IUser): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Документ не найден');
    }

    // Только автор, администратор или директор может архивировать документ
    if (document.createdBy.toString() !== (user._id as Types.ObjectId).toString() && 
        user.role !== UserRole.ADMIN && 
        user.role !== UserRole.DIRECTOR) {
      throw new Error('Только автор документа, администратор или директор может архивировать документ');
    }

    // Нельзя архивировать документ, который находится на согласовании
    if (document.status === DocumentStatus.PENDING_REVIEW) {
      throw new Error('Нельзя архивировать документ, который находится на согласовании');
    }

    document.status = DocumentStatus.ARCHIVED;
    await document.save();
    return document;
  }

  // Вспомогательный метод для проверки, полностью ли утвержден шаг
  private static isStepFullyApproved(step: IApprovalStep): boolean {
    // Если нет согласователей, шаг не может быть утвержден
    if (step.approvers.length === 0) {
      return false;
    }

    // Если хотя бы один согласователь отклонил, шаг отклонен
    const hasRejections = step.approvers.some(
      approver => approver.status === DocumentStatus.REJECTED
    );
    if (hasRejections) {
      return false;
    }

    // Если все согласователи должны утвердить
    if (step.allApproversRequired) {
      // Проверяем для assignedTo
      if (step.assignedTo && step.assignedTo.length > 0) {
        // Все назначенные пользователи должны утвердить
        const approvedUserIds = step.approvers
          .filter(a => a.status === DocumentStatus.APPROVED)
          .map(a => a.userId.toString());
          
        return step.assignedTo.every(
          userId => approvedUserIds.includes(userId.toString())
        );
      } 
      
      // Если нет назначенных пользователей, то проверяем по роли/департаменту
      // В этом случае нам достаточно хотя бы одного утверждения
      return step.approvers.some(
        approver => approver.status === DocumentStatus.APPROVED
      );
    } 
    
    // Если не все согласователи должны утвердить, достаточно хотя бы одного утверждения
    return step.approvers.some(
      approver => approver.status === DocumentStatus.APPROVED
    );
  }
} 