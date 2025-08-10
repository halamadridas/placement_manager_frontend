// Google Apps Script for Student Placement Form
// Deploy this as a web app to handle form submissions

// Your Google Sheet ID
const SPREADSHEET_ID = '1qaw22tBerPvG6A_WGpuH41vP9RfHsFodYQ2sz8F35Lk';
const SHEET_NAME = 'Student Submissions';

function doPost(e) {
  try {
    // Parse the incoming request
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    if (action === 'addStudentSubmission') {
      return handleStudentSubmission(requestData.studentData);
    } else if (action === 'write') {
      return handleRecruiterFeedback(requestData.values);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action specified'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getStudents') {
      return getStudentsData();
    } else if (action === 'getVerifications') {
      return getVerificationsData();
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action specified'
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

function handleStudentSubmission(studentData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(SHEET_NAME);
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
        'Is Verified'
      ];
      newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      newSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    // Insert the student data
    const targetSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    targetSheet.appendRow(studentData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Student data added successfully',
        data: {
          rowNumber: targetSheet.getLastRow(),
          timestamp: new Date().toISOString()
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

function handleRecruiterFeedback(values) {
  try {
    // This handles the existing recruiter feedback functionality
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Recruiter Verifications');
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet('Recruiter Verifications');
      const headers = [
        'Student Name',
        'Registration Number',
        'Email',
        'Department',
        'Company',
        'Phone',
        'Recruiter Name',
        'Recruiter Email',
        'Verification Date',
        'Status',
        'Still With Us',
        'Rating',
        'Comments',
        'Is Verified'
      ];
      newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      newSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    // Insert multiple rows
    const targetSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Recruiter Verifications');
    targetSheet.getRange(targetSheet.getLastRow() + 1, 1, values.length, values[0].length).setValues(values);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: `${values.length} rows added successfully`,
        data: {
          rowsAdded: values.length,
          timestamp: new Date().toISOString()
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error adding recruiter feedback:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getStudentsData() {
  try {
    // Try to get data from the main student data sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Student Data');
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Student Data sheet not found. Please check the sheet name.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const students = data.slice(1).map(row => {
      const student = {};
      headers.forEach((header, index) => {
        student[header.trim()] = row[index] || '';
      });
      
      // Map the columns based on your sheet structure
      return {
        regNo: student['Registration_Number'] || student['Registration Number'] || '',
        name: student['Name'] || '',
        company: student['Company'] || '',
        department: student['Course'] || student['Department'] || '',
        phone: student['Phone'] || student['Phone Number'] || '',
        email: student['Email_Id'] || student['Email'] || student['Email Id'] || ''
      };
    }).filter(s => s.regNo && s.name);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        students: students
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error fetching students data:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getVerificationsData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Recruiter Verifications');
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          verifications: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const verifications = data.slice(1).map(row => {
      const verification = {};
      headers.forEach((header, index) => {
        verification[header.trim()] = row[index] || '';
      });
      return verification;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        verifications: verifications
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error fetching verifications data:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script is working
function testConnection() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('Successfully connected to spreadsheet: ' + sheet.getName());
    return true;
  } catch (error) {
    Logger.log('Error connecting to spreadsheet: ' + error.toString());
    return false;
  }
}
