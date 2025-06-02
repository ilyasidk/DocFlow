'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DocumentDetail from '@/components/documents/document-detail';
import { Document, DocumentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const doc = documents.find(d => d.id === id);
      setDocument(doc || null);
      setLoading(false);
    }, 500);
  }, [id]);
  
  // Mock function to update document status
  const handleUpdateStatus = (documentId: string, stepId: string, newStatus: DocumentStatus, comment?: string) => {
    // In a real app, this would be an API call
    setDocument(prev => {
      if (!prev) return null;
      
      // Find the current step and update its status
      const updatedApprovalSteps = prev.approvalSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            status: newStatus,
            comment: comment || step.comment,
            approvedAt: newStatus === DocumentStatus.APPROVED ? new Date() : step.approvedAt,
            rejectedAt: newStatus === DocumentStatus.REJECTED ? new Date() : step.rejectedAt,
          };
        }
        return step;
      });
      
      // Check if we need to update document status or move to next step
      let docStatus = prev.status;
      let currentStep = prev.currentStep;
      
      if (newStatus === DocumentStatus.REJECTED) {
        docStatus = DocumentStatus.REJECTED;
      } else if (newStatus === DocumentStatus.RETURNED) {
        docStatus = DocumentStatus.RETURNED;
      } else if (newStatus === DocumentStatus.APPROVED) {
        // Check if this was the last step
        if (currentStep === updatedApprovalSteps.length) {
          docStatus = DocumentStatus.APPROVED;
        } else {
          // Move to next step
          currentStep += 1;
        }
      }
      
      return {
        ...prev,
        status: docStatus,
        currentStep,
        approvalSteps: updatedApprovalSteps,
        updatedAt: new Date(),
      };
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
          <div className="space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <div className="h-4 w-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-semibold">Документ не найден</h2>
        <p className="text-muted-foreground">Документ, который вы ищете, не существует или был удален.</p>
        <Button variant="outline" asChild>
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к документам
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/documents">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к документам
        </Link>
      </Button>
      
      <DocumentDetail 
        document={document} 
        onUpdateStatus={handleUpdateStatus} 
      />
    </div>
  );
} 