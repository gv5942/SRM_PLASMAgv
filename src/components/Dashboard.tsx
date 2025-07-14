@@ .. @@
 import { useAuth } from '../contexts/AuthContext';
 import { useData } from '../contexts/DataContext';
 import { exportToExcel, exportToCSV } from '../utils/excelUtils';
+import { AlertCircle } from 'lucide-react';
 import {
   calculateKPIs,
   getDepartmentStats,
@@ .. @@
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
+    isLoading,
+    error,
   } = useData();

@@ .. @@
   return (
     <Layout>
       <div className="space-y-6">
+        {/* Error Display */}
+        {error && (
+          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
+            <AlertCircle className="h-5 w-5 text-red-600" />
+            <span className="text-red-700">{error}</span>
+          </div>
+        )}
+
+        {/* Loading State */}
+        {isLoading && (
+          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-2">
+            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
+            <span className="text-blue-700">Loading student data...</span>
+          </div>
+        )}
+
         {user?.role === 'admin' && (