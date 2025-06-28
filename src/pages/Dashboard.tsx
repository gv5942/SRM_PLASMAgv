import React, { useState } from 'react';
import { Plus, Download, Upload, Users } from 'lucide-react';
import Layout from '../components/Layout';
import KPICards from '../components/KPICards';
import Charts from '../components/Charts';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import StudentModal from '../components/StudentModal';
import PlacementModal from '../components/PlacementModal';
import ExcelUpload from '../components/ExcelUpload';
import MentorManagement from '../components/MentorManagement';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { exportToExcel, exportToCSV } from '../utils/excelUtils';
import {
  calculateKPIs,
  getDepartmentStats,
  getMonthlyPlacements,
  getCompanyWiseData,
  getPackageDistribution,
  getStatusDistribution,
} from '../utils/chartUtils';
import { Student } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    filteredStudents,
    filters,
    setFilters,
    addStudent,
    updateStudent,
    deleteStudent,
    addPlacementRecord,
    updatePlacementRecord,
    importStudents,
    clearFilters,
    getMentorStudents,
  } = useData();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'mentors'>('dashboard');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [placementStudent, setPlacementStudent] = useState<Student | null>(null);

  // For mentors, get their assigned students for KPIs and export, but show all students in table
  const mentorAssignedStudents = getMentorStudents();
  const kpiStudents = user?.role === 'mentor' ? mentorAssignedStudents : filteredStudents;
  const exportStudents = user?.role === 'mentor' ? mentorAssignedStudents.filter(student => {
    // Apply same filters to mentor's assigned students for export
    let filtered = [student];
    
    if (filters.department && !student.department.toLowerCase().includes(filters.department.toLowerCase())) {
      filtered = [];
    }
    if (filters.company && filters.company !== '' && !student.placementRecord?.company.toLowerCase().includes(filters.company.toLowerCase())) {
      filtered = [];
    }
    if (filters.year && (!student.placementRecord || new Date(student.placementRecord.placementDate).getFullYear().toString() !== filters.year)) {
      filtered = [];
    }
    if (filters.status && student.status !== filters.status) {
      filtered = [];
    }
    if ((filters.packageRange.min > 0 || filters.packageRange.max > 0) && (!student.placementRecord || 
        student.placementRecord.package < (filters.packageRange.min || 0) || 
        student.placementRecord.package > (filters.packageRange.max || Infinity))) {
      filtered = [];
    }
    if (filters.dateRange.start && filters.dateRange.end && (!student.placementRecord ||
        new Date(student.placementRecord.placementDate) < new Date(filters.dateRange.start) ||
        new Date(student.placementRecord.placementDate) > new Date(filters.dateRange.end))) {
      filtered = [];
    }
    if (filters.search && !(
        student.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.department.toLowerCase().includes(filters.search.toLowerCase()) ||
        (student.placementRecord?.company.toLowerCase().includes(filters.search.toLowerCase()))
      )) {
      filtered = [];
    }
    
    return filtered.length > 0;
  }) : filteredStudents;

  // Calculate dashboard data
  const kpiData = calculateKPIs(kpiStudents);
  const departmentStats = getDepartmentStats(kpiStudents);
  const monthlyPlacements = getMonthlyPlacements(kpiStudents);
  const companyData = getCompanyWiseData(kpiStudents);
  const packageDistribution = getPackageDistribution(kpiStudents);
  const statusDistribution = getStatusDistribution(kpiStudents);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    // Check if user can edit this student
    if (user?.role === 'admin' || (user?.role === 'mentor' && student.mentorId === user.id)) {
      setEditingStudent(student);
      setIsStudentModalOpen(true);
    }
  };

  const handleAddPlacement = (student: Student) => {
    // Check if user can manage this student's placement
    if (user?.role === 'admin' || (user?.role === 'mentor' && student.mentorId === user.id)) {
      setPlacementStudent(student);
      setIsPlacementModalOpen(true);
    }
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
    } else {
      addStudent(studentData);
    }
  };

  const handleSavePlacement = (studentId: string, recordData: any) => {
    if (placementStudent?.placementRecord) {
      updatePlacementRecord(studentId, recordData);
    } else {
      addPlacementRecord(studentId, recordData);
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      deleteStudent(id);
    }
  };

  const handleExportExcel = () => {
    const exportData = exportStudents.map(student => ({
      'Roll Number': student.rollNumber,
      'Student Name': student.studentName,
      'Email': student.email,
      'Mobile Number': student.mobileNumber,
      'Department': student.department,
      'Status': student.status,
      '10th Percentage': student.academicDetails.tenthPercentage,
      '12th Percentage': student.academicDetails.twelfthPercentage,
      'UG Percentage': student.academicDetails.ugPercentage,
      'Mentor ID': student.mentorId,
      'Company': student.placementRecord?.company || '',
      'Package (LPA)': student.placementRecord?.package || '',
      'Placement Date': student.placementRecord?.placementDate || '',
    }));
    
    const filename = user?.role === 'mentor' 
      ? `${user.name.replace(/\s+/g, '_')}_assigned_students_${new Date().toISOString().split('T')[0]}.xlsx`
      : `student_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    exportToExcel(exportData, filename);
  };

  const handleExportCSV = () => {
    const exportData = exportStudents.map(student => ({
      'Roll Number': student.rollNumber,
      'Student Name': student.studentName,
      'Email': student.email,
      'Mobile Number': student.mobileNumber,
      'Department': student.department,
      'Status': student.status,
      '10th Percentage': student.academicDetails.tenthPercentage,
      '12th Percentage': student.academicDetails.twelfthPercentage,
      'UG Percentage': student.academicDetails.ugPercentage,
      'Mentor ID': student.mentorId,
      'Company': student.placementRecord?.company || '',
      'Package (LPA)': student.placementRecord?.package || '',
      'Placement Date': student.placementRecord?.placementDate || '',
    }));
    
    const filename = user?.role === 'mentor' 
      ? `${user.name.replace(/\s+/g, '_')}_assigned_students_${new Date().toISOString().split('T')[0]}.csv`
      : `student_data_${new Date().toISOString().split('T')[0]}.csv`;
    
    exportToCSV(exportData, filename);
  };

  const handleImportStudents = (students: Student[]) => {
    importStudents(students);
    setIsUploadModalOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Tab Navigation (Admin Only) */}
        {user?.role === 'admin' && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('mentors')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'mentors'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Mentor Management</span>
              </button>
            </nav>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'mentors' && user?.role === 'admin' ? (
          <MentorManagement />
        ) : (
          <>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.role === 'mentor' ? `${user.name} - Dashboard` : 'Dashboard Overview'}
                </h1>
                <p className="text-gray-600">
                  {user?.role === 'mentor' 
                    ? 'View all students and manage your assigned students' 
                    : 'Monitor and manage university placement data'
                  }
                </p>
                {user?.role === 'mentor' && (
                  <div className="text-sm mt-2 space-y-1">
                    <p className="text-blue-600">
                      📊 <strong>Dashboard & KPIs:</strong> Based on your {mentorAssignedStudents.length} assigned students
                    </p>
                    <p className="text-green-600">
                      👁️ <strong>Student Table:</strong> View all {filteredStudents.length} students in the system
                    </p>
                    <p className="text-purple-600">
                      ✏️ <strong>Edit/Manage:</strong> Only your assigned students
                    </p>
                    <p className="text-orange-600">
                      📤 <strong>Export:</strong> Only your assigned students data
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportExcel}
                  className="btn-secondary flex items-center space-x-2"
                  title={user?.role === 'mentor' ? 'Export your assigned students only' : 'Export all filtered students'}
                >
                  <Download className="h-4 w-4" />
                  <span>Export Excel</span>
                  {user?.role === 'mentor' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                      ({exportStudents.length})
                    </span>
                  )}
                </button>
                
                <button
                  onClick={handleExportCSV}
                  className="btn-secondary flex items-center space-x-2"
                  title={user?.role === 'mentor' ? 'Export your assigned students only' : 'Export all filtered students'}
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                  {user?.role === 'mentor' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                      ({exportStudents.length})
                    </span>
                  )}
                </button>

                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Import Excel</span>
                    </button>
                    
                    <button
                      onClick={handleAddStudent}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Student</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* KPI Cards - Based on mentor's assigned students for mentors */}
            <KPICards data={kpiData} />

            {/* Charts - Based on mentor's assigned students for mentors */}
            <Charts
              departmentStats={departmentStats}
              monthlyPlacements={monthlyPlacements}
              companyData={companyData}
              packageDistribution={packageDistribution}
              statusDistribution={statusDistribution}
            />

            {/* Filters */}
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />

            {/* Data Table - Shows ALL students for mentors but with edit restrictions */}
            <DataTable
              data={filteredStudents}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              onAddPlacement={handleAddPlacement}
            />

            {/* Modals */}
            <StudentModal
              isOpen={isStudentModalOpen}
              onClose={() => setIsStudentModalOpen(false)}
              onSave={handleSaveStudent}
              student={editingStudent}
            />

            <PlacementModal
              isOpen={isPlacementModalOpen}
              onClose={() => setIsPlacementModalOpen(false)}
              onSave={handleSavePlacement}
              student={placementStudent}
            />

            {isUploadModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Import Student Data</h2>
                      <button
                        onClick={() => setIsUploadModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close import modal"
                        title="Close"
                      >
                        <Plus className="h-6 w-6 rotate-45" />
                      </button>
                    </div>
                    <ExcelUpload onUpload={handleImportStudents} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;