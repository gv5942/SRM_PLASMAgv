import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlacementRecord, Student, FilterOptions } from '../types';
import { generateMockStudents } from '../utils/mockData';
import { useAuth } from './AuthContext';
import { useEnvironment } from './EnvironmentContext';
import { useDepartments } from '../utils/departmentUtils';

interface DataContextType {
  students: Student[];
  filteredStudents: Student[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addPlacementRecord: (studentId: string, record: Omit<PlacementRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlacementRecord: (studentId: string, record: Partial<PlacementRecord>) => void;
  importStudents: (students: Student[]) => void;
  clearFilters: () => void;
  getStudentsByMentor: (mentorId: string) => Student[];
  getMentorStudents: () => Student[];
  showMyStudentsOnly: boolean;
  setShowMyStudentsOnly: (show: boolean) => void;
  showInactiveDepartments: boolean;
  setShowInactiveDepartments: (show: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialFilters: FilterOptions = {
  department: '',
  section: '',
  company: '',
  year: '',
  mentor: '',
  status: '',
  packageRange: { min: 0, max: 0 },
  dateRange: { start: '', end: '' },
  search: '',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentEnvironment, updateEnvironment } = useEnvironment();
  const { activeDepartments, departments } = useDepartments();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [showMyStudentsOnly, setShowMyStudentsOnly] = useState(false);
  const [showInactiveDepartments, setShowInactiveDepartments] = useState(false);

  useEffect(() => {
    if (currentEnvironment) {
      // Load students from current environment
      if (currentEnvironment.students.length === 0) {
        // Generate mock data for new environment
        const mockData = generateMockStudents(currentEnvironment.mentors.map(m => m.id));
        setStudents(mockData);
        updateEnvironment(currentEnvironment.id, { students: mockData });
      } else {
        setStudents(currentEnvironment.students);
      }
    }
  }, [currentEnvironment]);

  useEffect(() => {
    // Apply filters whenever filters, students, user, or showMyStudentsOnly changes
    let filtered = [...students];

    // Filter out students from inactive departments unless explicitly showing them
    if (!showInactiveDepartments) {
      const activeDepartmentNames = activeDepartments.map(dept => dept.name);
      filtered = filtered.filter(student => 
        activeDepartmentNames.includes(student.department)
      );
    }
    // First apply mentor filter if showMyStudentsOnly is true
    if (user?.role === 'mentor' && showMyStudentsOnly) {
      filtered = filtered.filter(student => student.mentorId === user.id);
    }

    // Then apply all other filters
    if (filters.department) {
      filtered = filtered.filter(student => 
        student.department.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    if (filters.section) {
      filtered = filtered.filter(student => 
        student.section === filters.section
      );
    }
    if (filters.company && filters.company !== '') {
      filtered = filtered.filter(student => 
        student.placementRecord?.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    if (filters.year) {
      filtered = filtered.filter(student => 
        student.placementRecord && 
        new Date(student.placementRecord.placementDate).getFullYear().toString() === filters.year
      );
    }

    if (filters.mentor && user?.role === 'admin') {
      filtered = filtered.filter(student => student.mentorId === filters.mentor);
    }

    if (filters.status) {
      filtered = filtered.filter(student => student.status === filters.status);
    }

    if (filters.packageRange.min > 0 || filters.packageRange.max > 0) {
      filtered = filtered.filter(student => {
        if (!student.placementRecord) return false;
        const pkg = student.placementRecord.package;
        const min = filters.packageRange.min || 0;
        const max = filters.packageRange.max || Infinity;
        return pkg >= min && pkg <= max;
      });
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(student => {
        if (!student.placementRecord) return false;
        const date = new Date(student.placementRecord.placementDate);
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        return date >= start && date <= end;
      });
    }

    if (filters.search) {
      filtered = filtered.filter(student => 
        student.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.department.toLowerCase().includes(filters.search.toLowerCase()) ||
        (student.placementRecord?.company.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredStudents(filtered);
  }, [students, filters, user, showMyStudentsOnly, showInactiveDepartments, activeDepartments]);

  const saveStudentsToEnvironment = (updatedStudents: Student[]) => {
    if (currentEnvironment) {
      updateEnvironment(currentEnvironment.id, { students: updatedStudents });
    }
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `student_${currentEnvironment?.id}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    saveStudentsToEnvironment(updatedStudents);
  };

  const updateStudent = (id: string, updatedStudent: Partial<Student>) => {
    const updatedStudents = students.map(student => 
      student.id === id 
        ? { ...student, ...updatedStudent, updatedAt: new Date().toISOString() }
        : student
    );
    setStudents(updatedStudents);
    saveStudentsToEnvironment(updatedStudents);
  };

  const deleteStudent = (id: string) => {
    const updatedStudents = students.filter(student => student.id !== id);
    setStudents(updatedStudents);
    saveStudentsToEnvironment(updatedStudents);
  };

  const addPlacementRecord = (studentId: string, recordData: Omit<PlacementRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: PlacementRecord = {
      ...recordData,
      id: `placement_${currentEnvironment?.id}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedStudents = students.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            status: 'placed' as const,
            placementRecord: newRecord,
            updatedAt: new Date().toISOString()
          }
        : student
    );
    setStudents(updatedStudents);
    saveStudentsToEnvironment(updatedStudents);
  };

  const updatePlacementRecord = (studentId: string, updatedRecord: Partial<PlacementRecord>) => {
    const updatedStudents = students.map(student => 
      student.id === studentId && student.placementRecord
        ? { 
            ...student, 
            placementRecord: { 
              ...student.placementRecord, 
              ...updatedRecord, 
              updatedAt: new Date().toISOString() 
            },
            updatedAt: new Date().toISOString()
          }
        : student
    );
    setStudents(updatedStudents);
    saveStudentsToEnvironment(updatedStudents);
  };

  const importStudents = (newStudents: Student[]) => {
    const studentsWithIds = newStudents.map(student => ({
      ...student,
      id: student.id || `import_${currentEnvironment?.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: student.createdAt || new Date().toISOString(),
      updatedAt: student.updatedAt || new Date().toISOString(),
    }));
    const updatedStudents = [...students, ...studentsWithIds];
    setStudents(updatedStudents);
    saveStudentsToEnvironment(updatedStudents);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setShowMyStudentsOnly(false);
    setShowInactiveDepartments(false);
  };

  const getStudentsByMentor = (mentorId: string) => {
    return students.filter(student => student.mentorId === mentorId);
  };

  // Get only the mentor's assigned students for management purposes
  const getMentorStudents = () => {
    if (user?.role === 'mentor') {
      return students.filter(student => student.mentorId === user.id);
    }
    return students;
  };

  return (
    <DataContext.Provider value={{
      students,
      filteredStudents,
      filters,
      setFilters,
      addStudent,
      updateStudent,
      deleteStudent,
      addPlacementRecord,
      updatePlacementRecord,
      importStudents,
      clearFilters,
      getStudentsByMentor,
      getMentorStudents,
      showMyStudentsOnly,
      setShowMyStudentsOnly,
      showInactiveDepartments,
      setShowInactiveDepartments,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};