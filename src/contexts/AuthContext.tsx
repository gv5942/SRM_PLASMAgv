import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useEnvironment } from './EnvironmentContext';
import { useDepartments } from '../utils/departmentUtils';

interface AuthContextType {
  user: User | null;
  mentors: User[];
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addMentor: (mentor: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMentor: (id: string, mentor: Partial<User>) => void;
  deleteMentor: (id: string) => void;
  resetMentorPassword: (id: string, newPassword: string) => void;
  getMentorById: (id: string) => User | undefined;
  getActiveMentors: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentEnvironment, updateEnvironment } = useEnvironment();
  const { activeDepartments } = useDepartments();
  const [user, setUser] = useState<User | null>(null);
  const [mentors, setMentors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentEnvironment) {
      // Set mentors from current environment
      const allUsers = [currentEnvironment.adminUser, ...currentEnvironment.mentors];
      setMentors(allUsers);

      // Check if user is logged in for this environment
      const storedUser = localStorage.getItem(`user_${currentEnvironment.id}`);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Verify user still exists in current environment
        const userExists = allUsers.find(u => u.id === parsedUser.id && u.isActive);
        if (userExists) {
          setUser(userExists);
        } else {
          localStorage.removeItem(`user_${currentEnvironment.id}`);
        }
      }
    }
    setIsLoading(false);
  }, [currentEnvironment]);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    if (!currentEnvironment) return false;

    try {
      const allUsers = [currentEnvironment.adminUser, ...currentEnvironment.mentors];
      const storedPasswords = JSON.parse(
        localStorage.getItem(`passwords_${currentEnvironment.id}`) || '{}'
      );

      console.log('Login attempt for environment:', currentEnvironment.name);
      console.log('Available users:', allUsers.map(u => ({ 
        id: u.id,
        username: u.username, 
        email: u.email, 
        name: u.name,
        active: u.isActive 
      })));

      // Find user by username or email (case insensitive)
      const foundUser = allUsers.find(u => {
        const usernameMatch = u.username.toLowerCase() === usernameOrEmail.toLowerCase();
        const emailMatch = u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase();
        return (usernameMatch || emailMatch) && u.isActive;
      });

      console.log('Found user:', foundUser);

      if (foundUser) {
        const userPassword = storedPasswords[foundUser.username];
        console.log('Expected password for', foundUser.username, ':', userPassword);

        if (userPassword === password) {
          setUser(foundUser);
          localStorage.setItem(`user_${currentEnvironment.id}`, JSON.stringify(foundUser));
          console.log('Login successful for:', foundUser.name);
          return true;
        } else {
          console.log('Password mismatch');
        }
      } else {
        console.log('User not found');
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    if (currentEnvironment) {
      localStorage.removeItem(`user_${currentEnvironment.id}`);
    }
    setUser(null);
  };

  const addMentor = (mentorData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentEnvironment) return;

    const newMentor: User = {
      ...mentorData,
      id: `mentor_${currentEnvironment.id}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMentors = [...currentEnvironment.mentors, newMentor];
    
    updateEnvironment(currentEnvironment.id, {
      mentors: updatedMentors
    });

    // Set default password
    const storedPasswords = JSON.parse(
      localStorage.getItem(`passwords_${currentEnvironment.id}`) || '{}'
    );
    storedPasswords[newMentor.username] = 'mentor123';
    localStorage.setItem(`passwords_${currentEnvironment.id}`, JSON.stringify(storedPasswords));
  };

  const updateMentor = (id: string, updatedMentor: Partial<User>) => {
    if (!currentEnvironment) return;

    let updatedUsers = [...mentors];
    
    // Update in mentors array
    updatedUsers = updatedUsers.map(mentor => 
      mentor.id === id 
        ? { ...mentor, ...updatedMentor, updatedAt: new Date().toISOString() }
        : mentor
    );

    // Update environment
    if (id === currentEnvironment.adminUser.id) {
      // Updating admin user
      updateEnvironment(currentEnvironment.id, {
        adminUser: { ...currentEnvironment.adminUser, ...updatedMentor, updatedAt: new Date().toISOString() }
      });
    } else {
      // Updating mentor
      const updatedMentors = currentEnvironment.mentors.map(mentor =>
        mentor.id === id 
          ? { ...mentor, ...updatedMentor, updatedAt: new Date().toISOString() }
          : mentor
      );
      updateEnvironment(currentEnvironment.id, {
        mentors: updatedMentors
      });
    }

    // Update current user if it's the same user being updated
    if (user?.id === id) {
      const updatedUser = { ...user, ...updatedMentor, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem(`user_${currentEnvironment.id}`, JSON.stringify(updatedUser));
    }
  };

  const deleteMentor = (id: string) => {
    if (!currentEnvironment) return;

    const updatedMentors = currentEnvironment.mentors.filter(mentor => mentor.id !== id);
    updateEnvironment(currentEnvironment.id, {
      mentors: updatedMentors
    });

    // Remove password
    const storedPasswords = JSON.parse(
      localStorage.getItem(`passwords_${currentEnvironment.id}`) || '{}'
    );
    const mentorToDelete = currentEnvironment.mentors.find(m => m.id === id);
    if (mentorToDelete) {
      delete storedPasswords[mentorToDelete.username];
      localStorage.setItem(`passwords_${currentEnvironment.id}`, JSON.stringify(storedPasswords));
    }

    // Logout if current user is being deleted
    if (user?.id === id) {
      logout();
    }
  };

  const resetMentorPassword = (id: string, newPassword: string) => {
    if (!currentEnvironment) return;

    const allUsers = [currentEnvironment.adminUser, ...currentEnvironment.mentors];
    const mentor = allUsers.find(m => m.id === id);
    if (mentor) {
      const storedPasswords = JSON.parse(
        localStorage.getItem(`passwords_${currentEnvironment.id}`) || '{}'
      );
      storedPasswords[mentor.username] = newPassword;
      localStorage.setItem(`passwords_${currentEnvironment.id}`, JSON.stringify(storedPasswords));
    }
  };

  const getMentorById = (id: string) => {
    return mentors.find(mentor => mentor.id === id);
  };

  const getActiveMentors = () => {
    const activeDepartmentNames = activeDepartments.map(dept => dept.name);
    return mentors.filter(mentor => 
      mentor.isActive && 
      (!mentor.department || activeDepartmentNames.includes(mentor.department))
    );
  };
  return (
    <AuthContext.Provider value={{ 
      user, 
      mentors, 
      login, 
      logout, 
      isLoading, 
      addMentor, 
      updateMentor, 
      deleteMentor, 
      resetMentorPassword,
      getMentorById,
      getActiveMentors
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
      getActiveMentors