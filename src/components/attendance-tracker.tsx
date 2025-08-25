// src/components/attendance-tracker.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
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
import { format, isSunday } from 'date-fns';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import { EmployeeDetailsDialog } from './employee-details-dialog';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

export function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const { employees, attendance, initialized } = useStore();
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);
  
  const formattedDate = useMemo(() => selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '', [selectedDate]);
  const todaysAttendance = useMemo(() => attendance[formattedDate] || {}, [attendance, formattedDate]);

  const setAttendance = async (employeeId: string, date: string, status: AttendanceStatus, defaultAllowance: number) => {
    try {
        const currentRecord = todaysAttendance[employeeId];
        const currentStatus = currentRecord?.status;

        // If the user clicks the same status, we should clear it.
        if (currentStatus === status) {
            const { error } = await supabase.from('attendance')
                .delete()
                .match({ date: date, employee_id: employeeId });
            if (error) throw error;
            return;
        }
        
        // Upsert the new status
        const { error } = await supabase.from('attendance').upsert({
            date: date,
            employee_id: employeeId,
            status: status,
            allowance: currentRecord?.allowance ?? defaultAllowance
        }, { onConflict: 'date,employee_id' });
        if (error) throw error;
    } catch (error) {
      console.error("Error setting attendance:", error);
    }
  };
  
  const updateAllowance = useDebouncedCallback(async (employeeId: string, date: string, allowance: number) => {
    try {
        const { error } = await supabase.from('attendance')
            .update({ allowance })
            .match({ date: date, employee_id: employeeId });
        if (error) throw error;
    } catch (error) {
        console.error("Error updating allowance:", error);
    }
  }, 500);


  if (!initialized || !selectedDate) {
    return (
       <Card className="border-0 shadow-none">
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
    const record = todaysAttendance[employee.id];
    if (record && (record.status === 'present' || record.status === 'half-day')) {
      const allowance = record.allowance || 0;
      return total + (record.status === 'half-day' ? allowance / 2 : allowance);
    }
    return total;
  }, 0);
  
  const getStatusColor = (status: AttendanceStatus | undefined, option: AttendanceStatus) => {
    if (status !== option) return 'bg-muted/60';
    switch (status) {
        case 'present': return 'bg-primary text-primary-foreground';
        case 'half-day': return 'bg-accent text-accent-foreground';
        case 'absent': return 'bg-destructive text-destructive-foreground';
        default: return 'bg-muted/60';
    }
  }

  return (
    <>
    <Card className="border-0 shadow-none">
      <CardHeader className="p-4 md:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Employee Attendance</CardTitle>
            <CardDescription>
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
                disabled={isSunday}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Card className="mt-4">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-primary" />
                    <p className="font-semibold">Total Daily Allowance</p>
                </div>
                <p className="font-bold text-xl">LKR {totalDailyAllowance.toLocaleString()}</p>
            </CardContent>
        </Card>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-2">
          {employees.length > 0 ? (
            employees.map(employee => {
                const currentRecord = todaysAttendance[employee.id];
                const currentStatus = currentRecord?.status;
                const isEnabled = currentStatus === 'present' || currentStatus === 'half-day';
                return (
                  <div key={employee.id} className="rounded-lg border bg-secondary/40 shadow-sm">
                    <div className="p-3 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="text-left"
                        >
                          <p className="font-semibold hover:underline">
                            {employee.name}
                          </p>
                        </button>
                        <Input
                          type="number"
                          className="w-28 h-9 text-right"
                          placeholder="LKR"
                          disabled={!isEnabled}
                          value={currentRecord?.allowance ?? employee.daily_allowance ?? ''}
                          onChange={(e) => {
                            const newAllowance = parseInt(e.target.value, 10);
                            // Optimistically update the UI
                            useStore.setState(state => ({
                                attendance: {
                                    ...state.attendance,
                                    [formattedDate]: {
                                        ...state.attendance[formattedDate],
                                        [employee.id]: {
                                            ...state.attendance[formattedDate]?.[employee.id],
                                            allowance: isNaN(newAllowance) ? null : newAllowance,
                                        }
                                    }
                                }
                            }));
                            if (!isNaN(newAllowance)) {
                                updateAllowance(employee.id, formattedDate, newAllowance);
                            }
                          }}
                        />
                      </div>
                    <RadioGroup
                        value={currentStatus}
                        onValueChange={(status) => setAttendance(employee.id, formattedDate, status as AttendanceStatus, employee.daily_allowance || 1000)}
                        className="flex rounded-lg border border-input"
                    >
                        <Label
                            htmlFor={`${employee.id}-present`}
                            className={cn(
                                "flex-1 text-center text-sm p-2.5 rounded-l-md cursor-pointer transition-colors",
                                getStatusColor(currentStatus, 'present')
                            )}
                        >
                            Present
                        </Label>
                        <RadioGroupItem value="present" id={`${employee.id}-present`} className="sr-only" />
                        
                        <div className="border-l border-input h-auto"></div>

                        <Label
                            htmlFor={`${employee.id}-half-day`}
                            className={cn(
                                "flex-1 text-center text-sm p-2.5 cursor-pointer transition-colors",
                                getStatusColor(currentStatus, 'half-day')
                            )}
                        >
                            Half Day
                        </Label>
                        <RadioGroupItem value="half-day" id={`${employee.id}-half-day`} className="sr-only" />

                        <div className="border-l border-input h-auto"></div>

                        <Label
                            htmlFor={`${employee.id}-absent`}
                            className={cn(
                                "flex-1 text-center text-sm p-2.5 rounded-r-md cursor-pointer transition-colors",
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
