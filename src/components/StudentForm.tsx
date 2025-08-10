import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitStudentData, validateStudentData, type StudentSubmissionData } from "@/utils/studentSubmission";

interface StudentFormData {
  registrationNumber: string;
  name: string;
  isPlaced: string;
  company: string;
  course: string;
  phone: string;
  email: string;
  placementDate?: string;
  package?: string;
  feedback?: string;
}

export const StudentForm: React.FC = () => {
  const [formData, setFormData] = useState<StudentFormData>({
    registrationNumber: "",
    name: "",
    isPlaced: "",
    company: "",
    course: "",
    phone: "",
    email: "",
    placementDate: "",
    package: "",
    feedback: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug: Log the form data
      console.log("🔍 Form data being submitted:", formData);

      // Validate form data
      const validation = validateStudentData(formData);
      if (!validation.isValid) {
        alert(`Please fix the following errors:\n${validation.errors.join('\n')}`);
        return;
      }

      // Prepare data for submission
      const submissionData: StudentSubmissionData = {
        ...formData,
        submissionDate: new Date().toISOString(),
      };

      console.log("🔍 Submission data:", submissionData);

      // Submit to backend API
      const result = await submitStudentData(submissionData);

      if (result.success) {
        alert("✅ Student data submitted successfully!");
        
        // Reset form
        setFormData({
          registrationNumber: "",
          name: "",
          isPlaced: "",
          company: "",
          course: "",
          phone: "",
          email: "",
          placementDate: "",
          package: "",
          feedback: "",
        });
      } else {
        alert(`❌ Failed to submit data: ${result.error}`);
      }

    } catch (error) {
      console.error("Error submitting student data:", error);
      alert("❌ Failed to submit data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-4/5 mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Placement Form</h1>
        <p className="text-gray-600">Please provide your placement information and feedback</p>
      </div>

      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrationNumber" className="text-sm font-medium">
              Registration Number *
            </Label>
            <Input
              id="registrationNumber"
              type="text"
              placeholder="e.g., GF202215795"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Abhinanth Ravi"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course" className="text-sm font-medium">
              Course *
            </Label>
            <Input
              id="course"
              type="text"
              placeholder="e.g., MSc Microbiology [2023-2025]"
              value={formData.course}
              onChange={(e) => handleInputChange("course", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 9562437485"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., abhinanathravi@shooliniuniversity.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Placement Status</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Are you placed? *</Label>
            <RadioGroup
              value={formData.isPlaced}
              onValueChange={(value) => handleInputChange("isPlaced", value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="placed-yes" />
                <Label htmlFor="placed-yes">Yes, I have been placed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="placed-no" />
                <Label htmlFor="placed-no">No, I am still looking for placement</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.isPlaced === "yes" && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800">Placement Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="e.g., Glenmark"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placementDate" className="text-sm font-medium">
                    Placement Date
                  </Label>
                  <Input
                    id="placementDate"
                    type="date"
                    value={formData.placementDate}
                    onChange={(e) => handleInputChange("placementDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package" className="text-sm font-medium">
                    Package (CTC in LPA)
                  </Label>
                  <Input
                    id="package"
                    type="text"
                    placeholder="e.g., 4.5 LPA"
                    value={formData.package}
                    onChange={(e) => handleInputChange("package", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Feedback & Comments</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              Placement Process Feedback
            </Label>
            <Textarea
              id="feedback"
              placeholder="Please share your experience with the placement process, any challenges you faced, and suggestions for improvement..."
              value={formData.feedback}
              onChange={(e) => handleInputChange("feedback", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              registrationNumber: "",
              name: "",
              isPlaced: "",
              company: "",
              course: "",
              phone: "",
              email: "",
              placementDate: "",
              package: "",
              feedback: "",
            });
          }}
          disabled={isSubmitting}
        >
          Reset Form
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-8 py-2">
          {isSubmitting ? "Submitting..." : "Submit Data"}
        </Button>
      </div>
    </form>
  );
};
