// src/components/employee-list.tsx
'use client';

import { useState } from 'react';
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
import { Loader2, Search, UserPlus, User, Trash2, Edit } from 'lucide-react';
import type { Employee } from '@/types';
import { AddEmployeeDialog } from './add-employee-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function EmployeeList() {
  const { employees, initialized } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  }

  const handleAddNew = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  }
  
  const handleDelete = async (employeeId: string) => {
      try {
        const { error } = await supabase.from('employees').delete().eq('id', employeeId);
        if (error) throw error;
        // Note: Real-time subscription will auto-update the UI
      } catch (error) {
          console.error("Error deleting employee: ", error);
          // Here you might want to show a toast to the user
      }
  }


  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!initialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Employees...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                View, add, or edit employee information.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Employee
            </Button>
          </div>
          <div className="mt-4 relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <User className="h-6 w-6 text-muted-foreground" />
                       <div className="text-sm">
                           <p className="font-semibold text-base">{employee.name}</p>
                           <p className="text-muted-foreground">{employee.phone || 'No phone'}</p>
                           <p className="text-muted-foreground">{employee.address || 'No address'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                            <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the employee record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(employee.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center">
                No employees found. Add one to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <AddEmployeeDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        employee={selectedEmployee}
      />
    </>
  );
}
