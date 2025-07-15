// Dashboard.tsx
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
