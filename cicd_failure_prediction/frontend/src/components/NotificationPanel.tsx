import React, { useState } from 'react';
import type { PredictionResult } from '../types';
import { apiService, handleApiError } from '../api/api';
import { Mail, Send, AlertCircle, CheckCircle, Bell } from './Icons';

interface NotificationPanelProps {
  result: PredictionResult | null;
  onSendNotification: (email: string) => void;
  isLoading: boolean;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  result,
  onSendNotification,
  isLoading
}) => {
  const [email, setEmail] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSendEmail = async () => {
    if (!email || !result) return;

    setIsEmailLoading(true);
    setEmailStatus({ type: null, message: '' });

    try {
      const response = await apiService.sendNotification({
        prediction: result.prediction,
        probability: result.probability,
        message: result.message,
        email: email
      });

      setEmailStatus({
        type: response.success ? 'success' : 'error',
        message: response.message
      });

      if (response.success) {
        onSendNotification(email);
        setEmail('');
      }
    } catch (error) {
      setEmailStatus({
        type: 'error',
        message: handleApiError(error)
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const shouldShowNotification = result?.notification.should_notify || false;
  const alertType = result?.notification.alert_type || 'info';

  if (!result) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notification System</h3>
          <p className="text-gray-600">
            Run a prediction to see notification options
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
      </div>

      {/* Alert Status */}
      <div className={`p-4 rounded-lg border mb-6 ${
        shouldShowNotification 
          ? alertType === 'critical' 
            ? 'bg-red-50 border-red-200' 
            : alertType === 'warning'
            ? 'bg-orange-50 border-orange-200'
            : 'bg-yellow-50 border-yellow-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start space-x-3">
          {shouldShowNotification ? (
            <AlertCircle className={`w-5 h-5 mt-0.5 ${
              alertType === 'critical' ? 'text-red-600' :
              alertType === 'warning' ? 'text-orange-600' :
              'text-yellow-600'
            }`} />
          ) : (
            <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
          )}
          
          <div className="flex-1">
            <h4 className={`font-medium mb-1 ${
              shouldShowNotification 
                ? alertType === 'critical' ? 'text-red-900' :
                  alertType === 'warning' ? 'text-orange-900' :
                  'text-yellow-900'
                : 'text-green-900'
            }`}>
              {shouldShowNotification ? 'Alert Triggered' : 'No Alert Needed'}
            </h4>
            
            <p className={`text-sm ${
              shouldShowNotification 
                ? alertType === 'critical' ? 'text-red-800' :
                  alertType === 'warning' ? 'text-orange-800' :
                  'text-yellow-800'
                : 'text-green-800'
            }`}>
              {result.notification.alert_message}
            </p>
            
            <p className={`text-xs mt-2 ${
              shouldShowNotification 
                ? alertType === 'critical' ? 'text-red-700' :
                  alertType === 'warning' ? 'text-orange-700' :
                  'text-yellow-700'
                : 'text-green-700'
            }`}>
              Threshold: {(result.notification.threshold * 100).toFixed(0)}% failure probability
            </p>
          </div>
        </div>
      </div>

      {/* Email Notification */}
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to receive notifications"
                className="input pl-10"
                disabled={isEmailLoading}
              />
            </div>
            <button
              onClick={handleSendEmail}
              disabled={!email || isEmailLoading || !shouldShowNotification}
              className={`btn ${shouldShowNotification ? 'btn-primary' : 'btn-secondary'} flex items-center space-x-2`}
            >
              {isEmailLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Alert</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Email Status */}
        {emailStatus.message && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
            emailStatus.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {emailStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{emailStatus.message}</span>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500">
          {shouldShowNotification ? (
            <p>
              ⚠️ High-risk prediction detected. Email notification is recommended.
            </p>
          ) : (
            <p>
              ✅ Build prediction shows low risk. No notification needed, but you can still send an alert if desired.
            </p>
          )}
        </div>
      </div>

      {/* Notification Settings Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Notification Settings</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Alerts trigger when failure probability ≥ {(result.notification.threshold * 100).toFixed(0)}%</p>
          <p>• Email notifications include detailed analysis and recommendations</p>
          <p>• All predictions are logged for history tracking</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;