// src/types/index.ts
import type { Database } from "./supabase";

export type Employee = Database['public']['Tables']['employees']['Row'];

export type AttendanceStatus = 'present' | 'absent' | 'half-day';

export type AttendanceRecord = {
  [employeeId: string]: {
    status: AttendanceStatus;
    allowance: number | null;
  };
};

export type AttendanceData = {
  [date: string]: AttendanceRecord; // date is in 'yyyy-MM-dd' format
};

export type DbAttendanceRecord = Database['public']['Tables']['attendance']['Row'];
