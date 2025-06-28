import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PlacementRecord } from '../types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<PlacementRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  record?: PlacementRecord | null;
}

const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose, onSave, record }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    department: '',
    company: '',
    package: '',
    placementDate: '',
    mentorId: '',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        studentName: record.studentName,
        rollNumber: record.rollNumber || '',
        department: record.department,
        company: record.company,
        package: record.package.toString(),
        placementDate: record.placementDate,
        mentorId: record.mentorId || '',
      });
    } else {
      setFormData({
        studentName: '',
        rollNumber: '',
        department: '',
        company: '',
        package: '',
        placementDate: new Date().toISOString().split('T')[0],
        mentorId: '',
      });
    }
  }, [record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      studentName: formData.studentName,
      rollNumber: formData.rollNumber,
      department: formData.department,
      company: formData.company,
      package: parseFloat(formData.package),
      placementDate: formData.placementDate,
      mentorId: formData.mentorId,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {record ? 'Edit Record' : 'Add New Record'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
            title="Close"
          >
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <input
              type="text"
              required
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="input-field"
              placeholder="Enter student name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              required
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              className="input-field"
              placeholder="Enter roll number"
              title="Roll Number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mentor ID
            </label>
            <input
              type="text"
              required
              value={formData.mentorId}
              onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
              className="input-field"
              placeholder="Enter mentor ID"
              title="Mentor ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input-field"
              placeholder="Enter department"
              title="Department"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="input-field"
              placeholder="Enter company"
              title="Company"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package (LPA)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.package}
              onChange={(e) => setFormData({ ...formData, package: e.target.value })}
              className="input-field"
              placeholder="Enter package (LPA)"
              title="Package (LPA)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placement Date
            </label>
            <input
              type="date"
              required
              value={formData.placementDate}
              onChange={(e) => setFormData({ ...formData, placementDate: e.target.value })}
              className="input-field"
              placeholder="Select placement date"
              title="Placement Date"
            />
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
              {record ? 'Update' : 'Add'} Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordModal;