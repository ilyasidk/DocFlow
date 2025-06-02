import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  DEPARTMENT_HEAD = 'department_head',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
}

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

export interface IUser extends Document {
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  avatar?: string;
  username: string;
  passwordHash: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  department: { type: String, enum: Object.values(Department), required: true },
  avatar: { type: String },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema); 