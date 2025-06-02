'use client';

import { useAuth } from '@/lib/auth-context';
import { DocumentList } from '@/components/documents/document-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types';

export default function DocumentsPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Документы</h1>
          <p className="text-muted-foreground">
            {user.role === UserRole.ADMIN 
              ? 'Все документы в системе' 
              : user.role === UserRole.DEPARTMENT_HEAD
                ? 'Документы вашего отдела'
                : 'Ваши документы и их текущий статус'}
          </p>
        </div>
        <Button className="mt-4 md:mt-0" asChild>
          <Link href="/documents/create">
            <Plus className="mr-2 h-4 w-4" />
            Новый документ
          </Link>
        </Button>
      </div>
      
      <DocumentList />
    </div>
  );
} 