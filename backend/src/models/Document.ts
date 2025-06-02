import mongoose, { Schema, Document as MongooseDocument, Types } from 'mongoose';
import { UserRole, Department } from './User.js';

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum DocumentType {
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  REPORT = 'report',
  PROPOSAL = 'proposal',
  POLICY = 'policy',
  MEMO = 'memo',
  OTHER = 'other',
}

export interface IComment extends MongooseDocument {
  text: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  documentId: Types.ObjectId;
}

const CommentSchema = new Schema<IComment>({
  text: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
});

export interface IApproverStatus {
  userId: Types.ObjectId;
  status: DocumentStatus;
  comment?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}

const ApproverStatusSchema = new Schema<IApproverStatus>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: Object.values(DocumentStatus), required: true },
  comment: { type: String },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
}, { _id: false });

export interface IApprovalStep {
  position: number;
  role?: UserRole;
  department?: Department;
  assignedTo?: Types.ObjectId[];
  approvers: IApproverStatus[];
  status: DocumentStatus;
  comment?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  allApproversRequired?: boolean;
}

const ApprovalStepSchema = new Schema<IApprovalStep>({
  position: { type: Number, required: true },
  role: { type: String, enum: Object.values(UserRole) },
  department: { type: String, enum: Object.values(Department) },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  approvers: { type: [ApproverStatusSchema], required: true },
  status: { type: String, enum: Object.values(DocumentStatus), required: true },
  comment: { type: String },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  allApproversRequired: { type: Boolean, default: true },
}, { _id: false });

export interface IDocumentVersion {
  version: number;
  fileUrl: string;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  comment?: string;
}

export interface IApproval {
  approver: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  date?: Date;
}

export interface IDocument extends MongooseDocument {
  title: string;
  description?: string;
  type: DocumentType;
  status: DocumentStatus;
  createdBy: mongoose.Types.ObjectId;
  department: string;
  currentVersion: number;
  versions: IDocumentVersion[];
  approvals: IApproval[];
  tags?: string[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
  currentStep: number;
  approvalSteps: IApprovalStep[];
  comments?: Types.DocumentArray<IComment>;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>({
  version: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String },
});

const ApprovalSchema = new Schema<IApproval>({
  approver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending',
    required: true 
  },
  comment: { type: String },
  date: { type: Date },
});

const DocumentSchema = new Schema<IDocument>({
  title: { type: String, required: true, index: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: Object.values(DocumentType), 
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    enum: Object.values(DocumentStatus), 
    default: DocumentStatus.DRAFT,
    required: true,
    index: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  department: { 
    type: String, 
    required: true,
    index: true 
  },
  currentVersion: { type: Number, default: 1 },
  versions: [DocumentVersionSchema],
  approvals: [ApprovalSchema],
  tags: [{ type: String, index: true }],
  metadata: { type: Schema.Types.Mixed },
  expiresAt: { type: Date },
  currentStep: { type: Number, required: true },
  approvalSteps: { type: [ApprovalStepSchema], required: true },
  comments: { type: [CommentSchema], default: [] },
}, { timestamps: true });

// Индексы для поиска
DocumentSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema); 