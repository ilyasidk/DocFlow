'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole, DocumentStatus, DocumentType, Document } from '@/types';
import {
  PieChart,
  BarChart,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.DIRECTOR) {
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Требуется авторизация');
          setLoading(false);
          return;
        }
        const response = await fetch('/api/documents', { 
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка получения документов: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при загрузке данных для аналитики');
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user, periodFilter]);

  if (!user) return null;

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.DIRECTOR) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-semibold">Доступ запрещен</h2>
        <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Clock className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Загрузка данных для аналитики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <XCircle className="h-8 w-8 text-red-500" />
        <h2 className="text-xl font-semibold text-red-500">Ошибка загрузки данных</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
      </div>
    );
  }

  // Расчет статистики
  const totalDocuments = documents.length;
  const pendingApproval = documents.filter(doc => doc.status === DocumentStatus.PENDING).length;
  const approved = documents.filter(doc => doc.status === DocumentStatus.APPROVED).length;
  const rejected = documents.filter(doc => doc.status === DocumentStatus.REJECTED).length;
  const returned = documents.filter(doc => doc.status === DocumentStatus.RETURNED).length;
  const drafts = documents.filter(doc => doc.status === DocumentStatus.DRAFT).length;

  // Распределение по типам документов
  const documentTypes = Object.values(DocumentType);
  const typeDistribution = documentTypes.map(type => ({
    type,
    count: documents.filter(doc => doc.type === type).length,
  }));

  // Количество согласований по отделам (моковые данные, нужно заменить реальными)
  const approvalsByDepartment = [
    { department: 'IT', count: 12 },
    { department: 'Финансы', count: 24 },
    { department: 'Маркетинг', count: 8 },
    { department: 'Юридический', count: 15 },
  ];

  // Среднее время согласования (моковые данные)
  const avgApprovalTime = {
    contracts: '2.5 дня',
    reports: '1.2 дня',
    orders: '0.8 дня',
    invoices: '0.5 дня',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground">
            Анализ документооборота и статистика согласований
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            variant={periodFilter === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodFilter('week')}
          >
            Неделя
          </Button>
          <Button 
            variant={periodFilter === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodFilter('month')}
          >
            Месяц
          </Button>
          <Button 
            variant={periodFilter === 'quarter' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodFilter('quarter')}
          >
            Квартал
          </Button>
          <Button 
            variant={periodFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriodFilter('all')}
          >
            Все время
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
          <TabsTrigger value="approvals">Согласования</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
        </TabsList>
        
        {/* Обзор */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего документов</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 10)}% по сравнению с пред. периодом
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ожидают согласования</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApproval}</div>
                <p className="text-xs text-muted-foreground">
                  {totalDocuments > 0 ? Math.floor((pendingApproval / totalDocuments) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Согласовано</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approved}</div>
                <p className="text-xs text-muted-foreground">
                  {totalDocuments > 0 ? Math.floor((approved / totalDocuments) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Отклонено</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejected}</div>
                <p className="text-xs text-muted-foreground">
                  {totalDocuments > 0 ? Math.floor((rejected / totalDocuments) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Активность согласований</CardTitle>
                <CardDescription>
                  Количество обработанных документов по дням
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">График активности согласований (скоро)</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Распределение по типам</CardTitle>
                <CardDescription>
                  Документы по категориям
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md">
                  <PieChart className="h-8 w-8 text-muted-foreground mb-4" />
                  {typeDistribution.length > 0 ? (
                    <div className="space-y-2 w-full max-w-[200px]">
                      {typeDistribution.map(item => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full bg-primary/60`}></div> 
                            <span className="text-xs capitalize">{item.type.replace('_', ' ')}</span>
                          </div>
                          <span className="text-xs font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Нет данных по типам</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по статусам документов</CardTitle>
              <CardDescription>Общее количество документов в каждом статусе.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Ожидают согласования', value: pendingApproval, statusEnum: DocumentStatus.PENDING, color: 'bg-yellow-500' },
                { name: 'Согласованные', value: approved, statusEnum: DocumentStatus.APPROVED, color: 'bg-green-500' },
                { name: 'Отклоненные', value: rejected, statusEnum: DocumentStatus.REJECTED, color: 'bg-red-500' },
                { name: 'Возвращенные', value: returned, statusEnum: DocumentStatus.RETURNED, color: 'bg-blue-500' },
                { name: 'Черновики', value: drafts, statusEnum: DocumentStatus.DRAFT, color: 'bg-gray-500' },
              ].map(s => (
                <div key={s.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${s.color}`}></div>
                    <span>{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.value}</span>
                    {totalDocuments > 0 ? (
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full ${s.color} rounded-full`} 
                          style={{ width: `${(s.value / totalDocuments) * 100}%` }}
                        ></div>
                      </div>
                    ) : (
                      <div className="w-20 h-2 rounded-full bg-muted"></div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика согласований</CardTitle>
              <CardDescription>Данные по процессам согласования (скоро).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                <Users className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Подробная аналитика согласований будет доступна здесь.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика по пользователям</CardTitle>
              <CardDescription>Статистика активности пользователей (скоро).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                <Users className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Подробная аналитика по пользователям будет доступна здесь.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 