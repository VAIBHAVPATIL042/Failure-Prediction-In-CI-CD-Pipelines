import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any, Optional

class NotificationService:
    def __init__(self):
        """Initialize notification service with environment variables"""
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.sender_email = os.getenv('SENDER_EMAIL', '')
        self.sender_password = os.getenv('SENDER_PASSWORD', '')
        self.notification_threshold = float(os.getenv('NOTIFICATION_THRESHOLD', '0.7'))
    
    def should_notify(self, probability: float) -> bool:
        """
        Check if notification should be sent based on failure probability.
        
        Args:
            probability (float): Failure probability (0-1)
            
        Returns:
            bool: True if notification should be sent
        """
        return probability >= self.notification_threshold
    
    def create_email_message(self, prediction_data: Dict[str, Any], recipient_email: str) -> MIMEMultipart:
        """
        Create email message for high-risk prediction notification.
        
        Args:
            prediction_data (Dict[str, Any]): Prediction results
            recipient_email (str): Email address to send notification to
            
        Returns:
            MIMEMultipart: Email message object
        """
        message = MIMEMultipart()
        message['From'] = self.sender_email
        message['To'] = recipient_email
        message['Subject'] = "⚠️ CI/CD Build Risk Alert"
        
        # Create HTML email body
        html_body = f"""
        <html>
        <head></head>
        <body>
            <h2 style="color: #d73027;">⚠️ CI/CD Build Risk Alert</h2>
            
            <p>Your uploaded pipeline configuration shows a <strong>high risk of build failure</strong>.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #d73027; margin: 20px 0;">
                <h3>Prediction Results:</h3>
                <ul>
                    <li><strong>Prediction:</strong> {prediction_data.get('prediction', 'Unknown')}</li>
                    <li><strong>Failure Probability:</strong> {prediction_data.get('probability', 0):.1%}</li>
                    <li><strong>Timestamp:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</li>
                </ul>
            </div>
            
            <div style="background-color: #e8f4fd; padding: 15px; border-left: 4px solid #1f77b4; margin: 20px 0;">
                <h3>Recommendation:</h3>
                <p>{prediction_data.get('message', 'Please review your pipeline configuration.')}</p>
            </div>
            
            <h3>Common Issues to Check:</h3>
            <ul>
                <li>Missing test stages or inadequate test coverage</li>
                <li>Complex build steps that might fail</li>
                <li>Missing error handling in pipeline scripts</li>
                <li>Insufficient resource allocation</li>
                <li>Dependency conflicts or missing dependencies</li>
            </ul>
            
            <p style="margin-top: 20px;">
                <em>This alert was generated automatically by the CI/CD Failure Prediction System.</em>
            </p>
        </body>
        </html>
        """
        
        message.attach(MIMEText(html_body, 'html'))
        return message
    
    def send_email_notification(self, prediction_data: Dict[str, Any], recipient_email: str) -> Dict[str, Any]:
        """
        Send email notification for high-risk predictions.
        
        Args:
            prediction_data (Dict[str, Any]): Prediction results
            recipient_email (str): Email address to send notification to
            
        Returns:
            Dict[str, Any]: Status of email sending
        """
        try:
            if not self.sender_email or not self.sender_password:
                return {
                    "success": False,
                    "message": "Email credentials not configured. Set SENDER_EMAIL and SENDER_PASSWORD environment variables."
                }
            
            if not recipient_email:
                return {
                    "success": False,
                    "message": "Recipient email address is required."
                }
            
            # Create message
            message = self.create_email_message(prediction_data, recipient_email)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
            
            return {
                "success": True,
                "message": f"Notification email sent successfully to {recipient_email}"
            }
            
        except smtplib.SMTPAuthenticationError:
            return {
                "success": False,
                "message": "SMTP authentication failed. Check email credentials."
            }
        except smtplib.SMTPException as e:
            return {
                "success": False,
                "message": f"SMTP error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error sending email: {str(e)}"
            }
    
    def log_prediction(self, prediction_data: Dict[str, Any], filename: Optional[str] = None) -> None:
        """
        Log prediction results to a file.
        
        Args:
            prediction_data (Dict[str, Any]): Prediction results
            filename (Optional[str]): Original filename if available
        """
        try:
            log_dir = "logs"
            if not os.path.exists(log_dir):
                os.makedirs(log_dir)
            
            log_file = os.path.join(log_dir, "predictions.log")
            
            with open(log_file, "a", encoding="utf-8") as f:
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                log_entry = f"{timestamp} | File: {filename or 'Manual'} | Prediction: {prediction_data.get('prediction', 'Unknown')} | Probability: {prediction_data.get('probability', 0):.3f}\n"
                f.write(log_entry)
                
        except Exception as e:
            print(f"Warning: Could not log prediction: {e}")
    
    def create_notification_response(self, prediction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a notification response for the frontend.
        
        Args:
            prediction_data (Dict[str, Any]): Prediction results
            
        Returns:
            Dict[str, Any]: Notification response
        """
        probability = prediction_data.get('probability', 0)
        should_alert = self.should_notify(probability)
        
        response = {
            "should_notify": should_alert,
            "threshold": self.notification_threshold,
            "alert_type": self._get_alert_type(probability),
            "alert_message": self._get_alert_message(probability, prediction_data.get('prediction', 'Unknown'))
        }
        
        return response
    
    def _get_alert_type(self, probability: float) -> str:
        """Get alert type based on probability"""
        if probability >= 0.8:
            return "critical"
        elif probability >= 0.6:
            return "warning"
        elif probability >= 0.4:
            return "info"
        else:
            return "success"
    
    def _get_alert_message(self, probability: float, prediction: str) -> str:
        """Get alert message based on probability and prediction"""
        if probability >= 0.8:
            return f"🚨 Critical Alert: {probability:.1%} chance of build failure!"
        elif probability >= 0.6:
            return f"⚠️ Warning: {probability:.1%} chance of build failure."
        elif probability >= 0.4:
            return f"ℹ️ Moderate risk: {probability:.1%} chance of build failure."
        else:
            return f"✅ Low risk: {probability:.1%} chance of build failure."
