// src/lib/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';

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


// Custom hook to deal with hydration issues in Next.js
export const useStore = <T>(selector: (state: State & Actions) => T) => {
    const store = useStoreInitializer(selector);
    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => {
        setIsHydrated(true);
    }, []);
    return isHydrated ? store : (selector as any)({ employees: [], attendance: {} });
};

// We need to export the raw store for non-hook usage if needed, but for components, use useStore
// And we need to add a "hack" to avoid using the hook selector outside of components
const initialStoreForHook = {
    employees: [],
    attendance: {},
    addEmployee: () => {},
    toggleAttendance: () => {},
}
const useStoreSelector = (selector: (state: State & Actions) => any) => selector(initialStoreForHook);

// To avoid 'useState' and 'useEffect' import errors on the server, we need to create a dummy store for SSR.
// The real `useStore` will be used on the client.
import { useState, useEffect } from 'react';

const store = typeof window !== 'undefined' ? useStoreInitializer : useStoreSelector;
const useActualStore = typeof window !== 'undefined' ? useStore : useStore;

export { useActualStore as useStore };
