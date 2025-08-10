// Test script for Student Submission Script
// Run this in your browser console or as a Node.js script

// Your deployed Google Apps Script web app URL
const STUDENT_SUBMISSION_URL = "https://script.google.com/macros/s/AKfycbyf2sotopkgFeDzr1Ag33lnukBr3GoYVEMSgZWbCKrjfUGJ-OCH3ZfWAd_EOO_G2Eg3fQ/exec";

// Test 1: Test connection and get existing students
async function testGetExistingStudents() {
  try {
    console.log("Testing get existing students...");
    const response = await fetch(`${STUDENT_SUBMISSION_URL}?action=getStudents`);
    const result = await response.json();
    console.log("Get existing students result:", result);
    return result.success;
  } catch (error) {
    console.error("Get existing students failed:", error);
    return false;
  }
}

// Test 2: Test student submission
async function testStudentSubmission() {
  try {
    console.log("Testing student submission...");
    const testData = {
      action: "addStudentSubmission",
      studentData: [
        "TEST123",
        "Test Student",
        "Test Company",
        "Computer Science [2023-2025]",
        "1234567890",
        "test@example.com",
        "2024-01-15",
        "4.5 LPA",
        "Great placement process!",
        new Date().toISOString(),
        "false",
        "Pending"
      ]
    };

    const response = await fetch(STUDENT_SUBMISSION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log("Student submission result:", result);
    return result.success;
  } catch (error) {
    console.error("Student submission failed:", error);
    return false;
  }
}

// Test 3: Test checking if student exists
async function testCheckStudentExists() {
  try {
    console.log("Testing check student exists...");
    const response = await fetch(`${STUDENT_SUBMISSION_URL}?action=checkStudentExists&registrationNumber=TEST123`);
    const result = await response.json();
    console.log("Check student exists result:", result);
    return result.success;
  } catch (error) {
    console.error("Check student exists failed:", error);
    return false;
  }
}

// Test 4: Test get student submissions
async function testGetStudentSubmissions() {
  try {
    console.log("Testing get student submissions...");
    const response = await fetch(`${STUDENT_SUBMISSION_URL}?action=getSubmissions`);
    const result = await response.json();
    console.log("Get student submissions result:", result);
    return result.success;
  } catch (error) {
    console.error("Get student submissions failed:", error);
    return false;
  }
}

// Test 5: Test update existing student
async function testUpdateExistingStudent() {
  try {
    console.log("Testing update existing student...");
    const testData = {
      action: "updateExistingStudent",
      studentData: [
        "TEST123",
        "Updated Test Student",
        "Updated Test Company",
        "Computer Science [2023-2025]",
        "1234567890",
        "updated@example.com",
        "2024-01-15",
        "5.0 LPA",
        "Updated feedback!",
        new Date().toISOString(),
        "false",
        "Updated"
      ]
    };

    const response = await fetch(STUDENT_SUBMISSION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log("Update existing student result:", result);
    return result.success;
  } catch (error) {
    console.error("Update existing student failed:", error);
    return false;
  }
}

// Run all tests
async function runAllStudentSubmissionTests() {
  console.log("=== Testing Student Submission Script ===");
  
  const getStudentsTest = await testGetExistingStudents();
  console.log("Get existing students:", getStudentsTest ? "✅ PASSED" : "❌ FAILED");
  
  const submissionTest = await testStudentSubmission();
  console.log("Student submission:", submissionTest ? "✅ PASSED" : "❌ FAILED");
  
  const checkExistsTest = await testCheckStudentExists();
  console.log("Check student exists:", checkExistsTest ? "✅ PASSED" : "❌ FAILED");
  
  const getSubmissionsTest = await testGetStudentSubmissions();
  console.log("Get student submissions:", getSubmissionsTest ? "✅ PASSED" : "❌ FAILED");
  
  const updateStudentTest = await testUpdateExistingStudent();
  console.log("Update existing student:", updateStudentTest ? "✅ PASSED" : "❌ FAILED");
  
  if (getStudentsTest && submissionTest && checkExistsTest && getSubmissionsTest && updateStudentTest) {
    console.log("🎉 All student submission tests passed! Your script is working correctly.");
  } else {
    console.log("⚠️ Some tests failed. Check the errors above and verify your setup.");
  }
}

// Instructions for use:
console.log(`
=== STUDENT SUBMISSION SCRIPT TEST ===
This script tests the student submission functionality.

To run the tests, call: runAllStudentSubmissionTests()

Available test functions:
- testGetExistingStudents()
- testStudentSubmission()
- testCheckStudentExists()
- testGetStudentSubmissions()
- testUpdateExistingStudent()

Make sure to:
1. Replace 'YOUR_STUDENT_SUBMISSION_WEB_APP_URL_HERE' with your actual web app URL
2. Deploy the STUDENT_SUBMISSION_SCRIPT.js as a web app first
3. Set the correct permissions (Anyone can access)
`);

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testGetExistingStudents,
    testStudentSubmission,
    testCheckStudentExists,
    testGetStudentSubmissions,
    testUpdateExistingStudent,
    runAllStudentSubmissionTests
  };
} 