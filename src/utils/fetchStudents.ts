import Papa from "papaparse";

export interface Student {
  name: string;
  regNo: string;
  email: string;
  department: string;
  company: string;
  phone: string;
}

export interface RecruiterVerification {
  studentName: string;
  registrationNumber: string;
  email: string;
  department: string;
  company: string;
  phone: string;
  recruiterName: string;
  recruiterEmail: string;
  verificationDate: string;
  status: string;
  stillWithUs: boolean;
  rating?: number;
  comments?: string;
  isVerified: boolean;
}

export interface StudentFeedback {
  status?: string;
  stillWithUs?: boolean;
  comment?: string;
  rating?: number;
  isVerified?: boolean;
  verificationDate?: string;
  recruiterName?: string;
  recruiterEmail?: string;
}

// Cache for students data to avoid repeated API calls
let studentsCache: Student[] | null = null;
let cacheTimestamp: number = 0;
let verificationsCache: RecruiterVerification[] | null = null;
let verificationsCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Google Apps Script Web App URL - Replace with your deployed web app URL
const APPS_SCRIPT_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxMKdm72BFmlEdS77dAJMF-hdqq6QUbhaRjgn1SLrX4HNY3u6YxukJIwFeOzKeYsmuY/exec";

// Fallback CSV URL for reading student data
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1qaw22tBerPvG6A_WGpuH41vP9RfHsFodYQ2sz8F35Lk/gviz/tq?tqx=out:csv&sheet=Student%20Submission";

/**
 * Make a request to the Google Apps Script web app
 */
async function makeAppsScriptRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  data?: Record<string, unknown>
) {
  try {
    const url = `${APPS_SCRIPT_WEB_APP_URL}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data && method === "POST") {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Apps Script request failed");
    }

    return result.data;
  } catch (error) {
    console.error("Apps Script request failed:", error);
    throw error;
  }
}

/**
 * Fetch placement data from Google Apps Script (with CSV fallback)
 */
export async function fetchPlacementDataFromCSV(): Promise<Student[]> {
  // Return cached data if still valid
  const now = Date.now();
  if (studentsCache && now - cacheTimestamp < CACHE_DURATION) {
    return studentsCache;
  }

  try {
    // Try Apps Script first
    const result = await makeAppsScriptRequest("?action=getStudents");
    if (result && result.students && result.students.length > 0) {
      studentsCache = result.students;
      cacheTimestamp = now;
      console.log(
        `Fetched ${result.students.length} students from Apps Script`
      );
      return result.students;
    }
  } catch (error) {
    console.warn("Apps Script failed, falling back to CSV:", error);
  }

  // Fallback to CSV
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(CSV_URL, {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const text = await res.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep everything as strings for consistency
      transformHeader: (header) => header.trim(), // Clean headers
    });

    if (parsed.errors.length > 0) {
      console.warn("CSV parsing warnings:", parsed.errors);
    }

    const students = (parsed.data as Record<string, string>[])
      .map((obj) => ({
        regNo: (obj["Registration_Number"] || "").trim(),
        name: (obj["Name"] || "").trim(),
        company: (obj["Company"] || "").trim(),
        department: (obj["Course"] || "").trim(),
        phone: (obj["Phone"] || "").trim(),
        email: (obj["Email_Id"] || "").trim(),
      }))
      .filter((s) => s.regNo !== "" && s.name !== "");

    // Update cache
    studentsCache = students;
    cacheTimestamp = now;

    console.log(`Fetched ${students.length} students from CSV fallback`);
    return students;
  } catch (error) {
    console.error("Error fetching placement data:", error);

    // Return cached data if available, even if expired
    if (studentsCache) {
      console.warn("Using cached data due to fetch error");
      return studentsCache;
    }

    throw error;
  }
}

export async function fetchStudentsFromCSV(): Promise<Student[]> {
  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1qaw22tBerPvG6A_WGpuH41vP9RfHsFodYQ2sz8F35Lk/gviz/tq?tqx=out:csv&sheet=Student%20Submissions"
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const rawText = await response.text();

    // 💡 Sanitize malformed quotes manually (optional)
    const sanitizedText = rawText
      .split("\n")
      .filter((line) => line.split(",").length >= 6) // remove broken lines
      .join("\n")
      .replace(/“|”/g, '"') // replace fancy quotes
      .replace(/\uFFFD/g, ""); // remove replacement characters if any

    // 🧠 Parse using PapaParse
    const parsed = Papa.parse(sanitizedText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header) => header.trim().replace(/\s+/g, "_"), // normalize headers
    });

    if (parsed.errors.length > 0) {
      console.warn("CSV parsing errors:", parsed.errors);
    }

    const students = (parsed.data as Record<string, string>[])
      .map((obj) => ({
        regNo: (obj["Registration_Number"] || "").trim(),
        name: (obj["Name"] || "").trim(),
        company: (obj["Company"] || "").trim(),
        department: (obj["Course"] || "").trim(),
        phone: (obj["Phone"] || "").trim(),
        email: (obj["Email"] || obj["Email_Id"] || "").trim(),
      }))
      .filter((s) => s.regNo !== "" && s.name !== "");

    return students;
  } catch (error) {
    console.error("Error fetching students from CSV:", error);
    return [];
  }
}


export async function fetchCompanyNames(): Promise<string[]> {
  try {
    const data = await fetchStudentsFromCSV();
    const companies = new Set<string>();

    data.forEach((item) => {
      const company = item.company.trim();
      if (company.length > 0) {
        companies.add(company);
      }
    });

    return Array.from(companies).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Error fetching company names:", error);
    return [];
  }
}

export async function fetchStudentsByCompany(
  company: string
): Promise<Student[]> {
  try {
    const data = await fetchPlacementDataFromCSV();
    return data.filter(
      (s) => s.company.toLowerCase() === company.toLowerCase()
    );
  } catch (error) {
    console.error("Error fetching students by company:", error);
    return [];
  }
}

/**
 * Add recruiter verification data via Apps Script
 */
export async function addRecruiterVerification(
  verificationData: RecruiterVerification
): Promise<boolean> {
  try {
    const result = await makeAppsScriptRequest("", "POST", {
      action: "addVerification",
      verification: verificationData,
    });

    // Clear cache to force refresh
    verificationsCache = null;
    verificationsCacheTimestamp = 0;

    console.log("Successfully added verification via Apps Script:", result);
    return true;
  } catch (error) {
    console.error("Error adding recruiter verification:", error);
    throw error;
  }
}

/**
 * Update existing verification via Apps Script
 */
export async function updateRecruiterVerification(
  registrationNumber: string,
  verificationData: Partial<RecruiterVerification>
): Promise<boolean> {
  try {
    const result = await makeAppsScriptRequest("", "POST", {
      action: "updateVerification",
      registrationNumber,
      verification: verificationData,
    });

    // Clear cache
    verificationsCache = null;
    verificationsCacheTimestamp = 0;

    console.log("Successfully updated verification via Apps Script:", result);
    return true;
  } catch (error) {
    console.error("Error updating recruiter verification:", error);
    throw error;
  }
}

/**
 * Get all recruiter verifications via Apps Script
 */
export async function getRecruiterVerifications(): Promise<
  RecruiterVerification[]
> {
  const now = Date.now();
  if (
    verificationsCache &&
    now - verificationsCacheTimestamp < CACHE_DURATION
  ) {
    return verificationsCache;
  }

  try {
    const result = await makeAppsScriptRequest("?action=getVerifications");

    if (result && result.verifications) {
      verificationsCache = result.verifications;
      verificationsCacheTimestamp = now;
      return result.verifications;
    }

    return [];
  } catch (error) {
    console.error("Error fetching recruiter verifications:", error);

    // Return cached data if available
    if (verificationsCache) {
      console.warn("Using cached verifications due to fetch error");
      return verificationsCache;
    }

    throw error;
  }
}

/**
 * Check if a student has already been verified
 */
export async function getStudentVerification(
  registrationNumber: string
): Promise<RecruiterVerification | null> {
  try {
    const verifications = await getRecruiterVerifications();
    return (
      verifications.find(
        (v) =>
          v.registrationNumber.toLowerCase() ===
          registrationNumber.toLowerCase()
      ) || null
    );
  } catch (error) {
    console.error("Error checking student verification status:", error);
    return null;
  }
}

/**
 * Check if multiple students have been verified
 */
export async function getMultipleStudentVerifications(
  registrationNumbers: string[]
): Promise<Map<string, RecruiterVerification>> {
  try {
    const verifications = await getRecruiterVerifications();
    const verificationMap = new Map<string, RecruiterVerification>();

    verifications.forEach((verification) => {
      const regNo = verification.registrationNumber.toLowerCase();
      if (registrationNumbers.some((r) => r.toLowerCase() === regNo)) {
        verificationMap.set(regNo, verification);
      }
    });

    return verificationMap;
  } catch (error) {
    console.error("Error fetching multiple student verifications:", error);
    return new Map();
  }
}

/**
 * Get verification statistics for a company
 */
export async function getCompanyVerificationStats(company: string): Promise<{
  total: number;
  verified: number;
  joined: number;
  notJoined: number;
  leftCompany: number;
  blacklisted: number;
  stillWithUs: number;
}> {
  try {
    const [students, verifications] = await Promise.all([
      fetchStudentsByCompany(company),
      getRecruiterVerifications(),
    ]);

    const companyVerifications = verifications.filter(
      (v) => v.company.toLowerCase() === company.toLowerCase()
    );

    const stats = {
      total: students.length,
      verified: companyVerifications.length,
      joined: companyVerifications.filter((v) => v.status === "Joined").length,
      notJoined: companyVerifications.filter((v) => v.status === "Not Joined")
        .length,
      leftCompany: companyVerifications.filter(
        (v) => v.status === "Left Company"
      ).length,
      blacklisted: companyVerifications.filter(
        (v) => v.status === "Blacklisted"
      ).length,
      stillWithUs: companyVerifications.filter((v) => v.stillWithUs).length,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching company verification stats:", error);
    return {
      total: 0,
      verified: 0,
      joined: 0,
      notJoined: 0,
      leftCompany: 0,
      blacklisted: 0,
      stillWithUs: 0,
    };
  }
}

/**
 * Submit recruiter feedback (convenience function)
 */
export async function submitRecruiterFeedback(
  student: Student,
  feedback: StudentFeedback,
  recruiter: { name: string; email: string }
): Promise<boolean> {
  const verificationData: RecruiterVerification = {
    studentName: student.name,
    registrationNumber: student.regNo,
    email: student.email,
    department: student.department,
    company: student.company,
    phone: student.phone,
    recruiterName: recruiter.name,
    recruiterEmail: recruiter.email,
    verificationDate: new Date().toISOString(),
    status: feedback.status || "",
    stillWithUs: feedback.stillWithUs || false,
    rating: feedback.rating,
    comments: feedback.comment,
    isVerified: true,
  };

  // Check if verification already exists
  const existingVerification = await getStudentVerification(student.regNo);

  if (existingVerification) {
    // Update existing verification
    return await updateRecruiterVerification(student.regNo, verificationData);
  } else {
    // Add new verification
    return await addRecruiterVerification(verificationData);
  }
}

/**
 * Insert one or more rows into the Google Sheet via Apps Script
 * @param rows - array of arrays (each row matches the Sheet’s column order)
 */
export async function insertRowsViaScript(
  rows: (string | number | boolean)[][]
): Promise<boolean> {
  try {
    // Use your backend proxy endpoint instead of the Apps Script URL
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/insert-rows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "write",
        values: rows,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Insert failed");
    }

    console.log("✅ Rows inserted successfully:", result);
    return true;
  } catch (error) {
    console.error("❌ Error inserting rows via backend proxy:", error);
    return false;
  }
}

/**
 * Fetch verified students from the provided Google Sheet as CSV
 * Only returns rows where Is Verified is TRUE and company is not empty
 */
export async function fetchVerifiedStudentsFromSheet(): Promise<
  (Student & { verificationDate?: string })[]
> {
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/1Fkjm__5-2N3IkXQ1Op82a_3HGeuxcPsxG_aq4pt2hd0/gviz/tq?tqx=out:csv&sheet=Sheet1";
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const text = await response.text();
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
    });
    if (parsed.errors.length > 0) {
      console.warn("CSV parsing warnings (verified students):", parsed.errors);
    }
    const students = (parsed.data as Record<string, string>[])
      .filter(
        (obj) =>
          (obj["Is Verified"] || obj["Is Verified "] || "")
            .toString()
            .toLowerCase() === "true" &&
          (obj["Company"] || obj["Company "] || "").trim() !== ""
      )
      .map((obj) => ({
        name: (obj["Student Name"] || obj["Name"] || "").trim(),
        regNo: (obj["Registration Number"] || obj["Reg No"] || "").trim(),
        email: (
          obj["Email"] ||
          obj["Email Id"] ||
          obj["Email_Id"] ||
          ""
        ).trim(),
        department: (obj["Department"] || obj["Course"] || "").trim(),
        company: (obj["Company"] || obj["Company "] || "").trim(),
        phone: (obj["Phone"] || obj["Phone Number"] || "").trim(),
        verificationDate: (
          obj["Verification Date"] ||
          obj["Verification date"] ||
          obj["Verified On"] ||
          ""
        ).trim(),
      }))
      .filter((s) => s.regNo !== "" && s.name !== "" && s.company !== "");
    return students;
  } catch (error) {
    console.error("Error fetching verified students from sheet:", error);
    return [];
  }
}

// Utility functions
export function clearStudentsCache(): void {
  studentsCache = null;
  cacheTimestamp = 0;
}

export function clearVerificationsCache(): void {
  verificationsCache = null;
  verificationsCacheTimestamp = 0;
}

export function clearAllCaches(): void {
  clearStudentsCache();
  clearVerificationsCache();
}

// we want to fetch data from this sheet https://docs.google.com/spreadsheets/d/1Fkjm__5-2N3IkXQ1Op82a_3HGeuxcPsxG_aq4pt2hd0/edit?usp=sharing then com
