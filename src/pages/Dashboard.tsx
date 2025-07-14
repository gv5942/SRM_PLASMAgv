// Dashboard.tsx

import React, { useState } from 'react';
import { Plus, Download, Upload, Users, Building } from 'lucide-react';
import Layout from '../components/Layout';
import KPICards from '../components/KPICards';
import Charts from '../components/Charts';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import StudentModal from '../components/StudentModal';
import PlacementModal from '../components/PlacementModal';
import ExcelUpload from '../components/ExcelUpload';
import MentorManagement from '../components/MentorManagement';
import DepartmentManagement from '../components/DepartmentManagement';
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'mentors' | 'departments'>('dashboard');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [placementStudent, setPlacementStudent] = useState<Student | null>(null);

  const mentorAssignedStudents = getMentorStudents();
  const kpiStudents = user?.role === 'mentor' ? mentorAssignedStudents : filteredStudents;
  const exportStudents = user?.role === 'mentor' ? mentorAssignedStudents.filter(student => {
    let filtered = [student];
    if (filters.department && !student.department.toLowerCase().includes(filters.department.toLowerCase())) filtered = [];
    if (filters.company && filters.company !== '' && !student.placementRecord?.company.toLowerCase().includes(filters.company.toLowerCase())) filtered = [];
    if (filters.year && (!student.placementRecord || new Date(student.placementRecord.placementDate).getFullYear().toString() !== filters.year)) filtered = [];
    if (filters.status && student.status !== filters.status) filtered = [];
    if ((filters.packageRange.min > 0 || filters.packageRange.max > 0) && (!student.placementRecord ||
        student.placementRecord.package < (filters.packageRange.min || 0) ||
        student.placementRecord.package > (filters.packageRange.max || Infinity))) filtered = [];
    if (filters.dateRange.start && filters.dateRange.end && (!student.placementRecord ||
        new Date(student.placementRecord.placementDate) < new Date(filters.dateRange.start) ||
        new Date(student.placementRecord.placementDate) > new Date(filters.dateRange.end))) filtered = [];
    if (filters.search && !(
        student.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.department.toLowerCase().includes(filters.search.toLowerCase()) ||
        (student.placementRecord?.company.toLowerCase().includes(filters.search.toLowerCase()))
    )) filtered = [];
    return filtered.length > 0;
  }) : filteredStudents;

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
    if (user?.role === 'admin' || (user?.role === 'mentor' && student.mentorId === user.id)) {
      setEditingStudent(student);
      setIsStudentModalOpen(true);
    }
  };

  const handleAddPlacement = (student: Student) => {
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
        {user?.role === 'admin' && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-4 sm:gap-8">
              {['dashboard', 'mentors', 'departments'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-2 px-3 rounded-t-md font-semibold text-sm transition-colors duration-200 ${
                    activeTab === tab
                      ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-primary-600 hover:border-b-2 hover:border-primary-300'
                  } flex items-center gap-2`}
                >
                  {tab === 'mentors' && <Users className="h-4 w-4" />}
                  {tab === 'departments' && <Building className="h-4 w-4" />}
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {activeTab === 'mentors' && user?.role === 'admin' ? (
          <MentorManagement />
        ) : activeTab === 'departments' && user?.role === 'admin' ? (
          <DepartmentManagement />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                  {user?.role === 'mentor' ? `${user.name} - Dashboard` : '📊 Dashboard Overview'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {user?.role === 'mentor'
                    ? '👨‍🏫 View and manage your assigned students'
                    : '📈 Monitor university-wide placement data'}
                </p>
                {user?.role === 'mentor' && (
                  <div className="text-sm mt-4 grid gap-1 text-gray-700 bg-blue-50 rounded-md p-4 border border-blue-100">
                    <p><strong className="text-blue-600">📊 KPIs:</strong> {mentorAssignedStudents.length} assigned students</p>
                    <p><strong className="text-green-600">👁️ View:</strong> All {filteredStudents.length} students</p>
                    <p><strong className="text-purple-600">✏️ Manage:</strong> Only your students</p>
                    <p><strong className="text-orange-600">📤 Export:</strong> Assigned students only</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-start sm:justify-end items-center">
                <button
                  onClick={handleExportExcel}
                  className="bg-white hover:bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm transition duration-200"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                  {user?.role === 'mentor' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                      {exportStudents.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-white hover:bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm transition duration-200"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                  {user?.role === 'mentor' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                      {exportStudents.length}
                    </span>
                  )}
                </button>
                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm border border-yellow-200"
                    >
                      <Upload className="h-4 w-4" />
                      Import Excel
                    </button>
                    <button
                      onClick={handleAddStudent}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Student
                    </button>
                  </>
                )}
              </div>
            </div>

            <KPICards data={kpiData} />
            <Charts
              departmentStats={departmentStats}
              monthlyPlacements={monthlyPlacements}
              companyData={companyData}
              packageDistribution={packageDistribution}
              statusDistribution={statusDistribution}
            />
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />
            <DataTable
              data={filteredStudents}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              onAddPlacement={handleAddPlacement}
            />
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
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900">📥 Import Student Data</h2>
                      <button
                        onClick={() => setIsUploadModalOpen(false)}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label="Close"
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
