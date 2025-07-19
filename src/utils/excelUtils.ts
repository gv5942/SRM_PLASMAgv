import * as XLSX from 'xlsx';

// Helper function to export data to CSV
export function exportToCSV(data: any[], filename: string = 'export.csv'): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper function to convert Excel date serial to YYYY-MM-DD string
function convertExcelDateToString(excelDate: any): string | null {
  if (!excelDate) return null;
  
  try {
    // If it's already a string, return as is
    if (typeof excelDate === 'string') {
      return excelDate;
    }
    
    // If it's a number (Excel date serial), convert it
    if (typeof excelDate === 'number') {
      const date = XLSX.SSF.parse_date_code(excelDate);
      if (date) {
        const year = date.y;
        const month = String(date.m).padStart(2, '0');
        const day = String(date.d).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error converting Excel date:', error);
    return null;
  }
}

// Helper function to map department names to active departments
function mapDepartmentName(importedDept: string, availableDepartments: any[]): string {
  if (!importedDept || !availableDepartments.length) {
    return availableDepartments[0]?.name || 'Unknown';
  }

  const deptLower = importedDept.toLowerCase().trim();
  
  // Department mapping with common variations
  const departmentMappings: { [key: string]: string[] } = {
    'Computer Science': ['cs', 'cse', 'computer science', 'computer science and engineering', 'comp sci'],
    'Electronics and Communication': ['ece', 'electronics', 'electronics and communication', 'electronics and communication engineering'],
    'Mechanical Engineering': ['me', 'mech', 'mechanical', 'mechanical engineering'],
    'Civil Engineering': ['ce', 'civil', 'civil engineering'],
    'Electrical Engineering': ['ee', 'electrical', 'electrical engineering'],
    'Information Technology': ['it', 'info tech', 'information technology'],
    'Chemical Engineering': ['che', 'chemical', 'chemical engineering'],
    'Biotechnology': ['bt', 'biotech', 'biotechnology'],
    'Aerospace Engineering': ['ae', 'aerospace', 'aerospace engineering'],
    'Automobile Engineering': ['auto', 'automobile', 'automobile engineering']
  };

  // First try exact match with available departments
  for (const dept of availableDepartments) {
    if (dept.name.toLowerCase() === deptLower) {
      return dept.name;
    }
  }

  // Then try mapping variations
  for (const [standardName, variations] of Object.entries(departmentMappings)) {
    if (variations.includes(deptLower)) {
      // Find if this standard name exists in available departments
      const matchedDept = availableDepartments.find(dept => 
        dept.name.toLowerCase().includes(standardName.toLowerCase()) ||
        standardName.toLowerCase().includes(dept.name.toLowerCase())
      );
      if (matchedDept) {
        return matchedDept.name;
      }
    }
  }

  // Fallback to partial matching
  for (const dept of availableDepartments) {
    if (dept.name.toLowerCase().includes(deptLower) || deptLower.includes(dept.name.toLowerCase())) {
      return dept.name;
    }
  }

  // If no match found, return the first available department
  return availableDepartments[0]?.name || 'Unknown';
}

// Helper function to convert percentage to CGPA scale (100 to 10)
function convertPercentageToCGPA(value: number): number {
  if (value > 10) {
    return Number((value / 10).toFixed(2));
  }
  return value;
}

// Helper function to determine eligibility based on academic performance
function determineEligibility(tenthPercentage: number, twelfthPercentage: number, ugPercentage: number, cgpa?: number): string {
  const minTenth = 60;
  const minTwelfth = 60;
  const minUG = 6.0; // Out of 10
  const minCGPA = 6.0; // Out of 10

  if (tenthPercentage >= minTenth && 
      twelfthPercentage >= minTwelfth && 
      ugPercentage >= minUG && 
      (!cgpa || cgpa >= minCGPA)) {
    return 'eligible';
  }
  return 'not_eligible';
}

export function parseStudentsFromExcel(file: File, availableDepartments: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const students = jsonData.map((row: any) => {
          // Convert UG percentage from 100 scale to 10 scale if needed
          const ugPercentage = convertPercentageToCGPA(Number(row['UG Percentage'] || row['ug_percentage'] || 0));
          const cgpa = row['CGPA'] || row['cgpa'] ? convertPercentageToCGPA(Number(row['CGPA'] || row['cgpa'])) : null;

          const student = {
            roll_number: String(row['Roll Number'] || row['roll_number'] || ''),
            student_name: String(row['Student Name'] || row['student_name'] || ''),
            email: String(row['Email'] || row['email'] || ''),
            personal_email: String(row['Personal Email'] || row['personal_email'] || ''),
            mobile_number: String(row['Mobile Number'] || row['mobile_number'] || ''),
            department: mapDepartmentName(String(row['Department'] || row['department'] || ''), availableDepartments),
            section: String(row['Section'] || row['section'] || ''),
            gender: String(row['Gender'] || row['gender'] || ''),
            date_of_birth: convertExcelDateToString(row['Date of Birth'] || row['date_of_birth']),
            number_of_backlogs: Number(row['Number of Backlogs'] || row['number_of_backlogs'] || 0),
            resume_link: String(row['Resume Link'] || row['resume_link'] || ''),
            photo_url: String(row['Photo URL'] || row['photo_url'] || ''),
            mentor_id: String(row['Mentor ID'] || row['mentor_id'] || ''),
            tenth_percentage: Number(row['10th Percentage'] || row['tenth_percentage'] || 0),
            twelfth_percentage: Number(row['12th Percentage'] || row['twelfth_percentage'] || 0),
            ug_percentage: ugPercentage,
            cgpa: cgpa,
            status: determineEligibility(
              Number(row['10th Percentage'] || row['tenth_percentage'] || 0),
              Number(row['12th Percentage'] || row['twelfth_percentage'] || 0),
              ugPercentage,
              cgpa
            )
          };

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
}

export function parsePlacementsFromExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const placements = jsonData.map((row: any) => ({
          student_id: String(row['Student ID'] || row['student_id'] || ''),
          company_name: String(row['Company Name'] || row['company_name'] || ''),
          job_role: String(row['Job Role'] || row['job_role'] || ''),
          package_lpa: Number(row['Package (LPA)'] || row['package_lpa'] || 0),
          placement_date: convertExcelDateToString(row['Placement Date'] || row['placement_date']),
          placement_type: String(row['Placement Type'] || row['placement_type'] || 'full_time'),
          status: String(row['Status'] || row['status'] || 'placed')
        }));

        resolve(placements);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function generateExcelTemplate(): void {
  const studentTemplate = [
    {
      'Roll Number': 'CS001',
      'Student Name': 'John Doe',
      'Email': 'john.doe@college.edu',
      'Personal Email': 'john.doe@gmail.com',
      'Mobile Number': '9876543210',
      'Department': 'Computer Science',
      'Section': 'A',
      'Gender': 'Male',
      'Date of Birth': '2000-01-15',
      'Number of Backlogs': 0,
      'Resume Link': 'https://example.com/resume.pdf',
      'Photo URL': 'https://example.com/photo.jpg',
      'Mentor ID': 'MENTOR001',
      '10th Percentage': 85.5,
      '12th Percentage': 88.2,
      'UG Percentage': 75.8,
      'CGPA': 7.58
    }
  ];

  const ws = XLSX.utils.json_to_sheet(studentTemplate);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, 'student_template.xlsx');
}