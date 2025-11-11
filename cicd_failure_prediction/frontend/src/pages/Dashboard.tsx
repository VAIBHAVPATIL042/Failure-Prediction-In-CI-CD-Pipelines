import React, { useState, useEffect } from 'react';
import type { PredictionResult, ManualFormData } from '../types';
import { apiService, handleApiError } from '../api/api';
import FileUpload from '../components/FileUpload';
import ManualForm from '../components/ManualForm';
import ResultCard from '../components/ResultCard';
import NotificationPanel from '../components/NotificationPanel';
import { FileText, Settings, History, Activity } from '../components/Icons';
// import { useToast } from '../components/Toast';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'file' | 'form'>('file');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null); // TODO: Define proper type

  // Load model info on component mount
  useEffect(() => {
    const loadModelInfo = async () => {
      try {
        const info = await apiService.getModelInfo();
        setModelInfo(info);
      } catch (error) {
        console.error('Failed to load model info:', error);
      }
    };

    loadModelInfo();
  }, []);

  const handleFilePredict = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prediction = await apiService.predictFromFile(file);
      setResult(prediction);
      
      // Show notification (simplified for now)
      console.log(prediction.notification.should_notify ? 'High risk prediction!' : 'File prediction completed successfully!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('File prediction error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormPredict = async (formData: ManualFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prediction = await apiService.predictFromForm(formData);
      setResult(prediction);
      
      // Show notification (simplified for now)
      console.log(prediction.notification.should_notify ? 'High risk prediction!' : 'Form prediction completed successfully!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('Form prediction error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = (email: string) => {
    console.log(`Notification sent to ${email}`);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-primary-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  CI/CD Failure Prediction
                </h1>
              </div>
              
              {modelInfo && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full ${
                    modelInfo.model_loaded ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span>{modelInfo.model_type}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Input Section */}
            <div className="card">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'file'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Upload YAML</span>
                </button>
                <button
                  onClick={() => setActiveTab('form')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'form'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Manual Entry</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'file' ? (
                  <FileUpload
                    onFileSelect={() => {}}
                    onPredict={handleFilePredict}
                    isLoading={isLoading}
                    error={error || undefined}
                  />
                ) : (
                  <ManualForm
                    onSubmit={handleFormPredict}
                    isLoading={isLoading}
                    error={error || undefined}
                  />
                )}
              </div>
            </div>

            {/* Results Section */}
            {(result || isLoading) && (
              <ResultCard
                result={result}
                isLoading={isLoading}
                onReset={handleReset}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <NotificationPanel
              result={result}
              onSendNotification={handleSendNotification}
              isLoading={false}
            />

            {/* Model Info */}
            {modelInfo && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Model Status</span>
                    <span className={`text-sm font-medium ${
                      modelInfo.model_loaded ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {modelInfo.model_loaded ? 'Ready' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vectorizer</span>
                    <span className={`text-sm font-medium ${
                      modelInfo.vectorizer_loaded ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {modelInfo.vectorizer_loaded ? 'Ready' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Threshold</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(modelInfo.notification_threshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Max File Size</span>
                    <span className="text-sm font-medium text-gray-900">
                      {modelInfo.max_file_size}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  This system predicts the likelihood of CI/CD pipeline failures based on 
                  configuration files and pipeline metrics.
                </p>
                <p>
                  Upload your YAML configuration or enter details manually to get 
                  real-time predictions with confidence scores.
                </p>
                <p className="font-medium text-gray-900">
                  Supported Platforms:
                </p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• GitHub Actions</li>
                  <li>• GitLab CI/CD</li>
                  <li>• Azure DevOps</li>
                  <li>• CircleCI</li>
                  <li>• Travis CI</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;