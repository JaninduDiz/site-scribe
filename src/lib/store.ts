// src/lib/store.ts
import { create } from 'zustand';
import {
  collection,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';


type State = {
  employees: Employee[];
  attendance: AttendanceData;
};

type Actions = {
  setEmployees: (employees: Employee[]) => void;
  setAttendance: (attendance: AttendanceData) => void;
  addEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
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

  addEmployee: async (employeeData) => {
    try {
      const newEmployeeRef = doc(collection(db, 'employees'));
      await setDoc(newEmployeeRef, employeeData);
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  },
  
  updateEmployee: async (employee) => {
      try {
        const employeeRef = doc(db, 'employees', employee.id);
        await setDoc(employeeRef, employee, { merge: true });
      } catch (error) {
          console.error("Error updating employee: ", error);
      }
  },
  
  deleteEmployee: async (employeeId: string) => {
      try {
        await deleteDoc(doc(db, 'employees', employeeId));
      } catch (error) {
          console.error("Error deleting employee: ", error);
      }
  },

  toggleAttendance: async (employeeId, date, status) => {
    try {
      const attendanceRef = doc(db, 'attendance', date);
      const allAttendance = get().attendance;
      const currentAttendance = allAttendance[date] || {};
      
      const newStatus = currentAttendance[employeeId] === status ? null : status;

      const updatedRecord = { ...currentAttendance };
      if (newStatus === null) {
        delete updatedRecord[employeeId];
      } else {
        updatedRecord[employeeId] = newStatus;
      }
      
      await setDoc(attendanceRef, updatedRecord, { merge: true });

    } catch (error) {
      console.error("Error toggling attendance:", error);
    }
  },
}));

export default useStore;
