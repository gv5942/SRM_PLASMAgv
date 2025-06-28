import React, { useState } from 'react';
import { Building, ChevronDown, Plus, Settings, Trash2, Users, Shield } from 'lucide-react';
import { useEnvironment } from '../contexts/EnvironmentContext';
import { useAuth } from '../contexts/AuthContext';
import EnvironmentModal from './EnvironmentModal';

const EnvironmentSwitcher: React.FC = () => {
  const { currentEnvironment, environments, switchEnvironment, deleteEnvironment } = useEnvironment();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSwitchEnvironment = (environmentId: string) => {
    if (environmentId !== currentEnvironment?.id) {
      // Logout current user before switching
      logout();
      switchEnvironment(environmentId);
    }
    setIsDropdownOpen(false);
  };

  const handleDeleteEnvironment = (environmentId: string, environmentName: string) => {
    if (window.confirm(`Are you sure you want to delete "${environmentName}"? This action cannot be undone and will remove all data associated with this environment.`)) {
      deleteEnvironment(environmentId);
    }
  };

  if (!currentEnvironment) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Building className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-medium text-gray-900 max-w-32 truncate">
            {currentEnvironment.name}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* Current Environment */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Current Environment</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">{currentEnvironment.name}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Shield className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-gray-600">{currentEnvironment.adminUser.name}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Users className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">{currentEnvironment.mentors.length} mentors</span>
                </div>
              </div>
            </div>

            {/* Available Environments */}
            <div className="py-2">
              <div className="px-4 py-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Switch Environment
                </h4>
              </div>
              
              {environments.map((environment) => (
                <button
                  key={environment.id}
                  onClick={() => handleSwitchEnvironment(environment.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    environment.id === currentEnvironment.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {environment.name}
                        </span>
                        {environment.id === currentEnvironment.id && (
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Admin: {environment.adminUser.name} • {environment.mentors.length} mentors
                      </div>
                    </div>
                    
                    {environment.id !== currentEnvironment.id && environments.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEnvironment(environment.id, environment.name);
                        }}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete Environment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-primary-600 hover:bg-primary-50 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Environment</span>
              </button>
            </div>

            {/* Environment Info */}
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="text-xs text-gray-500">
                <p>Environments allow you to manage separate instances with different admins, mentors, and student data.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Environment Creation Modal */}
      <EnvironmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
};

export default EnvironmentSwitcher;