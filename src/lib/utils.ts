
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid, isSunday, getDaysInMonth } from 'date-fns';
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
  const monthDate = new Date(year, month - 1);
  const startDate = startOfMonth(monthDate);
  const endDate = endOfMonth(monthDate);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  const numDays = getDaysInMonth(monthDate);

  const monthYearHeader = format(monthDate, 'MMMM yyyy');
  
  // Create headers
  const dayHeaders = Array.from({ length: numDays }, (_, i) => format(new Date(year, month - 1, i + 1), 'dd'));
  const summaryHeaders = ['Total Present Days', 'Total Absent Days', 'Total Allowance (LKR)'];
  const headers = ['Employee Name', ...dayHeaders, ...summaryHeaders];
  
  const dataRows = employees.map(employee => {
    const row: (string | number)[] = [employee.name];
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalAllowance = 0;

    daysInMonth.forEach(day => {
        if (isSunday(day)) {
            row.push('SUN');
            return;
        }

        const dateStr = format(day, 'yyyy-MM-dd');
        const record = attendance[dateStr]?.[employee.id];
        const status = record?.status;

        switch (status) {
            case 'present':
                row.push('P');
                totalPresent += 1;
                totalAllowance += record.allowance || 0;
                break;
            case 'half-day':
                row.push('HD');
                totalPresent += 0.5;
                totalAllowance += record.allowance || 0;
                break;
            case 'absent':
                row.push('A');
                totalAbsent += 1;
                break;
            default:
                row.push('-'); // No record
        }
    });

    // Add summary data to the row
    row.push(totalPresent, totalAbsent, totalAllowance.toLocaleString());

    return row;
  });

  // Create worksheet data
  const worksheetData = [
    [monthYearHeader], // Merged header for month/year
    headers,
    ...dataRows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Define merges for the month/year header
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } } // Merge cells from A1 to the last header column
  ];
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // Employee Name
    ...dayHeaders.map(() => ({ wch: 5 })), // Day columns
    { wch: 20 }, // Total Present
    { wch: 20 }, // Total Absent
    { wch: 25 }  // Total Allowance
  ];
  worksheet['!cols'] = colWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `SiteScribe_Report_${format(monthDate, 'MMM-yyyy')}.xlsx`);
}


export function getMonthsWithData(attendance: AttendanceData): { value: string, label: string }[] {
    const months = new Set<string>();
    Object.keys(attendance).forEach(dateStr => {
        const date = new Date(dateStr);
        if (isValid(date)) {
            months.add(format(date, 'yyyy-MM'));
        }
    });

    return Array.from(months)
        .map(monthStr => {
            const date = new Date(monthStr + "-01T12:00:00"); 
            return {
                value: monthStr,
                label: format(date, 'MMMM yyyy'),
            }
        })
        .sort((a, b) => b.value.localeCompare(a.value));
}
