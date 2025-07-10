import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Student } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useDepartments } from '../utils/departmentUtils';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  student?: Student | null;
}

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, onSave, student }) => {
  const { user, mentors } = useAuth();
  const { departmentNames } = useDepartments();
  const [formData, setFormData] = useState({
    rollNumber: '',
    studentName: '',
    email: '',
    mobileNumber: '',
    department: '',
    section: '',
    mentorId: user?.role === 'mentor' ? user.id : '',
    tenthPercentage: '',
    twelfthPercentage: '',
    ugPercentage: '',
    status: 'eligible' as 'eligible' | 'ineligible' | 'higher_studies',
  });

  const activeMentors = mentors.filter(mentor => mentor.role === 'mentor' && mentor.isActive);

  const statusOptions = [
    { value: 'eligible', label: 'Eligible' },
    { value: 'ineligible', label: 'Ineligible' },
    { value: 'higher_studies', label: 'Higher Studies' },
  ];

  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  useEffect(() => {
    if (student) {
      setFormData({
        rollNumber: student.rollNumber,
        studentName: student.studentName,
        email: student.email,
        mobileNumber: student.mobileNumber,
        department: student.department,
        section: student.section,
        mentorId: student.mentorId,
        tenthPercentage: student.academicDetails.tenthPercentage.toString(),
        twelfthPercentage: student.academicDetails.twelfthPercentage.toString(),
        ugPercentage: student.academicDetails.ugPercentage.toString(),
        status: student.status === 'placed' ? 'eligible' : student.status,
      });
    } else {
      setFormData({
        rollNumber: '',
        studentName: '',
        email: '',
        mobileNumber: '',
        department: '',
        section: '',
        mentorId: user?.role === 'mentor' ? user.id : '',
        tenthPercentage: '',
        twelfthPercentage: '',
        ugPercentage: '',
        status: 'eligible',
      });
    }
  }, [student, isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tenthPercentage = parseFloat(formData.tenthPercentage);
    const twelfthPercentage = parseFloat(formData.twelfthPercentage);
    const ugPercentage = parseFloat(formData.ugPercentage);

    // Determine eligibility based on academic performance
    let finalStatus = formData.status;
    if (tenthPercentage < 60 || twelfthPercentage < 60 || ugPercentage < 60) {
      finalStatus = 'ineligible';
    }

    onSave({
      rollNumber: formData.rollNumber,
      studentName: formData.studentName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      department: formData.department,
      section: formData.section,
      mentorId: formData.mentorId,
      academicDetails: {
        tenthPercentage,
        twelfthPercentage,
        ugPercentage,
      },
      status: finalStatus,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 2024CS001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="input-field"
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="e.g., john.doe@student.university.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="input-field"
                  placeholder="e.g., +1-555-0123"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="select-field"
                  aria-label="Department"
                >
                  <option value="">Select Department</option>
                  {departmentNames.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  required
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="select-field"
                  aria-label="Section"
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mentor *
                  </label>
                  <select
                    required
                    value={formData.mentorId}
                    onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
                    className="select-field"
                    aria-label="Mentor"
                  >
                    <option value="">Select Mentor</option>
                    {activeMentors.map(mentor => (
                      <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Academic Performance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Academic Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  10th Percentage *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={formData.tenthPercentage}
                  onChange={(e) => setFormData({ ...formData, tenthPercentage: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 85.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  12th Percentage *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={formData.twelfthPercentage}
                  onChange={(e) => setFormData({ ...formData, twelfthPercentage: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 78.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UG Percentage *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={formData.ugPercentage}
                  onChange={(e) => setFormData({ ...formData, ugPercentage: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 72.8"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="select-field"
              aria-label="Status"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Students with less than 60% in any of 10th, 12th, or UG will be automatically marked as ineligible for placement.
            </p>
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
              {student ? 'Update' : 'Add'} Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;