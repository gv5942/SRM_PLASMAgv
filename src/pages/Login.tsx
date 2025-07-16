import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEnvironment } from '../contexts/EnvironmentContext';
import { Lock, Shield, Users, Mail, Building, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEnvironments, setShowEnvironments] = useState(false);

  const { user, login } = useAuth();
  const { currentEnvironment, environments, switchEnvironment } = useEnvironment();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(usernameOrEmail, password);
    if (!success) {
      setError('Invalid credentials. Please check your username/email and password.');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = (role: 'admin' | 'mentor', username?: string) => {
    if (!currentEnvironment) return;
    if (role === 'admin') {
      setUsernameOrEmail(currentEnvironment.adminUser.email || currentEnvironment.adminUser.username);
      setPassword('admin123');
    } else if (username) {
      const mentor = currentEnvironment.mentors.find(m => m.username === username);
      if (mentor) {
        setUsernameOrEmail(mentor.email || mentor.username);
        setPassword('mentor123');
      }
    }
  };

  const handleEnvironmentSwitch = (environmentId: string) => {
    switchEnvironment(environmentId);
    setShowEnvironments(false);
    setUsernameOrEmail('');
    setPassword('');
    setError('');
  };

  if (!currentEnvironment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading environments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* 🌊 Ocean Background */}
      <div className="ocean-bg" />

      {/* 🎨 Blobs & Overlay */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <div className="gradient-overlay"></div>

      {/* Login Card */}
      <div className="max-w-md w-full space-y-8 z-10">
        {/* Header */}
        <div className="text-center">
          <img
            src={logo}
            alt="SRM Plasma Logo"
            className="h-24 w-auto mb-2 object-contain drop-shadow-md"
            style={{ maxWidth: '320px' }}
          />
          <h1 className="text-4xl font-extrabold flex items-center justify-center space-x-3 tracking-tight">
            <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl animate-pulse">
              Mentee
            </span>
            <span className="text-cyan-600 font-black tracking-widest drop-shadow-md">
              Elevatr 360
            </span>
          </h1>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">University Placement Dashboard</h2>
          <p className="mt-2 text-sm text-gray-100">Sign in to access the placement monitoring system</p>
        </div>

        {/* Environment Switcher */}
        <div className="backdrop-card rounded-xl p-5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-800">Current Environment</div>
                <div className="text-xs text-gray-500">{currentEnvironment.name}</div>
              </div>
            </div>
            <button
              onClick={() => setShowEnvironments(!showEnvironments)}
              className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-all"
            >
              <span>Switch</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showEnvironments ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showEnvironments && (
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              {environments.map((env) => (
                <button
                  key={env.id}
                  onClick={() => handleEnvironmentSwitch(env.id)}
                  className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all ${
                    env.id === currentEnvironment.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div>{env.name}</div>
                  <div className="text-xs text-gray-400">
                    Admin: {env.adminUser.name} • {env.mentors.length} mentors
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="backdrop-card rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-semibold text-gray-700">
                Username or Email
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="usernameOrEmail"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter username or email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 btn-glow hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">
                  Demo Accounts for {currentEnvironment.name}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all btn-glow"
              >
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                Admin: {currentEnvironment.adminUser.name}
              </button>

              <div className="grid grid-cols-1 gap-2">
                {currentEnvironment.mentors.slice(0, 4).map((mentor) => (
                  <button
                    key={mentor.id}
                    onClick={() => handleDemoLogin('mentor', mentor.username)}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm btn-glow"
                  >
                    <Users className="h-3 w-3 mr-1 text-green-600" />
                    {mentor.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
              <p><strong>Admin:</strong> {currentEnvironment.adminUser.email || currentEnvironment.adminUser.username} / admin123</p>
              <p><strong>Mentors:</strong> Use email or username / mentor123</p>
              <p className="text-blue-600">✓ Login with username or email address</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
