// Test script to verify CSV URL works with your Google Sheet
// Run this in your browser console or as a Node.js script

const CSV_URL = "https://docs.google.com/spreadsheets/d/1qaw22tBerPvG6A_WGpuH41vP9RfHsFodYQ2sz8F35Lk/gviz/tq?tqx=out:csv&sheet=Student%20Data";

async function testCSVURL() {
  try {
    console.log("Testing CSV URL...");
    console.log("URL:", CSV_URL);
    
    const response = await fetch(CSV_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log("✅ CSV fetched successfully!");
    console.log("First 500 characters:", csvText.substring(0, 500));
    
    // Try to parse as CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    console.log("📋 Headers found:", headers);
    
    if (lines.length > 1) {
      const firstRow = lines[1].split(',');
      console.log("📝 First data row:", firstRow);
      console.log(`📊 Total rows: ${lines.length - 1}`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ CSV URL test failed:", error);
    return false;
  }
}

// Instructions for use:
console.log(`
=== CSV URL TEST ===
This script tests if your Google Sheet can be accessed as CSV.

To run the test, call: testCSVURL()

If the test fails, check:
1. The sheet name is correct (should be "Student Data")
2. The sheet is published to the web
3. The URL is accessible
`);

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCSVURL };
} 