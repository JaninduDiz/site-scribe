// src/lib/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import { useState, useEffect } from 'react';

// Dummy Data
const initialEmployees: Employee[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Mike Johnson' },
  { id: '4', name: 'Emily Davis' },
  { id: '5', name: 'Chris Wilson' },
];

type State = {
  employees: Employee[];
  attendance: AttendanceData;
};

type Actions = {
  addEmployee: (name: string) => void;
  toggleAttendance: (employeeId: string, date: string, status: AttendanceStatus) => void;
};

type StoreType = State & Actions;

const useStoreBase = create<StoreType>()(
  persist(
    (set, get) => ({
      employees: initialEmployees,
      attendance: {},

      addEmployee: (name) => {
        const newEmployee: Employee = {
          id: String(Date.now()), // Use a more unique ID
          name,
        };
        set((state) => ({ employees: [...state.employees, newEmployee] }));
      },

      toggleAttendance: (employeeId, date, status) => {
        set((state) => {
          const newAttendance = { ...state.attendance };
          if (!newAttendance[date]) {
            newAttendance[date] = {};
          }
          
          if (newAttendance[date][employeeId] === status) {
            // If clicking the same status again, clear it (mark as not recorded)
            delete newAttendance[date][employeeId];
          } else {
            newAttendance[date][employeeId] = status;
          }

          return { attendance: newAttendance };
        });
      },
    }),
    {
      name: 'sitescribe-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// This is a common pattern for handling Zustand hydration with Next.js
const useStore = <T>(selector: (state: StoreType) => T) => {
  const [state, setState] = useState<T | undefined>(undefined);

  useEffect(() => {
    // This effect runs on the client after hydration, so we can safely access the store.
    const unsubscribe = useStoreBase.subscribe(() => {
      setState(selector(useStoreBase.getState()));
    });
    // Set the initial state on the client
    setState(selector(useStoreBase.getState()));
    
    return () => unsubscribe();
  }, [selector]);

  // On the server, and before hydration on the client, we can return a default/initial state
  // or undefined. Returning undefined will cause consumers to handle the loading state.
  return state;
};

// We also export the base store for times we might need to access it outside of a React component
export { useStoreBase };
export default useStore;
