import React from 'react';
import type { PredictionResult } from '../types';
import { formatProbability, getRiskColor, getRiskBgColor } from '../api/api';
import { CheckCircle, XCircle, AlertTriangle, BarChart3, Clock, Target } from './Icons';

interface ResultCardProps {
  result: PredictionResult | null;
  isLoading: boolean;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, isLoading, onReset }) => {
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const isSuccess = result.prediction === 'Success';
  const probability = result.probability;

  return (
    <div className={`card animate-slide-up ${getRiskBgColor(probability)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {isSuccess ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">Prediction Result</h3>
            <p className="text-sm text-gray-600">{new Date(result.timestamp).toLocaleString()}</p>
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="btn btn-secondary text-sm"
        >
          New Prediction
        </button>
      </div>

      {/* Main Result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Prediction */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {result.prediction}
          </div>
          <p className="text-sm text-gray-600 mt-1">Build Prediction</p>
        </div>

        {/* Probability */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getRiskColor(probability)}`}>
            {formatProbability(probability)}
          </div>
          <p className="text-sm text-gray-600 mt-1">Failure Probability</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Risk Level</span>
          <span className={`text-sm font-medium ${getRiskColor(probability)}`}>
            {result.risk_level}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              probability >= 0.8 ? 'bg-red-500' :
              probability >= 0.6 ? 'bg-orange-500' :
              probability >= 0.4 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${probability * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Message */}
      <div className="mb-6">
        <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Recommendation</h4>
            <p className="text-sm text-blue-800">{result.message}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Target className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-gray-900">{result.confidence_level}</div>
          <div className="text-xs text-gray-600">Confidence</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <BarChart3 className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-gray-900">{result.risk_level}</div>
          <div className="text-xs text-gray-600">Risk Level</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-gray-900">
            {new Date(result.timestamp).toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-600">Analysis Time</div>
        </div>
      </div>

      {/* Alert Banner */}
      {result.notification.should_notify && (
        <div className={`p-4 rounded-lg border ${
          result.notification.alert_type === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
          result.notification.alert_type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' :
          'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Alert Triggered</h4>
              <p className="text-sm">{result.notification.alert_message}</p>
              <p className="text-xs mt-2 opacity-75">
                Notification threshold: {formatProbability(result.notification.threshold)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;