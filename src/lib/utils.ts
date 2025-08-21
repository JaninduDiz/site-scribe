import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import type { Employee, AttendanceData } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToExcel(
  selectedMonth: string,
  employees: Employee[],
  attendance: AttendanceData
) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const headers = ['Employee Name', ...daysInMonth.map(day => format(day, 'dd-MMM'))];
  
  const data = employees.map(employee => {
    const row: (string | number)[] = [employee.name];
    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const status = attendance[dateStr]?.[employee.id];
      const capitalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
      row.push(capitalizedStatus);
    });
    return row;
  });

  const worksheetData = [headers, ...data];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `SiteScribe_Attendance_${selectedMonth}.xlsx`);
}

export function getMonthsWithData(attendance: AttendanceData): { value: string, label: string }[] {
    const months = new Set<string>();
    Object.keys(attendance).forEach(dateStr => {
        const date = new Date(dateStr + "T00:00:00"); // Avoid timezone issues
        months.add(format(date, 'yyyy-MM'));
    });

    return Array.from(months)
        .map(monthStr => ({
            value: monthStr,
            label: format(new Date(monthStr + "-01T00:00:00"), 'MMMM yyyy'),
        }))
        .sort((a, b) => b.value.localeCompare(a.value)); // Sort descending
}
