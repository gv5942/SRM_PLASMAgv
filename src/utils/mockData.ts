import { Student } from '../types';

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
];

const companies = [
  'Google',
  'Microsoft',
  'Amazon',
  'Apple',
  'Meta',
  'Netflix',
  'Tesla',
  'Uber',
  'Airbnb',
  'Spotify',
  'Adobe',
  'Salesforce',
  'Oracle',
  'IBM',
  'Intel',
  'NVIDIA',
  'Cisco',
  'VMware',
  'ServiceNow',
  'Palantir',
  'Infosys',
  'TCS',
  'Wipro',
  'Accenture',
  'Deloitte',
];

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Priya', 'Kavya', 'Aanya', 'Ira', 'Myra', 'Sara', 'Riya', 'Aditi',
  'Rahul', 'Rohan', 'Amit', 'Vikram', 'Suresh', 'Rajesh', 'Kiran', 'Deepak', 'Manoj', 'Sandeep',
  'Sneha', 'Pooja', 'Meera', 'Nisha', 'Kavita', 'Sunita', 'Rekha', 'Geeta', 'Sita', 'Rita',
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Agarwal', 'Jain', 'Patel', 'Shah', 'Mehta',
  'Reddy', 'Rao', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Das', 'Roy', 'Ghosh', 'Banerjee',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomPackage(): number {
  const packages = [
    3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0,
    12.0, 15.0, 18.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0, 60.0, 75.0, 100.0
  ];
  return getRandomElement(packages);
}

function getRandomPercentage(min: number = 45, max: number = 95): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateRollNumber(dept: string, year: number, index: number): string {
  const deptCodes: { [key: string]: string } = {
    'Computer Science': 'CS',
    'Information Technology': 'IT',
    'Electronics & Communication': 'EC',
    'Mechanical Engineering': 'ME',
    'Civil Engineering': 'CE',
    'Electrical Engineering': 'EE',
    'Chemical Engineering': 'CH',
    'Biotechnology': 'BT',
  };
  
  const deptCode = deptCodes[dept] || 'XX';
  return `${year}${deptCode}${String(index).padStart(3, '0')}`;
}

function generateEmail(firstName: string, lastName: string, rollNumber: string): string {
  const cleanFirstName = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLastName = lastName.toLowerCase().replace(/\s+/g, '');
  return `${cleanFirstName}.${cleanLastName}@student.university.edu`;
}

function generateMobileNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1-${areaCode}-${exchange}-${number}`;
}

function determineEligibility(academicDetails: { tenthPercentage: number; twelfthPercentage: number; ugPercentage: number }): 'eligible' | 'ineligible' {
  const { tenthPercentage, twelfthPercentage, ugPercentage } = academicDetails;
  return (tenthPercentage >= 60 && twelfthPercentage >= 60 && ugPercentage >= 60) ? 'eligible' : 'ineligible';
}

export function generateMockStudents(mentorIds?: string[]): Student[] {
  // Use provided mentor IDs or default ones
  const availableMentorIds = mentorIds || ['mentor_1_1', 'mentor_1_2', 'mentor_1_3', 'mentor_1_4'];
  
  const students: Student[] = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 200; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const department = getRandomElement(departments);
    const mentorId = getRandomElement(availableMentorIds);
    const rollNumber = generateRollNumber(department, currentYear, i + 1);
    const email = generateEmail(firstName, lastName, rollNumber);
    const mobileNumber = generateMobileNumber();
    
    const academicDetails = {
      tenthPercentage: getRandomPercentage(50, 95),
      twelfthPercentage: getRandomPercentage(50, 95),
      ugPercentage: getRandomPercentage(55, 90),
    };

    // Determine status based on eligibility and random factors
    let status: 'placed' | 'eligible' | 'higher_studies' | 'ineligible';
    const eligibility = determineEligibility(academicDetails);
    
    if (eligibility === 'ineligible') {
      status = 'ineligible';
    } else {
      const rand = Math.random();
      if (rand < 0.4) {
        status = 'placed';
      } else if (rand < 0.7) {
        status = 'eligible';
      } else {
        status = 'higher_studies';
      }
    }

    const student: Student = {
      id: (i + 1).toString(),
      rollNumber,
      studentName: `${firstName} ${lastName}`,
      email,
      mobileNumber,
      department,
      mentorId,
      academicDetails,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add placement record if student is placed
    if (status === 'placed') {
      const placementDate = getRandomDate(startDate, endDate);
      student.placementRecord = {
        id: `placement_${i + 1}`,
        studentName: student.studentName,
        rollNumber: student.rollNumber,
        department: student.department,
        company: getRandomElement(companies),
        package: getRandomPackage(),
        placementDate: placementDate.toISOString().split('T')[0],
        mentorId: student.mentorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    students.push(student);
  }

  return students.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
}