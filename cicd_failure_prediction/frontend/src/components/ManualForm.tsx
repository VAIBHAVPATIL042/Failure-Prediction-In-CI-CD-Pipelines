import React, { useState } from 'react';
import type { ManualFormData } from '../types';
import { 
  ENVIRONMENT_TYPES, 
  BUILD_TRIGGER_TYPES, 
  BUILD_STATUS_TYPES, 
  PIPELINE_TOOLS 
} from '../types';
import { Settings, Play, RotateCcw } from './Icons';

interface ManualFormProps {
  onSubmit: (data: ManualFormData) => void;
  isLoading: boolean;
  error?: string;
}

const ManualForm: React.FC<ManualFormProps> = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState<ManualFormData>({
    build_duration: 0,
    number_of_dependencies: 0,
    lines_of_code_changed: 0,
    commit_frequency: 0,
    test_coverage: 0,
    number_of_build_steps: 0,
    environment_type: 'development',
    build_trigger_type: 'push',
    previous_build_status: 'unknown',
    code_complexity_score: 0,
    pipeline_tool: 'github_actions'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: ['environment_type', 'build_trigger_type', 'previous_build_status', 'pipeline_tool'].includes(name)
        ? value
        : parseFloat(value) || 0
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.build_duration < 0) errors.build_duration = 'Must be non-negative';
    if (formData.number_of_dependencies < 0) errors.number_of_dependencies = 'Must be non-negative';
    if (formData.lines_of_code_changed < 0) errors.lines_of_code_changed = 'Must be non-negative';
    if (formData.commit_frequency < 0) errors.commit_frequency = 'Must be non-negative';
    if (formData.test_coverage < 0 || formData.test_coverage > 100) {
      errors.test_coverage = 'Must be between 0-100';
    }
    if (formData.number_of_build_steps < 0) errors.number_of_build_steps = 'Must be non-negative';
    if (formData.code_complexity_score < 0) errors.code_complexity_score = 'Must be non-negative';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      build_duration: 0,
      number_of_dependencies: 0,
      lines_of_code_changed: 0,
      commit_frequency: 0,
      test_coverage: 0,
      number_of_build_steps: 0,
      environment_type: 'development',
      build_trigger_type: 'push',
      previous_build_status: 'unknown',
      code_complexity_score: 0,
      pipeline_tool: 'github_actions'
    });
    setValidationErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Manual Pipeline Configuration</h3>
          <p className="text-sm text-gray-600">Enter your CI/CD pipeline details manually</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Numeric Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="build_duration" className="label">
              Build Duration (minutes)
            </label>
            <input
              type="number"
              id="build_duration"
              name="build_duration"
              value={formData.build_duration}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className={`input ${validationErrors.build_duration ? 'border-red-300' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.build_duration && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.build_duration}</p>
            )}
          </div>

          <div>
            <label htmlFor="number_of_dependencies" className="label">
              Number of Dependencies
            </label>
            <input
              type="number"
              id="number_of_dependencies"
              name="number_of_dependencies"
              value={formData.number_of_dependencies}
              onChange={handleInputChange}
              min="0"
              step="1"
              className={`input ${validationErrors.number_of_dependencies ? 'border-red-300' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.number_of_dependencies && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.number_of_dependencies}</p>
            )}
          </div>

          <div>
            <label htmlFor="lines_of_code_changed" className="label">
              Lines of Code Changed
            </label>
            <input
              type="number"
              id="lines_of_code_changed"
              name="lines_of_code_changed"
              value={formData.lines_of_code_changed}
              onChange={handleInputChange}
              min="0"
              step="1"
              className={`input ${validationErrors.lines_of_code_changed ? 'border-red-300' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.lines_of_code_changed && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.lines_of_code_changed}</p>
            )}
          </div>

          <div>
            <label htmlFor="commit_frequency" className="label">
              Commit Frequency (per day)
            </label>
            <input
              type="number"
              id="commit_frequency"
              name="commit_frequency"
              value={formData.commit_frequency}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className={`input ${validationErrors.commit_frequency ? 'border-red-300' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.commit_frequency && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.commit_frequency}</p>
            )}
          </div>

          <div>
            <label htmlFor="test_coverage" className="label">
              Test Coverage (%)
            </label>
            <input
              type="number"
              id="test_coverage"
              name="test_coverage"
              value={formData.test_coverage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className={`input ${validationErrors.test_coverage ? 'border-red-300' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.test_coverage && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.test_coverage}</p>
            )}
          </div>

          <div>
            <label htmlFor="number_of_build_steps" className="label">
              Number of Build Steps
            </label>
            <input
              type="number"
              id="number_of_build_steps"
              name="number_of_build_steps"
              value={formData.number_of_build_steps}
              onChange={handleInputChange}
              min="0"
              step="1"
              className={`input ${validationErrors.number_of_build_steps ? 'border-red-300' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.number_of_build_steps && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.number_of_build_steps}</p>
            )}
          </div>

          <div>
            <label htmlFor="code_complexity_score" className="label">
              Code Complexity Score
            </label>
            <input
              type="number"
              id="code_complexity_score"
              name="code_complexity_score"
              value={formData.code_complexity_score}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className={`input ${validationErrors.code_complexity_score ? 'border-red-300' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.code_complexity_score && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.code_complexity_score}</p>
            )}
          </div>
        </div>

        {/* Dropdown Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="environment_type" className="label">
              Environment Type
            </label>
            <select
              id="environment_type"
              name="environment_type"
              value={formData.environment_type}
              onChange={handleInputChange}
              className="input"
              disabled={isLoading}
            >
              {ENVIRONMENT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="build_trigger_type" className="label">
              Build Trigger Type
            </label>
            <select
              id="build_trigger_type"
              name="build_trigger_type"
              value={formData.build_trigger_type}
              onChange={handleInputChange}
              className="input"
              disabled={isLoading}
            >
              {BUILD_TRIGGER_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="previous_build_status" className="label">
              Previous Build Status
            </label>
            <select
              id="previous_build_status"
              name="previous_build_status"
              value={formData.previous_build_status}
              onChange={handleInputChange}
              className="input"
              disabled={isLoading}
            >
              {BUILD_STATUS_TYPES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pipeline_tool" className="label">
              Pipeline Tool
            </label>
            <select
              id="pipeline_tool"
              name="pipeline_tool"
              value={formData.pipeline_tool}
              onChange={handleInputChange}
              className="input"
              disabled={isLoading}
            >
              {PIPELINE_TOOLS.map(tool => (
                <option key={tool} value={tool}>
                  {tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex items-center space-x-2 flex-1"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Predict Build Outcome</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Field Descriptions:</h4>
        <ul className="space-y-1">
          <li><strong>Build Duration:</strong> Average time for builds to complete</li>
          <li><strong>Dependencies:</strong> Number of external libraries/packages used</li>
          <li><strong>Code Changes:</strong> Lines modified in the current commit</li>
          <li><strong>Commit Frequency:</strong> How often code is committed per day</li>
          <li><strong>Test Coverage:</strong> Percentage of code covered by tests</li>
          <li><strong>Build Steps:</strong> Number of steps in your CI/CD pipeline</li>
          <li><strong>Complexity Score:</strong> Estimated complexity of your codebase</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualForm;