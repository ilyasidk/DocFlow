'use client';

import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Notification, Document, DocumentStatus } from '@/types';
import { Clock, CheckCircle, XCircle, FileText, CornerDownLeft, Bell } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  documentId?: string;
}

export default function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    if (!user) return;
    
    // Получаем уведомления для текущего пользователя
    const notifications = getNotificationsForUser(user.id);
    
    // Получаем документы, созданные или измененные пользователем
    const userDocuments = documents.filter(doc => 
      doc.createdBy.id === user.id || 
      doc.approvalSteps.some(step => 
        step.approvers.some(approver => approver.userId === user.id)
      )
    ).slice(0, 5);
    
    // Формируем список активностей
    const userActivities: Activity[] = [
      // Преобразуем уведомления в активности
      ...notifications.map(notif => ({
        id: notif.id,
        title: notif.title,
        description: notif.message,
        timestamp: notif.createdAt,
        documentId: notif.documentId,
        icon: <Bell className="h-4 w-4 text-blue-500" />
      })),
      
      // Добавляем активности на основе документов
      ...userDocuments.map(doc => {
        let icon = <FileText className="h-4 w-4 text-blue-500" />;
        let title = 'Документ создан';
        let description = `Вы создали документ "${doc.title}"`;
        
        if (doc.status === DocumentStatus.APPROVED) {
          icon = <CheckCircle className="h-4 w-4 text-green-500" />;
          title = 'Документ согласован';
          description = `Документ "${doc.title}" был согласован`;
        } else if (doc.status === DocumentStatus.REJECTED) {
          icon = <XCircle className="h-4 w-4 text-red-500" />;
          title = 'Документ отклонен';
          description = `Документ "${doc.title}" был отклонен`;
        } else if (doc.status === DocumentStatus.RETURNED) {
          icon = <CornerDownLeft className="h-4 w-4 text-orange-500" />;
          title = 'Документ возвращен';
          description = `Документ "${doc.title}" возвращен на доработку`;
        } else if (doc.status === DocumentStatus.PENDING) {
          icon = <Clock className="h-4 w-4 text-yellow-500" />;
          title = 'Ожидает согласования';
          description = `Документ "${doc.title}" ожидает согласования`;
        }
        
        return {
          id: `doc-activity-${doc.id}`,
          title,
          description,
          timestamp: doc.updatedAt,
          documentId: doc.id,
          icon
        };
      })
    ];
    
    // Сортируем по времени (сначала новые)
    userActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Ограничиваем список
    setActivities(userActivities.slice(0, 10));
  }, [user]);

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Недавняя активность</CardTitle>
        <CardDescription>
          Ваши последние действия и уведомления
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm">Нет активности для отображения</p>
            </div>
          )}
        </div>
        
        <Button variant="link" className="mt-4 px-0 w-full text-center">
          Показать всю активность
        </Button>
      </CardContent>
    </Card>
  );
} 