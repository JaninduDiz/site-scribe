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
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

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
  daily_allowance: z.coerce.number()
    .min(0, { message: "Daily allowance must be a positive number." })
    .optional(),
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
        daily_allowance: 1000,
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
              daily_allowance: employee.daily_allowance === null ? 1000 : employee.daily_allowance,
            });
        } else {
            reset({ name: '', phone: '', age: undefined, address: '', daily_allowance: 1000 });
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
          daily_allowance: data.daily_allowance || 1000,
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
      <DialogContent className={cn("sm:max-w-md", "h-full w-full max-h-[95vh] sm:h-auto sm:max-h-[90vh]")}>
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Update the details for this employee.' : 'Enter the details for the new employee.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1 px-6">
            <form onSubmit={handleSubmit(onSubmit)} id="employee-form" className="px-2 py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input id="name" {...field} />
                        )}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <Input id="phone" type="tel" {...field} />
                        )}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="daily_allowance">Default Daily Allowance (LKR)</Label>
                    <Controller
                        name="daily_allowance"
                        control={control}
                        render={({ field }) => (
                        <Input id="daily_allowance" type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} />
                        )}
                    />
                    {errors.daily_allowance && <p className="text-sm text-destructive">{errors.daily_allowance.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Controller
                        name="age"
                        control={control}
                        render={({ field }) => (
                        <Input id="age" type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} />
                        )}
                    />
                    {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                        <Textarea id="address" {...field} />
                        )}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
            </form>
        </ScrollArea>
        <DialogFooter className="border-t">
            <Button type="submit" form="employee-form" disabled={isSubmitting}>
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
      </DialogContent>
    </Dialog>
  );
}