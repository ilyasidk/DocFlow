'use client';

import { useAuth } from '@/lib/auth-context';
import { UserRole, DocumentStatus } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  AlertCircle
} from 'lucide-react';
import { 
  documents, 
  getDocumentsByUser, 
  getDocumentsAwaitingApproval 
} from '@/lib/mock-data';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Get appropriate documents based on role
  const myDocuments = getDocumentsByUser(user.id);
  const pendingApproval = getDocumentsAwaitingApproval(user.id);
  
  // Count document statuses
  const allDocumentsCount = documents.length;
  const pendingCount = documents.filter(doc => doc.status === DocumentStatus.PENDING).length;
  const approvedCount = documents.filter(doc => doc.status === DocumentStatus.APPROVED).length;
  const rejectedCount = documents.filter(doc => doc.status === DocumentStatus.REJECTED).length;

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
              <div className="text-2xl font-bold">{pendingApproval.length}</div>
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
              <div className="text-2xl font-bold">{myDocuments.length}</div>
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
                {myDocuments.filter(doc => doc.status === DocumentStatus.PENDING).length}
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
                {myDocuments.filter(doc => doc.status === DocumentStatus.APPROVED).length}
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
      <div>
        <h2 className="text-xl font-semibold mb-4">Недавняя активность</h2>
        <div className="space-y-4">
          {documents.slice(0, 5).map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary/10 mr-4">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.createdBy.name} • {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`
                    px-2 py-1 rounded-full text-xs
                    ${doc.status === DocumentStatus.APPROVED ? 'bg-green-100 text-green-800' : ''}
                    ${doc.status === DocumentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${doc.status === DocumentStatus.REJECTED ? 'bg-red-100 text-red-800' : ''}
                    ${doc.status === DocumentStatus.DRAFT ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {doc.status === DocumentStatus.APPROVED && 'Утвержден'}
                    {doc.status === DocumentStatus.PENDING && 'На согласовании'}
                    {doc.status === DocumentStatus.REJECTED && 'Отклонен'}
                    {doc.status === DocumentStatus.DRAFT && 'Черновик'}
                    {doc.status === DocumentStatus.RETURNED && 'Возвращен'}
                  </span>
                  <Button variant="ghost" size="sm" asChild className="ml-2">
                    <Link href={`/documents/${doc.id}`}>Просмотр</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 