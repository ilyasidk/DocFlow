'use client';

import { useAuth } from '@/lib/auth-context';
import { DocumentList } from '@/components/documents/document-list';
import { Button } from '@/components/ui/button';
import { UserRole, DocumentStatus } from '@/types';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [documentsToApprove, setDocumentsToApprove] = useState([]);
  
  useEffect(() => {
    if (!user) return;

    const fetchDocumentsToApprove = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/documents/pending-approvals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDocumentsToApprove(data.documents || []);
        }
      } catch (error) {
        console.error('Error fetching documents to approve:', error);
      }
    };
    
    fetchDocumentsToApprove();
  }, [user]);
  
  if (!user) return null;

  // Проверим, имеет ли пользователь доступ к этой странице
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.DEPARTMENT_HEAD) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-semibold">Доступ запрещен</h2>
        <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Согласования</h1>
          <p className="text-muted-foreground">
            Документы, требующие вашего согласования
          </p>
        </div>
        
        <Button variant="outline" className="mt-4 md:mt-0" disabled>
          <Clock className="mr-2 h-4 w-4" />
          {documentsToApprove.length} документов ожидают
        </Button>
      </div>

      {documentsToApprove.length === 0 ? (
        <div className="bg-muted rounded-md p-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Нет документов на согласование</h3>
          <p className="text-muted-foreground">
            В настоящее время у вас нет документов, требующих вашего согласования.
          </p>
        </div>
      ) : (
        <DocumentList initialDocuments={documentsToApprove} title="Документы на согласование" status={DocumentStatus.PENDING} />
      )}
    </div>
  );
} 