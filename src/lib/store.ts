// src/lib/store.ts
import { create } from 'zustand';
import type { Employee, AttendanceData } from '@/types';

type State = {
  employees: Employee[];
  attendance: AttendanceData;
};

type Actions = {
  setEmployees: (employees: Employee[]) => void;
  setAttendance: (attendance: AttendanceData) => void;
};

const useStore = create<State & Actions>((set) => ({
  employees: [],
  attendance: {},
  setEmployees: (employees) => set({ employees }),
  setAttendance: (attendance) => set({ attendance }),
}));

export default useStore;
