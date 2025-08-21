// src/lib/store.ts
import { create } from 'zustand';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

type State = {
  employees: Employee[];
  attendance: AttendanceData;
  isLoading: boolean;
  error: string | null;
};

type Actions = {
  initialize: () => () => void; // Returns the unsubscribe function
  addEmployee: (name: string) => Promise<void>;
  toggleAttendance: (
    employeeId: string,
    date: string,
    status: AttendanceStatus
  ) => Promise<void>;
  getAttendanceForMonth: (month: string) => Promise<AttendanceData>;
};

type StoreType = State & Actions;

const useStore = create<StoreType>((set, get) => ({
  employees: [],
  attendance: {},
  isLoading: true,
  error: null,

  initialize: () => {
    const unsubEmployees = onSnapshot(
      collection(db, 'employees'),
      (snapshot) => {
        const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        set({ employees, isLoading: false });
      },
      (error) => {
        console.error("Error fetching employees:", error);
        set({ error: "Failed to load employees.", isLoading: false });
      }
    );

    const unsubAttendance = onSnapshot(
      collection(db, 'attendance'),
      (snapshot) => {
        const attendance: AttendanceData = {};
        snapshot.forEach((doc) => {
            attendance[doc.id] = doc.data() as { [employeeId: string]: AttendanceStatus };
        });
        set({ attendance, isLoading: false });
      },
      (error) => {
        console.error("Error fetching attendance:", error);
        set({ error: "Failed to load attendance.", isLoading: false });
      }
    );
    
    // Return a function that unsubscribes from both listeners
    return () => {
      unsubEmployees();
      unsubAttendance();
    };
  },

  addEmployee: async (name) => {
    if (!name.trim()) return;
    try {
      const newEmployeeRef = doc(collection(db, 'employees'));
      const newEmployee: Employee = {
        id: newEmployeeRef.id,
        name,
      };
      await setDoc(newEmployeeRef, { name }); // Only store name, id is the doc id
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  },

  toggleAttendance: async (employeeId, date, status) => {
    try {
      const attendanceRef = doc(db, 'attendance', date);
      const currentAttendance = get().attendance[date] || {};
      
      const newStatus = currentAttendance[employeeId] === status ? null : status;

      const updatedRecord = { ...currentAttendance };
      if (newStatus === null) {
        delete updatedRecord[employeeId];
      } else {
        updatedRecord[employeeId] = newStatus;
      }
      
      await setDoc(attendanceRef, updatedRecord);

    } catch (error) {
      console.error("Error toggling attendance:", error);
    }
  },
  
  // This function might be needed for the export feature to fetch specific month data
  getAttendanceForMonth: async (month) => {
      // Assuming month is in 'yyyy-MM' format
      // Firestore queries for date ranges can be complex. For simplicity,
      // we'll rely on the already subscribed data. If performance becomes an issue,
      // a direct query would be better.
      const allAttendance = get().attendance;
      const monthlyAttendance: AttendanceData = {};
      for(const date in allAttendance) {
          if (date.startsWith(month)) {
              monthlyAttendance[date] = allAttendance[date];
          }
      }
      return monthlyAttendance;
  }
}));

export default useStore;
