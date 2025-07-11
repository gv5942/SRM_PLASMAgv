import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student } from '../types';
import { Department } from '../utils/departmentUtils';

interface Environment {
  id: string;
  name: string;
  adminUser: User;
  mentors: User[];
  students: Student[];
  departments: Department[];
  createdAt: string;
  isActive: boolean;
}

interface EnvironmentContextType {
  currentEnvironment: Environment | null;
  environments: Environment[];
  switchEnvironment: (environmentId: string) => void;
  createEnvironment: (environmentData: Omit<Environment, 'id' | 'createdAt'>) => void;
  updateEnvironment: (environmentId: string, updates: Partial<Environment>) => void;
  deleteEnvironment: (environmentId: string) => void;
  isLoading: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

// Default environments
const defaultEnvironments: Environment[] = [
  {
    id: 'env_1',
    name: 'SRM Institute - Main Campus',
    adminUser: {
      id: 'admin_1',
      username: 'admin',
      role: 'admin',
      name: 'Dr. Revathy Rajesh',
      email: 'revathys2@srmist.edu.in',
      phone: '+91 9840097317',
      department: 'Computer Science',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    mentors: [
      {
        id: 'mentor_1_1',
        username: 'mentor1',
        role: 'mentor',
        name: 'Dr. Rajesh Kumar',
        department: 'Computer Science',
        email: 'rajesh.kumar@srmist.edu.in',
        phone: '+91 9840097318',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'mentor_1_2',
        username: 'mentor2',
        role: 'mentor',
        name: 'Prof. Priya Sharma',
        department: 'Information Technology',
        email: 'priya.sharma@srmist.edu.in',
        phone: '+91 9840097319',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'mentor_1_3',
        username: 'mentor3',
        role: 'mentor',
        name: 'Dr. Amit Patel',
        department: 'Electronics & Communication',
        email: 'amit.patel@srmist.edu.in',
        phone: '+91 9840097320',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'mentor_1_4',
        username: 'mentor4',
        role: 'mentor',
        name: 'Prof. Sneha Gupta',
        department: 'Mechanical Engineering',
        email: 'sneha.gupta@srmist.edu.in',
        phone: '+91 9840097321',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    students: [],
    departments: [
      {
        id: 'dept_1_1',
        name: 'Computer Science',
        code: 'CS',
        description: 'Computer Science and Engineering',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'dept_1_2',
        name: 'Information Technology',
        code: 'IT',
        description: 'Information Technology',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'dept_1_3',
        name: 'Electronics & Communication',
        code: 'EC',
        description: 'Electronics and Communication Engineering',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'dept_1_4',
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Mechanical Engineering',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'dept_1_5',
        name: 'Civil Engineering',
        code: 'CE',
        description: 'Civil Engineering',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'dept_1_6',
        name: 'Electrical Engineering',
        code: 'EE',
        description: 'Electrical Engineering',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: 'env_2',
    name: 'SRM Institute - Satellite Campus',
    adminUser: {
      id: 'admin_2',
      username: 'admin2',
      role: 'admin',
      name: 'Dr. Suresh Babu',
      email: 'suresh.babu@srmist.edu.in',
      phone: '+91 9840097322',
      department: 'Engineering',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    mentors: [
      {
        id: 'mentor_2_1',
        username: 'mentor5',
        role: 'mentor',
        name: 'Dr. Lakshmi Narayan',
        department: 'Computer Science',
        email: 'lakshmi.narayan@srmist.edu.in',
        phone: '+91 9840097323',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'mentor_2_2',
        username: 'mentor6',
        role: 'mentor',
        name: 'Prof. Kavitha Reddy',
        department: 'Information Technology',
        email: 'kavitha.reddy@srmist.edu.in',
        phone: '+91 9840097324',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'mentor_2_3',
        username: 'mentor7',
        role: 'mentor',
        name: 'Dr. Venkat Rao',
        department: 'Electronics & Communication',
        email: 'venkat.rao@srmist.edu.in',
        phone: '+91 9840097325',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    students: [],
    departments: [
      {
        id: 'dept_2_1',
        name: 'Computer Science',
        code: 'CS',
        description: 'Computer Science and Engineering',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'dept_2_2',
        name: 'Information Technology',
        code: 'IT',
        description: 'Information Technology',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'dept_2_3',
        name: 'Electronics & Communication',
        code: 'EC',
        description: 'Electronics and Communication Engineering',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    isActive: true
  }
];

// Default passwords for each environment
const defaultEnvironmentPasswords: Record<string, Record<string, string>> = {
  'env_1': {
    'admin': 'admin123',
    'mentor1': 'mentor123',
    'mentor2': 'mentor123',
    'mentor3': 'mentor123',
    'mentor4': 'mentor123'
  },
  'env_2': {
    'admin2': 'admin123',
    'mentor5': 'mentor123',
    'mentor6': 'mentor123',
    'mentor7': 'mentor123'
  }
};

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load environments from localStorage or use defaults
    const storedEnvironments = localStorage.getItem('environments');
    const storedCurrentEnv = localStorage.getItem('currentEnvironment');

    if (storedEnvironments) {
      const envs = JSON.parse(storedEnvironments);
      setEnvironments(envs);
      
      if (storedCurrentEnv) {
        const currentEnv = envs.find((env: Environment) => env.id === storedCurrentEnv);
        setCurrentEnvironment(currentEnv || envs[0]);
      } else {
        setCurrentEnvironment(envs[0]);
      }
    } else {
      // Initialize with default environments
      setEnvironments(defaultEnvironments);
      setCurrentEnvironment(defaultEnvironments[0]);
      localStorage.setItem('environments', JSON.stringify(defaultEnvironments));
      localStorage.setItem('currentEnvironment', defaultEnvironments[0].id);
      
      // Set up passwords for default environments
      Object.entries(defaultEnvironmentPasswords).forEach(([envId, passwords]) => {
        localStorage.setItem(`passwords_${envId}`, JSON.stringify(passwords));
      });
    }

    setIsLoading(false);
  }, []);

  const switchEnvironment = (environmentId: string) => {
    const environment = environments.find(env => env.id === environmentId);
    if (environment) {
      setCurrentEnvironment(environment);
      localStorage.setItem('currentEnvironment', environmentId);
      
      // Clear current user session when switching environments
      localStorage.removeItem('user');
      
      // Reload the page to reset all contexts
      window.location.reload();
    }
  };

  const createEnvironment = (environmentData: Omit<Environment, 'id' | 'createdAt'>) => {
    const newEnvironment: Environment = {
      ...environmentData,
      id: `env_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedEnvironments = [...environments, newEnvironment];
    setEnvironments(updatedEnvironments);
    localStorage.setItem('environments', JSON.stringify(updatedEnvironments));

    // Set up default passwords for the new environment
    const defaultPasswords: Record<string, string> = {
      [newEnvironment.adminUser.username]: 'admin123'
    };
    
    newEnvironment.mentors.forEach(mentor => {
      defaultPasswords[mentor.username] = 'mentor123';
    });

    localStorage.setItem(`passwords_${newEnvironment.id}`, JSON.stringify(defaultPasswords));
  };

  const updateEnvironment = (environmentId: string, updates: Partial<Environment>) => {
    const updatedEnvironments = environments.map(env =>
      env.id === environmentId ? { ...env, ...updates } : env
    );
    
    setEnvironments(updatedEnvironments);
    localStorage.setItem('environments', JSON.stringify(updatedEnvironments));

    if (currentEnvironment?.id === environmentId) {
      setCurrentEnvironment({ ...currentEnvironment, ...updates });
    }
  };

  const deleteEnvironment = (environmentId: string) => {
    if (environments.length <= 1) {
      alert('Cannot delete the last environment. At least one environment must exist.');
      return;
    }

    const updatedEnvironments = environments.filter(env => env.id !== environmentId);
    setEnvironments(updatedEnvironments);
    localStorage.setItem('environments', JSON.stringify(updatedEnvironments));

    // Remove passwords for deleted environment
    localStorage.removeItem(`passwords_${environmentId}`);

    // If current environment is deleted, switch to first available
    if (currentEnvironment?.id === environmentId) {
      switchEnvironment(updatedEnvironments[0].id);
    }
  };

  return (
    <EnvironmentContext.Provider value={{
      currentEnvironment,
      environments,
      switchEnvironment,
      createEnvironment,
      updateEnvironment,
      deleteEnvironment,
      isLoading,
    }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};