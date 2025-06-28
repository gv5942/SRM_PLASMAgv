import React, { useState } from 'react';
import { Plus, Edit, Trash2, Key, UserCheck, UserX, Mail, Phone, Building, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import MentorModal from './MentorModal';

const MentorManagement: React.FC = () => {
  const { mentors, addMentor, updateMentor, deleteMentor, resetMentorPassword } = useAuth();
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<User | null>(null);
  const [resetPasswordMentor, setResetPasswordMentor] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const mentorUsers = mentors.filter(user => user.role === 'mentor');

  const handleAddMentor = () => {
    setEditingMentor(null);
    setIsMentorModalOpen(true);
  };

  const handleEditMentor = (mentor: User) => {
    setEditingMentor(mentor);
    setIsMentorModalOpen(true);
  };

  const handleSaveMentor = (mentorData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMentor) {
      updateMentor(editingMentor.id, mentorData);
    } else {
      addMentor(mentorData);
    }
  };

  const handleDeleteMentor = (mentor: User) => {
    if (window.confirm(`Are you sure you want to delete mentor "${mentor.name}"? This action cannot be undone.`)) {
      deleteMentor(mentor.id);
    }
  };

  const handleToggleActive = (mentor: User) => {
    updateMentor(mentor.id, { isActive: !mentor.isActive });
  };

  const handleResetPassword = (mentor: User) => {
    setResetPasswordMentor(mentor);
    setNewPassword('mentor123');
  };

  const handleConfirmPasswordReset = () => {
    if (resetPasswordMentor && newPassword) {
      resetMentorPassword(resetPasswordMentor.id, newPassword);
      setResetPasswordMentor(null);
      setNewPassword('');
      alert('Password reset successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mentor Management</h2>
          <p className="text-gray-600">Manage mentor accounts and their access</p>
        </div>
        <button
          onClick={handleAddMentor}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Mentor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Mentors</p>
              <p className="text-2xl font-bold text-gray-900">
                {mentorUsers.filter(m => m.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Mentors</p>
              <p className="text-2xl font-bold text-gray-900">
                {mentorUsers.filter(m => !m.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mentors</p>
              <p className="text-2xl font-bold text-gray-900">{mentorUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mentors Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Mentors</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mentorUsers.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                      <div className="text-sm text-gray-500">@{mentor.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {mentor.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{mentor.email}</span>
                        </div>
                      )}
                      {mentor.phone && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{mentor.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mentor.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(mentor)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mentor.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {mentor.isActive ? (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMentor(mentor)}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="Edit Mentor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(mentor)}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors"
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMentor(mentor)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Mentor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {mentorUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No mentors found. Add your first mentor to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <MentorModal
        isOpen={isMentorModalOpen}
        onClose={() => setIsMentorModalOpen(false)}
        onSave={handleSaveMentor}
        mentor={editingMentor}
      />

      {/* Password Reset Modal */}
      {resetPasswordMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
              <button
                onClick={() => setResetPasswordMentor(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close password reset modal"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Reset password for: <strong>{resetPasswordMentor.name}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Enter new password"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setResetPasswordMentor(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPasswordReset}
                className="btn-primary flex-1"
                disabled={!newPassword}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorManagement;