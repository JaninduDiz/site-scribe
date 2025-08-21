// src/lib/store.ts
import { create } from 'zustand';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import {
  collection,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

type State = {
  employees: Employee[];
  attendance: AttendanceData;
};

type Actions = {
  setEmployees: (employees: Employee[]) => void;
  setAttendance: (attendance: AttendanceData) => void;
  addEmployee: (name: string) => Promise<void>;
  toggleAttendance: (
    employeeId: string,
    date: string,
    status: AttendanceStatus
  ) => Promise<void>;
};

const useStore = create<State & Actions>((set, get) => ({
  employees: [],
  attendance: {},
  
  setEmployees: (employees) => set({ employees }),
  setAttendance: (attendance) => set({ attendance }),

  addEmployee: async (name) => {
    if (!name.trim()) return;
    try {
      const newEmployeeRef = doc(collection(db, 'employees'));
      const newEmployee: Partial<Employee> = { // ID is set by firestore
        name,
      };
      await setDoc(newEmployeeRef, newEmployee);
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  },

  toggleAttendance: async (employeeId, date, status) => {
    try {
      const attendanceRef = doc(db, 'attendance', date);
      // Get the most recent attendance from the state
      const allAttendance = get().attendance;
      const currentAttendance = allAttendance[date] || {};
      
      const newStatus = currentAttendance[employeeId] === status ? null : status;

      const updatedRecord = { ...currentAttendance };
      if (newStatus === null) {
        delete updatedRecord[employeeId];
      } else {
        updatedRecord[employeeId] = newStatus;
      }
      
      // Setting the whole document is safer for real-time updates
      await setDoc(attendanceRef, updatedRecord);

    } catch (error)
    {
      console.error("Error toggling attendance:", error);
    }
  },
}));

export default useStore;
