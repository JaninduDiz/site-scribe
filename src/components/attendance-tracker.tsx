// src/components/attendance-tracker.tsx
'use client';

import { useState, useEffect } from 'react';
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
  Search,
  Calendar as CalendarIcon,
  Check,
  X,
  User,
  Loader2,
  Clock,
} from 'lucide-react';
import { format, isSunday } from 'date-fns';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import { EmployeeDetailsDialog } from './employee-details-dialog';
import { cn } from '@/lib/utils';

export function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { employees, attendance, initialized } = useStore();
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const setAttendance = async (employeeId: string, date: string, status: AttendanceStatus) => {
    try {
        const currentStatus = attendance[date]?.[employeeId];

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
        }, { onConflict: 'date,employee_id' });
        if (error) throw error;
    } catch (error) {
      console.error("Error setting attendance:", error);
    }
  };


  if (!initialized || !selectedDate) {
    return (
       <Card>
        <CardHeader>
           <CardTitle>Loading Attendance...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const todaysAttendance = attendance[formattedDate] || {};

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
    <Card>
      <CardHeader>
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
        <div className="mt-4 relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map(employee => {
                const currentStatus = todaysAttendance[employee.id];
                return (
                  <Card key={employee.id}>
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="text-left"
                      >
                        <CardTitle className="text-base font-medium hover:underline">
                          {employee.name}
                        </CardTitle>
                      </button>
                    <RadioGroup
                        value={currentStatus}
                        onValueChange={(status) => setAttendance(employee.id, formattedDate, status as AttendanceStatus)}
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
                    </CardContent>
                  </Card>
                )
            })
          ) : (
            <p className="text-muted-foreground col-span-full text-center">
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
