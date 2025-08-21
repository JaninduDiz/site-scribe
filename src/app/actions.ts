// src/app/actions.ts
'use server';

import { assessDataIntegrity } from '@/ai/flows/data-integrity-tool';
import type { AssessDataIntegrityOutput } from '@/ai/flows/data-integrity-tool';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  // Check for service account credentials in environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    // Fallback for local development without service account key
    // This will have limited permissions
    initializeApp();
  }
}

const db = getFirestore();


async function getMonthlyData(month: string): Promise<string> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, monthNum, 1).toISOString().split('T')[0];

    const employeesSnapshot = await db.collection('employees').get();
    const employees = employeesSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().name;
        return acc;
    }, {} as {[id: string]: string});

    const attendanceSnapshot = await db.collection('attendance')
        .where(db.app.firestore.FieldPath.documentId(), '>=', startDate)
        .where(db.app.firestore.FieldPath.documentId(), '<', endDate)
        .get();
        
    let formattedData = '';
    attendanceSnapshot.forEach(doc => {
        const date = doc.id;
        const records = doc.data();
        const dailyRecords = Object.entries(records)
            .map(([empId, status]) => {
                const empName = employees[empId] || 'Unknown Employee';
                return `${empName}: ${status}`;
            })
            .join(', ');
        formattedData += `Date: ${date}, ${dailyRecords}\n`;
    });

    return formattedData;
}


export async function checkDataIntegrityAction(
  month: string // Expects 'yyyy-MM' format
): Promise<AssessDataIntegrityOutput> {
  try {
    const attendanceData = await getMonthlyData(month);
    if (!attendanceData) {
        return {
            assessment: 'No attendance data found for the selected month.',
            isConsistent: true,
        }
    }
    const result = await assessDataIntegrity({ attendanceData });
    return result;
  } catch (error) {
    console.error('Error assessing data integrity:', error);
    return {
      assessment: 'An error occurred while assessing data integrity. Please try again.',
      isConsistent: false,
    };
  }
}
