// src/lib/store.ts
import { create } from 'zustand';
import type { Employee, AttendanceData } from '@/types';

type State = {
  employees: Employee[];
  attendance: AttendanceData;
  initialized: boolean;
};

type Actions = {
  setEmployees: (employees: Employee[]) => void;
  setAttendance: (attendance: AttendanceData) => void;
};

export const useStore = create<State & Actions>((set) => ({
  employees: [],
  attendance: {},
  initialized: false,
  setEmployees: (employees) => set({ employees }),
  setAttendance: (attendance) => set({ attendance }),
}));
