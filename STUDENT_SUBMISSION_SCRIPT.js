// STUDENT SUBMISSION SCRIPT
// Google Apps Script for handling student placement form submissions
// Deploy this as a web app to handle student form data

// Your Google Sheet ID
const SPREADSHEET_ID = '1qaw22tBerPvG6A_WGpuH41vP9RfHsFodYQ2sz8F35Lk';

// Sheet names
const STUDENT_SUBMISSIONS_SHEET = 'Student Submissions';
const EXISTING_STUDENT_DATA_SHEET = 'Student Data'; // Your existing sheet

/**
 * Main POST handler for student submissions
 */
function doPost(e) {
  try {
    // Parse the incoming request
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    // Debug logging
    Logger.log('Received POST request with action: ' + action);
    Logger.log('Request data: ' + JSON.stringify(requestData));
    
    if (action === 'addStudentSubmission') {
      Logger.log('Processing addStudentSubmission action');
      return handleStudentSubmission(requestData.studentData);
    } else if (action === 'updateExistingStudent') {
      Logger.log('Processing updateExistingStudent action');
      return updateExistingStudent(requestData.studentData);
    } else if (action === 'verifyStudent') {
      Logger.log('Processing verifyStudent action');
      return verifyStudent(requestData.verificationData);
    } else {
      Logger.log('Unknown action: ' + action);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action specified. Use "addStudentSubmission", "updateExistingStudent", or "verifyStudent"',
          receivedAction: action,
          availableActions: ['addStudentSubmission', 'updateExistingStudent', 'verifyStudent']
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error processing student submission:', error);
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main GET handler for retrieving student data
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getStudents') {
      return getExistingStudents();
    } else if (action === 'getSubmissions') {
      return getStudentSubmissions();
    } else if (action === 'checkStudentExists') {
      const regNo = e.parameter.registrationNumber;
      return checkStudentExists(regNo);
    } else if (action === 'getCompanies') {
      return getCompanies();
    } else if (action === 'getStudentsByCompany') {
      const companyName = e.parameter.company;
      if (!companyName) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            error: 'Company parameter is required'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return getStudentsByCompany(companyName);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action specified. Use "getStudents", "getSubmissions", "checkStudentExists", "getCompanies", or "getStudentsByCompany"'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error processing GET request:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle new student submissions
 */
function handleStudentSubmission(studentData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(STUDENT_SUBMISSIONS_SHEET);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(STUDENT_SUBMISSIONS_SHEET);
      const headers = [
        'Registration Number',
        'Name', 
        'Company',
        'Course',
        'Phone',
        'Email',
        'Placement Date',
        'Package (CTC)',
        'Feedback',
        'Submission Date',
        'Is Verified',
        'Status'
      ];
      newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      newSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      
      // Add some styling
      newSheet.getRange(1, 1, 1, headers.length).setBackground('#4285f4').setFontColor('white');
    }
    
    // Insert the student data
    const targetSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(STUDENT_SUBMISSIONS_SHEET);
    targetSheet.appendRow(studentData);
    
    // Log the submission
    Logger.log(`New student submission: ${studentData[1]} (${studentData[0]})`);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Student data submitted successfully',
        data: {
          rowNumber: targetSheet.getLastRow(),
          timestamp: new Date().toISOString(),
          studentName: studentData[1],
          registrationNumber: studentData[0]
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error adding student submission:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update existing student data in the main sheet
 */
function updateExistingStudent(studentData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(EXISTING_STUDENT_DATA_SHEET);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Existing student data sheet not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find the student by registration number
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const regNoIndex = headers.findIndex(h => 
      h.trim().toLowerCase().includes('registration')
    );
    
    if (regNoIndex === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Registration number column not found in existing sheet'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find the row with matching registration number
    const targetRow = data.findIndex((row, index) => 
      index > 0 && row[regNoIndex] && row[regNoIndex].toString().trim() === studentData[0].trim()
    );
    
    if (targetRow === -1) {
      // Student not found, add as new row
      sheet.appendRow(studentData);
      Logger.log(`Added new student to existing sheet: ${studentData[1]} (${studentData[0]})`);
    } else {
      // Update existing row
      const rowNumber = targetRow + 1;
      sheet.getRange(rowNumber, 1, 1, studentData.length).setValues([studentData]);
      Logger.log(`Updated existing student: ${studentData[1]} (${studentData[0]}) at row ${rowNumber}`);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Student data updated successfully',
        data: {
          rowNumber: targetRow === -1 ? sheet.getLastRow() : targetRow + 1,
          timestamp: new Date().toISOString(),
          studentName: studentData[1],
          registrationNumber: studentData[0],
          action: targetRow === -1 ? 'added' : 'updated'
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error updating existing student:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get existing students from the main sheet
 */
function getExistingStudents() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(EXISTING_STUDENT_DATA_SHEET);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Existing student data sheet not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const students = data.slice(1).map(row => {
      const student = {};
      headers.forEach((header, index) => {
        const value = row[index];
        // Convert empty strings to null for not placed students
        student[header.trim()] = (value === '' || value === null || value === undefined) ? null : value.toString().trim();
      });
      
      // Map the columns based on your sheet structure
      return {
        regNo: student['Registration_Number'] || student['Registration Number'] || null,
        name: student['Name'] || null,
        company: student['Company'] || null,
        department: student['Course'] || student['Department'] || null,
        phone: student['Phone'] || student['Phone Number'] || null,
        email: student['Email_Id'] || student['Email'] || student['Email Id'] || null,
        status: student['Status'] || 'Pending' // Default to 'Pending' if not set
      };
    }).filter(s => s.regNo && s.name); // Only return students with registration number and name
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        students: students,
        totalCount: students.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error fetching existing students:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get student submissions from the submissions sheet
 */
function getStudentSubmissions() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(STUDENT_SUBMISSIONS_SHEET);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          submissions: [],
          totalCount: 0
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const submissions = data.slice(1).map(row => {
      const submission = {};
      headers.forEach((header, index) => {
        submission[header.trim()] = row[index] || '';
      });
      return submission;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        submissions: submissions,
        totalCount: submissions.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Check if a student already exists in the main sheet
 */
function checkStudentExists(registrationNumber) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(EXISTING_STUDENT_DATA_SHEET);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Existing student data sheet not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const regNoIndex = headers.findIndex(h => 
      h.trim().toLowerCase().includes('registration')
    );
    
    if (regNoIndex === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Registration number column not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if student exists
    const exists = data.slice(1).some(row => 
      row[regNoIndex] && row[regNoIndex].toString().trim() === registrationNumber.trim()
    );
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        exists: exists,
        registrationNumber: registrationNumber
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error checking student existence:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get all unique company names from the student data
 */
function getCompanies() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(EXISTING_STUDENT_DATA_SHEET);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Existing student data sheet not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const companyIndex = headers.findIndex(h => 
      h.trim().toLowerCase().includes('company')
    );
    
    if (companyIndex === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Company column not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get unique companies (excluding empty values)
    const companies = new Set();
    data.slice(1).forEach(row => {
      const company = row[companyIndex];
      if (company && company.toString().trim() !== '' && company.toString().trim().toLowerCase() !== 'null') {
        companies.add(company.toString().trim());
      }
    });
    
    const companyList = Array.from(companies).sort();
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        companies: companyList,
        totalCount: companyList.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error fetching companies:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get students by company name
 */
function getStudentsByCompany(companyName) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(EXISTING_STUDENT_DATA_SHEET);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Existing student data sheet not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const companyIndex = headers.findIndex(h => 
      h.trim().toLowerCase().includes('company')
    );
    
    if (companyIndex === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Company column not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Filter students by company
    const students = data.slice(1)
      .filter(row => {
        const company = row[companyIndex];
        return company && company.toString().trim().toLowerCase() === companyName.toLowerCase();
      })
      .map(row => {
        const student = {};
        headers.forEach((header, index) => {
          const value = row[index];
          // Convert empty strings to null for not placed students
          student[header.trim()] = (value === '' || value === null || value === undefined) ? null : value.toString().trim();
        });
        
        // Map to standard format
        return {
          regNo: student['Registration_Number'] || student['Registration Number'] || null,
          name: student['Name'] || null,
          company: student['Company'] || null,
          department: student['Course'] || student['Department'] || null,
          phone: student['Phone'] || student['Phone Number'] || null,
          email: student['Email_Id'] || student['Email'] || student['Email Id'] || null,
          status: student['Status'] || 'Pending' // Default to 'Pending' if not set
        };
      })
      .filter(s => s.regNo && s.name); // Only return students with registration number and name
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        students: students,
        company: companyName,
        totalCount: students.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error fetching students by company:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Verify student placement data
 */
function verifyStudent(verificationData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(EXISTING_STUDENT_DATA_SHEET);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Existing student data sheet not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const regNoIndex = headers.findIndex(h => 
      h.trim().toLowerCase().includes('registration')
    );
    
    if (regNoIndex === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Registration number column not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find the student by registration number
    const targetRow = data.findIndex((row, index) => 
      index > 0 && row[regNoIndex] && row[regNoIndex].toString().trim() === verificationData.registrationNumber.trim()
    );
    
    if (targetRow === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Student not found with the provided registration number'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const rowNumber = targetRow + 1;
    const row = data[targetRow];
    
    // Update the student data with verification info
    const updatedRow = [...row];
    
    // Find column indices for verification fields
    const statusIndex = headers.findIndex(h => h.trim().toLowerCase().includes('status'));
    const verifiedIndex = headers.findIndex(h => h.trim().toLowerCase().includes('verified'));
    const verificationDateIndex = headers.findIndex(h => h.trim().toLowerCase().includes('verification'));
    const recruiterIndex = headers.findIndex(h => h.trim().toLowerCase().includes('recruiter'));
    const ratingIndex = headers.findIndex(h => h.trim().toLowerCase().includes('rating'));
    const feedbackIndex = headers.findIndex(h => h.trim().toLowerCase().includes('feedback'));
    
    // Update fields if they exist
    if (statusIndex !== -1) {
      updatedRow[statusIndex] = verificationData.status || 'Pending';
    }
    if (verifiedIndex !== -1) {
      updatedRow[verifiedIndex] = 'Yes';
    }
    if (verificationDateIndex !== -1) {
      updatedRow[verificationDateIndex] = new Date().toISOString();
    }
    if (recruiterIndex !== -1) {
      updatedRow[recruiterIndex] = verificationData.recruiterName || '';
    }
    if (ratingIndex !== -1) {
      updatedRow[ratingIndex] = verificationData.rating || '';
    }
    if (feedbackIndex !== -1) {
      updatedRow[feedbackIndex] = verificationData.feedback || '';
    }
    
    // Update the row in the sheet
    sheet.getRange(rowNumber, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    Logger.log(`Verified student: ${verificationData.registrationNumber} by ${verificationData.recruiterName}`);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Student verification completed successfully',
        data: {
          registrationNumber: verificationData.registrationNumber,
          status: verificationData.status || 'Pending',
          verifiedBy: verificationData.recruiterName,
          verificationDate: new Date().toISOString(),
          rowNumber: rowNumber
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error verifying student:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script is working
 */
function testConnection() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('Successfully connected to spreadsheet: ' + sheet.getName());
    
    // Test getting sheet names
    const sheets = sheet.getSheets();
    const sheetNames = sheets.map(s => s.getName());
    Logger.log('Available sheets: ' + sheetNames.join(', '));
    
    return {
      success: true,
      spreadsheetName: sheet.getName(),
      availableSheets: sheetNames
    };
  } catch (error) {
    Logger.log('Error connecting to spreadsheet: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Utility function to create sample data for testing
 */
function createSampleSubmission() {
  const sampleData = [
    'TEST123',
    'Test Student',
    'Test Company',
    'Computer Science [2023-2025]',
    '1234567890',
    'test@example.com',
    '2024-01-15',
    '4.5 LPA',
    'Great placement process!',
    new Date().toISOString(),
    'false',
    'Pending'
  ];
  
  return handleStudentSubmission(sampleData);
} 