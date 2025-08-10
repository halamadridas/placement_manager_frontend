# Google Apps Script Setup Guide

## Step 1: Create/Open Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet or open your existing one
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
   ```

## Step 2: Set Up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Delete the default code and paste the entire content from `test-apps-script.js`
4. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID
5. Save the project with a name like "Student Placement Form Handler"

## Step 3: Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following:
   - **Execute as**: "Me" (your Google account)
   - **Who has access**: "Anyone" (for testing) or "Anyone with Google account" (for production)
4. Click "Deploy"
5. Copy the **Web app URL** that's generated

## Step 4: Update Backend Configuration

1. Open `p-lacement_backend/index.js`
2. Replace the `GOOGLE_SCRIPT_URL` with your new web app URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = "YOUR_NEW_WEB_APP_URL_HERE";
   ```

## Step 5: Test the Setup

1. Start your backend server:
   ```bash
   cd p-lacement_backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd p-lacement_frontend
   npm run dev
   ```

3. Test the student form by filling it out and submitting

## Google Sheet Structure

The script will automatically create these sheets in your Google Spreadsheet:

### 1. Student Submissions Sheet
This sheet will be created automatically when the first student submits data.

| Column | Description |
|--------|-------------|
| Registration Number | Student's registration number |
| Name | Student's full name |
| Company | Company name (if placed) |
| Course | Student's course/department |
| Phone | Phone number |
| Email | Email address |
| Placement Date | Date of placement |
| Package (CTC) | Salary package |
| Feedback | Student's feedback |
| Submission Date | When the form was submitted |
| Is Verified | Whether recruiter has verified (false by default) |

### 2. Recruiter Verifications Sheet
This sheet will be created when recruiters submit feedback.

| Column | Description |
|--------|-------------|
| Student Name | Student's name |
| Registration Number | Student's registration number |
| Email | Student's email |
| Department | Student's department |
| Company | Company name |
| Phone | Student's phone |
| Recruiter Name | Recruiter's name |
| Recruiter Email | Recruiter's email |
| Verification Date | When verification was done |
| Status | Joined/Not Joined/Left Company/Blacklisted |
| Still With Us | Whether student is still with company |
| Rating | Recruiter's rating (1-5) |
| Comments | Recruiter's comments |
| Is Verified | Whether verification is complete |

### 3. Placement Data Sheet (Existing)
This should be your existing sheet with student placement data.

## Troubleshooting

### Common Issues:

1. **"Spreadsheet not found" error**
   - Check that the Spreadsheet ID is correct
   - Ensure the Google account running the script has access to the spreadsheet

2. **"Permission denied" error**
   - Make sure the web app is deployed with "Anyone" access
   - Check that the spreadsheet is shared with the Google account running the script

3. **CORS errors**
   - The script handles CORS automatically, but if you get errors, check the deployment settings

4. **Data not appearing in sheets**
   - Check the Apps Script logs in the Google Apps Script editor
   - Verify the sheet names match exactly

### Testing the Script:

1. In the Google Apps Script editor, run the `testConnection()` function
2. Check the logs to see if it connects successfully
3. Test with a simple form submission

## Security Notes

- The web app URL will be public, so anyone can potentially access it
- Consider implementing authentication if needed
- The script only allows specific actions (addStudentSubmission, write, getStudents, getVerifications)
- All data is validated before being written to the spreadsheet

## Next Steps

Once everything is set up:

1. Test the student form submission
2. Test the recruiter verification process
3. Monitor the Google Sheet to ensure data is being added correctly
4. Consider adding data validation rules to the Google Sheet
5. Set up notifications for new submissions if needed
