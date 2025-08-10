export interface StudentSubmissionData {
  registrationNumber: string;
  name: string;
  isPlaced: string;
  company: string;
  course: string;
  phone: string;
  email: string;
  placementDate?: string;
  package?: string;
  feedback?: string;
  submissionDate: string;
}

// Interface for the backend response
export interface BackendResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    rowNumber: number;
    timestamp: string;
    studentName: string;
    registrationNumber: string;
  };
}

export interface StudentSubmissionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Submit student placement data to the backend API
 */
export async function submitStudentData(
  data: StudentSubmissionData
): Promise<StudentSubmissionResponse> {
  try {
    // Convert the form data to array format for Google Sheets
    const rowData = [
      data.registrationNumber,
      data.name,
      data.isPlaced === 'yes' ? data.company : '',
      data.course,
      data.phone,
      data.email,
      data.placementDate || '',
      data.package || '',
      data.feedback || '',
      new Date().toISOString(), // Submission timestamp
      'false', // Is Verified (will be updated by recruiters)
      'Pending' // Status
    ];

    // Send the data in the format expected by Google Apps Script
    const payload = {
      action: "addStudentSubmission",
      studentData: rowData
    };

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/student-submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return result;
  } catch (error) {
    console.error("Error submitting student data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Validate student form data
 */
export function validateStudentData(data: Partial<StudentSubmissionData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Debug: Log the data being validated
  console.log("🔍 Validating form data:", data);

  // Required fields validation
  if (!data.registrationNumber || !data.registrationNumber.trim()) {
    errors.push("Registration number is required");
  }

  if (!data.name || !data.name.trim()) {
    errors.push("Full name is required");
  }

  if (!data.course || !data.course.trim()) {
    errors.push("Course is required");
  }

  if (!data.phone || !data.phone.trim()) {
    errors.push("Phone number is required");
  }

  if (!data.email || !data.email.trim()) {
    errors.push("Email address is required");
  } else if (!isValidEmail(data.email)) {
    errors.push("Please enter a valid email address");
  }

  // Placement-specific validation
  if (data.isPlaced === "yes" && (!data.company || !data.company.trim())) {
    errors.push("Company name is required when student is placed");
  }

  console.log("🔍 Validation errors:", errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format as Indian phone number if it's 10 digits
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  }
  
  return phone;
}

/**
 * Generate a unique submission ID
 */
export function generateSubmissionId(): string {
  return `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 