
// src/components/header.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, HardHat, MoreVertical, Edit, UserPlus, X, Check } from 'lucide-react';
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
          <HardHat className="h-6 w-6 text-primary" />
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
            <Button onClick={onAddEmployee}>
              <UserPlus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add New</span>
            </Button>
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
