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
import {
  Search,
  Calendar as CalendarIcon,
  Check,
  X,
  User,
  Loader2,
} from 'lucide-react';
import { format, isSunday } from 'date-fns';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import { EmployeeDetailsDialog } from './employee-details-dialog';

export function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { employees, attendance, initialized } = useStore();
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const toggleAttendance = async (employeeId: string, date: string, status: AttendanceStatus) => {
    try {
        const currentStatus = attendance[date]?.[employeeId];
        const newStatus = currentStatus === status ? null : status;

        if (newStatus === null) {
            // Delete the record
            const { error } = await supabase.from('attendance')
                .delete()
                .match({ date: date, employee_id: employeeId });
            if (error) throw error;
        } else {
            // Upsert the record
            const { error } = await supabase.from('attendance').upsert({
                date: date,
                employee_id: employeeId,
                status: newStatus,
            }, { onConflict: 'date,employee_id' });
            if (error) throw error;
        }
    } catch (error) {
      console.error("Error toggling attendance:", error);
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
            filteredEmployees.map(employee => (
              <Card key={employee.id} className="flex flex-col">
                <CardHeader className="flex-row items-center justify-between pb-2">
                   <button
                    onClick={() => setSelectedEmployee(employee)}
                    className="text-left"
                  >
                    <CardTitle className="text-base font-medium hover:underline">
                      {employee.name}
                    </CardTitle>
                  </button>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex-1 flex items-end">
                  <div className="flex w-full gap-2">
                    <Button
                      variant={
                        todaysAttendance[employee.id] === 'present'
                          ? 'default'
                          : 'outline'
                      }
                      className="w-full"
                      onClick={() =>
                        toggleAttendance(
                          employee.id,
                          formattedDate,
                          'present'
                        )
                      }
                    >
                      <Check className="mr-2 h-4 w-4" /> Present
                    </Button>
                    <Button
                      variant={
                        todaysAttendance[employee.id] === 'absent'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="w-full"
                      onClick={() =>
                        toggleAttendance(employee.id, formattedDate, 'absent')
                      }
                    >
                      <X className="mr-2 h-4 w-4" /> Absent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
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
