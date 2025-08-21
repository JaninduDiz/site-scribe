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

const useStore = <T>(selector: (state: StoreType) => T) => {
    const [store, setStore] = useState<T | undefined>(undefined);
  
    useEffect(() => {
      // This ensures that we're only accessing the store on the client-side
      // after hydration is complete.
      const unsub = useStoreBase.subscribe(
        (state) => setStore(selector(state)),
        true // Fire immediately to get the initial state
      );
      return unsub;
    }, [selector]);
  
    // On the server, and on the client before hydration, return undefined.
    // The components using this hook should handle this undefined state gracefully.
    return store;
  };

export default useStore;