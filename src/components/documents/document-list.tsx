'use client';

import { Document, DocumentStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  XCircle, 
  Edit,
  ExternalLink, 
  File
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface DocumentListProps {
  documents: Document[];
  showActions?: boolean;
}

export default function DocumentList({ documents, showActions = true }: DocumentListProps) {
  const [filter, setFilter] = useState<DocumentStatus | 'all'>('all');

  const filteredDocuments = filter === 'all' 
    ? documents 
    : documents.filter(doc => doc.status === filter);

  // Get document status icon
  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case DocumentStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case DocumentStatus.REJECTED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case DocumentStatus.DRAFT:
        return <Edit className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get document type icon
  const getTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <File className="h-4 w-4 text-red-400" />;
    }
    if (fileType.includes('word') || fileType.includes('docx')) {
      return <File className="h-4 w-4 text-blue-400" />;
    }
    if (fileType.includes('presentation') || fileType.includes('pptx')) {
      return <File className="h-4 w-4 text-orange-400" />;
    }
    return <File className="h-4 w-4" />;
  };

  // Translate status to Russian
  const getStatusText = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return 'Утвержден';
      case DocumentStatus.PENDING:
        return 'На согласовании';
      case DocumentStatus.REJECTED:
        return 'Отклонен';
      case DocumentStatus.DRAFT:
        return 'Черновик';
      case DocumentStatus.RETURNED:
        return 'Возвращен';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          Все
        </Button>
        <Button 
          variant={filter === DocumentStatus.PENDING ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter(DocumentStatus.PENDING)}
          className="text-yellow-500"
        >
          <Clock className="h-4 w-4 mr-2" />
          На согласовании
        </Button>
        <Button 
          variant={filter === DocumentStatus.APPROVED ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter(DocumentStatus.APPROVED)}
          className="text-green-500"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Утвержденные
        </Button>
        <Button 
          variant={filter === DocumentStatus.REJECTED ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter(DocumentStatus.REJECTED)}
          className="text-red-500"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Отклоненные
        </Button>
        <Button 
          variant={filter === DocumentStatus.DRAFT ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter(DocumentStatus.DRAFT)}
          className="text-gray-500"
        >
          <Edit className="h-4 w-4 mr-2" />
          Черновики
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Документ</TableHead>
              <TableHead>Создатель</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Текущий этап</TableHead>
              {showActions && <TableHead className="text-right">Действия</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  Документов не найдено
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center">
                    {getTypeIcon(doc.fileType)}
                    <span className="ml-2">{doc.title}</span>
                  </TableCell>
                  <TableCell>{doc.createdBy.name}</TableCell>
                  <TableCell>{new Date(doc.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span>{getStatusText(doc.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.approvalSteps.length > 0 ? 
                      `Этап ${doc.currentStep} из ${doc.approvalSteps.length}` : 
                      'Не отправлен'}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/documents/${doc.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Просмотр
                        </Link>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 