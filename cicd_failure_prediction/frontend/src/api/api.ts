import axios from 'axios';

// API base URL - adjust for your backend
const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Types for API responses
export interface PredictionResponse {
  prediction: 'Success' | 'Fail';
  probability: number;
  message: string;
  timestamp: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  notification: {
    should_notify: boolean;
    threshold: number;
    alert_type: 'critical' | 'warning' | 'info' | 'success';
    alert_message: string;
  };
}

export interface ManualFormData {
  build_duration: number;
  number_of_dependencies: number;
  lines_of_code_changed: number;
  commit_frequency: number;
  test_coverage: number;
  number_of_build_steps: number;
  environment_type: string;
  build_trigger_type: string;
  previous_build_status: string;
  code_complexity_score: number;
  pipeline_tool: string;
}

export interface NotificationRequest {
  prediction: string;
  probability: number;
  message: string;
  email: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  ml_processor: string;
  version: string;
}

export interface ModelInfoResponse {
  model_type: string;
  vectorizer_type: string;
  model_loaded: boolean;
  vectorizer_loaded: boolean;
  notification_threshold: number;
  supported_formats: string[];
  max_file_size: string;
  model_features?: string | number;
  vocabulary_size?: string | number;
}

export interface HistoryEntry {
  timestamp: string;
  filename: string;
  prediction: string;
  probability: number;
}

export interface HistoryResponse {
  history: HistoryEntry[];
}

// API Functions
export const apiService = {
  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Get model information
  async getModelInfo(): Promise<ModelInfoResponse> {
    const response = await apiClient.get('/model-info');
    return response.data;
  },

  // Predict from uploaded file
  async predictFromFile(file: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/predict-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file processing
    });

    return response.data;
  },

  // Predict from manual form
  async predictFromForm(data: ManualFormData): Promise<PredictionResponse> {
    const response = await apiClient.post('/predict-form', data);
    return response.data;
  },

  // Send notification
  async sendNotification(data: NotificationRequest): Promise<NotificationResponse> {
    const response = await apiClient.post('/notify', data);
    return response.data;
  },

  // Get prediction history
  async getHistory(): Promise<HistoryResponse> {
    const response = await apiClient.get('/upload-history');
    return response.data;
  },
};

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || error.response.data?.message || 'Server error occurred';
    return message;
  } else if (error.request) {
    // Request was made but no response received
    return 'Unable to connect to server. Please check if the backend is running.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

// File validation utilities
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (16MB limit)
  const maxSize = 16 * 1024 * 1024; // 16MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 16MB limit' };
  }

  // Check file extension
  const allowedExtensions = ['yml', 'yaml'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Only .yml and .yaml files are allowed' };
  }

  return { isValid: true };
};

// Utility to format probability as percentage
export const formatProbability = (probability: number): string => {
  return `${(probability * 100).toFixed(1)}%`;
};

// Utility to get risk color based on probability
export const getRiskColor = (probability: number): string => {
  if (probability >= 0.8) return 'text-red-600';
  if (probability >= 0.6) return 'text-orange-600';
  if (probability >= 0.4) return 'text-yellow-600';
  return 'text-green-600';
};

// Utility to get risk background color
export const getRiskBgColor = (probability: number): string => {
  if (probability >= 0.8) return 'bg-red-50 border-red-200';
  if (probability >= 0.6) return 'bg-orange-50 border-orange-200';
  if (probability >= 0.4) return 'bg-yellow-50 border-yellow-200';
  return 'bg-green-50 border-green-200';
};

export default apiService;