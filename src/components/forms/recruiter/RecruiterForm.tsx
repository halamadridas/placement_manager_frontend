import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecruiterIdentity } from "@/components/forms/recruiter/RecruiterIdentity";
import { StudentVerificationTable } from "@/components/forms/recruiter/StudentVerificationTable";
import { RatingsSection } from "@/components/forms/recruiter/RatingsSection";
import {
  fetchStudentsFromCSV,
  type Student,
  type StudentFeedback,
  // submitRecruiterFeedback,
  insertRowsViaScript,
} from "@/utils/fetchStudents";

export const RecruiterForm: React.FC = () => {
  const [recruiter, setRecruiter] = useState({
    name: "",
    designation: "",
    company: "",
    email: "",
  });

  // Cache all students data
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use a single state for student feedback
  const [studentFeedbackMap, setStudentFeedbackMap] = useState<
    Record<string, StudentFeedback>
  >({});

  const [ratings, setRatings] = useState({
    overallExperience: 0,
    skillsSatisfaction: 0,
    reHireLikelihood: 0,
  });
  const [exitFeedback, setExitFeedback] = useState("");

  // Fetch all students once on mount with error handling
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStudentsFromCSV();
        if (mounted) {
          setAllStudents(data);
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  console.log(allStudents);
  // Memoize filtered students - only recalculate when company or allStudents change
  const filteredStudents = useMemo(() => {
    if (!recruiter.company || !allStudents.length) return [];

    return allStudents.filter(
      (student) =>
        student.company.toLowerCase() === recruiter.company.toLowerCase() &&
        student.regNo.trim() !== "" &&
        student.name.trim() !== ""
    );
  }, [recruiter.company, allStudents]);

  // Memoized callback for recruiter changes
  const handleRecruiterChange = useCallback((field: string, value: string) => {
    setRecruiter((prev) => {
      // Only update if value actually changed
      if (prev[field as keyof typeof prev] === value) return prev;

      const newRecruiter = { ...prev, [field]: value };

      // Clear feedback only when company changes
      if (field === "company") {
        setStudentFeedbackMap({});
      }

      return newRecruiter;
    });
  }, []);

  // Optimized student feedback change handler
  const handleStudentFeedbackChange = useCallback(
    (regNo: string, data: StudentFeedback) => {
      setStudentFeedbackMap((prev) => {
        const currentFeedback = prev[regNo] || {};

        // Check if there's actually a change to prevent unnecessary re-renders
        const hasChanges = Object.keys(data).some(
          (key) =>
            currentFeedback[key as keyof StudentFeedback] !==
            data[key as keyof StudentFeedback]
        );

        if (!hasChanges) return prev;

        return {
          ...prev,
          [regNo]: { ...currentFeedback, ...data },
        };
      });
    },
    []
  );

  // Memoized ratings change handler
  const handleRatingsChange = useCallback((field: string, value: number) => {
    setRatings((prev) => {
      if (prev[field as keyof typeof prev] === value) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  // Memoized exit feedback handler
  const handleExitFeedbackChange = useCallback((value: string) => {
    setExitFeedback(value);
  }, []);

  // Convert feedback map to array for the table (memoized)
  const studentFeedbackArr = useMemo(
    () => filteredStudents.map((s) => studentFeedbackMap[s.regNo] || {}),
    [filteredStudents, studentFeedbackMap]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Build rows based on recruiter & student feedback
    const rows = filteredStudents
      .map((student) => {
        const feedback = studentFeedbackMap[student.regNo] || {};

        // Only push if recruiter gave feedback
        if (!feedback.status && !feedback.comment && !feedback.rating)
          return null;

        return [
          student.name,
          student.regNo,
          student.email,
          student.department,
          student.company,
          student.phone,
          recruiter.name,
          recruiter.email,
          feedback.verificationDate || new Date().toISOString(),
          feedback.status || "",
          feedback.stillWithUs ? "true" : "false",
          feedback.rating?.toString() || "",
          feedback.comment || "",
          "true", // Mark verified
        ];
      })
      .filter(Boolean) as (string | number | boolean)[][];

    if (rows.length === 0) {
      alert("⚠️ No feedback to submit.");
      return;
    }

    console.log(rows);

    // send one row to check if the script is working
    
    // ✅ Send all rows at once
    const success = await insertRowsViaScript(rows);

    console.log(success);

    if (success) {
      alert(`✅ Successfully submitted feedback for ${rows.length} students!`);
    } else {
      alert("❌ Failed to submit feedback. Please try again.");
    }
  };
  if (isLoading) {
    return (
      <div className="w-4/5 mx-auto p-4 flex justify-center items-center min-h-64">
        <div className="text-lg">Loading student data...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-4/5 mx-auto p-4 space-y-6">
      <Card className="p-6 shadow-md">
        <RecruiterIdentity
          recruiter={recruiter}
          onChange={handleRecruiterChange}
        />
      </Card>

      {recruiter.company && filteredStudents.length > 0 && (
        <Card className="p-6 shadow-md">
          <StudentVerificationTable
            students={filteredStudents}
            feedback={studentFeedbackArr}
            onFeedbackChange={(idx, data) =>
              handleStudentFeedbackChange(filteredStudents[idx].regNo, data)
            }
          />
        </Card>
      )}

      {recruiter.company && (
        <Card className="p-6 shadow-md">
          <RatingsSection
            ratings={ratings}
            onRatingsChange={handleRatingsChange}
            exitFeedback={exitFeedback}
            setExitFeedback={handleExitFeedbackChange}
          />
        </Card>
      )}

      {recruiter.company && (
        <div className="flex justify-end">
          <Button type="submit" className="mt-4 px-8 py-2 text-lg">
            Submit Feedback
          </Button>
        </div>
      )}
    </form>
  );
};
