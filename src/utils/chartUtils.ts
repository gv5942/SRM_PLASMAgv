import { Student, ChartData, DepartmentStats, MonthlyPlacement, KPIData, MentorStats } from '../types';
import { format, parseISO } from 'date-fns';

export const calculateKPIs = (students: Student[]): KPIData => {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      totalPlaced: 0,
      totalEligible: 0,
      totalIneligible: 0,
      higherStudies: 0,
      averagePackage: 0,
      topCompany: '',
      topPackage: 0,
      placementRate: 0,
    };
  }

  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.status === 'placed');
  const eligibleStudents = students.filter(s => s.status === 'eligible');
  const ineligibleStudents = students.filter(s => s.status === 'ineligible');
  const higherStudiesStudents = students.filter(s => s.status === 'higher_studies');

  const totalPlaced = placedStudents.length;
  const averagePackage = placedStudents.length > 0 
    ? placedStudents.reduce((sum, student) => sum + (student.placementRecord?.package || 0), 0) / placedStudents.length
    : 0;
  
  const topPackage = placedStudents.length > 0 
    ? Math.max(...placedStudents.map(student => student.placementRecord?.package || 0))
    : 0;
  
  const companyCount = placedStudents.reduce((acc, student) => {
    const company = student.placementRecord?.company;
    if (company) {
      acc[company] = (acc[company] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topCompany = Object.keys(companyCount).length > 0 
    ? Object.entries(companyCount).reduce((a, b) => companyCount[a[0]] > companyCount[b[0]] ? a : b)[0]
    : '';

  const placementRate = totalStudents > 0 ? (totalPlaced / totalStudents) * 100 : 0;

  return {
    totalStudents,
    totalPlaced,
    totalEligible: eligibleStudents.length,
    totalIneligible: ineligibleStudents.length,
    higherStudies: higherStudiesStudents.length,
    averagePackage: Math.round(averagePackage * 100) / 100,
    topCompany,
    topPackage,
    placementRate: Math.round(placementRate * 100) / 100,
  };
};

export const getDepartmentStats = (students: Student[]): DepartmentStats[] => {
  const departmentMap = students.reduce((acc, student) => {
    if (!acc[student.department]) {
      acc[student.department] = [];
    }
    acc[student.department].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  return Object.entries(departmentMap).map(([department, deptStudents]) => {
    const placedStudents = deptStudents.filter(s => s.status === 'placed');
    const eligibleStudents = deptStudents.filter(s => s.status === 'eligible');
    const ineligibleStudents = deptStudents.filter(s => s.status === 'ineligible');
    const higherStudiesStudents = deptStudents.filter(s => s.status === 'higher_studies');

    const averagePackage = placedStudents.length > 0
      ? placedStudents.reduce((sum, s) => sum + (s.placementRecord?.package || 0), 0) / placedStudents.length
      : 0;

    const topPackage = placedStudents.length > 0
      ? Math.max(...placedStudents.map(s => s.placementRecord?.package || 0))
      : 0;

    return {
      department,
      placed: placedStudents.length,
      eligible: eligibleStudents.length,
      ineligible: ineligibleStudents.length,
      higherStudies: higherStudiesStudents.length,
      averagePackage: Math.round(averagePackage * 100) / 100,
      topPackage,
    };
  });
};

export const getMonthlyPlacements = (students: Student[]): MonthlyPlacement[] => {
  const placedStudents = students.filter(s => s.status === 'placed' && s.placementRecord);
  
  const monthlyMap = placedStudents.reduce((acc, student) => {
    if (student.placementRecord) {
      const month = format(parseISO(student.placementRecord.placementDate), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(student);
    }
    return acc;
  }, {} as Record<string, Student[]>);

  return Object.entries(monthlyMap)
    .map(([month, monthStudents]) => ({
      month,
      placed: monthStudents.length,
      averagePackage: Math.round((monthStudents.reduce((sum, s) => sum + (s.placementRecord?.package || 0), 0) / monthStudents.length) * 100) / 100,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};

export const getCompanyWiseData = (students: Student[]): ChartData[] => {
  const placedStudents = students.filter(s => s.status === 'placed' && s.placementRecord);
  
  const companyMap = placedStudents.reduce((acc, student) => {
    const company = student.placementRecord?.company;
    if (company) {
      if (!acc[company]) {
        acc[company] = { count: 0, totalPackage: 0 };
      }
      acc[company].count += 1;
      acc[company].totalPackage += student.placementRecord?.package || 0;
    }
    return acc;
  }, {} as Record<string, { count: number; totalPackage: number }>);

  return Object.entries(companyMap)
    .map(([company, data]) => ({
      name: company,
      value: data.count,
      package: Math.round((data.totalPackage / data.count) * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
};

export const getPackageDistribution = (students: Student[]): ChartData[] => {
  const placedStudents = students.filter(s => s.status === 'placed' && s.placementRecord);
  
  const ranges = [
    { label: '0-5 LPA', min: 0, max: 5 },
    { label: '5-10 LPA', min: 5, max: 10 },
    { label: '10-15 LPA', min: 10, max: 15 },
    { label: '15-25 LPA', min: 15, max: 25 },
    { label: '25-50 LPA', min: 25, max: 50 },
    { label: '50+ LPA', min: 50, max: Infinity },
  ];

  return ranges.map(range => ({
    name: range.label,
    value: placedStudents.filter(student => {
      const pkg = student.placementRecord?.package || 0;
      return pkg >= range.min && pkg < range.max;
    }).length,
  }));
};

export const getStatusDistribution = (students: Student[]): ChartData[] => {
  const statusCounts = students.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusLabels = {
    placed: 'Placed',
    eligible: 'Eligible',
    ineligible: 'Ineligible',
    higher_studies: 'Higher Studies',
  };

  return Object.entries(statusCounts).map(([status, count]) => ({
    name: statusLabels[status as keyof typeof statusLabels] || status,
    value: count,
  }));
};

export const getMentorStats = (students: Student[], mentors: any[]): MentorStats[] => {
  return mentors.map(mentor => {
    const mentorStudents = students.filter(s => s.mentorId === mentor.id);
    const placedStudents = mentorStudents.filter(s => s.status === 'placed');
    const eligibleStudents = mentorStudents.filter(s => s.status === 'eligible');
    const ineligibleStudents = mentorStudents.filter(s => s.status === 'ineligible');
    const higherStudiesStudents = mentorStudents.filter(s => s.status === 'higher_studies');

    const placementRate = mentorStudents.length > 0 
      ? (placedStudents.length / mentorStudents.length) * 100 
      : 0;

    return {
      mentorId: mentor.id,
      mentorName: mentor.name,
      totalStudents: mentorStudents.length,
      placed: placedStudents.length,
      eligible: eligibleStudents.length,
      ineligible: ineligibleStudents.length,
      higherStudies: higherStudiesStudents.length,
      placementRate: Math.round(placementRate * 100) / 100,
    };
  });
};