'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Users, 
  Check, 
  X,
  Move,
  Plus,
  ChevronRight,
  ChevronLeft,
  Trash2,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentType, UserRole, DocumentStatus, User, Department } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Перевод типов документов
const translateDocType = (type: DocumentType): string => {
  switch(type) {
    case DocumentType.CONTRACT: return 'Договор';
    case DocumentType.REPORT: return 'Отчет';
    case DocumentType.INVOICE: return 'Счет';
    case DocumentType.ORDER: return 'Приказ';
    case DocumentType.MEMO: return 'Меморандум';
    case DocumentType.OTHER: return 'Другое';
    default: return type;
  }
};

// Helper function to safely get initials
const getSafeInitials = (name?: string): string => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return '-'; // Return a dash or other placeholder for missing/invalid names
  }
  try {
    return name
      .split(' ')
      .filter(part => part && part.length > 0)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  } catch (e) {
    console.error("Error generating initials:", name, e);
    return '?'; // Fallback for any unexpected error
  }
};

interface ApprovalStepState {
  id: string;
  position: number;
  approvers: string[]; // Массив ID согласующих
  allApproversRequired: boolean; // Требуется ли согласование всех или достаточно одного
}

export default function CreateDocumentPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Form state
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStepState[]>([]);
  
  // Диалоговое окно добавления согласующих
  const [isAddingApprovers, setIsAddingApprovers] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [requireAllApprovers, setRequireAllApprovers] = useState(true);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUsersError('Требуется авторизация для загрузки пользователей.');
          return;
        }
        const response = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Не удалось загрузить список пользователей');
        }
        const data: User[] = await response.json();
        setAllUsers(data);
      } catch (err: any) {
        setUsersError(err.message || 'Ошибка при загрузке пользователей');
        console.error("Error fetching users:", err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [user]);
  
  if (!user) return null;
  
  const availableApprovers = useMemo(() => {
    return allUsers.filter(u => u.role !== UserRole.ADMIN);
  }, [allUsers]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview for certain file types
      if (selectedFile.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };
  
  // Открывает диалог для добавления согласующих
  const openAddApproversDialog = (stepIndex: number | null) => {
    // Если stepIndex === null, значит создаем новый этап
    if (stepIndex === null) {
      setSelectedApprovers([]);
      setRequireAllApprovers(true);
    } else {
      // Редактирование существующего этапа
      const step = approvalSteps[stepIndex];
      setSelectedApprovers([...step.approvers]);
      setRequireAllApprovers(step.allApproversRequired);
    }
    
    setCurrentStepIndex(stepIndex);
    setIsAddingApprovers(true);
  };
  
  // Сохраняет выбранных согласующих
  const saveApprovers = () => {
    if (selectedApprovers.length === 0) {
      // Ничего не делать, если не выбраны согласующие
      setIsAddingApprovers(false);
      return;
    }
    
    if (currentStepIndex === null) {
      // Создание нового этапа
      setApprovalSteps(prev => [
        ...prev,
        {
          id: `step-${Date.now()}`,
          position: prev.length + 1,
          approvers: selectedApprovers,
          allApproversRequired: requireAllApprovers
        }
      ]);
    } else {
      // Обновление существующего этапа
      setApprovalSteps(prev => 
        prev.map((item, index) => 
          index === currentStepIndex
            ? { ...item, approvers: selectedApprovers, allApproversRequired: requireAllApprovers }
            : item
        )
      );
    }
    
    setIsAddingApprovers(false);
    setCurrentStepIndex(null);
    setSelectedApprovers([]);
  };
  
  // Удаляет этап согласования
  const removeApprovalStep = (stepIndex: number) => {
    setApprovalSteps(prev => {
      const filtered = prev.filter((_, index) => index !== stepIndex);
      // Пересчитываем позиции
      return filtered.map((step, index) => ({
        ...step,
        position: index + 1
      }));
    });
  };
  
  // Перемещает этап согласования вверх или вниз
  const moveApprovalStep = (stepIndex: number, direction: 'up' | 'down') => {
    setApprovalSteps(prev => {
      if (direction === 'up' && stepIndex > 0) {
        // Меняем местами с предыдущим
        const newList = [...prev];
        [newList[stepIndex - 1], newList[stepIndex]] = [newList[stepIndex], newList[stepIndex - 1]];
        // Обновляем позиции
        return newList.map((step, index) => ({
          ...step,
          position: index + 1
        }));
      } else if (direction === 'down' && stepIndex < prev.length - 1) {
        // Меняем местами со следующим
        const newList = [...prev];
        [newList[stepIndex], newList[stepIndex + 1]] = [newList[stepIndex + 1], newList[stepIndex]];
        // Обновляем позиции
        return newList.map((step, index) => ({
          ...step,
          position: index + 1
        }));
      }
      
      return prev;
    });
  };
  
  // Проверяет, выбран ли согласующий
  const isApproverSelected = (userId: string) => {
    return selectedApprovers.includes(userId);
  };
  
  // Переключает выбор согласующего
  const toggleApprover = (userId: string) => {
    setSelectedApprovers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };
  
  // Возвращает список согласующих для этапа
  const getApproversForStep = (stepApproverIds: string[]): User[] => {
    return stepApproverIds.map(userId => {
      const foundUser = allUsers.find(u => u.id === userId);
      if (foundUser) {
        return foundUser;
      }
      return {
        id: userId,
        name: 'Неизвестный пользователь',
        email: 'unknown@example.com',
        role: UserRole.EMPLOYEE,
        department: Department.HR,
        avatar: ''
      } as User;
    }).filter((userFound): userFound is User => Boolean(userFound));
  };
  
  // Create document (using API call)
  const createDocument = async () => {
    try {
      if (!title || !type || !file) {
        console.error('Missing required fields');
        return;
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found. Please login again.');
        router.push('/login');
        return;
      }

      // Create FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('type', type);
      
      // Add description if applicable
      formData.append('description', 'Document created via web interface');
      
      // Add the user's department
      formData.append('department', user?.department || '');
      
      // Add current date
      const currentDate = new Date().toISOString();
      formData.append('createdAt', currentDate);
      
      // Add approval steps if any
      if (approvalSteps.length > 0) {
        // Convert approval steps to proper format
        const formattedSteps = approvalSteps.map(step => {
        return {
          position: step.position,
            assignedTo: step.approvers,
            allApproversRequired: step.allApproversRequired
          };
        });
        
        formData.append('approvalSteps', JSON.stringify(formattedSteps));
      }
      
      // Make API call to create document
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating document:', errorData);
        return;
      }
      
      console.log('Document created successfully');
    
    // Navigate to documents page after creation
    router.push('/documents');
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };
  
  // Render specific step
  const renderStep = () => {
    switch (step) {
      case 1: // Document Info
        return (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Шаг 1: Информация о документе</CardTitle>
              <CardDescription>Укажите основную информацию о документе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Название документа
                </label>
                <Input
                  id="title"
                  placeholder="Введите название документа"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Тип документа
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.values(DocumentType).map((docType) => (
                    <Button
                      key={docType}
                      variant={type === docType ? 'default' : 'outline'}
                      onClick={() => setType(docType as DocumentType)}
                      className="justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {translateDocType(docType as DocumentType)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Загрузить документ
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  {preview ? (
                    <div className="relative w-full">
                      <img src={preview} alt="Предпросмотр" className="max-h-48 mx-auto object-contain" />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : file ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 mr-2 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} КБ
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Перетащите файл или нажмите для выбора
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Поддерживаются PDF, DOCX, XLSX, PPTX, JPG, PNG
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                          document.getElementById('file-upload')?.click();
                        }}>
                          Выбрать файл
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/documents">
                  <X className="h-4 w-4 mr-2" />
                  Отмена
                </Link>
              </Button>
              <Button 
                onClick={() => setStep(2)}
                disabled={!title || !type || !file}
              >
                Следующий шаг
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 2: // Approval Workflow
        return (
          <>
            <Card className="mx-auto max-w-2xl">
              <CardHeader>
                <CardTitle>Шаг 2: Процесс согласования</CardTitle>
                <CardDescription>Выберите, кто должен согласовать документ и в каком порядке</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Этапы согласования
                    </label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openAddApproversDialog(null)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить этап
                    </Button>
                  </div>
                  
                  {approvalSteps.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-md">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Этапы согласования еще не добавлены
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Нажмите кнопку "Добавить этап" для создания процесса согласования
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvalSteps.map((approvalStep, index) => {
                        const stepApprovers = getApproversForStep(approvalStep.approvers);
                        
                        return (
                          <div key={`${approvalStep.id}-${index}`} className="border rounded-md p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground mr-3">
                                  {approvalStep.position}
                                </div>
                                <h4 className="text-sm font-medium">
                                  Этап {approvalStep.position}: {stepApprovers.length} согласующих
                                </h4>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  disabled={index === 0}
                                  onClick={() => moveApprovalStep(index, 'up')}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  disabled={index === approvalSteps.length - 1}
                                  onClick={() => moveApprovalStep(index, 'down')}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openAddApproversDialog(index)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeApprovalStep(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground mb-1">
                                {approvalStep.allApproversRequired 
                                  ? 'Требуется согласование всех пользователей' 
                                  : 'Достаточно согласования одного пользователя'}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              {stepApprovers.map((approver, approverIndex) => (
                                approver && (
                                  <div key={`${approver.id}-${approverIndex}`} className="flex items-center p-2 bg-muted rounded-md">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarImage src={approver.avatar || ''} alt={approver.name || ''} />
                                      <AvatarFallback>
                                        {getSafeInitials(approver.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{approver.name || ''}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {approver.role === UserRole.ADMIN ? 'Директор' : 
                                        approver.role === UserRole.DEPARTMENT_HEAD ? 'Руководитель отдела' : 
                                        approver.role === UserRole.EMPLOYEE ? 'Сотрудник' : 'Наблюдатель'} • {approver.department || ''}
                                      </p>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
                <Button onClick={() => setStep(3)}>
                  Следующий шаг
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Dialog open={isAddingApprovers} onOpenChange={setIsAddingApprovers}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {currentStepIndex === null ? 'Добавить этап согласования' : `Редактировать этап ${approvalSteps[currentStepIndex]?.position}`}
                  </DialogTitle>
                  <DialogDescription>
                    Выберите пользователей, которые будут согласовывать документ на этом этапе.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="requireAll" 
                      checked={requireAllApprovers} 
                      onCheckedChange={(checked) => setRequireAllApprovers(!!checked)}
                    />
                    <Label htmlFor="requireAll">Требуется согласование всех пользователей</Label>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {usersLoading && <p className="text-center text-muted-foreground">Загрузка пользователей...</p>}
                    {usersError && <p className="text-center text-red-500">{usersError}</p>}
                    {!usersLoading && !usersError && availableApprovers.map((u, index) => {
                      const keyId = (typeof u.id === 'string' && u.id) ? u.id : `generated-key-${index}`;
                      return (
                        <div 
                          key={`${keyId}-${index}`}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${isApproverSelected(u.id) ? 'bg-primary/10' : 'hover:bg-muted'}`}
                          onClick={() => toggleApprover(u.id)}
                        >
                          <div className="flex items-center flex-1">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={u.avatar || ''} alt={u.name || ''} />
                              <AvatarFallback>
                                {getSafeInitials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <p className="text-sm font-medium">{u.name || ''}</p>
                              <p className="text-xs text-muted-foreground">
                                {u.role === UserRole.ADMIN ? 'Директор' : 
                                u.role === UserRole.DEPARTMENT_HEAD ? 'Руководитель отдела' : 
                                u.role === UserRole.EMPLOYEE ? 'Сотрудник' : 'Наблюдатель'} • {u.department || ''}
                              </p>
                            </div>
                          </div>
                          <Checkbox 
                            checked={isApproverSelected(u.id)} 
                            onCheckedChange={() => toggleApprover(u.id)} 
                            className="ml-2" 
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      );
                    })}
                    {!usersLoading && !usersError && availableApprovers.length === 0 && (
                      <p className="text-center text-muted-foreground">Нет доступных пользователей для согласования.</p>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingApprovers(false)}>
                    Отмена
                  </Button>
                  <Button 
                    onClick={saveApprovers}
                    disabled={selectedApprovers.length === 0}
                  >
                    {currentStepIndex === null ? 'Добавить' : 'Сохранить'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
        
      case 3: // Review & Submit
        return (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Шаг 3: Проверка и отправка</CardTitle>
              <CardDescription>Проверьте информацию о документе перед отправкой</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Информация о документе</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Название</p>
                      <p className="text-sm">{title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Тип</p>
                      <p className="text-sm">{type ? translateDocType(type) : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Файл</p>
                      <p className="text-sm">{file?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Размер</p>
                      <p className="text-sm">{file ? `${(file.size / 1024).toFixed(2)} КБ` : ''}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Процесс согласования</h3>
                  {approvalSteps.length === 0 ? (
                    <p className="text-sm">Согласующие не выбраны (документ будет сохранен как черновик)</p>
                  ) : (
                    <div className="space-y-4">
                      {approvalSteps.map((approvalStep, index) => {
                        const stepApprovers = getApproversForStep(approvalStep.approvers);
                        
                        return (
                          <div key={`${approvalStep.id}-${index}`} className="border rounded-md p-3">
                            <h4 className="text-sm font-medium mb-2">
                              Этап {approvalStep.position}
                              <span className="text-xs text-muted-foreground ml-2">
                                ({approvalStep.allApproversRequired ? 'Требуется согласование всех' : 'Достаточно одного согласующего'})
                              </span>
                            </h4>
                            <div className="space-y-1">
                              {stepApprovers.map((approver, approverIndex) => (
                                approver && (
                                  <div key={`${approver.id}-${approverIndex}`} className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs mr-2">
                                      {getSafeInitials(approver.name)}
                                    </div>
                                    <p className="text-sm">{approver.name || ''} ({approver.department || ''})</p>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Статус</h3>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${approvalSteps.length > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {approvalSteps.length > 0 ? 'На согласовании' : 'Черновик'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <Button onClick={createDocument}>
                <Check className="h-4 w-4 mr-2" />
                Отправить документ
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-2">
        <Link href="/documents">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к документам
        </Link>
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Создание нового документа</h1>
        <p className="text-muted-foreground">
          Загрузите документ и определите процесс согласования
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${step >= 1 ? 'bg-primary text-primary-foreground border-primary' : 'border-gray-300 text-gray-400'}`}>1</div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${step >= 2 ? 'bg-primary text-primary-foreground border-primary' : 'border-gray-300 text-gray-400'}`}>2</div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${step >= 3 ? 'bg-primary text-primary-foreground border-primary' : 'border-gray-300 text-gray-400'}`}>3</div>
        </div>
      </div>
      
      {renderStep()}
    </div>
  );
} 