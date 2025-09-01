// src/components/header.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileDown, MoreVertical, Edit, UserPlus, X, Check } from 'lucide-react';
import { ExportDialog } from './export-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type HeaderProps = {
  activeTab: string;
  isEditMode: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onAddEmployee: () => void;
};

export function Header({ activeTab, isEditMode, onEdit, onSubmit, onCancel, onAddEmployee }: HeaderProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
           <Image src="/icon-256x256.png" alt="SiteScribe Logo" width={32} height={32} className="h-8 w-8" />
          <span className="text-xl">SiteScribe</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {activeTab === 'attendance' && (
            isEditMode ? (
              <>
                <Button onClick={onSubmit} size="icon" className="sm:hidden">
                    <Check className="h-4 w-4" />
                </Button>
                <Button onClick={onCancel} variant="ghost" size="icon" className="sm:hidden">
                    <X className="h-4 w-4" />
                </Button>
                <Button onClick={onSubmit} className="hidden sm:inline-flex">Submit</Button>
                <Button variant="ghost" onClick={onCancel} className="hidden sm:inline-flex">Cancel</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
                      <FileDown className="mr-2 h-4 w-4" />
                      <span>Export Report</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )
          )}
          {activeTab === 'employees' && (
            <>
              <Button onClick={onAddEmployee} size="icon" className="sm:hidden">
                  <UserPlus className="h-4 w-4" />
                  <span className="sr-only">Add New Employee</span>
              </Button>
              <Button onClick={onAddEmployee} className="hidden sm:inline-flex">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New
              </Button>
            </>
          )}
        </div>
      </header>
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </>
  );
}
