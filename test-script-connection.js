// Test script to verify Google Apps Script connection
// Run this in your browser console or as a Node.js script

// Replace with your actual Google Apps Script web app URL
const APPS_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

// Test 1: Check if the script is accessible
async function testScriptAccess() {
  try {
    console.log("Testing script access...");
    const response = await fetch(APPS_SCRIPT_URL);
    const text = await response.text();
    console.log("Script response:", text);
    return response.ok;
  } catch (error) {
    console.error("Script access failed:", error);
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
        "false"
      ]
    };

    const response = await fetch(APPS_SCRIPT_URL, {
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

// Test 3: Test getting students data
async function testGetStudents() {
  try {
    console.log("Testing get students...");
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getStudents`);
    const result = await response.json();
    console.log("Get students result:", result);
    return result.success;
  } catch (error) {
    console.error("Get students failed:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("=== Testing Google Apps Script Connection ===");
  
  const accessTest = await testScriptAccess();
  console.log("Script access:", accessTest ? "✅ PASSED" : "❌ FAILED");
  
  const submissionTest = await testStudentSubmission();
  console.log("Student submission:", submissionTest ? "✅ PASSED" : "❌ FAILED");
  
  const getStudentsTest = await testGetStudents();
  console.log("Get students:", getStudentsTest ? "✅ PASSED" : "❌ FAILED");
  
  if (accessTest && submissionTest && getStudentsTest) {
    console.log("🎉 All tests passed! Your Google Apps Script is working correctly.");
  } else {
    console.log("⚠️ Some tests failed. Check the errors above and verify your setup.");
  }
}

// Instructions for use:
console.log(`
=== INSTRUCTIONS ===
1. Replace 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' with your actual web app URL
2. Run this script in your browser console or as a Node.js script
3. Check the results to verify your setup is working

To run the tests, call: runAllTests()
`);

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testScriptAccess,
    testStudentSubmission,
    testGetStudents,
    runAllTests
  };
} 