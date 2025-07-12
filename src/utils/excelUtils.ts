import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PlacementRecord, Student } from '../types';
import { useDepartments } from './departmentUtils';

export const exportToExcel = (data: any[], filename: string = 'placement_data.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data_blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data_blob, filename);
};

export const exportToCSV = (data: any[], filename: string = 'placement_data.csv') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const data_blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  saveAs(data_blob, filename);
};

export const parseExcelFile = (file: File): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Define column mappings - multiple possible names for each field
        const columnMappings = {
          rollNumber: ['Roll Number', 'rollNumber', 'roll_number', 'Roll No', 'RollNumber', 'Student ID', 'ID'],
          studentName: ['Student Name', 'studentName', 'student_name', 'Name', 'Full Name', 'StudentName'],
          email: ['Email', 'email', 'Email Address', 'email_address', 'EmailAddress', 'E-mail'],
          mobileNumber: ['Mobile Number', 'mobileNumber', 'mobile_number', 'Phone', 'phone', 'Mobile', 'Contact', 'Phone Number'],
          department: ['Department', 'department', 'Dept', 'dept', 'Branch', 'branch'],
          section: ['Section', 'section', 'Class', 'class'],
          mentorId: ['Mentor ID', 'mentorId', 'mentor_id', 'Mentor', 'mentor', 'MentorID'],
          tenthPercentage: ['10th Percentage', 'tenthPercentage', 'tenth_percentage', '10th %', '10th', 'Class 10', 'SSC'],
          twelfthPercentage: ['12th Percentage', 'twelfthPercentage', 'twelfth_percentage', '12th %', '12th', 'Class 12', 'HSC', 'Intermediate'],
          ugPercentage: ['UG Percentage', 'ugPercentage', 'ug_percentage', 'UG %', 'UG', 'Graduation', 'CGPA', 'GPA'],
          status: ['Status', 'status', 'Placement Status', 'Student Status'],
          company: ['Company', 'company', 'Company Name', 'Employer', 'Organization'],
          package: ['Package (LPA)', 'package', 'Package', 'Salary', 'CTC', 'Annual Package', 'Package LPA'],
          placementDate: ['Placement Date', 'placementDate', 'placement_date', 'Date of Placement', 'Joining Date']
        };

        // Function to find the correct column name from the Excel data
        const findColumnName = (possibleNames: string[], excelColumns: string[]): string | null => {
          for (const possibleName of possibleNames) {
            const found = excelColumns.find(col => 
              col.toLowerCase().trim() === possibleName.toLowerCase().trim()
            );
            if (found) return found;
          }
          return null;
        };

        // Get all column names from the Excel file
        const excelColumns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        
        // Map Excel columns to our field names
        const columnMap: Record<string, string | null> = {};
        Object.entries(columnMappings).forEach(([fieldName, possibleNames]) => {
          columnMap[fieldName] = findColumnName(possibleNames, excelColumns);
        });

        // Helper function to safely get value from row
        const getValue = (row: any, fieldName: string): string => {
          const columnName = columnMap[fieldName];
          if (!columnName || !row[columnName]) return '';
          return String(row[columnName]).trim();
        };

        // Helper function to safely parse number
        const parseNumber = (value: string, defaultValue: number = 0): number => {
          if (!value) return defaultValue;
          const parsed = parseFloat(value);
          return isNaN(parsed) ? defaultValue : parsed;
        };

        const students: Student[] = jsonData.map((row: any, index: number) => {
          // Extract data using flexible column matching
          const rollNumber = getValue(row, 'rollNumber') || `IMP${Date.now()}${index}`;
          const studentName = getValue(row, 'studentName');
          const email = getValue(row, 'email');
          const mobileNumber = getValue(row, 'mobileNumber');
          const department = getValue(row, 'department');
          const section = getValue(row, 'section') || 'A';
          const mentorId = getValue(row, 'mentorId') || 'mentor_1_1'; // Default to first mentor
          
          // Extract academic details with safe parsing
          const tenthPercentage = parseNumber(getValue(row, 'tenthPercentage'), 0);
          const twelfthPercentage = parseNumber(getValue(row, 'twelfthPercentage'), 0);
          const ugPercentage = parseNumber(getValue(row, 'ugPercentage'), 0);

          // Determine eligibility based on academic performance
          let status: 'placed' | 'eligible' | 'higher_studies' | 'ineligible' = 'eligible';
          const importedStatus = getValue(row, 'status').toLowerCase();
          
          if (tenthPercentage < 60 || twelfthPercentage < 60 || ugPercentage < 60) {
            status = 'ineligible';
          } else if (importedStatus === 'higher_studies' || importedStatus === 'higher studies') {
            status = 'higher_studies';
          } else if (importedStatus === 'placed') {
            status = 'placed';
          } else {
            status = 'eligible';
          }

          const student: Student = {
            id: `import_${Date.now()}_${index}`,
            rollNumber,
            studentName,
            email,
            mobileNumber,
            department,
            section,
            mentorId,
            academicDetails: {
              tenthPercentage,
              twelfthPercentage,
              ugPercentage,
            },
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Add placement record if student is placed and has placement data
          const company = getValue(row, 'company');
          const packageValue = parseNumber(getValue(row, 'package'), 0);
          const placementDate = getValue(row, 'placementDate');

          if (status === 'placed' && company && packageValue > 0) {
            student.placementRecord = {
              id: `placement_import_${Date.now()}_${index}`,
              studentName: student.studentName,
              rollNumber: student.rollNumber,
              department: student.department,
              company,
              package: packageValue,
              placementDate: placementDate || new Date().toISOString().split('T')[0],
              mentorId: student.mentorId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }

          return student;
        });

        resolve(students);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Template generator for Excel import
export const generateExcelTemplate = (departmentNames?: string[]) => {
  // Use provided department names or fallback to default
  const departments = departmentNames || [
    'Computer Science',
    'Information Technology', 
    'Electronics & Communication',
    'Mechanical Engineering'
  ];
  
  const templateData = [
    {
      'Roll Number': '2024CS001',
      'Student Name': 'John Doe',
      'Email': 'john.doe@student.university.edu',
      'Mobile Number': '+1-555-0123',
      'Department': departments[0],
      'Section': 'A',
      'Mentor ID': '2',
      '10th Percentage': '85.5',
      '12th Percentage': '78.2',
      'UG Percentage': '72.8',
      'Status': 'placed',
      'Company': 'Google',
      'Package (LPA)': '15.5',
      'Placement Date': '2024-03-15'
    },
    {
      'Roll Number': '2024IT002',
      'Student Name': 'Jane Smith',
      'Email': 'jane.smith@student.university.edu',
      'Mobile Number': '+1-555-0124',
      'Department': departments[1] || 'Information Technology',
      'Section': 'B',
      'Mentor ID': '3',
      '10th Percentage': '92.0',
      '12th Percentage': '88.5',
      'UG Percentage': '85.2',
      'Status': 'eligible',
      'Company': '',
      'Package (LPA)': '',
      'Placement Date': ''
    },
    {
      'Roll Number': '2024ME003',
      'Student Name': 'Mike Johnson',
      'Email': 'mike.johnson@student.university.edu',
      'Mobile Number': '+1-555-0125',
      'Department': departments[2] || 'Mechanical Engineering',
      'Section': 'C',
      'Mentor ID': '4',
      '10th Percentage': '65.0',
      '12th Percentage': '70.5',
      'UG Percentage': '68.8',
      'Status': 'higher_studies',
      'Company': '',
      'Package (LPA)': '',
      'Placement Date': ''
    }
  ];

  exportToExcel(templateData, 'student_import_template.xlsx');
};