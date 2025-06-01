'use client';

import { useAuth } from '@/lib/auth-context';
import { UserRole, DocumentStatus } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  BarChart3,
  TrendingUp,
  Users,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { 
  documents, 
  getDocumentsByUser, 
  getDocumentsAwaitingApproval 
} from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RecentActivity from '@/components/layout/recent-activity';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Получаем документы для текущего пользователя
  const userDocuments = documents.filter(doc => doc.createdBy.id === user.id);
  const userDrafts = userDocuments.filter(doc => doc.status === DocumentStatus.DRAFT);
  const userPending = userDocuments.filter(doc => doc.status === DocumentStatus.PENDING);
  const userRejected = userDocuments.filter(doc => doc.status === DocumentStatus.REJECTED);
  
  // Документы, ожидающие согласования
  const documentsToApprove = getDocumentsAwaitingApproval(user.id);
  
  // Count document statuses
  const allDocumentsCount = documents.length;
  const pendingCount = documents.filter(doc => doc.status === DocumentStatus.PENDING).length;
  const approvedCount = documents.filter(doc => doc.status === DocumentStatus.APPROVED).length;
  const rejectedCount = documents.filter(doc => doc.status === DocumentStatus.REJECTED).length;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
          <p className="text-muted-foreground">
            Добро пожаловать, {user.name}
          </p>
        </div>
        <Button className="mt-4 md:mt-0" asChild>
          <Link href="/documents/create">
            <Plus className="mr-2 h-4 w-4" />
            Новый документ
          </Link>
        </Button>
      </div>
      
      {/* Role-specific stats */}
      {user.role === UserRole.ADMIN && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего документов
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allDocumentsCount}</div>
              <p className="text-xs text-muted-foreground">
                Все документы в системе
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ожидают согласования
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                В процессе согласования
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Утвержденные документы
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">
                Успешно завершены
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Отклоненные документы
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">
                Требуют доработки
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Department Head Stats */}
      {user.role === UserRole.DEPARTMENT_HEAD && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Документы отдела
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter(doc => doc.createdBy.department === user.department).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Из вашего отдела
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ожидают вашего согласования
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentsToApprove.length}</div>
              <p className="text-xs text-muted-foreground">
                Документы, требующие вашего рассмотрения
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Время обработки
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2 дня</div>
              <p className="text-xs text-muted-foreground">
                Среднее время согласования
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Employee Stats */}
      {user.role === UserRole.EMPLOYEE && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Мои документы
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userDocuments.length}</div>
              <p className="text-xs text-muted-foreground">
                Созданные вами документы
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                На рассмотрении
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userPending.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ожидают согласования
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Завершенные
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userDocuments.filter(doc => doc.status === DocumentStatus.APPROVED).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Успешно обработаны
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Viewer Stats */}
      {user.role === UserRole.VIEWER && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Доступные документы
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                Документы, которые вы можете просматривать
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Недавно обновленные
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter(doc => {
                  const oneWeekAgo = new Date();
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                  return doc.updatedAt > oneWeekAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Обновлены за последние 7 дней
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Документы на согласование */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ожидают вашего согласования</CardTitle>
            <CardDescription>
              Документы, требующие вашего рассмотрения
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documentsToApprove.length > 0 ? (
              <div className="space-y-4">
                {documentsToApprove.slice(0, 4).map((doc) => (
                  <div key={doc.id} className="flex items-start space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={doc.createdBy.avatar} alt={doc.createdBy.name} />
                      <AvatarFallback>{getInitials(doc.createdBy.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{doc.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          На согласовании
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {doc.createdBy.name} • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm">Нет документов, требующих согласования</p>
              </div>
            )}
          </CardContent>
          {documentsToApprove.length > 0 && (
            <CardFooter>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/approvals">
                  <span>Все документы на согласование</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Недавняя активность */}
        <RecentActivity />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Последние документы</CardTitle>
          <CardDescription>
            Ваши недавние документы
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDocuments.length > 0 ? (
            <div className="space-y-4">
              {userDocuments.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {doc.status === DocumentStatus.APPROVED && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {doc.status === DocumentStatus.PENDING && <Clock className="h-5 w-5 text-yellow-500" />}
                    {doc.status === DocumentStatus.REJECTED && <XCircle className="h-5 w-5 text-red-500" />}
                    {doc.status === DocumentStatus.DRAFT && <FileText className="h-5 w-5 text-gray-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{doc.title}</p>
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs
                        ${doc.status === DocumentStatus.APPROVED ? 'bg-green-100 text-green-800' : ''}
                        ${doc.status === DocumentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${doc.status === DocumentStatus.REJECTED ? 'bg-red-100 text-red-800' : ''}
                        ${doc.status === DocumentStatus.DRAFT ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {doc.status === DocumentStatus.APPROVED ? 'Согласован' : ''}
                        {doc.status === DocumentStatus.PENDING ? 'На согласовании' : ''}
                        {doc.status === DocumentStatus.REJECTED ? 'Отклонен' : ''}
                        {doc.status === DocumentStatus.DRAFT ? 'Черновик' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Обновлен {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/documents/${doc.id}`}>
                      Открыть
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm">У вас пока нет документов</p>
              <Button className="mt-4" asChild>
                <Link href="/documents/create">
                  Создать первый документ
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        {userDocuments.length > 0 && (
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/documents">
                <span>Все мои документы</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 