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
 * Submit student placement data with enhanced debugging
 */
export async function submitStudentData(
  data: StudentSubmissionData
): Promise<StudentSubmissionResponse> {
  try {
    console.log("🔍 Debug Info:");
    console.log("- API URL:", import.meta.env.VITE_APP_API_URL);
    console.log("- Original Data:", JSON.stringify(data, null, 2));

    // Send the data as individual fields (as expected by backend)
    const payload = {
      registrationNumber: data.registrationNumber,
      name: data.name,
      company: data.isPlaced === 'yes' ? data.company : '',
      course: data.course,
      phone: data.phone,
      email: data.email,
      placementDate: data.placementDate || '',
      package: data.package || '',
      feedback: data.feedback || '',
      submissionDate: new Date().toISOString()
    };

    console.log("- Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/student-submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("🔍 Response Info:");
    console.log("- Status:", response.status);
    console.log("- Status Text:", response.statusText);
    console.log("- Headers:", Object.fromEntries(response.headers.entries()));

    // Get response text first to debug
    const responseText = await response.text();
    console.log("🔍 Raw Response:", responseText);

    // Check if response is HTML (error page)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error("❌ Received HTML instead of JSON. This usually means:");
      console.error("1. Wrong URL or deployment issue");
      console.error("2. Authentication problem");
      console.error("3. Script execution error");
      
      return {
        success: false,
        error: "Server returned HTML instead of JSON. Please check:\n1. Google Apps Script URL is correct\n2. Script is deployed as web app\n3. Permissions are set to 'Anyone'\n4. Script has no runtime errors"
      };
    }

    // Try to parse JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      return {
        success: false,
        error: `Invalid JSON response: ${responseText.substring(0, 200)}...`
      };
    }

    console.log("✅ Parsed Result:", result);

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return result;
  } catch (error) {
    console.error("❌ Network/Fetch Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
/**
 * Test connection to Google Apps Script
 */
export async function testConnection(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}> {
  try {
    console.log("🧪 Testing connection to:", import.meta.env.VITE_APP_API_URL);

    const response = await fetch(import.meta.env.VITE_APP_API_URL, {
      method: "GET",
    });

    const responseText = await response.text();
    console.log("🧪 Test Response:", responseText);

    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      return {
        success: false,
        error: "Received HTML page - check your Google Apps Script deployment",
        details: {
          status: response.status,
          statusText: response.statusText,
          url: import.meta.env.VITE_APP_API_URL
        }
      };
    }

    try {
      const result = JSON.parse(responseText);
      return {
        success: true,
        message: "Connection successful",
        details: result
      };
    } catch {
      return {
        success: false,
        error: "Invalid JSON response",
        details: { rawResponse: responseText }
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
/**
 * Check if a student already exists in the system
 */
export async function checkStudentExists(
  registrationNumber: string
): Promise<{ success: boolean; exists: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}?action=checkStudentExists&registrationNumber=${encodeURIComponent(registrationNumber)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        exists: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return result;
  } catch (error) {
    console.error("Error checking student existence:", error);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all existing students
 */
export async function getExistingStudents(): Promise<{
  success: boolean;
  students?: any[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}?action=getStudents`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return result;
  } catch (error) {
    console.error("Error fetching existing students:", error);
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