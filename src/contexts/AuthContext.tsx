import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useEnvironment } from './EnvironmentContext';
import { useDepartments } from '../utils/departmentUtils';
import { supabase, DatabaseMentor } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  mentors: User[];
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addMentor: (mentor: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMentor: (id: string, mentor: Partial<User>) => Promise<void>;
  deleteMentor: (id: string) => Promise<void>;
  resetMentorPassword: (id: string, newPassword: string) => Promise<void>;
  getMentorById: (id: string) => User | undefined;
  getActiveMentors: () => User[];
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert database mentor to app user format
const convertDatabaseMentor = (dbMentor: DatabaseMentor): User => {
  return {
    id: dbMentor.id,
    username: dbMentor.username,
    role: 'mentor',
    name: dbMentor.name,
    email: dbMentor.email,
    phone: dbMentor.phone,
    department: dbMentor.department,
    isActive: dbMentor.is_active,
    createdAt: dbMentor.created_at,
    updatedAt: dbMentor.updated_at,
  };
};

// For now, we'll use a simple admin user (in production, this should also be in database)
const defaultAdmin: User = {
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
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeDepartments } = useDepartments();
  const [user, setUser] = useState<User | null>(null);
  const [mentors, setMentors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load mentors from database
  const loadMentors = async () => {
    try {
      setError(null);
      const { data, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .order('name');

      if (mentorsError) throw mentorsError;

      const convertedMentors = data.map(convertDatabaseMentor);
      setMentors([defaultAdmin, ...convertedMentors]);
    } catch (err) {
      console.error('Error loading mentors:', err);
      setError('Failed to load mentors. Please try again.');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await loadMentors();
      
      // Check if user is logged in
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (err) {
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Simple password check (in production, use proper authentication)
      const allUsers = mentors;
      
      const foundUser = allUsers.find(u => {
        const usernameMatch = u.username.toLowerCase() === usernameOrEmail.toLowerCase();
        const emailMatch = u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase();
        return (usernameMatch || emailMatch) && u.isActive;
      });

      if (foundUser) {
        // Simple password check (admin123 for admin, mentor123 for mentors)
        const expectedPassword = foundUser.role === 'admin' ? 'admin123' : 'mentor123';
        
        if (password === expectedPassword) {
          setUser(foundUser);
          localStorage.setItem('user', JSON.stringify(foundUser));
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const addMentor = async (mentorData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('mentors')
        .insert([{
          username: mentorData.username,
          name: mentorData.name,
          email: mentorData.email,
          phone: mentorData.phone,
          department: mentorData.department,
          is_active: mentorData.isActive,
        }])
        .select()
        .single();

      if (error) throw error;

      const newMentor = convertDatabaseMentor(data);
      setMentors(prev => [...prev, newMentor]);
    } catch (err) {
      console.error('Error adding mentor:', err);
      setError('Failed to add mentor. Please try again.');
      throw err;
    }
  };

  const updateMentor = async (id: string, updatedMentor: Partial<User>) => {
    try {
      setError(null);
      
      if (id === defaultAdmin.id) {
        // Update admin user (in production, this should also be in database)
        const updatedAdmin = { ...defaultAdmin, ...updatedMentor, updatedAt: new Date().toISOString() };
        setMentors(prev => prev.map(mentor => 
          mentor.id === id ? updatedAdmin : mentor
        ));
        
        if (user?.id === id) {
          setUser(updatedAdmin);
          localStorage.setItem('user', JSON.stringify(updatedAdmin));
        }
        return;
      }

      // Update mentor in database
      const updateData: any = {};
      if (updatedMentor.name) updateData.name = updatedMentor.name;
      if (updatedMentor.email !== undefined) updateData.email = updatedMentor.email;
      if (updatedMentor.phone !== undefined) updateData.phone = updatedMentor.phone;
      if (updatedMentor.department !== undefined) updateData.department = updatedMentor.department;
      if (updatedMentor.isActive !== undefined) updateData.is_active = updatedMentor.isActive;

      const { data, error } = await supabase
        .from('mentors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedMentorData = convertDatabaseMentor(data);
      setMentors(prev => prev.map(mentor => 
        mentor.id === id ? updatedMentorData : mentor
      ));

      if (user?.id === id) {
        setUser(updatedMentorData);
        localStorage.setItem('user', JSON.stringify(updatedMentorData));
      }
    } catch (err) {
      console.error('Error updating mentor:', err);
      setError('Failed to update mentor. Please try again.');
      throw err;
    }
  };

  const deleteMentor = async (id: string) => {
    try {
      setError(null);
      
      if (id === defaultAdmin.id) {
        throw new Error('Cannot delete admin user');
      }

      const { error } = await supabase
        .from('mentors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMentors(prev => prev.filter(mentor => mentor.id !== id));

      if (user?.id === id) {
        logout();
      }
    } catch (err) {
      console.error('Error deleting mentor:', err);
      setError('Failed to delete mentor. Please try again.');
      throw err;
    }
  };

  const resetMentorPassword = async (id: string, newPassword: string) => {
    // In production, this would update the password in the database
    // For now, we'll just show a success message
    console.log(`Password reset for mentor ${id} to: ${newPassword}`);
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
      getActiveMentors,
      error,
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