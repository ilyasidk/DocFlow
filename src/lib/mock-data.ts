import { 
  User, 
  UserRole, 
  Department, 
  Document,
  DocumentStatus,
  DocumentType,
  ApprovalStep,
  Notification,
  Comment,
  ApproverStatus
} from '@/types';

// Mock Users
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Иванов Иван',
    email: 'ivan.ivanov@docflow.com',
    role: UserRole.ADMIN,
    department: Department.MANAGEMENT,
    avatar: '/avatars/john-doe.png',
  },
  {
    id: 'user-2',
    name: 'Смирнова Елена',
    email: 'elena.smirnova@docflow.com',
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.FINANCE,
    avatar: '/avatars/jane-smith.png',
  },
  {
    id: 'user-3',
    name: 'Петров Алексей',
    email: 'alexey.petrov@docflow.com',
    role: UserRole.EMPLOYEE,
    department: Department.IT,
    avatar: '/avatars/michael-johnson.png',
  },
  {
    id: 'user-4',
    name: 'Козлова Мария',
    email: 'maria.kozlova@docflow.com',
    role: UserRole.VIEWER,
    department: Department.LEGAL,
    avatar: '/avatars/sarah-williams.png',
  },
  {
    id: 'user-5',
    name: 'Соколов Дмитрий',
    email: 'dmitry.sokolov@docflow.com',
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.HR,
    avatar: '/avatars/david-brown.png',
  },
  {
    id: 'user-6',
    name: 'Новиков Андрей',
    email: 'andrey.novikov@docflow.com',
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.IT,
    avatar: '/avatars/andrew-novikov.png',
  },
  {
    id: 'user-7',
    name: 'Морозова Анна',
    email: 'anna.morozova@docflow.com',
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.LEGAL,
    avatar: '/avatars/anna-morozova.png',
  },
  {
    id: 'user-8',
    name: 'Волков Сергей',
    email: 'sergey.volkov@docflow.com',
    role: UserRole.EMPLOYEE,
    department: Department.FINANCE,
    avatar: '/avatars/sergey-volkov.png',
  },
  {
    id: 'user-9',
    name: 'Лебедева Ольга',
    email: 'olga.lebedeva@docflow.com',
    role: UserRole.EMPLOYEE,
    department: Department.MARKETING,
    avatar: '/avatars/olga-lebedeva.png',
  },
  {
    id: 'user-10',
    name: 'Козлов Михаил',
    email: 'mikhail.kozlov@docflow.com',
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.MARKETING,
    avatar: '/avatars/mikhail-kozlov.png',
  },
];

// Mock Approval Steps
export const approvalSteps: ApprovalStep[] = [
  {
    id: 'step-1',
    position: 1,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.FINANCE,
    assignedTo: [users[1], users[7]],
    status: DocumentStatus.APPROVED,
    comment: 'Бюджет выглядит хорошо, согласовано.',
    approvedAt: new Date('2023-09-15T10:30:00'),
    approvers: [
      {
        userId: users[1].id,
        status: DocumentStatus.APPROVED,
        comment: 'Утверждаю',
        approvedAt: new Date('2023-09-15T10:30:00')
      },
      {
        userId: users[7].id,
        status: DocumentStatus.APPROVED,
        comment: 'Согласовано',
        approvedAt: new Date('2023-09-15T09:45:00')
      }
    ],
    allApproversRequired: true
  },
  {
    id: 'step-2',
    position: 2,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.LEGAL,
    assignedTo: [users[3], users[6]],
    status: DocumentStatus.PENDING,
    approvers: [
      {
        userId: users[3].id,
        status: DocumentStatus.PENDING,
      },
      {
        userId: users[6].id,
        status: DocumentStatus.PENDING,
      }
    ],
    allApproversRequired: false
  },
  {
    id: 'step-3',
    position: 3,
    role: UserRole.ADMIN,
    department: Department.MANAGEMENT,
    assignedTo: [users[0]],
    status: DocumentStatus.PENDING,
    approvers: [
      {
        userId: users[0].id,
        status: DocumentStatus.PENDING,
      }
    ],
    allApproversRequired: true
  },
];

// Дополнительные этапы согласования для других документов
export const approvalStepsForDoc2: ApprovalStep[] = [
  {
    id: 'step-4',
    position: 1,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.IT,
    assignedTo: [users[5]],
    status: DocumentStatus.PENDING,
    approvers: [
      {
        userId: users[5].id,
        status: DocumentStatus.PENDING,
      }
    ],
    allApproversRequired: true
  },
  {
    id: 'step-5',
    position: 2,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.LEGAL,
    assignedTo: [users[6]],
    status: DocumentStatus.PENDING,
    approvers: [
      {
        userId: users[6].id,
        status: DocumentStatus.PENDING,
      }
    ],
    allApproversRequired: true
  }
];

export const approvalStepsForDoc3: ApprovalStep[] = [
  {
    id: 'step-6',
    position: 1,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.FINANCE,
    assignedTo: [users[1]],
    status: DocumentStatus.REJECTED,
    comment: 'Бюджет превышает квартальное распределение. Пожалуйста, пересмотрите и отправьте повторно.',
    rejectedAt: new Date('2023-09-14T16:45:00'),
    approvers: [
      {
        userId: users[1].id,
        status: DocumentStatus.REJECTED,
        comment: 'Бюджет превышает квартальное распределение. Пожалуйста, пересмотрите и отправьте повторно.',
        rejectedAt: new Date('2023-09-14T16:45:00')
      }
    ],
    allApproversRequired: true
  },
];

export const approvalStepsForDoc4: ApprovalStep[] = [
  {
    id: 'step-7',
    position: 1,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.IT,
    assignedTo: [users[5]],
    status: DocumentStatus.APPROVED,
    approvedAt: new Date('2023-09-01T11:30:00'),
    approvers: [
      {
        userId: users[5].id,
        status: DocumentStatus.APPROVED,
        approvedAt: new Date('2023-09-01T11:30:00')
      }
    ],
    allApproversRequired: true
  },
  {
    id: 'step-8',
    position: 2,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.FINANCE,
    assignedTo: [users[1], users[7]],
    status: DocumentStatus.PENDING,
    approvers: [
      {
        userId: users[1].id,
        status: DocumentStatus.APPROVED,
        approvedAt: new Date('2023-09-05T09:15:00')
      },
      {
        userId: users[7].id,
        status: DocumentStatus.PENDING
      }
    ],
    allApproversRequired: true
  }
];

export const approvalStepsForDoc5: ApprovalStep[] = [
  {
    id: 'step-9',
    position: 1,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.MARKETING,
    assignedTo: [users[9]],
    status: DocumentStatus.APPROVED,
    approvedAt: new Date('2023-09-07T14:20:00'),
    approvers: [
      {
        userId: users[9].id,
        status: DocumentStatus.APPROVED,
        approvedAt: new Date('2023-09-07T14:20:00')
      }
    ],
    allApproversRequired: true
  },
  {
    id: 'step-10',
    position: 2,
    role: UserRole.DEPARTMENT_HEAD,
    department: Department.FINANCE,
    assignedTo: [users[1]],
    status: DocumentStatus.APPROVED,
    approvedAt: new Date('2023-09-08T10:45:00'),
    approvers: [
      {
        userId: users[1].id,
        status: DocumentStatus.APPROVED,
        approvedAt: new Date('2023-09-08T10:45:00')
      }
    ],
    allApproversRequired: true
  },
  {
    id: 'step-11',
    position: 3,
    role: UserRole.ADMIN,
    department: Department.MANAGEMENT,
    assignedTo: [users[0]],
    status: DocumentStatus.APPROVED,
    approvedAt: new Date('2023-09-09T11:30:00'),
    approvers: [
      {
        userId: users[0].id,
        status: DocumentStatus.APPROVED,
        approvedAt: new Date('2023-09-09T11:30:00')
      }
    ],
    allApproversRequired: true
  }
];

// Mock Documents
export const documents: Document[] = [
  {
    id: 'doc-1',
    title: 'Финансовый отчет за 3 квартал',
    type: DocumentType.REPORT,
    createdBy: users[2],
    createdAt: new Date('2023-09-10T09:15:00'),
    updatedAt: new Date('2023-09-15T11:45:00'),
    status: DocumentStatus.PENDING,
    fileUrl: '/documents/q3-financial-report.pdf',
    fileName: 'q3-financial-report.pdf',
    fileType: 'application/pdf',
    currentStep: 2,
    approvalSteps: approvalSteps,
    comments: [
      {
        id: 'comment-1',
        text: 'Пожалуйста, внимательно проверьте показатели 3 квартала.',
        createdBy: users[2],
        createdAt: new Date('2023-09-10T09:20:00'),
        documentId: 'doc-1',
      },
      {
        id: 'comment-2',
        text: 'Показатели выглядят хорошо. Согласовано.',
        createdBy: users[1],
        createdAt: new Date('2023-09-15T10:30:00'),
        documentId: 'doc-1',
      },
    ],
  },
  {
    id: 'doc-2',
    title: 'Соглашение о лицензировании ПО',
    type: DocumentType.CONTRACT,
    createdBy: users[2],
    createdAt: new Date('2023-09-05T14:30:00'),
    updatedAt: new Date('2023-09-05T14:30:00'),
    status: DocumentStatus.DRAFT,
    fileUrl: '/documents/software-license-agreement.docx',
    fileName: 'software-license-agreement.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    currentStep: 0,
    approvalSteps: [],
  },
  {
    id: 'doc-3',
    title: 'Предложение по маркетинговому бюджету',
    type: DocumentType.REPORT,
    createdBy: users[8],
    createdAt: new Date('2023-09-12T11:00:00'),
    updatedAt: new Date('2023-09-14T16:45:00'),
    status: DocumentStatus.REJECTED,
    fileUrl: '/documents/marketing-budget-proposal.pptx',
    fileName: 'marketing-budget-proposal.pptx',
    fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    currentStep: 1,
    approvalSteps: approvalStepsForDoc3,
  },
  {
    id: 'doc-4',
    title: 'Заявка на закупку оборудования',
    type: DocumentType.ORDER,
    createdBy: users[3],
    createdAt: new Date('2023-08-28T10:15:00'),
    updatedAt: new Date('2023-09-05T09:15:00'),
    status: DocumentStatus.PENDING,
    fileUrl: '/documents/equipment-purchase-request.pdf',
    fileName: 'equipment-purchase-request.pdf',
    fileType: 'application/pdf',
    currentStep: 2,
    approvalSteps: approvalStepsForDoc4,
    comments: [
      {
        id: 'comment-3',
        text: 'Необходимо закупить новые серверы для проекта.',
        createdBy: users[3],
        createdAt: new Date('2023-08-28T10:20:00'),
        documentId: 'doc-4',
      },
      {
        id: 'comment-4',
        text: 'Утверждаю со стороны IT отдела.',
        createdBy: users[5],
        createdAt: new Date('2023-09-01T11:30:00'),
        documentId: 'doc-4',
      }
    ],
  },
  {
    id: 'doc-5',
    title: 'Маркетинговая кампания Q4',
    type: DocumentType.REPORT,
    createdBy: users[8],
    createdAt: new Date('2023-09-05T13:45:00'),
    updatedAt: new Date('2023-09-09T11:30:00'),
    status: DocumentStatus.APPROVED,
    fileUrl: '/documents/q4-marketing-campaign.pdf',
    fileName: 'q4-marketing-campaign.pdf',
    fileType: 'application/pdf',
    currentStep: 3,
    approvalSteps: approvalStepsForDoc5,
  },
  {
    id: 'doc-6',
    title: 'Договор с поставщиком',
    type: DocumentType.CONTRACT,
    createdBy: users[2],
    createdAt: new Date('2023-09-18T11:20:00'),
    updatedAt: new Date('2023-09-18T11:20:00'),
    status: DocumentStatus.DRAFT,
    fileUrl: '/documents/supplier-contract.docx',
    fileName: 'supplier-contract.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    currentStep: 0,
    approvalSteps: [],
  },
  {
    id: 'doc-7',
    title: 'Техническое задание для разработки',
    type: DocumentType.REPORT,
    createdBy: users[3],
    createdAt: new Date('2023-09-15T14:30:00'),
    updatedAt: new Date('2023-09-15T14:30:00'),
    status: DocumentStatus.PENDING,
    fileUrl: '/documents/technical-requirements.docx',
    fileName: 'technical-requirements.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    currentStep: 1,
    approvalSteps: approvalStepsForDoc2,
  },
];

// Mock Notifications
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Документ согласован',
    message: 'Смирнова Елена согласовала "Финансовый отчет за 3 квартал"',
    read: false,
    createdAt: new Date('2023-09-15T10:35:00'),
    userId: users[2].id,
    documentId: 'doc-1',
  },
  {
    id: 'notif-2',
    title: 'Документ ожидает вашего согласования',
    message: 'Вам необходимо рассмотреть "Финансовый отчет за 3 квартал"',
    read: true,
    createdAt: new Date('2023-09-10T10:00:00'),
    userId: users[1].id,
    documentId: 'doc-1',
  },
  {
    id: 'notif-3',
    title: 'Документ отклонен',
    message: 'Смирнова Елена отклонила "Предложение по маркетинговому бюджету"',
    read: false,
    createdAt: new Date('2023-09-14T16:50:00'),
    userId: users[8].id,
    documentId: 'doc-3',
  },
  {
    id: 'notif-4',
    title: 'Документ согласован',
    message: 'Иванов Иван утвердил "Маркетинговая кампания Q4"',
    read: false,
    createdAt: new Date('2023-09-09T11:35:00'),
    userId: users[8].id,
    documentId: 'doc-5',
  },
  {
    id: 'notif-5',
    title: 'Документ ожидает вашего согласования',
    message: 'Вам необходимо рассмотреть "Заявка на закупку оборудования"',
    read: false,
    createdAt: new Date('2023-09-05T09:20:00'),
    userId: users[7].id,
    documentId: 'doc-4',
  },
  {
    id: 'notif-6',
    title: 'Новый документ на согласование',
    message: 'Новый документ "Техническое задание для разработки" требует вашего рассмотрения',
    read: false,
    createdAt: new Date('2023-09-15T14:35:00'),
    userId: users[5].id,
    documentId: 'doc-7',
  },
];

// Current User (for demo purposes)
export const getCurrentUser = (): User => {
  return users[0]; // Default to admin user
};

// Get user by role (for demo purposes)
export const getUserByRole = (role: UserRole): User | undefined => {
  return users.find(user => user.role === role);
};

// Get documents by user
export const getDocumentsByUser = (userId: string): Document[] => {
  return documents.filter(doc => doc.createdBy.id === userId);
};

// Get documents awaiting user approval
export const getDocumentsAwaitingApproval = (userId: string): Document[] => {
  return documents.filter(doc => 
    doc.status === DocumentStatus.PENDING && 
    doc.approvalSteps.some(step => 
      step.status === DocumentStatus.PENDING && 
      step.approvers.some(approver => approver.userId === userId && approver.status === DocumentStatus.PENDING)
    )
  );
};

// Get notifications for user
export const getNotificationsForUser = (userId: string): Notification[] => {
  return notifications.filter(notif => notif.userId === userId);
}; 