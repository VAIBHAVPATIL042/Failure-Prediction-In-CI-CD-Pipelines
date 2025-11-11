// Core prediction types
export interface PredictionResult {
  prediction: 'Success' | 'Fail';
  probability: number;
  message: string;
  timestamp: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  notification: NotificationInfo;
}

export interface NotificationInfo {
  should_notify: boolean;
  threshold: number;
  alert_type: 'critical' | 'warning' | 'info' | 'success';
  alert_message: string;
}

// Form data types
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

// Component prop types
export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onPredict: (file: File) => void;
  isLoading: boolean;
  error?: string;
}

export interface ResultCardProps {
  result: PredictionResult | null;
  isLoading: boolean;
  onReset: () => void;
}

export interface NotificationPanelProps {
  result: PredictionResult | null;
  onSendNotification: (email: string) => void;
  isLoading: boolean;
}

export interface DashboardState {
  activeTab: 'file' | 'form';
  isLoading: boolean;
  result: PredictionResult | null;
  error: string | null;
  showHistory: boolean;
}

// History types
export interface HistoryEntry {
  timestamp: string;
  filename: string;
  prediction: string;
  probability: number;
}

// API response types
export interface ApiError {
  error: string;
  message?: string;
}

// UI component types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: 'green' | 'red' | 'yellow' | 'blue';
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Chart data types for visualization
export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface ConfidenceChartProps {
  probability: number;
  prediction: string;
  className?: string;
}

// Notification request types
export interface NotificationRequest {
  prediction: string;
  probability: number;
  message: string;
  email: string;
}

// Model info types
export interface ModelInfo {
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

// Environment types
export const ENVIRONMENT_TYPES = [
  'production',
  'staging', 
  'development',
  'unknown'
] as const;

export const BUILD_TRIGGER_TYPES = [
  'push',
  'pull_request',
  'scheduled',
  'manual'
] as const;

export const BUILD_STATUS_TYPES = [
  'success',
  'failure',
  'unknown'
] as const;

export const PIPELINE_TOOLS = [
  'github_actions',
  'gitlab_ci',
  'azure_devops',
  'circleci',
  'travis_ci',
  'unknown'
] as const;

export type EnvironmentType = typeof ENVIRONMENT_TYPES[number];
export type BuildTriggerType = typeof BUILD_TRIGGER_TYPES[number];
export type BuildStatusType = typeof BUILD_STATUS_TYPES[number];
export type PipelineToolType = typeof PIPELINE_TOOLS[number];