import { useEnvironment } from '../contexts/EnvironmentContext';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default departments that will be used when no custom departments are set
const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dept_1',
    name: 'Computer Science',
    code: 'CS',
    description: 'Computer Science and Engineering',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'dept_2',
    name: 'Information Technology',
    code: 'IT',
    description: 'Information Technology',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'dept_3',
    name: 'Electronics & Communication',
    code: 'EC',
    description: 'Electronics and Communication Engineering',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'dept_4',
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Mechanical Engineering',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'dept_5',
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Civil Engineering',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'dept_6',
    name: 'Electrical Engineering',
    code: 'EE',
    description: 'Electrical Engineering',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'dept_7',
    name: 'Chemical Engineering',
    code: 'CH',
    description: 'Chemical Engineering',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'dept_8',
    name: 'Biotechnology',
    code: 'BT',
    description: 'Biotechnology',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Function to get default departments
export const getDefaultDepartments = (): Department[] => {
  return DEFAULT_DEPARTMENTS;
};

// Hook to get departments from current environment or fallback to defaults
export const useDepartments = () => {
  const { currentEnvironment } = useEnvironment();
  
  // Use departments from current environment or fallback to defaults
  const departments = currentEnvironment?.departments || DEFAULT_DEPARTMENTS;
  const activeDepartments = departments.filter(dept => dept.isActive);
  const departmentNames = activeDepartments.map(dept => dept.name);
  
  return {
    departments,
    activeDepartments,
    departmentNames,
    getDepartmentByName: (name: string) => departments.find(dept => dept.name === name),
    getDepartmentById: (id: string) => departments.find(dept => dept.id === id),
  };
};