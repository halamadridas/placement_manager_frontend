// Student verification utility functions

export interface Student {
  regNo: string | null;
  name: string | null;
  company: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  status: string;
}

export interface VerificationData {
  registrationNumber: string;
  recruiterName: string;
  status?: string;
  rating?: string;
  feedback?: string;
}

const BACKEND_URL = `${process.env.VITE_APP_API_URL}`;

/**
 * Fetch all companies from the student data
 */
export async function fetchCompanies(): Promise<string[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/companies`);
    const result = await response.json();
    
    if (result.success) {
      return result.companies || [];
    } else {
      console.error('Failed to fetch companies:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

/**
 * Fetch students by company name
 */
export async function fetchStudentsByCompany(companyName: string): Promise<Student[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/students/company/${encodeURIComponent(companyName)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.students || [];
    } else {
      console.error('Failed to fetch students by company:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching students by company:', error);
    return [];
  }
}

/**
 * Verify a student's placement data
 */
export async function verifyStudent(verificationData: VerificationData): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/verify-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verificationData: {
          ...verificationData,
          status: verificationData.status || 'Pending'
        }
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Student verification successful:', result.message);
      return true;
    } else {
      console.error('Student verification failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error verifying student:', error);
    return false;
  }
}

/**
 * Fetch all students with default status handling
 */
export async function fetchAllStudents(): Promise<Student[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/students`);
    const result = await response.json();
    
    if (result.success) {
      return result.students || [];
    } else {
      console.error('Failed to fetch students:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

/**
 * Check if a student exists by registration number
 */
export async function checkStudentExists(registrationNumber: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/check-student/${registrationNumber}`);
    const result = await response.json();
    
    if (result.success) {
      return result.exists || false;
    } else {
      console.error('Failed to check student existence:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error checking student existence:', error);
    return false;
  }
} 