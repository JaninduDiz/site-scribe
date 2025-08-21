
// src/app/page.tsx
'use client';

import { Header } from '@/components/header';
import { AttendanceTracker } from '@/components/attendance-tracker';
import { EmployeeList } from '@/components/employee-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import { StoreInitializer } from '@/components/store-initializer';

export default function Home() {
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div className="flex min-h-screen w-full flex-col" style={{ paddingTop: 'env(safe-area-inset-top)'}}>
      <StoreInitializer />
      <Header />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto pb-20">
            <TabsContent value="attendance" className="p-4 md:p-6">
                <AttendanceTracker />
            </TabsContent>
            <TabsContent value="employees" className="p-4 md:p-6">
                <EmployeeList />
            </TabsContent>
        </main>
        <TabsList className="grid w-full grid-cols-2 h-16 rounded-none fixed bottom-0 z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)'}}>
            <TabsTrigger value="attendance" className="text-sm data-[state=active]:text-primary h-full rounded-none flex-col gap-1">
            <CalendarCheck className="h-5 w-5" />
            Attendance
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-sm data-[state=active]:text-primary h-full rounded-none flex-col gap-1">
            <Users className="h-5 w-5" />
            Employees
            </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
