'use client';

import { Document, DocumentStatus, UserRole } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Download,
  MessageSquare,
  FileText,
  CornerDownLeft,
  RefreshCw
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

interface DocumentDetailProps {
  document: Document;
  onUpdateStatus?: (documentId: string, stepId: string, newStatus: DocumentStatus, comment?: string) => void;
  onAddComment?: (documentId: string, text: string) => void;
}

export default function DocumentDetail({ document, onUpdateStatus, onAddComment }: DocumentDetailProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [formattedCreatedDate, setFormattedCreatedDate] = useState('');
  const [formattedUpdatedDate, setFormattedUpdatedDate] = useState('');

  // Fix hydration mismatch with dates by setting formatted dates client-side only
  useEffect(() => {
    setFormattedCreatedDate(new Date(document.createdAt).toLocaleDateString());
    setFormattedUpdatedDate(new Date(document.updatedAt).toLocaleDateString());
  }, [document.createdAt, document.updatedAt]);

  if (!user) return null;

  // Check if current user is assigned to the current step
  const currentStep = document.approvalSteps.find(step => step.position === document.currentStep);
  // Fix: Check if user is in the array of approvers
  const isCurrentApprover = currentStep?.assignedTo?.some(assignedUser => assignedUser.id === user.id);
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Handle approval
  const handleApprove = () => {
    if (currentStep && onUpdateStatus) {
      const documentId = document._id || document.id;
      onUpdateStatus(documentId, currentStep.id, DocumentStatus.APPROVED, comment);
      setComment('');
    }
  };

  // Handle rejection
  const handleReject = () => {
    if (currentStep && onUpdateStatus) {
      const documentId = document._id || document.id;
      onUpdateStatus(documentId, currentStep.id, DocumentStatus.REJECTED, rejectionReason);
      setRejectionReason('');
    }
  };

  // Handle return for revision
  const handleReturn = () => {
    if (currentStep && onUpdateStatus) {
      const documentId = document._id || document.id;
      onUpdateStatus(documentId, currentStep.id, DocumentStatus.RETURNED, returnReason);
      setReturnReason('');
    }
  };

  // Handle adding a comment
  const handleAddComment = () => {
    if (comment.trim() && onAddComment) {
      const documentId = document._id || document.id;
      onAddComment(documentId, comment);
      setComment('');
    }
  };

  // Get status text in Russian
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
        return 'Возвращен на доработку';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{document.title}</h1>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={document.createdBy.avatar} alt={document.createdBy.name} />
                <AvatarFallback>{getInitials(document.createdBy.name)}</AvatarFallback>
              </Avatar>
              {document.createdBy.name}
            </span>
            <span className="mx-2">•</span>
            <span>{formattedCreatedDate}</span>
            <span className="mx-2">•</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs
              ${document.status === DocumentStatus.APPROVED ? 'bg-green-100 text-green-800' : ''}
              ${document.status === DocumentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
              ${document.status === DocumentStatus.REJECTED ? 'bg-red-100 text-red-800' : ''}
              ${document.status === DocumentStatus.DRAFT ? 'bg-gray-100 text-gray-800' : ''}
              ${document.status === DocumentStatus.RETURNED ? 'bg-orange-100 text-orange-800' : ''}
            `}>
              {getStatusText(document.status)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Скачать
          </Button>
          
          {/* Action buttons for approvers */}
          {isCurrentApprover && document.status === DocumentStatus.PENDING && (
            <>
              <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Утвердить
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    Отклонить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Отклонение документа</DialogTitle>
                    <DialogDescription>
                      Пожалуйста, укажите причину отклонения документа. Это будет видно создателю документа.
                    </DialogDescription>
                  </DialogHeader>
                  <textarea 
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Введите причину отклонения..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <DialogFooter>
                    <Button 
                      variant="destructive" 
                      onClick={handleReject}
                      disabled={!rejectionReason.trim()}
                    >
                      Подтвердить отклонение
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CornerDownLeft className="h-4 w-4 mr-2" />
                    Вернуть
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Возврат на доработку</DialogTitle>
                    <DialogDescription>
                      Вернуть документ создателю для доработки. Пожалуйста, укажите комментарии.
                    </DialogDescription>
                  </DialogHeader>
                  <textarea 
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Укажите необходимые доработки..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                  />
                  <DialogFooter>
                    <Button 
                      variant="default" 
                      onClick={handleReturn}
                      disabled={!returnReason.trim()}
                    >
                      Вернуть на доработку
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {/* Show resubmit button for creator if document was rejected or returned */}
          {document.createdBy.id === user.id && 
           (document.status === DocumentStatus.REJECTED || document.status === DocumentStatus.RETURNED) && (
            <Button variant="default" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Отправить повторно
            </Button>
          )}
        </div>
      </div>
      
      {/* Document Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Детали документа</TabsTrigger>
          <TabsTrigger value="workflow">Процесс согласования</TabsTrigger>
          <TabsTrigger value="comments">Комментарии</TabsTrigger>
          {user.role === UserRole.ADMIN && (
            <TabsTrigger value="history">История</TabsTrigger>
          )}
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Информация о документе</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Тип:</span>
                  <span className="text-sm font-medium">{document.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Создан:</span>
                  <span className="text-sm font-medium">{formattedCreatedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Обновлен:</span>
                  <span className="text-sm font-medium">{formattedUpdatedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Имя файла:</span>
                  <span className="text-sm font-medium">{document.fileName}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Предпросмотр документа</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Предпросмотр недоступен</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Скачать для просмотра
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Процесс согласования</CardTitle>
              <CardDescription>Текущий статус: {getStatusText(document.status)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 py-2">
                {document.approvalSteps.map((step) => (
                  <div key={step.id} className="flex items-start">
                    <div className="flex items-center justify-center mr-4">
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center
                        ${step.status === DocumentStatus.APPROVED ? 'bg-green-100' : ''}
                        ${step.status === DocumentStatus.PENDING ? 'bg-yellow-100' : ''}
                        ${step.status === DocumentStatus.REJECTED ? 'bg-red-100' : ''}
                        ${step.status === DocumentStatus.RETURNED ? 'bg-orange-100' : ''}
                      `}>
                        {step.status === DocumentStatus.APPROVED && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {step.status === DocumentStatus.PENDING && <Clock className="h-4 w-4 text-yellow-600" />}
                        {step.status === DocumentStatus.REJECTED && <XCircle className="h-4 w-4 text-red-600" />}
                        {step.status === DocumentStatus.RETURNED && <CornerDownLeft className="h-4 w-4 text-orange-600" />}
                      </div>
                      {step.position < document.approvalSteps.length && (
                        <div className="h-10 w-px bg-border mx-auto my-1"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {step.assignedTo && step.assignedTo.map(approver => (
                          <div key={approver.id} className="flex items-center">
                            <div className="mr-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={approver.avatar} alt={approver.name} />
                                <AvatarFallback>{getInitials(approver.name)}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{approver.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {step.approvers.find(a => a.userId === approver.id)?.status === DocumentStatus.APPROVED && 'Утверждено'}
                                {step.approvers.find(a => a.userId === approver.id)?.status === DocumentStatus.REJECTED && 'Отклонено'}
                                {step.approvers.find(a => a.userId === approver.id)?.status === DocumentStatus.PENDING && 'Ожидает'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {step.comment && (
                        <div className="mt-2 text-sm p-3 bg-muted rounded-md">
                          {step.comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {document.approvalSteps.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Процесс согласования не определен
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Комментарии</CardTitle>
              <CardDescription>Добавьте комментарии и обратную связь</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.comments && document.comments.length > 0 ? (
                document.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 pb-4 border-b last:border-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.createdBy.avatar} alt={comment.createdBy.name} />
                      <AvatarFallback>{getInitials(comment.createdBy.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.createdBy.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Комментариев пока нет
                </div>
              )}
              
              {/* Comment input */}
              <div className="flex gap-2 pt-4">
                <textarea 
                  className="min-h-[80px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Добавить комментарий..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button className="self-end" disabled={!comment.trim()} onClick={handleAddComment}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Комментировать
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* History Tab (Admin only) */}
        {user.role === UserRole.ADMIN && (
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">История документа</CardTitle>
                <CardDescription>Полная история изменений</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-3 p-2 rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Документ создан</p>
                      <p className="text-xs text-muted-foreground">
                        {document.createdBy.name} • {formattedCreatedDate}
                      </p>
                    </div>
                  </div>
                  
                  {document.approvalSteps
                    .filter(step => step.status !== DocumentStatus.PENDING)
                    .map((step) => (
                      <div key={step.id} className="flex items-start">
                        <div className="mr-3 p-2 rounded-full bg-primary/10">
                          {step.status === DocumentStatus.APPROVED ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {step.status === DocumentStatus.APPROVED ? 'Утверждено' : 'Отклонено'} пользователями: 
                            {step.assignedTo && step.assignedTo.map(user => ` ${user.name}`).join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {step.approvedAt && new Date(step.approvedAt).toLocaleDateString()}
                            {step.rejectedAt && new Date(step.rejectedAt).toLocaleDateString()}
                          </p>
                          {step.comment && (
                            <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                              {step.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 