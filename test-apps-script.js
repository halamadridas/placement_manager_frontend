// Test script to verify Apps Script web app is working
// Run this in your browser console or as a Node.js script

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx9iLG2I80M_DW6FNGfbQ1l4XZbytqTDPVGodRuBsdJk36ZtsoURezBEBJxWg0njKivRw/exec";

//   https://docs.google.com/spreadsheets/d/1y2VgyMeQsMNu2NL9COGE2jHSEOb-BMO1dtMkAT5pG6k/edit?usp=sharing
// Test 1: GET request to read data
async function testGetRequest() {
  try {
    console.log("Testing GET request...");
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getStudents`);
    const data = await response.json();
    console.log("GET Response:", data);
    return data.success;
  } catch (error) {
    console.error("GET request failed:", error);
    return false;
  }
}

// Test 2: POST request to add verification
async function testPostRequest() {
  try {
    console.log("Testing POST request...");
    const testData = {
      action: "addVerification",
      verification: {
        studentName: "Test Student",
        registrationNumber: "TEST123",
        email: "test@example.com",
        department: "Computer Science",
        company: "Test Company",
        phone: "1234567890",
        recruiterName: "Test Recruiter",
        recruiterEmail: "recruiter@test.com",
        verificationDate: new Date().toISOString(),
        status: "Joined",
        stillWithUs: true,
        rating: 5,
        comments: "Test verification",
        isVerified: true,
      },
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log("POST Response:", data);
    return data.success;
  } catch (error) {
    console.error("POST request failed:", error);
    return false;
  }
}

// Test 3: POST request to insert table header
async function testInsertHeader() {
  try {
    console.log("Testing POST request to insert table header...");
    const headerRow = [
      [
        "Student Name",
        "Registration Number",
        "Email",
        "Department",
        "Company",
        "Phone",
        "Recruiter Name",
        "Recruiter Email",
        "Verification Date",
        "Status",
        "Still With Us",
        "Rating",
        "Comments",
        "Is Verified",
      ],
    ];

    const testData = {
      action: "write",
      values: headerRow,
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log("Insert Header Response:", data);
    return data.success;
  } catch (error) {
    console.error("Insert header POST request failed:", error);
    return false;
  }
}

// Test 4: POST request to insert data rows
async function testInsertRows() {
  try {
    console.log("Testing POST request to insert data rows...");
    const dataRows = [
      [
        "Alice Smith",
        "REG001",
        "alice@example.com",
        "Computer Science",
        "Acme Corp",
        "1234567890",
        "Bob Recruiter",
        "bob@acme.com",
        new Date().toISOString(),
        "Joined",
        "true",
        "5",
        "Great candidate",
        "true",
      ],
      [
        "John Doe",
        "REG002",
        "john@example.com",
        "Electrical Engineering",
        "Beta Inc",
        "9876543210",
        "Carol Recruiter",
        "carol@beta.com",
        new Date().toISOString(),
        "Not Joined",
        "false",
        "3",
        "Needs improvement",
        "false",
      ],
    ];

    const testData = {
      action: "write",
      values: dataRows,
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log("Insert Rows Response:", data);
    return data.success;
  } catch (error) {
    console.error("Insert rows POST request failed:", error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log("=== Testing Apps Script Web App ===");

  const getTest = await testGetRequest();
  console.log("GET test:", getTest ? "✅ PASSED" : "❌ FAILED");

  const postTest = await testPostRequest();
  console.log("POST test:", postTest ? "✅ PASSED" : "❌ FAILED");

  const headerTest = await testInsertHeader();
  console.log("Insert Header test:", headerTest ? "✅ PASSED" : "❌ FAILED");

  const rowsTest = await testInsertRows();
  console.log("Insert Rows test:", rowsTest ? "✅ PASSED" : "❌ FAILED");

  if (getTest && postTest && headerTest && rowsTest) {
    console.log("🎉 All tests passed! Your Apps Script is working correctly.");
  } else {
    console.log("⚠️ Some tests failed. Check the errors above.");
  }
}

// Run the tests
runTests();
