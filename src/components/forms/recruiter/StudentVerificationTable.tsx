import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  // Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserX,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Star,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Save,
  Loader2,
  ShieldCheck,
  Shield,
  // FileText,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  MessageCircle,
} from "lucide-react";

// Import API functions from fetchStudents.ts
import {
  type Student,
  type StudentFeedback,
  type RecruiterVerification,
  addRecruiterVerification,
  getStudentVerification,
  updateRecruiterVerification,
  fetchVerifiedStudentsFromSheet,
} from "@/utils/fetchStudents";

// Types and Interfaces
// Note: Student, StudentFeedback, and RecruiterVerification are imported from fetchStudents.ts

interface StudentVerificationTableProps {
  students: Student[];
  feedback: StudentFeedback[];
  onFeedbackChange: (index: number, data: StudentFeedback) => void;
  onSubmitVerification?: (
    studentIndex: number,
    verificationData: {
      recruiterName: string;
      recruiterEmail: string;
      feedback: StudentFeedback;
    }
  ) => Promise<void>;
  loading?: boolean;
  companyStats?: {
    total: number;
    verified: number;
    joined: number;
    notJoined: number;
    leftCompany: number;
    blacklisted: number;
    stillWithUs: number;
  };
}

// Constants
const statusOptions = ["Joined", "Not Joined", "Left Company", "Blacklisted"];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const statusIcons = {
  Joined: CheckCircle2,
  "Not Joined": XCircle,
  "Left Company": AlertCircle,
  Blacklisted: UserX,
};

const statusColors = {
  Joined: "bg-green-50 text-green-700 border-green-200",
  "Not Joined": "bg-red-50 text-red-700 border-red-200",
  "Left Company": "bg-yellow-50 text-yellow-700 border-yellow-200",
  Blacklisted: "bg-gray-50 text-gray-700 border-gray-200",
};

// Component: Star Rating
const StarRating = React.memo(
  ({
    rating,
    onChange,
  }: {
    rating: number;
    onChange: (rating: number) => void;
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer transition-colors ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
            onClick={() => onChange(star)}
          />
        ))}
        <span className="text-xs text-gray-500 ml-2">{rating}/5</span>
      </div>
    );
  }
);
StarRating.displayName = "StarRating";

// Component: Status Select
const StatusSelect = React.memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40 h-9 border border-gray-200 hover:border-gray-300 focus:border-blue-500 transition-all duration-200 bg-white text-sm">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
        {statusOptions.map((status) => {
          const Icon = statusIcons[status as keyof typeof statusIcons];
          return (
            <SelectItem
              key={status}
              value={status}
              className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer py-2 px-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm">{status}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  )
);
StatusSelect.displayName = "StatusSelect";

// Component: Still With Us Checkbox
const StillWithUsCheckbox = React.memo(
  ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={checked}
        onCheckedChange={(checked) => onChange(!!checked)}
        className="w-4 h-4 border border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-all duration-200"
      />
    </div>
  )
);
StillWithUsCheckbox.displayName = "StillWithUsCheckbox";

// Component: Feedback Textarea
const FeedbackTextarea = React.memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add feedback here..."
      className="min-w-[240px] border border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 resize-none bg-white text-sm"
      rows={2}
    />
  )
);
FeedbackTextarea.displayName = "FeedbackTextarea";

// Component: Verification Dialog
const VerificationDialog = React.memo(
  ({
    student,
    feedback,
    onSubmit,
    loading,
  }: {
    student: Student;
    feedback: StudentFeedback;
    onSubmit: (data: {
      recruiterName: string;
      recruiterEmail: string;
      feedback: StudentFeedback;
    }) => Promise<void>;
    loading?: boolean;
  }) => {
    const [open, setOpen] = React.useState(false);
    const [recruiterName, setRecruiterName] = React.useState("");
    const [recruiterEmail, setRecruiterEmail] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
      if (open) {
        setRecruiterName(feedback.recruiterName || "");
        setRecruiterEmail(feedback.recruiterEmail || "");
      }
    }, [open, feedback]);

    const handleSubmit = async () => {
      if (!recruiterName.trim() || !recruiterEmail.trim()) {
        alert("Please fill in recruiter name and email");
        return;
      }

      if (!feedback.status) {
        alert("Please select a status");
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit({
          recruiterName: recruiterName.trim(),
          recruiterEmail: recruiterEmail.trim(),
          feedback: {
            ...feedback,
            isVerified: true,
            verificationDate: new Date().toISOString(),
            recruiterName: recruiterName.trim(),
            recruiterEmail: recruiterEmail.trim(),
          },
        });
        setOpen(false);
      } catch (error) {
        console.error("Failed to submit verification:", error);
        alert("Failed to submit verification. Please try again.");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant={feedback.isVerified ? "secondary" : "default"}
            className={`h-8 px-3 text-xs ${
              feedback.isVerified
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {feedback.isVerified ? (
              <>
                <ShieldCheck className="w-3 h-3 mr-1" />
                Verified
              </>
            ) : (
              <>
                <Shield className="w-3 h-3 mr-1" />
                Verify
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {feedback.isVerified ? "Update Verification" : "Verify Student"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {feedback.isVerified
                ? `Update verification for ${student.name}`
                : `Verify employment status for ${student.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Recruiter Name *
              </label>
              <Input
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="Enter your name"
                className="border border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Recruiter Email *
              </label>
              <Input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="Enter your email"
                className="border border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Student Details
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Name: {student.name}</div>
                <div>Reg No: {student.regNo}</div>
                <div>Department: {student.department}</div>
                <div>Company: {student.company}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting || !recruiterName.trim() || !recruiterEmail.trim()
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {feedback.isVerified ? "Update" : "Verify"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);
VerificationDialog.displayName = "VerificationDialog";

// --- Actions Menu ---
const ActionsMenu: React.FC<{
  student: Student;
}> = ({ student }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(
              `Name: ${student.name}\nReg No: ${student.regNo}\nEmail: ${student.email}\nDepartment: ${student.department}\nCompany: ${student.company}\nPhone: ${student.phone}`
            );
          }}
        >
          Copy Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(`mailto:${student.email}`)}
        >
          Email Student
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`tel:${student.phone}`)}>
          Call Student
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// --- CSV Export ---
function exportToCSV(students: Student[], feedback: StudentFeedback[]) {
  const headers = [
    "Name",
    "Reg No",
    "Email",
    "Department",
    "Company",
    "Phone",
    "Status",
    "Still With Us",
    "Rating",
    "Comment",
    "Verified",
    "Verification Date",
    "Recruiter Name",
    "Recruiter Email",
  ];
  const rows = students.map((s, i) => [
    s.name,
    s.regNo,
    s.email,
    s.department,
    s.company,
    s.phone,
    feedback[i]?.status || "",
    feedback[i]?.stillWithUs ? "Yes" : "No",
    feedback[i]?.rating?.toString() || "",
    feedback[i]?.comment || "",
    feedback[i]?.isVerified ? "Yes" : "No",
    feedback[i]?.verificationDate || "",
    feedback[i]?.recruiterName || "",
    feedback[i]?.recruiterEmail || "",
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student_verification.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// --- Statistics Card ---
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-xl border-2 ${color} p-4 bg-white shadow-sm min-w-[120px]`}
  >
    <div className="mb-2">{icon}</div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-xs font-medium text-gray-500 mt-1">{label}</div>
  </div>
);

// --- Main Table Component ---
export const StudentVerificationTable: React.FC<StudentVerificationTableProps> =
  React.memo(function StudentVerificationTable({
    students,
    feedback,
    onFeedbackChange,
    onSubmitVerification,
    loading,
    companyStats,
  }) {
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
      React.useState<ColumnFiltersState>([]);
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [verificationFilter, setVerificationFilter] =
      React.useState<string>("all");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [verifiedSheetList, setVerifiedSheetList] = React.useState<
      (Student & { verificationDate?: string })[]
    >([]);
    const [loadingVerifiedSheet, setLoadingVerifiedSheet] =
      React.useState(false);

    // Load verified students from the Google Sheet
    React.useEffect(() => {
      const loadVerifiedSheet = async () => {
        setLoadingVerifiedSheet(true);
        try {
          const data = await fetchVerifiedStudentsFromSheet();
          setVerifiedSheetList(data);
        } catch (error) {
          console.error("Failed to load verified students from sheet:", error);
        } finally {
          setLoadingVerifiedSheet(false);
        }
      };
      loadVerifiedSheet();
    }, []);

    // Enhanced verification submission handler
    const handleVerificationSubmit = React.useCallback(
      async (
        studentIndex: number,
        verificationData: {
          recruiterName: string;
          recruiterEmail: string;
          feedback: StudentFeedback;
        }
      ) => {
        if (!onSubmitVerification) return;

        try {
          const student = students[studentIndex];
          const verificationRecord: RecruiterVerification = {
            studentName: student.name,
            registrationNumber: student.regNo,
            email: student.email,
            department: student.department,
            company: student.company,
            phone: student.phone,
            recruiterName: verificationData.recruiterName,
            recruiterEmail: verificationData.recruiterEmail,
            verificationDate: new Date().toISOString(),
            status: verificationData.feedback.status || "",
            stillWithUs: verificationData.feedback.stillWithUs || false,
            rating: verificationData.feedback.rating,
            comments: verificationData.feedback.comment,
            isVerified: true,
          };

          // Check if verification already exists
          const existingVerification = await getStudentVerification(
            student.regNo
          );

          if (existingVerification) {
            // Update existing verification
            await updateRecruiterVerification(
              student.regNo,
              verificationRecord
            );
          } else {
            // Add new verification
            await addRecruiterVerification(verificationRecord);
          }

          // No need to refresh verifications from API, as we now use the sheet for verification

          // Call the original onSubmitVerification
          await onSubmitVerification(studentIndex, verificationData);
        } catch (error) {
          console.error("Failed to submit verification:", error);
          throw error;
        }
      },
      [students, onSubmitVerification]
    );

    // Filter students by search term and filters
    const filteredStudents = React.useMemo(() => {
      let filtered = students;

      // Search filter
      if (search.trim()) {
        const term = search.trim().toLowerCase();
        filtered = filtered.filter((s) => {
          const name = (s.name || "").toLowerCase().trim();
          const regNo = (s.regNo || "").toLowerCase().trim();
          const email = (s.email || "").toLowerCase().trim();
          const department = (s.department || "").toLowerCase().trim();
          const phone = (s.phone || "").toLowerCase().trim();
          return (
            name.includes(term) ||
            regNo.includes(term) ||
            email.includes(term) ||
            department.includes(term) ||
            phone.includes(term)
          );
        });
      }

      // Status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((s) => {
          const studentIndex = students.findIndex(
            (stu) => stu.regNo === s.regNo
          );
          const studentFeedback = feedback[studentIndex];
          return studentFeedback?.status === statusFilter;
        });
      }

      // Verification filter
      if (verificationFilter !== "all") {
        filtered = filtered.filter((s) => {
          const studentIndex = students.findIndex(
            (stu) => stu.regNo === s.regNo
          );
          const studentFeedback = feedback[studentIndex];
          if (verificationFilter === "verified") {
            return studentFeedback?.isVerified === true;
          } else if (verificationFilter === "unverified") {
            return !studentFeedback?.isVerified;
          }
          return true;
        });
      }

      return filtered;
    }, [students, search, statusFilter, verificationFilter, feedback]);

    const filteredFeedback = React.useMemo(
      () =>
        filteredStudents.map(
          (s) =>
            feedback[students.findIndex((stu) => stu.regNo === s.regNo)] || {}
        ),
      [filteredStudents, feedback, students]
    );

    // Calculate statistics
    const stats = React.useMemo(() => {
      const total = students.length;
      const verified = feedback.filter((f) => f.isVerified).length;
      const joined = feedback.filter((f) => f.status === "Joined").length;
      const notJoined = feedback.filter(
        (f) => f.status === "Not Joined"
      ).length;
      const leftCompany = feedback.filter(
        (f) => f.status === "Left Company"
      ).length;
      const blacklisted = feedback.filter(
        (f) => f.status === "Blacklisted"
      ).length;
      const stillWithUs = feedback.filter((f) => f.stillWithUs).length;

      return (
        companyStats || {
          total,
          verified,
          joined,
          notJoined,
          leftCompany,
          blacklisted,
          stillWithUs,
        }
      );
    }, [students.length, feedback, companyStats]);

    // Calculate pagination
    const { totalPages, pagedStudents, pagedFeedback } = React.useMemo(() => {
      const totalPages = Math.ceil(filteredStudents.length / pageSize);
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      return {
        totalPages,
        pagedStudents: filteredStudents.slice(startIndex, endIndex),
        pagedFeedback: filteredFeedback.slice(startIndex, endIndex),
      };
    }, [filteredStudents, filteredFeedback, page, pageSize]);

    // Table data with proper indexing
    const tableData = React.useMemo(() => {
      return pagedStudents.map((student, idx) => {
        const originalIndex = students.findIndex(
          (s) => s.regNo === student.regNo
        );
        // Check if student is verified in the sheet for the same company
        const verifiedEntry = verifiedSheetList.find(
          (v) =>
            v.company.trim().toLowerCase() ===
              student.company.trim().toLowerCase() &&
            ((v.regNo &&
              v.regNo.trim().toLowerCase() ===
                student.regNo.trim().toLowerCase()) ||
              (v.email &&
                v.email.trim().toLowerCase() ===
                  student.email.trim().toLowerCase()) ||
              (v.phone && v.phone.trim() === student.phone.trim()) ||
              (v.name &&
                v.name.trim().toLowerCase() ===
                  student.name.trim().toLowerCase()))
        );
        const isVerified = !!verifiedEntry;
        return {
          ...student,
          status: pagedFeedback[idx]?.status || "",
          stillWithUs: pagedFeedback[idx]?.stillWithUs || false,
          comment: pagedFeedback[idx]?.comment || "",
          rating: pagedFeedback[idx]?.rating || 0,
          isVerified,
          verificationDate: verifiedEntry?.verificationDate || "",
          recruiterName: pagedFeedback[idx]?.recruiterName || "",
          recruiterEmail: pagedFeedback[idx]?.recruiterEmail || "",
          originalIndex,
        };
      });
    }, [pagedStudents, pagedFeedback, students, verifiedSheetList]);

    // Callback creators
    const createStatusChangeHandler = React.useCallback(
      (originalIndex: number, currentFeedback: StudentFeedback) =>
        (value: string) =>
          onFeedbackChange(originalIndex, {
            ...currentFeedback,
            status: value,
          }),
      [onFeedbackChange]
    );

    const createStillWithUsChangeHandler = React.useCallback(
      (originalIndex: number, currentFeedback: StudentFeedback) =>
        (checked: boolean) =>
          onFeedbackChange(originalIndex, {
            ...currentFeedback,
            stillWithUs: checked,
          }),
      [onFeedbackChange]
    );

    const createCommentChangeHandler = React.useCallback(
      (originalIndex: number, currentFeedback: StudentFeedback) =>
        (value: string) =>
          onFeedbackChange(originalIndex, {
            ...currentFeedback,
            comment: value,
          }),
      [onFeedbackChange]
    );

    const createRatingChangeHandler = React.useCallback(
      (originalIndex: number, currentFeedback: StudentFeedback) =>
        (rating: number) =>
          onFeedbackChange(originalIndex, {
            ...currentFeedback,
            rating,
          }),
      [onFeedbackChange]
    );

    // Enhanced columns with sorting and better styling
    const columns: ColumnDef<(typeof tableData)[0]>[] = React.useMemo(
      () => [
        {
          accessorKey: "name",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center gap-2 h-auto p-0 hover:bg-transparent font-semibold text-gray-700"
            >
              <Users className="w-4 h-4" />
              Name
              {column.getIsSorted() === "asc" && (
                <ArrowUp className="w-3 h-3" />
              )}
              {column.getIsSorted() === "desc" && (
                <ArrowDown className="w-3 h-3" />
              )}
              {!column.getIsSorted() && (
                <ArrowUpDown className="w-3 h-3 opacity-50" />
              )}
            </Button>
          ),
          cell: ({ getValue }) => (
            <div className="font-medium text-gray-900 text-sm">
              {getValue() as string}
            </div>
          ),
        },
        {
          accessorKey: "regNo",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <GraduationCap className="w-4 h-4" />
              Reg No
            </div>
          ),
          cell: ({ getValue }) => (
            <Badge
              variant="outline"
              className="font-mono text-xs bg-gray-50 border-gray-200 text-gray-700"
            >
              {getValue() as string}
            </Badge>
          ),
        },
        {
          accessorKey: "email",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <Mail className="w-4 h-4" />
              Email
            </div>
          ),
          cell: ({ getValue }) => (
            <div className="text-sm text-gray-600 font-mono max-w-[200px] truncate">
              {getValue() as string}
            </div>
          ),
        },
        {
          accessorKey: "department",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center gap-2 h-auto p-0 hover:bg-transparent font-semibold text-gray-700"
            >
              <Building2 className="w-4 h-4" />
              Department
              {column.getIsSorted() === "asc" && (
                <ArrowUp className="w-3 h-3" />
              )}
              {column.getIsSorted() === "desc" && (
                <ArrowDown className="w-3 h-3" />
              )}
              {!column.getIsSorted() && (
                <ArrowUpDown className="w-3 h-3 opacity-50" />
              )}
            </Button>
          ),
          cell: ({ getValue }) => (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
            >
              {getValue() as string}
            </Badge>
          ),
        },
        {
          accessorKey: "company",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <Building2 className="w-4 h-4" />
              Company
            </div>
          ),
          cell: ({ getValue }) => (
            <Badge
              variant="secondary"
              className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
            >
              {getValue() as string}
            </Badge>
          ),
        },
        {
          accessorKey: "phone",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <Phone className="w-4 h-4" />
              Phone
            </div>
          ),
          cell: ({ getValue }) => (
            <div className="text-sm text-gray-600 font-mono">
              {getValue() as string}
            </div>
          ),
        },
        // --- Verification Badge Column ---
        {
          id: "verificationBadge",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <ShieldCheck className="w-4 h-4" />
              Verification
            </div>
          ),
          cell: ({ row }) =>
            row.original.isVerified ? (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 text-xs"
              >
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 text-xs"
              >
                <XCircle className="w-3 h-3 mr-1" /> Unverified
              </Badge>
            ),
        },
        // --- Verification Date Column ---
        {
          accessorKey: "verificationDate",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <Calendar className="w-4 h-4" />
              Verified On
            </div>
          ),
          cell: ({ getValue, row }) =>
            row.original.isVerified && getValue() ? (
              <span className="text-xs text-gray-500">
                {new Date(getValue() as string).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-xs text-gray-400">-</span>
            ),
        },
        // --- Status, Rating, StillWithUs, Comment ---
        {
          accessorKey: "status",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center gap-2 h-auto p-0 hover:bg-transparent font-semibold text-gray-700"
            >
              <Filter className="w-4 h-4" />
              Status
              {column.getIsSorted() === "asc" && (
                <ArrowUp className="w-3 h-3" />
              )}
              {column.getIsSorted() === "desc" && (
                <ArrowDown className="w-3 h-3" />
              )}
              {!column.getIsSorted() && (
                <ArrowUpDown className="w-3 h-3 opacity-50" />
              )}
            </Button>
          ),
          cell: ({ row }) => {
            const originalIndex = row.original.originalIndex;
            const currentFeedback = feedback[originalIndex] || {};
            const status = row.original.status;
            return (
              <div className="space-y-2">
                <StatusSelect
                  value={status}
                  onChange={createStatusChangeHandler(
                    originalIndex,
                    currentFeedback
                  )}
                />
                {status && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      statusColors[status as keyof typeof statusColors] ||
                      "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {React.createElement(
                      statusIcons[status as keyof typeof statusIcons] ||
                        CheckCircle2,
                      { className: "w-3 h-3 mr-1" }
                    )}
                    {status}
                  </Badge>
                )}
              </div>
            );
          },
        },
        {
          accessorKey: "rating",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <Star className="w-4 h-4" />
              Rating
            </div>
          ),
          cell: ({ row }) => {
            const originalIndex = row.original.originalIndex;
            const currentFeedback = feedback[originalIndex] || {};
            return (
              <StarRating
                rating={row.original.rating || 0}
                onChange={createRatingChangeHandler(
                  originalIndex,
                  currentFeedback
                )}
              />
            );
          },
        },
        {
          accessorKey: "stillWithUs",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700 justify-center">
              <CheckCircle2 className="w-4 h-4" />
              Active
            </div>
          ),
          cell: ({ row }) => {
            const originalIndex = row.original.originalIndex;
            const currentFeedback = feedback[originalIndex] || {};
            return (
              <StillWithUsCheckbox
                checked={row.original.stillWithUs}
                onChange={createStillWithUsChangeHandler(
                  originalIndex,
                  currentFeedback
                )}
              />
            );
          },
        },
        {
          accessorKey: "comment",
          header: () => (
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <MessageCircle className="w-4 h-4" />
              Comment
            </div>
          ),
          cell: ({ row }) => {
            const originalIndex = row.original.originalIndex;
            const currentFeedback = feedback[originalIndex] || {};
            return (
              <FeedbackTextarea
                value={currentFeedback.comment || ""}
                onChange={createCommentChangeHandler(
                  originalIndex,
                  currentFeedback
                )}
              />
            );
          },
        },
        // --- Actions ---
        {
          id: "actions",
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => {
            return <ActionsMenu student={row.original} />;
          },
        },
      ],
      [
        feedback,
        createStatusChangeHandler,
        createStillWithUsChangeHandler,
        createCommentChangeHandler,
        createRatingChangeHandler,
      ]
    );

    const table = useReactTable({
      data: tableData,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      state: { sorting, columnFilters },
    });

    // --- Render ---
    return (
      <div className="space-y-6 w-full">
        {/* --- Statistics Dashboard --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            label="Total"
            value={stats.total}
            color="border-blue-200"
          />
          <StatCard
            icon={<ShieldCheck className="w-6 h-6 text-green-600" />}
            label="Verified"
            value={stats.verified}
            color="border-green-200"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            label="Joined"
            value={stats.joined}
            color="border-green-200"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 text-red-500" />}
            label="Not Joined"
            value={stats.notJoined}
            color="border-red-200"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6 text-yellow-500" />}
            label="Left Company"
            value={stats.leftCompany}
            color="border-yellow-200"
          />
          <StatCard
            icon={<UserX className="w-6 h-6 text-gray-500" />}
            label="Blacklisted"
            value={stats.blacklisted}
            color="border-gray-200"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6 text-blue-500" />}
            label="Active"
            value={stats.stillWithUs}
            color="border-blue-100"
          />
        </div>
        {/* --- Filters and Actions --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-64 border border-gray-200 focus:border-blue-500"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9 border border-gray-200 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger className="w-40 h-9 border border-gray-200 text-sm">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setVerificationFilter("all");
              }}
              className="h-9 px-4 text-sm"
            >
              Reset Filters
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => exportToCSV(students, feedback)}
              className="h-9 px-4 text-sm border-gray-200"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            {loading && (
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600 ml-2" />
            )}
          </div>
        </div>
        {/* --- Table --- */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <Table className="min-w-[1400px] w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gray-50 border-b border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-base px-6 py-4 font-semibold"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 border-b border-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  {/* Verification Dialog Button */}
                  <TableCell className="px-6 py-4 align-top">
                    {row.original.isVerified ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                      >
                        <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                        {row.original.verificationDate && (
                          <span className="ml-2 text-gray-500 text-[10px]">
                            {new Date(
                              row.original.verificationDate
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </Badge>
                    ) : (
                      onSubmitVerification && (
                        <VerificationDialog
                          student={row.original}
                          feedback={feedback[row.original.originalIndex] || {}}
                          onSubmit={async ({
                            recruiterName,
                            recruiterEmail,
                            feedback: fb,
                          }) => {
                            await handleVerificationSubmit(
                              row.original.originalIndex,
                              {
                                recruiterName,
                                recruiterEmail,
                                feedback: fb,
                              }
                            );
                          }}
                          loading={loading || loadingVerifiedSheet}
                        />
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* --- Pagination --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-9 px-4 border border-gray-200"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <span className="text-sm font-medium text-gray-600">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-9 px-4 border border-gray-200"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Rows per page:
            </span>
            <select
              className="h-9 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium focus:border-blue-500 focus:outline-none transition-all duration-200"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  });

StudentVerificationTable.displayName = "StudentVerificationTable";
export default StudentVerificationTable;
