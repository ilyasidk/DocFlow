'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Document, DocumentStatus, UserRole } from '@/types';
import Link from 'next/link';
import { Eye, FileText, File, FileCheck, FileX, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentListProps {
  initialDocuments?: Document[];
  status?: DocumentStatus;
  title?: string;
  limit?: number;
}

export function DocumentList({ 
  initialDocuments = [], 
  status, 
  title = 'Документы', 
  limit = 10 
}: DocumentListProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [loading, setLoading] = useState(initialDocuments.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDocuments.length > 0) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please login again.');
          return;
        }
        
        // Construct query string
        let queryString = `limit=${limit}`;
        if (status) queryString += `&status=${status}`;
        
        const response = await fetch(`/api/documents?${queryString}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить документы');
        }
        
        const data = await response.json();
        
        // Apply visibility filter on the client side
        const visibleDocuments = filterVisibleDocuments(data.documents || []);
        setDocuments(visibleDocuments);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [initialDocuments.length, status, limit]);

  // Filter documents based on user role and involvement
  const filterVisibleDocuments = (docs: Document[]): Document[] => {
    if (!user) return [];
    
    return docs.filter(doc => {
      // Document creator can always see their documents
      if (doc.createdBy.id === user.id) return true;
      
      // Admin/Director can see all documents
      if (user.role === UserRole.ADMIN || user.role === UserRole.DIRECTOR) return true;
      
      // Department head can see documents from their department
      if (user.role === UserRole.DEPARTMENT_HEAD && doc.createdBy.department === user.department) return true;
      
      // Check if user is an approver in any approval step
      const isApprover = doc.approvalSteps.some(step => 
        step.assignedTo?.some(approver => approver.id === user.id) ||
        step.approvers.some(approver => approver.userId === user.id)
      );
      
      return isApprover;
    });
  };

  // Get status icon based on document status
  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case DocumentStatus.REJECTED:
        return <FileX className="h-5 w-5 text-red-500" />;
      case DocumentStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center justify-center h-32">
          <p>Загрузка документов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>Ошибка: {error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Повторить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Документы не найдены</p>
              <Link href="/documents/create">
                <Button className="mt-4">
                  Создать документ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/documents/create">
          <Button>
            Создать документ
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
              <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                <div className="flex items-center">
                  {getStatusIcon(doc.status)}
                  <span className="ml-1 capitalize">
                    {doc.status === DocumentStatus.APPROVED ? 'Одобрен' : 
                     doc.status === DocumentStatus.REJECTED ? 'Отклонен' : 
                     doc.status === DocumentStatus.PENDING ? 'На согласовании' : 'Черновик'}
                  </span>
                </div>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Тип:</span>
                  <span className="capitalize">
                    {doc.type === 'contract' ? 'Договор' : 
                     doc.type === 'report' ? 'Отчет' : 
                     doc.type === 'invoice' ? 'Счет' : 
                     doc.type === 'order' ? 'Приказ' : 
                     doc.type === 'memo' ? 'Меморандум' : 'Другое'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Автор:</span>
                  <span>{doc.createdBy.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Отдел:</span>
                  <span>{doc.createdBy.department}</span>
                </div>
                {doc.currentStep > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Этап согласования:</span>
                    <span>{doc.currentStep} из {doc.approvalSteps.length}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/documents/${doc.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотреть
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {documents.length >= limit && (
        <div className="flex justify-center pt-4">
          <Link href="/documents">
            <Button variant="outline">
              Показать все документы
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 