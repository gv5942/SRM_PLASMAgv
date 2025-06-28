import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, Info } from 'lucide-react';
import { parseExcelFile, generateExcelTemplate } from '../utils/excelUtils';
import { Student } from '../types';

interface ExcelUploadProps {
  onUpload: (students: Student[]) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const students = await parseExcelFile(file);
      onUpload(students);
      setUploadedCount(students.length);
      setUploadStatus('success');
      setUploadMessage(`Successfully imported ${students.length} student records`);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Failed to parse Excel file. Please check the format and try again.');
      console.error('Excel import error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Import Student Data</h3>
        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Template</span>
        </button>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          ) : (
            <FileSpreadsheet className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop the file here' : 'Drag & drop Excel file here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select file (.xlsx, .xls, .csv)
            </p>
          </div>
          
          {!isUploading && (
            <button className="btn-primary">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </button>
          )}
        </div>
      </div>

      {uploadStatus !== 'idle' && (
        <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
          uploadStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {uploadStatus === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{uploadMessage}</span>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Excel Import Format Requirements:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Required Columns:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Roll Number</li>
                  <li>Student Name</li>
                  <li>Email</li>
                  <li>Mobile Number</li>
                  <li>Department</li>
                  <li>10th Percentage</li>
                  <li>12th Percentage</li>
                  <li>UG Percentage</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Optional Columns:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Mentor ID (2, 3, 4, or 5)</li>
                  <li>Status (placed/eligible/higher_studies)</li>
                  <li>Company (for placed students)</li>
                  <li>Package (LPA)</li>
                  <li>Placement Date</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <p className="font-medium">Eligibility Rules:</p>
              <p>Students with less than 60% in any of 10th, 12th, or UG will be automatically marked as ineligible for placement.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Mentor IDs:</strong></p>
        <ul className="list-disc list-inside mt-1">
          <li>2 - Dr. Rajesh Kumar</li>
          <li>3 - Prof. Priya Sharma</li>
          <li>4 - Dr. Amit Patel</li>
          <li>5 - Prof. Sneha Gupta</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUpload;