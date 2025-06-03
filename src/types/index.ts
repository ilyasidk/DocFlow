// User role types
export enum UserRole {
  ADMIN = 'admin',
  DIRECTOR = 'director',
  DEPARTMENT_HEAD = 'department_head',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
}

// Document status types
export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
}

// Document type categories
export enum DocumentType {
  CONTRACT = 'contract',
  REPORT = 'report',
  INVOICE = 'invoice',
  ORDER = 'order',
  MEMO = 'memo',
  OTHER = 'other',
}

// Department types
export enum Department {
  MANAGEMENT = 'management',
  FINANCE = 'finance',
  HR = 'hr',
  LEGAL = 'legal',
  IT = 'it',
  MARKETING = 'marketing',
  SALES = 'sales',
  OPERATIONS = 'operations',
}

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  avatar?: string;
}

// Approval status for individual approver
export interface ApproverStatus {
  userId: string;
  status: DocumentStatus;
  comment?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}

// Approval step type
export interface ApprovalStep {
  id: string;
  position: number;
  role?: UserRole;
  department?: Department;
  assignedTo?: User[];  // Теперь массив пользователей
  approvers: ApproverStatus[];  // Статус каждого согласующего
  status: DocumentStatus;  // Общий статус этапа
  comment?: string;  // Общий комментарий к этапу
  approvedAt?: Date;
  rejectedAt?: Date;
  allApproversRequired?: boolean;  // Требуется ли согласование всех или достаточно одного
}

// Document type
export interface Document {
  id: string;
  _id?: string; // MongoDB ID format
  title: string;
  type: DocumentType;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  status: DocumentStatus;
  fileUrl: string;
  fileName: string;
  fileType: string;
  currentStep: number;
  approvalSteps: ApprovalStep[];
  comments?: Comment[];
}

// Comment type
export interface Comment {
  id: string;
  text: string;
  createdBy: User;
  createdAt: Date;
  documentId: string;
}

// Notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: string;
  documentId?: string;
} 