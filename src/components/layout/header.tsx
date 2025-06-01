'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Menu, Bell, LogOut, UserCircle, Briefcase, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export default function Header() {
  const { user, logout, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="font-bold inline-block">DocFlowChain</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Дашборд
            </Link>
            <Link href="/documents" className="text-sm font-medium transition-colors hover:text-primary">
              Документы
            </Link>
            {(user.role === UserRole.ADMIN || user.role === UserRole.DEPARTMENT_HEAD) && (
              <Link href="/approvals" className="text-sm font-medium transition-colors hover:text-primary">
                Согласования
              </Link>
            )}
            {user.role === UserRole.ADMIN && (
              <Link href="/analytics" className="text-sm font-medium transition-colors hover:text-primary">
                Аналитика
              </Link>
            )}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600"></span>
          </Button>

          {/* Mobile navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="sr-only">Меню навигации</SheetTitle>
              <div className="flex flex-col gap-4 py-4">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Дашборд
                </Link>
                <Link 
                  href="/documents" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Документы
                </Link>
                {(user.role === UserRole.ADMIN || user.role === UserRole.DEPARTMENT_HEAD) && (
                  <Link 
                    href="/approvals" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Согласования
                  </Link>
                )}
                {user.role === UserRole.ADMIN && (
                  <Link 
                    href="/analytics" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Аналитика
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Профиль</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Мой отдел</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Demo User Switching */}
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                Демо: Сменить роль
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => switchRole(UserRole.ADMIN)}>
                <span>Директор</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole(UserRole.DEPARTMENT_HEAD)}>
                <span>Руководитель отдела</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole(UserRole.EMPLOYEE)}>
                <span>Сотрудник</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole(UserRole.VIEWER)}>
                <span>Наблюдатель</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 