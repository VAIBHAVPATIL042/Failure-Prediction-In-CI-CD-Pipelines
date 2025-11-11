import React, { useCallback, useState } from 'react';
import { useDropzone } from './Dropzone';
import { Upload, File, AlertCircle, CheckCircle } from './Icons';
import { validateFile } from '../api/api';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onPredict: (file: File) => void;
  isLoading: boolean;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onPredict,
  isLoading,
  error
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: Array<{file: File, errors: Array<{code: string, message: string}>}>) => {
    setValidationError(null);
    
    if (rejectedFiles.length > 0) {
      setValidationError('Please upload only .yml or .yaml files');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid file');
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);

      // Read file content for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPreviewContent(content.slice(0, 1000)); // First 1000 characters
      };
      reader.readAsText(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/yaml': ['.yml', '.yaml'],
      'application/x-yaml': ['.yml', '.yaml']
    },
    multiple: false,
    maxSize: 16 * 1024 * 1024 // 16MB
  });

  const handlePredict = () => {
    if (selectedFile) {
      onPredict(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewContent(null);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
            <Upload 
              className={`w-8 h-8 ${isDragActive ? 'text-primary-600' : 'text-gray-600'}`} 
            />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop your YAML file here' : 'Upload CI/CD Pipeline Configuration'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop or click to select .yml or .yaml files (max 16MB)
            </p>
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{validationError}</span>
        </div>
      )}

      {/* API Error */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Selected File Info */}
      {selectedFile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{selectedFile.name}</p>
                <p className="text-sm text-green-700">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'YAML file'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleClear}
                className="btn btn-secondary text-sm"
                disabled={isLoading}
              >
                Clear
              </button>
              <button
                onClick={handlePredict}
                className="btn btn-primary text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </span>
                ) : (
                  'Predict Build Outcome'
                )}
              </button>
            </div>
          </div>

          {/* File Preview */}
          {previewContent && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <File className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">File Preview</span>
                </div>
              </div>
              <div className="p-4">
                <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                  {previewContent}
                  {previewContent.length >= 1000 && (
                    <span className="text-gray-500">
                      {'\n\n... (truncated for preview)'}
                    </span>
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supported Formats Info */}
      <div className="text-xs text-gray-500 text-center">
        <p>Supported formats: GitHub Actions, GitLab CI, Azure DevOps, CircleCI, Travis CI</p>
      </div>
    </div>
  );
};

export default FileUpload;