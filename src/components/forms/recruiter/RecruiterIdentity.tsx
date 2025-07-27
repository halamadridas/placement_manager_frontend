import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCompanyNames } from "@/utils/fetchStudents";

interface RecruiterIdentityProps {
  recruiter: {
    name: string;
    designation: string;
    company: string;
    email: string;
  };
  onChange: (field: string, value: string) => void;
}

export const RecruiterIdentity: React.FC<RecruiterIdentityProps> = ({
  recruiter,
  onChange,
}) => {
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCompanyNames()
      .then((names) => {
        setCompanies(names);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching company names:", err);
        setCompanies([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">Recruiter Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <Label htmlFor="recruiter-name">Name</Label>
          <Input
            id="recruiter-name"
            value={recruiter.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Enter your name"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="recruiter-email">Email</Label>
          <Input
            id="recruiter-email"
            type="email"
            value={recruiter.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Enter your email"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="recruiter-designation">Designation</Label>
          <Input
            id="recruiter-designation"
            value={recruiter.designation}
            onChange={(e) => onChange("designation", e.target.value)}
            placeholder="e.g. HR Manager"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="recruiter-company">Company</Label>
          <Select
            value={recruiter.company}
            onValueChange={(value) => onChange("company", value)}
            disabled={loading}
          >
            <SelectTrigger id="recruiter-company" className="mt-1">
              <SelectValue
                placeholder={
                  loading ? "Loading companies..." : "Select company"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : companies.length === 0 ? (
                <SelectItem value="no-companies" disabled>
                  No companies found
                </SelectItem>
              ) : (
                companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
