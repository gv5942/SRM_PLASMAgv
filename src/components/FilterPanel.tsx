import React from 'react';
import { Search, Filter, X, Users, Eye, EyeOff } from 'lucide-react';
import { FilterOptions } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const { students, showMyStudentsOnly, setShowMyStudentsOnly, showInactiveDepartments, setShowInactiveDepartments } = useData();
  const { user, getActiveMentors } = useAuth();

  // Get unique values for dropdowns
  const departments = [...new Set(students.map(s => s.department))].sort();
  const sections = [...new Set(students.map(s => s.section))].sort();
  const companies = [...new Set(students.filter(s => s.placementRecord).map(s => s.placementRecord!.company))].sort();
  const years = [...new Set(students.filter(s => s.placementRecord).map(s => new Date(s.placementRecord!.placementDate).getFullYear().toString()))].sort().reverse();
  
  // Get active mentors for admin view
  const activeMentors = user?.role === 'admin' ? getActiveMentors().filter(mentor => mentor.role === 'mentor') : [];

  const statusOptions = [
    { value: 'placed', label: 'Placed' },
    { value: 'eligible', label: 'Eligible' },
    { value: 'ineligible', label: 'Ineligible' },
    { value: 'higher_studies', label: 'Higher Studies' },
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleShowMyStudentsOnly = () => {
    setShowMyStudentsOnly(true);
  };

  const handleShowAllStudents = () => {
    setShowMyStudentsOnly(false);
  };

  const handleToggleInactiveDepartments = () => {
    setShowInactiveDepartments(!showInactiveDepartments);
  };
  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'string') return value !== '';
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== '' && v !== 0);
    }
    return false;
  }) || showMyStudentsOnly || showInactiveDepartments;

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {user?.role === 'mentor' && (
            <div className="ml-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Quick Filter:</span>
              <button
                onClick={handleShowMyStudentsOnly}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  showMyStudentsOnly
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="h-3 w-3 inline mr-1" />
                My Students Only
              </button>
              <button
                onClick={handleShowAllStudents}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  !showMyStudentsOnly
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Students
              </button>
            </div>
          )}
          {user?.role === 'admin' && (
            <div className="ml-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Department Filter:</span>
              <button
                onClick={handleToggleInactiveDepartments}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  showInactiveDepartments
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}
              >
                {showInactiveDepartments ? (
                  <>
                    <Eye className="h-3 w-3 inline mr-1" />
                    Show All Departments
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 inline mr-1" />
                    Active Departments Only
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Status indicator for mentors */}
      {user?.role === 'mentor' && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {showMyStudentsOnly 
                ? `Viewing your assigned students only`
                : `Viewing all students in the system`
              }
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {showMyStudentsOnly 
              ? 'You can edit and manage these students. Use "All Students" to view everyone.'
              : 'You can view all students but only edit/manage your assigned ones.'
            }
          </p>
        </div>
      )}

      {/* Status indicator for admins */}
      {user?.role === 'admin' && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center space-x-2">
            {showInactiveDepartments ? (
              <Eye className="h-4 w-4 text-orange-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-green-600" />
            )}
            <span className="text-sm font-medium text-gray-800">
              {showInactiveDepartments 
                ? `Viewing students from all departments (including inactive)`
                : `Viewing students from active departments only`
              }
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {showInactiveDepartments 
              ? 'Students from deactivated departments are visible. Toggle to hide them.'
              : 'Students from deactivated departments are hidden. Toggle to show them.'
            }
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students, roll no, companies..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Department */}
        <select
          aria-label="Filter by department"
          title="Filter by department"
          value={filters.department}
          onChange={(e) => handleFilterChange('department', e.target.value)}
          className="select-field"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Section */}
        <select
          aria-label="Filter by section"
          title="Filter by section"
          value={filters.section}
          onChange={(e) => handleFilterChange('section', e.target.value)}
          className="select-field"
        >
          <option value="">All Sections</option>
          {sections.map(section => (
            <option key={section} value={section}>Section {section}</option>
          ))}
        </select>
        {/* Status */}
        <select
          aria-label="Filter by status"
          title="Filter by status"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="select-field"
        >
          <option value="">All Status</option>
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        {/* Mentor (Admin only) */}
        {user?.role === 'admin' && (
          <select
            aria-label="Filter by mentor"
            value={filters.mentor}
            onChange={(e) => handleFilterChange('mentor', e.target.value)}
            className="select-field"
          >
            <option value="">All Mentors</option>
            {activeMentors.map(mentor => (
              <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
            ))}
          </select>
        )}

        {/* Company (for placed students) */}
        <select
          aria-label="Filter by company"
          title="Filter by company"
          value={filters.company}
          onChange={(e) => handleFilterChange('company', e.target.value)}
          className="select-field"
        >
          <option value="">All Companies</option>
          {companies.map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>

        {/* Year */}
        <select
          aria-label="Filter by year"
          title="Filter by year"
          value={filters.year}
          onChange={(e) => handleFilterChange('year', e.target.value)}
          className="select-field"
        >
          <option value="">All Years</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Package Range */}
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min Package"
            value={filters.packageRange.min || ''}
            onChange={(e) => handleFilterChange('packageRange', {
              ...filters.packageRange,
              min: parseFloat(e.target.value) || 0
            })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max Package"
            value={filters.packageRange.max || ''}
            onChange={(e) => handleFilterChange('packageRange', {
              ...filters.packageRange,
              max: parseFloat(e.target.value) || 0
            })}
            className="input-field"
          />
        </div>

        {/* Date Range */}
        <div className="flex space-x-2">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleFilterChange('dateRange', {
              ...filters.dateRange,
              start: e.target.value
            })}
            className="input-field"
            title="Start Date"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleFilterChange('dateRange', {
              ...filters.dateRange,
              end: e.target.value
            })}
            className="input-field"
            title="End Date"
            placeholder="End Date"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;