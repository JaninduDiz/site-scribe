// src/components/header.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, HardHat } from 'lucide-react';
import { ExportDialog } from './export-dialog';

export function Header() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
            <HardHat className="h-6 w-6 text-primary" />
            <span className="text-xl">SiteScribe</span>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setIsExportDialogOpen(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </header>
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </>
  );
}
