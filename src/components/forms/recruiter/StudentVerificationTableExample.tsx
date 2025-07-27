import React, { useState, useEffect } from "react";
import StudentVerificationTable from "./StudentVerificationTable";
import {
  fetchPlacementDataFromCSV,
  type Student,
  type StudentFeedback,
} from "@/utils/fetchStudents";

const StudentVerificationTableExample: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [feedback, setFeedback] = useState<StudentFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Load students data
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await fetchPlacementDataFromCSV();
        setStudents(studentsData);

        // Initialize feedback array with empty objects
        const initialFeedback = studentsData.map(() => ({}));
        setFeedback(initialFeedback);
      } catch (error) {
        console.error("Failed to load students:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Handle feedback changes
  const handleFeedbackChange = (index: number, data: StudentFeedback) => {
    setFeedback((prev) => {
      const newFeedback = [...prev];
      newFeedback[index] = { ...newFeedback[index], ...data };
      return newFeedback;
    });
  };

  // Handle verification submission
  const handleSubmitVerification = async (
    studentIndex: number,
    verificationData: {
      recruiterName: string;
      recruiterEmail: string;
      feedback: StudentFeedback;
    }
  ) => {
    try {
      console.log(
        "Submitting verification for student:",
        students[studentIndex].name
      );
      console.log("Verification data:", verificationData);

      // Update local feedback state
      setFeedback((prev) => {
        const newFeedback = [...prev];
        newFeedback[studentIndex] = {
          ...newFeedback[studentIndex],
          ...verificationData.feedback,
          isVerified: true,
          verificationDate: new Date().toISOString(),
          recruiterName: verificationData.recruiterName,
          recruiterEmail: verificationData.recruiterEmail,
        };
        return newFeedback;
      });

      // You can add additional logic here like showing success messages
      alert(`Successfully verified ${students[studentIndex].name}!`);
    } catch (error) {
      console.error("Failed to submit verification:", error);
      alert("Failed to submit verification. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Student Verification System
        </h1>
        <p className="text-gray-600">
          Manage and verify student placement status with Google Sheets
          integration
        </p>
      </div>

      <StudentVerificationTable
        students={students}
        feedback={feedback}
        onFeedbackChange={handleFeedbackChange}
        onSubmitVerification={handleSubmitVerification}
        loading={loading}
      />
    </div>
  );
};

export default StudentVerificationTableExample;
