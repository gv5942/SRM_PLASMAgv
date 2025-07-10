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

        const students: Student[] = jsonData.map((row: any, index: number) => {
          // Extract academic details
          const tenthPercentage = parseFloat(row['10th Percentage'] || row['tenthPercentage'] || '0');
          const twelfthPercentage = parseFloat(row['12th Percentage'] || row['twelfthPercentage'] || '0');
          const ugPercentage = parseFloat(row['UG Percentage'] || row['ugPercentage'] || '0');

          // Determine eligibility based on academic performance
          let status: 'placed' | 'eligible' | 'higher_studies' | 'ineligible' = 'eligible';
          const importedStatus = row['Status'] || row['status'] || '';
          
          if (tenthPercentage < 60 || twelfthPercentage < 60 || ugPercentage < 60) {
            status = 'ineligible';
          } else if (importedStatus.toLowerCase() === 'higher_studies' || importedStatus.toLowerCase() === 'higher studies') {
            status = 'higher_studies';
          } else if (importedStatus.toLowerCase() === 'placed') {
            status = 'placed';
          } else {
            status = 'eligible';
          }

          const student: Student = {
            id: `import_${Date.now()}_${index}`,
            rollNumber: row['Roll Number'] || row['rollNumber'] || `IMP${Date.now()}${index}`,
            studentName: row['Student Name'] || row['studentName'] || '',
            email: row['Email'] || row['email'] || row['Email Address'] || '',
            mobileNumber: row['Mobile Number'] || row['mobileNumber'] || row['Phone'] || row['phone'] || '',
            department: row['Department'] || row['department'] || '',
            section: row['Section'] || row['section'] || 'A',
            mentorId: row['Mentor ID'] || row['mentorId'] || '2', // Default to first mentor
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
          const company = row['Company'] || row['company'] || '';
          const packageValue = parseFloat(row['Package (LPA)'] || row['package'] || '0');
          const placementDate = row['Placement Date'] || row['placementDate'] || '';

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