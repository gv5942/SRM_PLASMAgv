import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { EnvironmentProvider } from './contexts/EnvironmentContext'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <EnvironmentProvider>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </DataProvider>
      </AuthProvider>
    </EnvironmentProvider>
  )
}

export default App