import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Student, PlacementRecord } from '../types';

interface PlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: string, record: Omit<PlacementRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  student?: Student | null;
}

const PlacementModal: React.FC<PlacementModalProps> = ({ isOpen, onClose, onSave, student }) => {
  const [formData, setFormData] = useState({
    company: '',
    package: '',
    placementDate: '',
  });

  useEffect(() => {
    if (student?.placementRecord) {
      setFormData({
        company: student.placementRecord.company,
        package: student.placementRecord.package.toString(),
        placementDate: student.placementRecord.placementDate,
      });
    } else {
      setFormData({
        company: '',
        package: '',
        placementDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [student, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    onSave(student.id, {
      studentName: student.studentName,
      rollNumber: student.rollNumber,
      department: student.department,
      company: formData.company,
      package: parseFloat(formData.package),
      placementDate: formData.placementDate,
      mentorId: student.mentorId,
    });
    onClose();
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {student.placementRecord ? 'Edit Placement' : 'Add Placement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Student: <span className="font-medium">{student.studentName}</span></p>
          <p className="text-sm text-gray-600">Roll Number: <span className="font-medium">{student.rollNumber}</span></p>
          <p className="text-sm text-gray-600">Department: <span className="font-medium">{student.department}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="e.g., Google, Microsoft"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package (LPA)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={formData.package}
              onChange={(e) => setFormData({ ...formData, package: e.target.value })}
              className="input-field"
              placeholder="e.g., 12.5"
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
              title="Select placement date"
              placeholder="Select placement date"
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
              {student.placementRecord ? 'Update' : 'Add'} Placement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlacementModal;