import React from 'react';
import { Plus } from 'lucide-react';
import Layout from '../components/Layout';
import KPICards from '../components/KPICards';
import Charts from '../components/Charts';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import StudentModal from '../components/StudentModal';
import PlacementModal from '../components/PlacementModal';
import ExcelUpload from '../components/ExcelUpload';

const Dashboard = ({
  kpiData,
  departmentStats,
  monthlyPlacements,
  companyData,
  packageDistribution,
  statusDistribution,
  filters,
  setFilters,
  clearFilters,
  filteredStudents,
  handleEditStudent,
  handleDeleteStudent,
  handleAddPlacement,
  handleSaveStudent,
  handleSavePlacement,
  isStudentModalOpen,
  setIsStudentModalOpen,
  editingStudent,
  isPlacementModalOpen,
  setIsPlacementModalOpen,
  placementStudent,
  isUploadModalOpen,
  setIsUploadModalOpen,
  handleImportStudents,
  user,
}) => {
  return (
    <Layout>
      {/* 🌈 Animated Background Blobs */}
      <div className="relative z-0 overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-cyan-50">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        {/* 🧊 Dashboard Content Container */}
        <div className="relative z-10 px-6 py-8 max-w-7xl mx-auto space-y-8">
          {/* Top Controls */}
          <div className="flex justify-between items-center backdrop-card p-6 rounded-xl shadow-lg border border-gray-200">
            <h1 className="text-3xl font-extrabold text-gray-800 drop-shadow-md">📊 Dashboard</h1>
            {user?.role === 'admin' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="btn-secondary btn-glow flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Import Students</span>
                </button>
                <button
                  onClick={() => setIsStudentModalOpen(true)}
                  className="btn-primary btn-glow flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Student</span>
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Widgets */}
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
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 backdrop-card">
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
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
