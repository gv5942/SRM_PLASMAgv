import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield, Users, Settings, ChevronDown } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import EnvironmentSwitcher from './EnvironmentSwitcher';
import { useEnvironment } from '../contexts/EnvironmentContext';
import logo from '../assets/logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { currentEnvironment } = useEnvironment();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    setIsProfileOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Logo and Platform Name */}
              <img
                src={logo}
                alt="SRM Logo"
                className="h-10 w-auto object-contain"
                style={{ maxWidth: '48px' }}
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold flex items-center space-x-2">
                  <span className="bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl">
                    Mentee
                  </span>
                  <span className="text-cyan-500 font-black tracking-widest drop-shadow-lg">
                    Elevatr 360
                  </span>
                </span>
                <span className="text-xs text-gray-500 -mt-1">University Placement Dashboard</span>
              </div>
              {currentEnvironment && (
                <div className="hidden md:block text-sm text-gray-500 ml-4">
                  • {currentEnvironment.name}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Environment Switcher */}
              <EnvironmentSwitcher />
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <div className="flex items-center space-x-2">
                    {user?.role === 'admin' ? (
                      <Shield className="h-4 w-4 text-primary-600" />
                    ) : (
                      <Users className="h-4 w-4 text-green-600" />
                    )}
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{user?.name || user?.username}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                  
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          user?.role === 'admin' ? 'bg-purple-100' : 'bg-green-100'
                        }`}>
                          {user?.role === 'admin' ? (
                            <Shield className="h-5 w-5 text-purple-600" />
                          ) : (
                            <Users className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user?.name}</div>
                          <div className="text-sm text-gray-500">@{user?.username}</div>
                          <div className="text-xs text-gray-400">{user?.email}</div>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user?.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user?.role === 'admin' ? '👑 Administrator' : '👨‍🏫 Mentor'}
                        </span>
                        {user?.department && (
                          <span className="ml-2 text-xs text-gray-500">• {user.department}</span>
                        )}
                      </div>
                    </div>

                    {/* Environment Info */}
                    {currentEnvironment && (
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-xs text-gray-500">
                          <div className="font-medium text-gray-700">Environment</div>
                          <div className="truncate">{currentEnvironment.name}</div>
                        </div>
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span>Profile Settings</span>
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    {/* Account Stats */}
                    <div className="border-t border-gray-100 px-4 py-3">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Account Status: <span className="text-green-600 font-medium">Active</span></div>
                        <div>Member Since: {new Date(user?.createdAt || '').toLocaleDateString()}</div>
                        <div>Last Updated: {new Date(user?.updatedAt || '').toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Profile Settings Modal */}
      <ProfileSettings
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;