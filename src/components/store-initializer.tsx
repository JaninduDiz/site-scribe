// src/components/store-initializer.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Employee, AttendanceData, AttendanceStatus } from '@/types';

export function StoreInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const unsubEmployees = onSnapshot(
        collection(db, 'employees'),
        (snapshot) => {
          const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
          useStore.getState().setEmployees(fetchedEmployees);
        },
        (err) => {
          console.error("Error fetching employees:", err);
        }
      );

      const unsubAttendance = onSnapshot(
        collection(db, 'attendance'),
        (snapshot) => {
          const fetchedAttendance: AttendanceData = {};
          snapshot.forEach((doc) => {
              fetchedAttendance[doc.id] = doc.data() as { [employeeId: string]: AttendanceStatus };
          });
          useStore.getState().setAttendance(fetchedAttendance);
        },
        (err) => {
          console.error("Error fetching attendance:", err);
        }
      );

      // Set initialized to true after setting up listeners
      useStore.setState({ initialized: true });
      initialized.current = true;

      // Cleanup function to unsubscribe from listeners on component unmount
      return () => {
        unsubEmployees();
        unsubAttendance();
      };
    }
  }, []);

  return null;
}
