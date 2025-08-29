
// src/lib/store.ts
import { create } from 'zustand';
import type { Employee, AttendanceData, DbAttendanceRecord } from '@/types';
import { immer } from 'zustand/middleware/immer';

type PendingChange = {
  date: string;
  employee_id: string;
  status: 'present' | 'absent' | 'half-day' | null;
  allowance: number | null;
};

type State = {
  employees: Employee[];
  attendance: AttendanceData;
  pendingChanges: { [key: string]: PendingChange };
  initialized: boolean;
};

type Actions = {
  setEmployees: (employees: Employee[]) => void;
  setAttendance: (attendance: AttendanceData) => void;
  updatePendingChange: (change: PendingChange) => void;
  clearPendingChanges: () => void;
};

export const useStore = create<State & Actions>()(
  immer((set) => ({
    employees: [],
    attendance: {},
    pendingChanges: {},
    initialized: false,
    setEmployees: (employees) => set({ employees }),
    setAttendance: (attendance) => set({ attendance }),
    updatePendingChange: (change) => {
      set((state) => {
        const key = `${change.date}-${change.employee_id}`;
        if (change.status === null) {
          // This logic might need to be adjusted based on desired behavior for clearing status.
          // For now, we assume null means "revert to original" or "no change".
          // A more robust implementation might differentiate between "cleared" and "unchanged".
          delete state.pendingChanges[key];
        } else {
          state.pendingChanges[key] = change;
        }
      });
    },
    clearPendingChanges: () => set({ pendingChanges: {} }),
  }))
);
