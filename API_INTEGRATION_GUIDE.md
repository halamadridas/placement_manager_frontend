# API Integration Guide for Student Verification System

## Overview

This guide explains how to integrate the Google Sheets API with your Student Verification Table component. The system uses the `fetchStudents.ts` utility file for all API operations and the `StudentVerificationTable.tsx` component for the UI.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in your project root:

```env
VITE_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
```

### 2. Google Sheets API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create credentials (API Key)
5. Add the API key to your `.env` file

### 3. Google Sheet Structure

Your Google Sheet should have the following columns (A-N):

| Column | Field               | Description                                         |
| ------ | ------------------- | --------------------------------------------------- |
| A      | Student Name        | Full name of the student                            |
| B      | Registration Number | Student's registration number                       |
| C      | Email               | Student's email address                             |
| D      | Department          | Student's department/course                         |
| E      | Company             | Company where student is placed                     |
| F      | Phone               | Student's phone number                              |
| G      | Recruiter Name      | Name of the recruiter                               |
| H      | Recruiter Email     | Email of the recruiter                              |
| I      | Verification Date   | Date when verification was done                     |
| J      | Status              | Status (Joined/Not Joined/Left Company/Blacklisted) |
| K      | Still With Us       | Boolean (true/false)                                |
| L      | Rating              | Star rating (1-5)                                   |
| M      | Comments            | Additional comments                                 |
| N      | Is Verified         | Boolean (true/false)                                |

## 📁 File Structure

```
src/
├── utils/
│   └── fetchStudents.ts          # API functions and data fetching
├── components/
│   └── forms/
│       └── recruiter/
│           ├── StudentVerificationTable.tsx      # Main component
│           └── StudentVerificationTableExample.tsx # Usage example
```

## 🔧 API Functions

### Core Functions in `fetchStudents.ts`

#### 1. `fetchPlacementDataFromCSV()`

- **Purpose**: Fetches student data from Google Sheets CSV export
- **Returns**: `Promise<Student[]>`
- **Cache**: 5 minutes

#### 2. `addRecruiterVerification(verificationData)`

- **Purpose**: Adds new verification data to Google Sheets
- **Parameters**: `RecruiterVerification` object
- **Returns**: `Promise<boolean>`

#### 3. `updateRecruiterVerification(registrationNumber, verificationData)`

- **Purpose**: Updates existing verification data
- **Parameters**: Registration number and updated data
- **Returns**: `Promise<boolean>`

#### 4. `getRecruiterVerifications()`

- **Purpose**: Fetches all verification data from Google Sheets
- **Returns**: `Promise<RecruiterVerification[]>`
- **Cache**: 5 minutes

#### 5. `getStudentVerification(registrationNumber)`

- **Purpose**: Gets verification data for a specific student
- **Parameters**: Student registration number
- **Returns**: `Promise<RecruiterVerification | null>`

#### 6. `getCompanyVerificationStats(company)`

- **Purpose**: Gets statistics for a specific company
- **Parameters**: Company name
- **Returns**: `Promise<CompanyStats>`

## 🎯 Usage Examples

### Basic Usage

```tsx
import React, { useState, useEffect } from "react";
import StudentVerificationTable from "./StudentVerificationTable";
import {
  fetchPlacementDataFromCSV,
  type Student,
  type StudentFeedback,
} from "@/utils/fetchStudents";

const MyComponent = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [feedback, setFeedback] = useState<StudentFeedback[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const studentsData = await fetchPlacementDataFromCSV();
      setStudents(studentsData);
      setFeedback(studentsData.map(() => ({})));
    };
    loadData();
  }, []);

  const handleFeedbackChange = (index: number, data: StudentFeedback) => {
    setFeedback((prev) => {
      const newFeedback = [...prev];
      newFeedback[index] = { ...newFeedback[index], ...data };
      return newFeedback;
    });
  };

  const handleSubmitVerification = async (
    studentIndex: number,
    verificationData
  ) => {
    // The component automatically handles API calls
    console.log("Verification submitted:", verificationData);
  };

  return (
    <StudentVerificationTable
      students={students}
      feedback={feedback}
      onFeedbackChange={handleFeedbackChange}
      onSubmitVerification={handleSubmitVerification}
    />
  );
};
```

### Advanced Usage with Custom API Handling

```tsx
const handleSubmitVerification = async (
  studentIndex: number,
  verificationData
) => {
  try {
    // Custom pre-processing
    console.log("Processing verification...");

    // The component will automatically:
    // 1. Check if verification exists
    // 2. Add or update in Google Sheets
    // 3. Refresh verification data
    // 4. Call this callback

    // Your custom logic here
    await sendNotification(verificationData);
    await updateLocalState(verificationData);
  } catch (error) {
    console.error("Verification failed:", error);
  }
};
```

## 🔄 Data Flow

1. **Load Students**: `fetchPlacementDataFromCSV()` → Google Sheets CSV
2. **User Interaction**: User fills feedback and clicks "Verify"
3. **API Call**: Component automatically calls `addRecruiterVerification()` or `updateRecruiterVerification()`
4. **Data Refresh**: Component refreshes verification data with `getRecruiterVerifications()`
5. **UI Update**: Table updates with new verification status

## 🛠️ Customization

### Custom API Endpoints

You can modify the API endpoints in `fetchStudents.ts`:

```typescript
// Change the sheet ID
const VERIFICATION_SHEET_ID = "your_sheet_id_here";

// Change the sheet name
const url = `https://sheets.googleapis.com/v4/spreadsheets/${VERIFICATION_SHEET_ID}/values/YourSheetName!A:N?key=${GOOGLE_SHEETS_API_KEY}`;
```

### Custom Caching

Modify cache duration in `fetchStudents.ts`:

```typescript
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes instead of 5
```

### Custom Error Handling

```typescript
const handleSubmitVerification = async (
  studentIndex: number,
  verificationData
) => {
  try {
    // Your custom error handling
    await customValidation(verificationData);

    // Component handles the rest
  } catch (error) {
    // Custom error handling
    showCustomError(error);
  }
};
```

## 🚨 Error Handling

The system includes comprehensive error handling:

- **API Key Missing**: Clear error message
- **Network Errors**: Automatic retry with cached data
- **Invalid Data**: Validation and error logging
- **Sheet Access Issues**: Detailed error messages

## 📊 Performance Features

- **Caching**: 5-minute cache for API calls
- **Batch Operations**: Efficient data loading
- **Lazy Loading**: Data loaded on demand
- **Optimistic Updates**: UI updates immediately

## 🔒 Security

- API keys stored in environment variables
- No sensitive data in client-side code
- Input validation and sanitization
- Error messages don't expose sensitive information

## 📝 Troubleshooting

### Common Issues

1. **API Key Not Working**

   - Check if API key is in `.env` file
   - Verify Google Sheets API is enabled
   - Check API key permissions

2. **Sheet Not Found**

   - Verify sheet ID is correct
   - Check sheet sharing permissions
   - Ensure sheet has correct column structure

3. **Data Not Loading**
   - Check network connection
   - Verify CSV export URL is accessible
   - Check browser console for errors

### Debug Mode

Enable debug logging:

```typescript
// In fetchStudents.ts
const DEBUG = true;

if (DEBUG) {
  console.log("API Response:", data);
}
```

## 📞 Support

For issues or questions:

1. Check the browser console for error messages
2. Verify your Google Sheets setup
3. Test API key with Google Sheets API explorer
4. Check network tab for failed requests

---

This integration provides a complete, production-ready solution for managing student verifications with Google Sheets backend.
