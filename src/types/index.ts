export interface PlacementRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  department: string;
  company: string;
  package: number;
  placementDate: string;
  mentorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  studentName: string;
  email: string;
  personalEmail?: string;
  mobileNumber: string;
  department: string;
  section: string;
  mentorId: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  numberOfBacklogs?: number;
  resumeLink?: string;
  photoUrl?: string;
  academicDetails: {
    tenthPercentage: number;
    twelfthPercentage: number;
    ugPercentage: number;
    cgpa?: number;
  };
  status: 'placed' | 'eligible' | 'higher_studies' | 'ineligible';
  placementRecord?: PlacementRecord;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'mentor';
  name: string;
  department?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  department: string;
  section: string;
  company: string;
  year: string;
  mentor: string;
  status: string;
  packageRange: {
    min: number;
    max: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

export interface ChartData {
  name: string;
  value: number;
  package?: number;
  count?: number;
}

export interface KPIData {
  totalStudents: number;
  totalPlaced: number;
  totalEligible: number;
  totalIneligible: number;
  higherStudies: number;
  averagePackage: number;
  topCompany: string;
  topPackage: number;
  placementRate: number;
}

export interface DepartmentStats {
  department: string;
  placed: number;
  eligible: number;
  ineligible: number;
  higherStudies: number;
  averagePackage: number;
  topPackage: number;
}

export interface MonthlyPlacement {
  month: string;
  placed: number;
  averagePackage: number;
}

export interface MentorStats {
  mentorId: string;
  mentorName: string;
  totalStudents: number;
  placed: number;
  eligible: number;
  ineligible: number;
  higherStudies: number;
  placementRate: number;
}