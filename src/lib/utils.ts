
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid } from 'date-fns';
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

  // Headers are employee names
  const headers = ['Date', ...employees.map(emp => emp.name)];
  
  // Data rows are for each day
  const dataRows = daysInMonth.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const formattedDay = format(day, 'dd-MMM-yyyy');
    const row: (string | number)[] = [formattedDay];

    employees.forEach(employee => {
      const status = attendance[dateStr]?.[employee.id];
      const capitalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
      row.push(capitalizedStatus);
    });
    return row;
  });

  // Calculate totals
  const totalPresent: (string | number)[] = ['Total Present'];
  const totalAbsent: (string | number)[] = ['Total Absent'];

  employees.forEach(employee => {
    let presentCount = 0;
    let absentCount = 0;
    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const status = attendance[dateStr]?.[employee.id];
      if (status === 'present') {
        presentCount++;
      } else if (status === 'absent') {
        absentCount++;
      }
    });
    totalPresent.push(presentCount);
    totalAbsent.push(absentCount);
  });

  const worksheetData = [headers, ...dataRows, totalPresent, totalAbsent];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Add styling
  const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } } };
  const firstColStyle = { font: { bold: true } };
  const totalsStyle = { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } } };

  // Style Header Row
  headers.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: 0});
    if (!worksheet[cellAddress]) worksheet[cellAddress] = {v: headers[colIndex]};
    worksheet[cellAddress].s = headerStyle;
  });
  
  // Style First Column (Dates)
  worksheetData.slice(1, -2).forEach((_, rowIndex) => {
     const cellAddress = XLSX.utils.encode_cell({c: 0, r: rowIndex + 1});
     if(worksheet[cellAddress]) {
       worksheet[cellAddress].s = firstColStyle;
     }
  });

  // Style Totals Rows
  const totalsRowIndex1 = worksheetData.length - 2;
  const totalsRowIndex2 = worksheetData.length - 1;
  headers.forEach((_, colIndex) => {
    const cellAddress1 = XLSX.utils.encode_cell({c: colIndex, r: totalsRowIndex1});
    const cellAddress2 = XLSX.utils.encode_cell({c: colIndex, r: totalsRowIndex2});
    if(worksheet[cellAddress1]) worksheet[cellAddress1].s = totalsStyle;
    if(worksheet[cellAddress2]) worksheet[cellAddress2].s = totalsStyle;
  });

  // Set column widths
  const colWidths = [{wch: 15}, ...employees.map(e => ({wch: e.name.length + 5}))];
  worksheet['!cols'] = colWidths;


  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `SiteScribe_Attendance_${selectedMonth}.xlsx`);
}


export function getMonthsWithData(attendance: AttendanceData): { value: string, label: string }[] {
    const months = new Set<string>();
    Object.keys(attendance).forEach(dateStr => {
        // Ensure the date string is a valid format before processing
        const date = new Date(dateStr);
        if (isValid(date)) {
            months.add(format(date, 'yyyy-MM'));
        }
    });

    return Array.from(months)
        .map(monthStr => {
            const date = new Date(monthStr + "-01T12:00:00"); // Use midday to avoid timezone issues
            return {
                value: monthStr,
                label: format(date, 'MMMM yyyy'),
            }
        })
        .sort((a, b) => b.value.localeCompare(a.value)); // Sort descending
}
