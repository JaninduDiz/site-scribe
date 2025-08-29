
// src/app/page.tsx
'use client';

import { Header } from '@/components/header';
import { AttendanceTracker } from '@/components/attendance-tracker';
import { EmployeeList } from '@/components/employee-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import { StoreInitializer } from '@/components/store-initializer';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    const pendingChanges = useStore.getState().pendingChanges;
    const { data, error } = await supabase.from('attendance').upsert(Object.values(pendingChanges));

    if (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save attendance changes.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Attendance has been saved successfully.',
      });
      useStore.getState().clearPendingChanges();
      setIsEditMode(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col" style={{ paddingTop: 'env(safe-area-inset-top)'}}>
      <StoreInitializer />
      <Header 
        isEditMode={isEditMode}
        onEdit={() => setIsEditMode(true)}
        onSubmit={handleSaveChanges}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto pb-24">
            <TabsContent value="attendance" className="p-4 md:p-6 pt-4">
                <AttendanceTracker isEditMode={isEditMode} />
            </TabsContent>
            <TabsContent value="employees" className="p-4 md:p-6 pt-4">
                <EmployeeList />
            </TabsContent>
        </main>
        <TabsList className="grid w-full grid-cols-2 h-20 rounded-none fixed bottom-0 z-20" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)'}}>
            <TabsTrigger value="attendance" className="text-xs data-[state=active]:text-primary h-full rounded-none flex-col gap-1">
            <CalendarCheck className="h-5 w-5" />
            Attendance
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-xs data-[state=active]:text-primary h-full rounded-none flex-col gap-1">
            <Users className="h-5 w-5" />
            Employees
            </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
