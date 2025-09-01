
// src/components/attendance-tracker.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Calendar as CalendarIcon,
  Loader2,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import { EmployeeDetailsDialog } from './employee-details-dialog';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

type AttendanceTrackerProps = {
  isEditMode: boolean;
};

export function AttendanceTracker({ isEditMode }: AttendanceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const { employees, attendance, pendingChanges, initialized } = useStore();
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);
  
  const formattedDate = useMemo(() => selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '', [selectedDate]);
  
  const getRecordForEmployee = (employeeId: string) => {
    const pendingKey = `${formattedDate}-${employeeId}`;
    const pendingRecord = pendingChanges[pendingKey];
    const savedRecord = attendance[formattedDate]?.[employeeId];
    
    if (pendingRecord) {
        return {
            status: pendingRecord.status !== null ? pendingRecord.status : savedRecord?.status,
            allowance: pendingRecord.allowance !== null ? pendingRecord.allowance : savedRecord?.allowance,
        };
    }
    return savedRecord;
  };


  const setLocalAttendance = (employeeId: string, status: AttendanceStatus, defaultAllowance: number) => {
    const currentRecord = getRecordForEmployee(employeeId);
    
    useStore.getState().updatePendingChange({
        date: formattedDate,
        employee_id: employeeId,
        status: currentRecord?.status === status ? null : status,
        allowance: currentRecord?.allowance ?? defaultAllowance
    });
  };

  const updateLocalAllowance = useDebouncedCallback((employeeId: string, allowance: number) => {
     const currentRecord = getRecordForEmployee(employeeId);
      useStore.getState().updatePendingChange({
        date: formattedDate,
        employee_id: employeeId,
        status: currentRecord?.status || null,
        allowance: allowance
    });
  }, 500);

  useEffect(() => {
    // Clear pending changes when date changes
    useStore.getState().clearPendingChanges();
  }, [selectedDate]);

  if (!initialized || !selectedDate) {
    return (
       <Card className="border-0 shadow-none px-0">
        <CardHeader className="px-0">
           <CardTitle>Loading Attendance...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const totalDailyAllowance = employees.reduce((total, employee) => {
    const record = getRecordForEmployee(employee.id);
    if (record && (record.status === 'present' || record.status === 'half-day')) {
      const allowance = record.allowance || 0;
      return total + allowance;
    }
    return total;
  }, 0);
  
  const getStatusColor = (status: AttendanceStatus | undefined | null, option: AttendanceStatus) => {
    if (status !== option) return 'bg-transparent text-muted-foreground hover:bg-secondary/40';
    switch (status) {
        case 'present': return 'bg-primary text-primary-foreground';
        case 'half-day': return 'bg-accent text-accent-foreground';
        case 'absent': return 'bg-destructive text-destructive-foreground';
        default: return 'bg-transparent text-muted-foreground hover:bg-secondary/40';
    }
  }

  return (
    <>
    <Card className="border-0 shadow-none p-0">
      <CardHeader className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Employee Attendance</CardTitle>
            <CardDescription className="hidden sm:block">
              Mark attendance for {format(selectedDate, 'PPP')}.
            </CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Card className="mt-4">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-primary" />
                    <p className="font-semibold text-sm">Total Daily Allowance</p>
                </div>
                <p className="font-bold text-lg">LKR {totalDailyAllowance.toLocaleString()}</p>
            </CardContent>
        </Card>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <div className="grid gap-2">
          {employees.length > 0 ? (
            employees.map(employee => {
                const currentRecord = getRecordForEmployee(employee.id);
                const currentStatus = currentRecord?.status;
                const isAllowanceEnabled = isEditMode && (currentStatus === 'present' || currentStatus === 'half-day');
                
                const isPresent = currentStatus === 'present';
                const isHalfDay = currentStatus === 'half-day';
                const isAbsent = currentStatus === 'absent';
                const noStatus = !currentStatus;
                
                return (
                  <div key={employee.id} className="rounded-lg border bg-secondary/40 shadow-sm">
                    <div className="p-3 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="text-left"
                        >
                          <p className="font-semibold hover:underline text-sm">
                            {employee.name}
                          </p>
                        </button>
                        <Input
                          type="number"
                          className="w-28 h-9 text-right text-sm"
                          placeholder="LKR"
                          disabled={!isAllowanceEnabled}
                          value={currentRecord?.allowance ?? employee.daily_allowance ?? ''}
                           onChange={(e) => {
                            const newAllowance = parseInt(e.target.value, 10);
                            // Optimistically update the UI
                             useStore.getState().updatePendingChange({
                                date: formattedDate,
                                employee_id: employee.id,
                                status: currentStatus || null,
                                allowance: isNaN(newAllowance) ? null : newAllowance,
                            });
                            if (!isNaN(newAllowance)) {
                                updateLocalAllowance(employee.id, newAllowance);
                            }
                          }}
                        />
                      </div>
                    <RadioGroup
                        value={currentStatus || ''}
                        onValueChange={(status) => setLocalAttendance(employee.id, status as AttendanceStatus, employee.daily_allowance || 1000)}
                        className="flex rounded-lg border bg-muted p-0.5"
                        disabled={!isEditMode}
                    >
                        <Label
                            htmlFor={`${employee.id}-present`}
                            className={cn(
                                "flex-1 text-center text-xs p-2 rounded-md transition-colors",
                                isEditMode ? "cursor-pointer" : "cursor-not-allowed",
                                getStatusColor(currentStatus, 'present')
                            )}
                        >
                            Present
                        </Label>
                        <RadioGroupItem value="present" id={`${employee.id}-present`} className="sr-only" />
                        
                        <div className={cn("w-px bg-border transition-opacity", noStatus || isPresent ? 'opacity-0' : 'opacity-100')}></div>

                        <Label
                            htmlFor={`${employee.id}-half-day`}
                            className={cn(
                                "flex-1 text-center text-xs p-2 rounded-md transition-colors",
                                isEditMode ? "cursor-pointer" : "cursor-not-allowed",
                                getStatusColor(currentStatus, 'half-day')
                            )}
                        >
                            Half Day
                        </Label>
                        <RadioGroupItem value="half-day" id={`${employee.id}-half-day`} className="sr-only" />

                        <div className={cn("w-px bg-border transition-opacity", noStatus || isHalfDay ? 'opacity-0' : 'opacity-100')}></div>

                        <Label
                            htmlFor={`${employee.id}-absent`}
                            className={cn(
                                "flex-1 text-center text-xs p-2 rounded-md transition-colors",
                                isEditMode ? "cursor-pointer" : "cursor-not-allowed",
                                getStatusColor(currentStatus, 'absent')
                            )}
                        >
                            Absent
                        </Label>
                        <RadioGroupItem value="absent" id={`${employee.id}-absent`} className="sr-only" />

                    </RadioGroup>
                    </div>
                  </div>
                )
            })
          ) : (
            <p className="text-muted-foreground col-span-full text-center py-4">
              No employees found. Add one in the Employees tab.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
    {selectedEmployee && (
      <EmployeeDetailsDialog
        employee={selectedEmployee}
        attendance={attendance}
        open={!!selectedEmployee}
        onOpenChange={() => setSelectedEmployee(null)}
      />
    )}
    </>
  );
}
