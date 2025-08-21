// src/types/index.ts

export type Employee = {
  id: string;
  name: string;
  phone?: string;
  age?: number;
};

export type AttendanceStatus = 'present' | 'absent';

export type AttendanceRecord = {
  [employeeId: string]: AttendanceStatus;
};

export type AttendanceData = {
  [date: string]: AttendanceRecord; // date is in 'yyyy-MM-dd' format
};
