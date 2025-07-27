import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UserTypeCard } from "@/components/UserTypeCard";
import { RecruiterForm } from "@/components/RecruiterForm";
import { StudentForm } from "@/components/StudentForm";

function App() {
  const [userType, setUserType] = useState<string | null>(null);

  if (!userType) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-8">
        <h1 className="text-2xl font-bold">Select User Type</h1>
        <div className="flex flex-wrap gap-8 justify-center">
          <UserTypeCard
            title="Recruiter"
            description="Verify students placed in your company, provide feedback, and share insights about your hiring process."
            onClick={() => setUserType("recruiter")}
          />
          <UserTypeCard
            title="Student"
            description="Submit your placement information and feedback about your experience with the placement process."
            onClick={() => setUserType("student")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      {userType === "recruiter" && <RecruiterForm />}
      {userType === "student" && <StudentForm />}
      <Button
        variant="outline"
        className="mt-8"
        onClick={() => setUserType(null)}
      >
        Back
      </Button>
    </div>
  );
}

export default App;
