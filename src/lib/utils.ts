import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid, isSunday } from 'date-fns';
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

  // Main attendance sheet
  const headers = ['Date', ...employees.map(emp => emp.name)];
  
  const dataRows = daysInMonth.map(day => {
    if (isSunday(day)) {
      return [format(day, 'dd-MMM-yyyy'), ...Array(employees.length).fill('Sunday')];
    }
    const dateStr = format(day, 'yyyy-MM-dd');
    const formattedDay = format(day, 'dd-MMM-yyyy');
    const row: (string | number)[] = [formattedDay];

    employees.forEach(employee => {
      const record = attendance[dateStr]?.[employee.id];
      const status = record?.status;
      let capitalizedStatus = '-';
      if (status) {
        if (status === 'half-day') {
            capitalizedStatus = 'Half Day';
        } else {
            capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        }
      }
      row.push(capitalizedStatus);
    });
    return row;
  });

  const totalPresent: (string | number)[] = ['Total Present Days'];
  const totalAbsent: (string | number)[] = ['Total Absent Days'];

  employees.forEach(employee => {
    let presentCount = 0;
    let absentCount = 0;
    daysInMonth.forEach(day => {
      if (!isSunday(day)) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const status = attendance[dateStr]?.[employee.id]?.status;
        if (status === 'present') {
          presentCount += 1;
        } else if (status === 'half-day') {
          presentCount += 0.5;
        } else if (status === 'absent') {
          absentCount++;
        }
      }
    });
    totalPresent.push(presentCount);
    totalAbsent.push(absentCount);
  });
  
  const worksheetData = [headers, ...dataRows, [], totalPresent, totalAbsent];
  const attendanceWorksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const colWidths = [{wch: 15}, ...employees.map(e => ({wch: (e.name?.length || 10) + 5}))];
  attendanceWorksheet['!cols'] = colWidths;
  
  // Allowance sheet
  const allowanceHeaders = ['Employee Name', 'Total Allowance (LKR)'];
  const allowanceData = employees.map(employee => {
    const totalAllowance = daysInMonth.reduce((total, day) => {
        if (!isSunday(day)) {
            const dateStr = format(day, 'yyyy-MM-dd');
            const record = attendance[dateStr]?.[employee.id];
            if (record && (record.status === 'present' || record.status === 'half-day')) {
                const allowance = record.allowance || 0;
                return total + allowance;
            }
        }
        return total;
    }, 0);
    return [employee.name, totalAllowance];
  });

  const allowanceWorksheetData = [allowanceHeaders, ...allowanceData];
  const allowanceWorksheet = XLSX.utils.aoa_to_sheet(allowanceWorksheetData);
  allowanceWorksheet['!cols'] = [{wch: 20}, {wch: 20}];


  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, attendanceWorksheet, 'Attendance');
  XLSX.utils.book_append_sheet(workbook, allowanceWorksheet, 'Allowances');


  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `SiteScribe_Report_${selectedMonth}.xlsx`);
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
