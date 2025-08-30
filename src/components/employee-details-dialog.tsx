// src/components/employee-details-dialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import type { Employee, AttendanceData } from '@/types';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
} from 'date-fns';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

type EmployeeDetailsDialogProps = {
  employee: Employee;
  attendance: AttendanceData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EmployeeDetailsDialog({
  employee,
  attendance,
  open,
  onOpenChange,
}: EmployeeDetailsDialogProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!attendance) {
    return (
       <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  let monthlyPresent = 0;
  let monthlyAbsent = 0;
  let monthlyHalfDay = 0;
  let totalAllowance = 0;

  const modifiers: Record<string, Date[]> = {
    present: [],
    absent: [],
    'half-day': [],
  };

  for (const dateStr in attendance) {
    const record = attendance[dateStr][employee.id];
    if (record) {
      const date = new Date(dateStr + 'T12:00:00'); // To avoid timezone issues
      
      // Monthly calculation
      if (isSameMonth(date, currentMonth)) {
        if(record.status === 'present') monthlyPresent++;
        if(record.status === 'absent') monthlyAbsent++;
        if(record.status === 'half-day') {
            monthlyHalfDay++;
            monthlyPresent += 0.5; // for calculation
        }
        modifiers[record.status]?.push(date);

        if(record.status === 'present' || record.status === 'half-day') {
          const allowance = record.allowance || 0;
          totalAllowance += allowance;
        }
      }
    }
  }

  const modifiersClassNames = {
    present: 'bg-primary text-primary-foreground rounded-full',
    absent: 'bg-destructive text-destructive-foreground rounded-full',
    'half-day': 'bg-accent text-accent-foreground rounded-full',
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{employee.name}</DialogTitle>
          <DialogDescription>Attendance Overview for {format(currentMonth, 'MMMM yyyy')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1 px-6">
        <div className="flex justify-between items-center py-4">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        <div className="flex justify-center">
            <Calendar
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
            />
        </div>
        <div className="space-y-4 text-sm py-4">
            <div className="font-semibold">Monthly Summary:</div>
            <div className="flex gap-2 flex-wrap">
                <Badge variant="default">Present: {monthlyPresent}</Badge>
                <Badge variant="secondary">Half Day: {monthlyHalfDay}</Badge>
                <Badge variant="destructive">Absent: {monthlyAbsent}</Badge>
            </div>
             <div className="font-semibold pt-2">Total Allowance:</div>
             <div className="flex gap-2 flex-wrap">
                <Badge className="bg-green-600 hover:bg-green-700 text-white">LKR {totalAllowance.toLocaleString()}</Badge>
            </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
