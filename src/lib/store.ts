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

const useStoreInitializer = create<State & Actions>()(
  persist(
    (set, get) => ({
      employees: initialEmployees,
      attendance: {},

      addEmployee: (name) => {
        const newEmployee: Employee = {
          id: (get().employees.length + 1).toString(),
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

const useStore = ((selector) => {
    const store = useStoreInitializer(selector);
    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const initialState = {
        employees: initialEmployees,
        attendance: {},
    };

    if (!isHydrated) {
        if(typeof selector === 'function') {
            return selector(initialState as any);
        }
        return initialState;
    }

    return store;
});

export { useStore };
