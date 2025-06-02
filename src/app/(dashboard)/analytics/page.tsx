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
import { UserRole, DocumentStatus, DocumentType } from '@/types';
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

  if (!user) return null;

  // Проверяем доступ (для админов и директоров)
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.DIRECTOR) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-semibold">Доступ запрещен</h2>
        <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
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

  // Количество согласований по отделам
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
                  {Math.floor(Math.random() * 100)}% от общего числа
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
                  {Math.floor((approved / totalDocuments) * 100)}% от общего числа
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
                  {Math.floor((rejected / totalDocuments) * 100)}% от общего числа
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
                  <span className="ml-2 text-sm text-muted-foreground">График активности согласований</span>
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
                  <div className="space-y-2 w-full max-w-[200px]">
                    {typeDistribution.map(item => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary/60"></div>
                          <span className="text-xs">{item.type}</span>
                        </div>
                        <span className="text-xs font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Документы */}
        <TabsContent value="documents">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Статусы документов</CardTitle>
                <CardDescription>
                  Распределение документов по статусам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span>Ожидают согласования</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pendingApproval}</span>
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full" 
                          style={{ width: `${(pendingApproval / totalDocuments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Согласованные</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{approved}</span>
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${(approved / totalDocuments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span>Отклоненные</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rejected}</span>
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${(rejected / totalDocuments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span>Возвращенные</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{returned}</span>
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${(returned / totalDocuments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                      <span>Черновики</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{drafts}</span>
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-gray-500 rounded-full" 
                          style={{ width: `${(drafts / totalDocuments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Типы документов</CardTitle>
                <CardDescription>
                  Распределение по категориям
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Круговая диаграмма типов</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Согласования */}
        <TabsContent value="approvals">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Среднее время согласования</CardTitle>
                <CardDescription>
                  По типам документов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Договоры</span>
                    <span className="font-medium">{avgApprovalTime.contracts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Отчеты</span>
                    <span className="font-medium">{avgApprovalTime.reports}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Приказы</span>
                    <span className="font-medium">{avgApprovalTime.orders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Счета</span>
                    <span className="font-medium">{avgApprovalTime.invoices}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Согласования по отделам</CardTitle>
                <CardDescription>
                  Количество согласований
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvalsByDepartment.map(dept => (
                    <div key={dept.department} className="flex items-center gap-4">
                      <div className="w-32 text-sm">{dept.department}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${(dept.count / Math.max(...approvalsByDepartment.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium">{dept.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Динамика согласований</CardTitle>
                <CardDescription>
                  Скорость обработки документов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">График скорости согласований</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Пользователи */}
        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Активность пользователей</CardTitle>
                <CardDescription>
                  Топ активных пользователей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">ИИ</div>
                      <span>Иванов Иван</span>
                    </div>
                    <span className="text-sm font-medium">24 документа</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">СЕ</div>
                      <span>Смирнова Елена</span>
                    </div>
                    <span className="text-sm font-medium">18 документов</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">ПА</div>
                      <span>Петров Алексей</span>
                    </div>
                    <span className="text-sm font-medium">15 документов</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">КМ</div>
                      <span>Козлова Мария</span>
                    </div>
                    <span className="text-sm font-medium">12 документов</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Распределение по ролям</CardTitle>
                <CardDescription>
                  Пользователи системы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center bg-muted/30 rounded-md mb-4">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Администраторы: 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Руководители: 4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Сотрудники: 4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Наблюдатели: 1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 