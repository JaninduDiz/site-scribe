// src/components/attendance-tracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  Calendar as CalendarIcon,
  Check,
  X,
  UserPlus,
  ChevronDown,
  User,
  Loader2,
} from 'lucide-react';
import { format, isSunday } from 'date-fns';
import useStore from '@/lib/store';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import { EmployeeDetailsDialog } from './employee-details-dialog';

export function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { employees, attendance, addEmployee, toggleAttendance, setEmployees, setAttendance } = useStore();

  useEffect(() => {
    setIsLoading(true);
    const unsubEmployees = onSnapshot(
      collection(db, 'employees'),
      (snapshot) => {
        const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        setEmployees(fetchedEmployees);
        if (isLoading) setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees.");
        setIsLoading(false);
      }
    );

    const unsubAttendance = onSnapshot(
      collection(db, 'attendance'),
      (snapshot) => {
        const fetchedAttendance: AttendanceData = {};
        snapshot.forEach((doc) => {
            fetchedAttendance[doc.id] = doc.data() as { [employeeId: string]: AttendanceStatus };
        });
        setAttendance(fetchedAttendance);
        if (isLoading) setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching attendance:", err);
        setError("Failed to load attendance data.");
        setIsLoading(false);
      }
    );

    return () => {
      unsubEmployees();
      unsubAttendance();
    };
  }, [setEmployees, setAttendance]);


  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmployeeName.trim()) {
      await addEmployee(newEmployeeName.trim());
      setNewEmployeeName('');
      setIsAddingEmployee(false);
    }
  };

  if (isLoading) {
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

  if (error) {
     return (
       <Card>
        <CardHeader>
           <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  const filteredEmployees = employees.filter(emp =>
    emp?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const todaysAttendance = attendance[formattedDate] || {};

  return (
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
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Collapsible open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <form onSubmit={handleAddEmployee} className="flex gap-2">
                <Input
                  placeholder="New employee name..."
                  value={newEmployeeName}
                  onChange={e => setNewEmployeeName(e.target.value)}
                />
                <Button type="submit">Add</Button>
              </form>
            </CollapsibleContent>
          </Collapsible>
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
              No employees found. Add one to get started.
            </p>
          )}
        </div>
      </CardContent>
      {selectedEmployee && (
        <EmployeeDetailsDialog
          employee={selectedEmployee}
          attendance={attendance}
          open={!!selectedEmployee}
          onOpenChange={() => setSelectedEmployee(null)}
        />
      )}
    </Card>
  );
}
