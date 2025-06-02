import { DocumentModel, DocumentStatus, DocumentType } from '../models/Document.js';
import { Department } from '../models/User.js';
import { Types } from 'mongoose';

export class AnalyticsService {
  /**
   * Получить статистику по документам за указанный период
   */
  static async getDocumentStats(
    startDate: Date,
    endDate: Date = new Date(),
    departmentFilter?: Department
  ) {
    const matchStage: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (departmentFilter) {
      matchStage.department = departmentFilter;
    }

    const stats = await DocumentModel.aggregate([
      { $match: matchStage },
      { $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.APPROVED] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.REJECTED] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.PENDING_REVIEW] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.DRAFT] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.ARCHIVED] }, 1, 0] } }
        }}
    ]);

    return stats.length > 0 ? stats[0] : {
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      draft: 0,
      archived: 0
    };
  }

  /**
   * Получить статистику по документам по типам
   */
  static async getDocumentsByType(
    startDate: Date,
    endDate: Date = new Date(),
    departmentFilter?: Department
  ) {
    const matchStage: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (departmentFilter) {
      matchStage.department = departmentFilter;
    }

    const stats = await DocumentModel.aggregate([
      { $match: matchStage },
      { $group: {
          _id: '$type',
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.APPROVED] }, 1, 0] } }
        }},
      { $sort: { count: -1 } }
    ]);

    return stats.map(item => ({
      type: item._id,
      count: item.count,
      approved: item.approved,
      approvalRate: item.count > 0 ? (item.approved / item.count) * 100 : 0
    }));
  }

  /**
   * Получить статистику по времени одобрения документов
   */
  static async getApprovalTimeStats(
    startDate: Date,
    endDate: Date = new Date(),
    departmentFilter?: Department
  ) {
    const matchStage: any = {
      status: DocumentStatus.APPROVED,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (departmentFilter) {
      matchStage.department = departmentFilter;
    }

    // For approved documents, we need to check when they were created and when they were approved
    const approvedDocs = await DocumentModel.find(matchStage).lean();
    
    if (approvedDocs.length === 0) {
      return {
        averageTimeInHours: 0,
        medianTimeInHours: 0,
        fastestTimeInHours: 0,
        slowestTimeInHours: 0
      };
    }

    // Calculate approval times (assume updatedAt is when approval happened)
    const approvalTimes = approvedDocs.map(doc => {
      const createdAt = new Date(doc.createdAt).getTime();
      const updatedAt = new Date(doc.updatedAt).getTime();
      return (updatedAt - createdAt) / (1000 * 60 * 60); // hours
    });

    // Sort for median calculation
    approvalTimes.sort((a, b) => a - b);
    
    // Calculate median
    const mid = Math.floor(approvalTimes.length / 2);
    const median = approvalTimes.length % 2 === 0
      ? (approvalTimes[mid - 1] + approvalTimes[mid]) / 2
      : approvalTimes[mid];

    return {
      averageTimeInHours: approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length,
      medianTimeInHours: median,
      fastestTimeInHours: approvalTimes[0],
      slowestTimeInHours: approvalTimes[approvalTimes.length - 1]
    };
  }

  /**
   * Получить статистику по пользователям и их активности с документами
   */
  static async getUserActivityStats(
    startDate: Date,
    endDate: Date = new Date()
  ) {
    const documentsCreated = await DocumentModel.aggregate([
      { $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }},
      { $group: {
          _id: '$createdBy',
          count: { $sum: 1 }
        }},
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }},
      { $unwind: '$user' },
      { $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          department: '$user.department',
          documentsCreated: '$count'
        }}
    ]);

    // We could add more statistics here like approvals, rejections, etc.

    return documentsCreated;
  }

  /**
   * Получить статистику по департаментам
   */
  static async getDepartmentStats(
    startDate: Date,
    endDate: Date = new Date()
  ) {
    const stats = await DocumentModel.aggregate([
      { $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }},
      { $group: {
          _id: '$department',
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.APPROVED] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.REJECTED] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', DocumentStatus.PENDING_REVIEW] }, 1, 0] } }
        }},
      { $sort: { total: -1 } }
    ]);

    return stats.map(item => ({
      department: item._id,
      total: item.total,
      approved: item.approved,
      rejected: item.rejected,
      pending: item.pending,
      approvalRate: item.total > 0 ? (item.approved / item.total) * 100 : 0
    }));
  }
} 