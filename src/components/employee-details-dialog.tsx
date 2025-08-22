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
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isWithinInterval,
} from 'date-fns';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        <DialogContent className="sm:max-w-md mx-4">
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

  const daysInWeek = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }), // Assuming week starts on Monday
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  let monthlyPresent = 0;
  let monthlyAbsent = 0;
  let monthlyHalfDay = 0;
  let weeklyPresent = 0;
  let weeklyAbsent = 0;
  let weeklyHalfDay = 0;

  const modifiers: Record<string, Date[]> = {
    present: [],
    absent: [],
    'half-day': [],
  };

  for (const dateStr in attendance) {
    const status = attendance[dateStr][employee.id];
    if (status) {
      const date = new Date(dateStr + 'T12:00:00'); // To avoid timezone issues
      
      // Monthly calculation
      if (isSameMonth(date, currentMonth)) {
        if(status === 'present') monthlyPresent++;
        if(status === 'absent') monthlyAbsent++;
        if(status === 'half-day') monthlyHalfDay++;
        modifiers[status]?.push(date);
      }
      
      // Weekly calculation
      if (isWithinInterval(date, { start: daysInWeek[0], end: daysInWeek[6] })) {
        if (status === 'present') weeklyPresent++;
        if (status === 'absent') weeklyAbsent++;
        if (status === 'half-day') weeklyHalfDay++;
      }
    }
  }

  const modifiersClassNames = {
    present: 'bg-primary text-primary-foreground rounded-full',
    absent: 'bg-destructive text-destructive-foreground rounded-full',
    'half-day': 'bg-secondary text-secondary-foreground rounded-full',
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>{employee.name}</DialogTitle>
          <DialogDescription>Attendance Overview</DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center px-4">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          className="rounded-md border"
        />
        <div className="space-y-2 text-sm">
            <div className="font-semibold">This Week's Summary:</div>
            <div className="flex gap-2 flex-wrap">
                <Badge variant="default">Present: {weeklyPresent}</Badge>
                <Badge variant="secondary">Half Day: {weeklyHalfDay}</Badge>
                <Badge variant="destructive">Absent: {weeklyAbsent}</Badge>
            </div>
            <div className="font-semibold pt-2">Monthly Summary ({format(currentMonth, 'MMMM')}):</div>
             <div className="flex gap-2 flex-wrap">
                <Badge variant="default">Present: {monthlyPresent}</Badge>
                <Badge variant="secondary">Half Day: {monthlyHalfDay}</Badge>
                <Badge variant="destructive">Absent: {monthlyAbsent}</Badge>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
