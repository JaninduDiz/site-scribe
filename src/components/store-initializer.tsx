// src/components/store-initializer.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import type { Employee, AttendanceData, AttendanceStatus, DbAttendanceRecord } from '@/types';

function transformAttendance(records: DbAttendanceRecord[]): AttendanceData {
    const attendanceData: AttendanceData = {};
    for (const record of records) {
        if (!attendanceData[record.date]) {
            attendanceData[record.date] = {};
        }
        attendanceData[record.date][record.employee_id] = record.status as AttendanceStatus;
    }
    return attendanceData;
}


export function StoreInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      
      const fetchInitialData = async () => {
        const { data: employees, error: empError } = await supabase.from('employees').select('*');
        if (empError) {
          console.error('Error fetching employees:', empError);
        } else {
          useStore.getState().setEmployees(employees || []);
        }

        const { data: attendance, error: attError } = await supabase.from('attendance').select('*');
        if (attError) {
            console.error('Error fetching attendance:', attError);
        } else {
            useStore.getState().setAttendance(transformAttendance(attendance || []));
        }

        useStore.setState({ initialized: true });
        initialized.current = true;
      };
      
      fetchInitialData();

      const employeeChannel = supabase.channel('employees')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, async (payload) => {
            const { data: employees, error } = await supabase.from('employees').select('*');
            if (error) console.error('Error re-fetching employees', error);
            else useStore.getState().setEmployees(employees || []);
        })
        .subscribe();
        
      const attendanceChannel = supabase.channel('attendance')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, async (payload) => {
           const { data: attendance, error } = await supabase.from('attendance').select('*');
            if (error) console.error('Error re-fetching attendance', error);
            else useStore.getState().setAttendance(transformAttendance(attendance || []));
        })
        .subscribe();


      // Cleanup function to unsubscribe from channels on component unmount
      return () => {
        supabase.removeChannel(employeeChannel);
        supabase.removeChannel(attendanceChannel);
      };
    }
  }, []);

  return null;
}
