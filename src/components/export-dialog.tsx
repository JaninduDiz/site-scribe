// src/components/export-dialog.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertTriangle, CheckCircle, FileDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { exportToExcel, getMonthsWithData } from '@/lib/utils';
import { checkDataIntegrityAction } from '@/app/actions';
import type { AssessDataIntegrityOutput } from '@/ai/flows/data-integrity-tool';

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
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessDataIntegrityOutput | null>(null);

  const availableMonths = useMemo(() => attendance ? getMonthsWithData(attendance) : [], [attendance]);
  
  // Reset assessment when month changes
  useEffect(() => {
    setAssessmentResult(null);
  }, [selectedMonth]);


  const handleIntegrityCheck = async () => {
    if (!selectedMonth) return;

    setIsLoading(true);
    setAssessmentResult(null);
    
    // The server action will now fetch its own data from Firestore
    const result = await checkDataIntegrityAction(selectedMonth);
    setAssessmentResult(result);
    setIsLoading(false);
  };

  const handleExport = () => {
    if (!selectedMonth || !employees || !attendance) return;
    exportToExcel(selectedMonth, employees, attendance);
  };
  
  const resetState = () => {
    setSelectedMonth('');
    setIsLoading(false);
    setAssessmentResult(null);
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
            Select a month to export. An AI-powered data integrity check is available.
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

          <Button
            onClick={handleIntegrityCheck}
            disabled={!selectedMonth || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Check Data Integrity
          </Button>

          {assessmentResult && (
            <Alert variant={assessmentResult.isConsistent ? 'default' : 'destructive'}>
              {assessmentResult.isConsistent ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {assessmentResult.isConsistent
                  ? 'Data is Consistent'
                  : 'Inconsistency Detected'}
              </AlertTitle>
              <AlertDescription>{assessmentResult.assessment}</AlertDescription>
            </Alert>
          )}
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
