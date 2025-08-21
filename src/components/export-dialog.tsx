// src/components/export-dialog.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { exportToExcel, getMonthsWithData } from '@/lib/utils';

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { employees, attendance } = useStore(state => ({
    employees: state.employees,
    attendance: state.attendance,
  }));

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const availableMonths = useMemo(() => attendance ? getMonthsWithData(attendance) : [], [attendance]);
  
  const handleExport = () => {
    if (!selectedMonth || !employees || !attendance) return;
    exportToExcel(selectedMonth, employees, attendance);
  };
  
  const resetState = () => {
    setSelectedMonth('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    if(!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Attendance Report</DialogTitle>
          <DialogDescription>
            Select a month to export a report of the attendance data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="justify-center">
          <Button
            onClick={handleExport}
            disabled={!selectedMonth}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
