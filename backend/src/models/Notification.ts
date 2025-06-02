import mongoose, { Schema, Document as MongooseDocument, Types } from 'mongoose';

export interface INotification extends MongooseDocument {
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: Types.ObjectId;
  documentId?: Types.ObjectId;
}

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
});

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema); 