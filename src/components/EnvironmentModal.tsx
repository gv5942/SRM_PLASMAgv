import React, { useState } from 'react';
import { X, Building, User, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { useEnvironment } from '../contexts/EnvironmentContext';
import { User as UserType } from '../types';
import { Department, getDefaultDepartments } from '../utils/departmentUtils';

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnvironmentModal: React.FC<EnvironmentModalProps> = ({ isOpen, onClose }) => {
  const { createEnvironment } = useEnvironment();
  
  const [formData, setFormData] = useState({
    name: '',
    adminUser: {
      username: '',
      name: '',
      email: '',
      phone: '',
      department: '',
    },
    mentors: [
      {
        username: '',
        name: '',
        email: '',
        phone: '',
        department: '',
      }
    ]
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create admin user
    const adminUser: UserType = {
      id: `admin_${Date.now()}`,
      username: formData.adminUser.username,
      role: 'admin',
      name: formData.adminUser.name,
      email: formData.adminUser.email,
      phone: formData.adminUser.phone,
      department: formData.adminUser.department,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create mentor users
    const mentors: UserType[] = formData.mentors
      .filter(mentor => mentor.username && mentor.name)
      .map((mentor, index) => ({
        id: `mentor_${Date.now()}_${index}`,
        username: mentor.username,
        role: 'mentor',
        name: mentor.name,
        email: mentor.email,
        phone: mentor.phone,
        department: mentor.department,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    // Create environment
    createEnvironment({
      name: formData.name,
      adminUser,
      mentors,
      students: [],
      departments: getDefaultDepartments(),
      isActive: true,
    });

    // Reset form and close modal
    setFormData({
      name: '',
      adminUser: {
        username: '',
        name: '',
        email: '',
        phone: '',
        department: '',
      },
      mentors: [
        {
          username: '',
          name: '',
          email: '',
          phone: '',
          department: '',
        }
      ]
    });
    
    onClose();
  };

  const addMentor = () => {
    setFormData({
      ...formData,
      mentors: [
        ...formData.mentors,
        {
          username: '',
          name: '',
          email: '',
          phone: '',
          department: '',
        }
      ]
    });
  };

  const removeMentor = (index: number) => {
    if (formData.mentors.length > 1) {
      setFormData({
        ...formData,
        mentors: formData.mentors.filter((_, i) => i !== index)
      });
    }
  };

  const updateMentor = (index: number, field: string, value: string) => {
    const updatedMentors = formData.mentors.map((mentor, i) =>
      i === index ? { ...mentor, [field]: value } : mentor
    );
    setFormData({ ...formData, mentors: updatedMentors });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create New Environment</h2>
                <p className="text-sm text-gray-600">Set up a new admin environment with mentors</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Environment Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Environment Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Environment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., SRM Institute - North Campus"
                />
              </div>
            </div>

            {/* Admin User */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Administrator Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminUser.username}
                    onChange={(e) => setFormData({
                      ...formData,
                      adminUser: { ...formData.adminUser, username: e.target.value }
                    })}
                    className="input-field"
                    placeholder="e.g., admin3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminUser.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      adminUser: { ...formData.adminUser, name: e.target.value }
                    })}
                    className="input-field"
                    placeholder="e.g., Dr. John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.adminUser.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      adminUser: { ...formData.adminUser, email: e.target.value }
                    })}
                    className="input-field"
                    placeholder="john.smith@university.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.adminUser.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      adminUser: { ...formData.adminUser, phone: e.target.value }
                    })}
                    className="input-field"
                    placeholder="+91 9840097317"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.adminUser.department}
                    onChange={(e) => setFormData({
                      ...formData,
                      adminUser: { ...formData.adminUser, department: e.target.value }
                    })}
                    className="select-field"
                    aria-label="Department"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Mentors */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Mentors</h3>
                <button
                  type="button"
                  onClick={addMentor}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Mentor</span>
                </button>
              </div>

              <div className="space-y-6">
                {formData.mentors.map((mentor, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Mentor {index + 1}
                      </h4>
                      {formData.mentors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMentor(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Remove Mentor"
                          aria-label="Remove Mentor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username *
                        </label>
                        <input
                          type="text"
                          required
                          value={mentor.username}
                          onChange={(e) => updateMentor(index, 'username', e.target.value)}
                          className="input-field"
                          placeholder={`e.g., mentor${index + 5}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={mentor.name}
                          onChange={(e) => updateMentor(index, 'name', e.target.value)}
                          className="input-field"
                          placeholder="e.g., Prof. Jane Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={mentor.email}
                          onChange={(e) => updateMentor(index, 'email', e.target.value)}
                          className="input-field"
                          placeholder="jane.doe@university.edu"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={mentor.phone}
                          onChange={(e) => updateMentor(index, 'phone', e.target.value)}
                          className="input-field"
                          placeholder="+91 9840097318"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          value={mentor.department}
                          onChange={(e) => updateMentor(index, 'department', e.target.value)}
                          className="select-field"
                          aria-label="Department"
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Default Credentials Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Default Login Credentials</p>
                  <div className="space-y-1">
                    <p><strong>Admin Password:</strong> admin123</p>
                    <p><strong>Mentor Password:</strong> mentor123</p>
                    <p className="text-xs text-blue-600 mt-2">
                      All users can change their passwords after first login. Admins can reset passwords anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Create Environment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentModal;