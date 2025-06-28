import React, { useState } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, UserPlus, Mail, Phone, Eye } from 'lucide-react';
import { Student } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';

interface DataTableProps {
  data: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onAddPlacement: (student: Student) => void;
}

type SortField = keyof Student | 'company' | 'package' | 'placementDate';
type SortDirection = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ data, onEdit, onDelete, onAddPlacement }) => {
  const { user } = useAuth();
  const [sortField, setSortField] = useState<SortField>('rollNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === 'company') {
      aValue = a.placementRecord?.company || '';
      bValue = b.placementRecord?.company || '';
    } else if (sortField === 'package') {
      aValue = a.placementRecord?.package || 0;
      bValue = b.placementRecord?.package || 0;
    } else if (sortField === 'placementDate') {
      aValue = a.placementRecord?.placementDate ? new Date(a.placementRecord.placementDate).getTime() : 0;
      bValue = b.placementRecord?.placementDate ? new Date(b.placementRecord.placementDate).getTime() : 0;
    } else {
      aValue = a[sortField as keyof Student];
      bValue = b[sortField as keyof Student];
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      placed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Placed' },
      eligible: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Eligible' },
      ineligible: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ineligible' },
      higher_studies: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Higher Studies' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.eligible;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Check if user can edit this student
  const canEditStudent = (student: Student) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'mentor' && student.mentorId === user.id) return true;
    return false;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Student Records</h3>
        <span className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rollNumber')}
              >
                <div className="flex items-center space-x-1">
                  <span>Roll Number</span>
                  <SortIcon field="rollNumber" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('studentName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Student Details</span>
                  <SortIcon field="studentName" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center space-x-1">
                  <span>Department</span>
                  <SortIcon field="department" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Academic Details
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center space-x-1">
                  <span>Placement Details</span>
                  <SortIcon field="company" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.rollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{student.mobileNumber}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getStatusBadge(student.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-xs">
                    <div>10th: {student.academicDetails.tenthPercentage}%</div>
                    <div>12th: {student.academicDetails.twelfthPercentage}%</div>
                    <div>UG: {student.academicDetails.ugPercentage}%</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.placementRecord ? (
                    <div className="text-xs">
                      <div className="font-medium">{student.placementRecord.company}</div>
                      <div>₹{student.placementRecord.package} LPA</div>
                      <div>{format(parseISO(student.placementRecord.placementDate), 'MMM dd, yyyy')}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewingStudent(student)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {canEditStudent(student) && (
                      <>
                        <button
                          onClick={() => onEdit(student)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="Edit Student"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {(student.status === 'eligible' || student.placementRecord) && (
                          <button
                            onClick={() => onAddPlacement(student)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title={student.placementRecord ? "Edit Placement" : "Add Placement"}
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => onDelete(student.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Student Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingStudent.rollNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student Name</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingStudent.studentName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingStudent.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingStudent.mobileNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingStudent.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">{getStatusBadge(viewingStudent.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Academic Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Academic Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">10th Percentage</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingStudent.academicDetails.tenthPercentage}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">12th Percentage</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingStudent.academicDetails.twelfthPercentage}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UG Percentage</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingStudent.academicDetails.ugPercentage}%</p>
                    </div>
                  </div>
                </div>

                {/* Placement Details */}
                {viewingStudent.placementRecord && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Placement Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingStudent.placementRecord.company}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Package</label>
                        <p className="mt-1 text-sm text-gray-900">₹{viewingStudent.placementRecord.package} LPA</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Placement Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {format(parseISO(viewingStudent.placementRecord.placementDate), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingStudent(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;