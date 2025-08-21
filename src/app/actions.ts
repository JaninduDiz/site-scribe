// src/app/actions.ts
'use server';

import { assessDataIntegrity } from '@/ai/flows/data-integrity-tool';
import type { AssessDataIntegrityOutput } from '@/ai/flows/data-integrity-tool';

export async function checkDataIntegrityAction(
  attendanceData: string
): Promise<AssessDataIntegrityOutput> {
  try {
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
