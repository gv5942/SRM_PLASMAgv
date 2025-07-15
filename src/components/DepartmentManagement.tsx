import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building, BookOpen, Users, CheckCircle, XCircle, X, AlertCircle, Loader } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Department, useDepartments } from '../utils/departmentUtils';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  department?: Department | null;
  isLoading?: boolean;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSave, department, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  React.useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || '',
        isActive: department.isActive,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        isActive: true,
      });
    }
  }, [department, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {department ? 'Edit Department' : 'Add New Department'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Computer Science"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="e.g., CS"
              maxLength={5}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              placeholder="Brief description of the department"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isLoading}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active Department
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{department ? 'Update' : 'Add'} Department</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DepartmentManagement: React.FC = () => {
  const { students } = useData();
  const { mentors } = useAuth();
  const { 
    departments, 
    activeDepartments, 
    isLoading: departmentsLoading, 
    error: departmentsError,
    addDepartment, 
    updateDepartment, 
    deleteDepartment 
  } = useDepartments();
  
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setOperationError(null);
    setIsDepartmentModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setOperationError(null);
    setIsDepartmentModalOpen(true);
  };

  const handleSaveDepartment = async (departmentData: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsOperationLoading(true);
    setOperationError(null);

    try {
      // Check for duplicate name or code (excluding current department if editing)
      const isDuplicate = departments.some(dept => 
        dept.id !== editingDepartment?.id && 
        (dept.name.toLowerCase() === departmentData.name.toLowerCase() || 
         dept.code.toLowerCase() === departmentData.code.toLowerCase())
      );

      if (isDuplicate) {
        throw new Error('Department name or code already exists. Please use different values.');
      }

      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, departmentData);
      } else {
        await addDepartment(departmentData);
      }
    } catch (err: any) {
      setOperationError(err.message || 'Failed to save department. Please try again.');
      throw err;
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    // Check if department is being used by students or mentors
    const studentsUsingDept = students.filter(student => student.department === department.name);
    const mentorsUsingDept = mentors.filter(mentor => mentor.department === department.name);

    if (studentsUsingDept.length > 0 || mentorsUsingDept.length > 0) {
      const confirmMessage = `Department "${department.name}" is currently assigned to:\n• ${studentsUsingDept.length} students\n• ${mentorsUsingDept.length} mentors\n\nDeleting this department will:\n1. Remove the department permanently\n2. Keep all student and mentor data intact\n3. Students/mentors will show their department name even though department is deleted\n\nRecommended: Deactivate instead of delete to preserve data integrity.\n\nDo you still want to DELETE this department permanently?`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete the department "${department.name}"? This action cannot be undone.`)) {
        return;
      }
    }

    setIsOperationLoading(true);
    setOperationError(null);

    try {
      await deleteDepartment(department.id);
      alert(`Department "${department.name}" has been deleted successfully.`);
    } catch (err: any) {
      setOperationError(err.message || 'Failed to delete department. Please try again.');
      alert('An error occurred while deleting the department. Please try again.');
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleToggleActive = async (department: Department) => {
    const studentsUsingDept = students.filter(student => student.department === department.name);
    const mentorsUsingDept = mentors.filter(mentor => mentor.department === department.name);

    if (!department.isActive && (studentsUsingDept.length > 0 || mentorsUsingDept.length > 0)) {
      // Reactivating department with existing data
      if (!window.confirm(`Reactivating "${department.name}" will make ${studentsUsingDept.length} students and ${mentorsUsingDept.length} mentors visible again. Continue?`)) {
        return;
      }
    } else if (department.isActive && (studentsUsingDept.length > 0 || mentorsUsingDept.length > 0)) {
      // Deactivating department with existing data
      if (!window.confirm(`Deactivating "${department.name}" will hide ${studentsUsingDept.length} students and ${mentorsUsingDept.length} mentors from most views. The data will be preserved but not visible. Continue?`)) {
        return;
      }
    }

    setIsOperationLoading(true);
    setOperationError(null);

    try {
      await updateDepartment(department.id, { isActive: !department.isActive });
    } catch (err: any) {
      setOperationError(err.message || 'Failed to update department status. Please try again.');
    } finally {
      setIsOperationLoading(false);
    }
  };

  const inactiveDepartments = departments.filter(dept => !dept.isActive);

  if (departmentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading departments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
          <p className="text-gray-600">Manage academic departments and their settings</p>
        </div>
        <button
          onClick={handleAddDepartment}
          className="btn-primary flex items-center space-x-2"
          disabled={isOperationLoading}
        >
          <Plus className="h-4 w-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Error Display */}
      {(departmentsError || operationError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{departmentsError || operationError}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Departments</p>
              <p className="text-2xl font-bold text-gray-900">{activeDepartments.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Departments</p>
              <p className="text-2xl font-bold text-gray-900">{inactiveDepartments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Departments</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
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
              {departments.map((department) => {
                const studentsCount = students.filter(s => s.department === department.name).length;
                const mentorsCount = mentors.filter(m => m.department === department.name).length;

                return (
                  <tr key={department.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{department.name}</div>
                          <div className="text-xs text-gray-500">
                            Created: {new Date(department.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {department.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {department.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-blue-600" />
                          <span>{studentsCount} students</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <BookOpen className="h-3 w-3 text-green-600" />
                          <span>{mentorsCount} mentors</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(department)}
                        disabled={isOperationLoading}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          department.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors disabled:opacity-50`}
                      >
                        {department.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDepartment(department)}
                          disabled={isOperationLoading}
                          className="text-primary-600 hover:text-primary-900 transition-colors disabled:opacity-50"
                          title="Edit Department"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(department)}
                          disabled={isOperationLoading}
                          className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                          title="Delete Department"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {departments.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No departments found. Add your first department to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Department Modal */}
      <DepartmentModal
        isOpen={isDepartmentModalOpen}
        onClose={() => {
          setIsDepartmentModalOpen(false);
          setOperationError(null);
        }}
        onSave={handleSaveDepartment}
        department={editingDepartment}
        isLoading={isOperationLoading}
      />
    </div>
  );
};

export default DepartmentManagement;