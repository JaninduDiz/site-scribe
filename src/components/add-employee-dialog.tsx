// src/components/add-employee-dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import type { Employee } from '@/types';
import { Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';

const employeeSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters." })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces." }),
  phone: z.string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits." })
    .optional()
    .or(z.literal('')),
  age: z.coerce.number()
    .min(18, { message: "Age must be at least 18." })
    .max(99, { message: "Age must be a 2-digit number." })
    .optional(),
  address: z.string().optional(),
});


type AddEmployeeDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  employee: Employee | null;
};

export function AddEmployeeDialog({
  isOpen,
  setIsOpen,
  employee,
}: AddEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
        name: '',
        phone: '',
        age: undefined,
        address: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (employee) {
            reset({
              name: employee.name,
              phone: employee.phone || '',
              age: employee.age || undefined,
              address: employee.address || '',
            });
        } else {
            reset({ name: '', phone: '', age: undefined, address: '' });
        }
    }
  }, [isOpen, employee, reset]);


  const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
    setIsSubmitting(true);
    try {
      const employeeData = {
          ...(employee && { id: employee.id }),
          name: data.name,
          phone: data.phone || null,
          age: data.age || null,
          address: data.address || null,
      };

      const { error } = await supabase.from('employees').upsert(employeeData);

      if (error) {
          throw error;
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Error saving employee: ", error);
      // Here you might want to show a toast to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Update the details for this employee.' : 'Enter the details for the new employee.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input id="name" {...field} className="col-span-3" />
                        )}
                    />
                    {errors.name && <p className="col-span-4 text-sm text-destructive text-right">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <Input id="phone" {...field} className="col-span-3" />
                        )}
                    />
                    {errors.phone && <p className="col-span-4 text-sm text-destructive text-right">{errors.phone.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right">Age</Label>
                     <Controller
                        name="age"
                        control={control}
                        render={({ field }) => (
                           <Input id="age" type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} className="col-span-3" />
                        )}
                    />
                    {errors.age && <p className="col-span-4 text-sm text-destructive text-right">{errors.age.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="address" className="text-right pt-2">Address</Label>
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                           <Textarea id="address" {...field} className="col-span-3" />
                        )}
                    />
                    {errors.address && <p className="col-span-4 text-sm text-destructive text-right">{errors.address.message}</p>}
                </div>
            </div>
            <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    'Save Employee'
                )}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
