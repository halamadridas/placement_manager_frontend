# Google Apps Script Setup Guide

## Overview

This guide will help you set up Google Apps Script to enable read/write access to your Google Sheets without requiring API keys or OAuth2 complexity.

## Step 1: Create Google Apps Script Project

1. **Go to Google Apps Script**

   - Visit [script.google.com](https://script.google.com)
   - Sign in with your Google account

2. **Create New Project**

   - Click **"New Project"**
   - Name it "Student Verification API"

3. **Replace Default Code**

   - Delete the default `Code.gs` content
   - Copy and paste the code from `google-apps-script-code.gs` file

4. **Update Configuration**
   - Replace `SPREADSHEET_ID` with your actual Google Sheet ID
   - Replace `SHEET_NAME` with your sheet name (usually "Sheet1")

## Step 2: Deploy as Web App

1. **Save the Project**

   - Click **"Save"** (Ctrl+S or Cmd+S)
   - Give it a name like "Student Verification API"

2. **Deploy**

   - Click **"Deploy"** → **"New deployment"**
   - Choose type: **"Web app"**
   - Description: "Student Verification API v1"
   - Execute as: **"Me"** (your Google account)
   - Who has access: **"Anyone"** (for public access)
   - Click **"Deploy"**

3. **Authorize Access**

   - Click **"Authorize access"**
   - Choose your Google account
   - Click **"Advanced"** → **"Go to Student Verification API (unsafe)"**
   - Click **"Allow"**

4. **Copy Web App URL**
   - After deployment, copy the web app URL
   - It looks like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

## Step 3: Update Your TypeScript Code

1. **Update the Web App URL**
   - Open `src/utils/fetchStudents.ts`
   - Replace `YOUR_SCRIPT_ID` in the `APPS_SCRIPT_WEB_APP_URL` with your actual script ID

```typescript
const APPS_SCRIPT_WEB_APP_URL =
  "https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec";
```

2. **Test the Connection**
   - Open your browser
   - Visit: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getStudents`
   - You should see JSON response with your data

## Step 4: Update Your React Component

Your existing `StudentVerificationTable` component should work as-is, but you can also use the new convenience function:

```typescript
import { submitRecruiterFeedback } from "@/utils/fetchStudents";

// In your component
const handleVerificationSubmit = async (
  studentIndex: number,
  verificationData: {
    recruiterName: string;
    recruiterEmail: string;
    feedback: StudentFeedback;
  }
) => {
  const student = students[studentIndex];

  try {
    await submitRecruiterFeedback(student, verificationData.feedback, {
      name: verificationData.recruiterName,
      email: verificationData.recruiterEmail,
    });

    // Update local state
    onFeedbackChange(studentIndex, {
      ...verificationData.feedback,
      isVerified: true,
      verificationDate: new Date().toISOString(),
      recruiterName: verificationData.recruiterName,
      recruiterEmail: verificationData.recruiterEmail,
    });

    alert("Verification submitted successfully!");
  } catch (error) {
    console.error("Failed to submit verification:", error);
    alert("Failed to submit verification. Please try again.");
  }
};
```

## Step 5: Test the Integration

1. **Test Reading Data**

   - Your app should load student data from the Apps Script
   - Check browser console for "Fetched X students from Apps Script"

2. **Test Writing Data**
   - Fill out a verification form
   - Click "Verify"
   - Check your Google Sheet - new data should appear
   - Check browser console for success messages

## Troubleshooting

### Common Issues

1. **"Script not found" Error**

   - Make sure you copied the correct script ID
   - Check that the deployment was successful

2. **"Access denied" Error**

   - Make sure you set "Who has access" to "Anyone"
   - Check that you authorized the script

3. **"Sheet not found" Error**

   - Verify your `SPREADSHEET_ID` is correct
   - Make sure the sheet name matches exactly

4. **CORS Errors**
   - Apps Script handles CORS automatically
   - If you see CORS errors, check your web app URL

### Debug Mode

Add this to your Apps Script to see detailed logs:

```javascript
// Add this at the top of your Apps Script
function log(message) {
  console.log(new Date().toISOString() + ": " + message);
}
```

Then check the Apps Script logs:

1. Go to your Apps Script project
2. Click **"Executions"** in the left sidebar
3. Click on any execution to see logs

## Security Considerations

1. **Web App Access**

   - "Anyone" means anyone with the URL can access your script
   - For production, consider "Anyone with Google account"

2. **Sheet Permissions**

   - The script runs with your account permissions
   - Make sure your Google account has access to the sheet

3. **Rate Limiting**
   - Google Apps Script has daily quotas
   - Monitor usage in the Apps Script dashboard

## Benefits of This Approach

✅ **No API keys needed**  
✅ **No OAuth2 complexity**  
✅ **Direct read/write access**  
✅ **Automatic error handling**  
✅ **Works from any domain**  
✅ **Built-in Google authentication**  
✅ **Easy to debug and maintain**

## Next Steps

1. **Test thoroughly** with your actual data
2. **Monitor usage** in Apps Script dashboard
3. **Add error handling** for production use
4. **Consider rate limiting** for high traffic

---

Your student verification system is now ready to read and write data directly to Google Sheets!
