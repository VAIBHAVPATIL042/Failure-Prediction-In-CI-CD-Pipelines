from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
from typing import Dict, Any

# Import custom utilities
from utils.parser import parse_yml_file, extract_manual_features
from utils.preprocess import MLPreprocessor
from utils.notifier import NotificationService

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'yml', 'yaml'}

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize ML components
try:
    # Get paths to model files (adjust paths as needed)
    model_path = os.path.join('..', '..', 'xgb_cicd_model.pkl')
    vectorizer_path = os.path.join('..', '..', 'tfidf_vectorizer.pkl')
    
    # Initialize preprocessor with model and vectorizer
    ml_processor = MLPreprocessor(model_path, vectorizer_path)
    print("✅ ML Processor initialized successfully")
    
except Exception as e:
    print(f"❌ Error initializing ML Processor: {e}")
    ml_processor = None

# Initialize notification service
notification_service = NotificationService()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_prediction_response(prediction: str, probability: float, features: Dict[str, Any], 
                             filename: str = None) -> Dict[str, Any]:
    """Create standardized prediction response"""
    
    # Get recommendation
    recommendation = ml_processor.get_recommendation(prediction, probability, features)
    
    # Create base response
    response = {
        "prediction": prediction,
        "probability": round(probability, 3),
        "message": recommendation,
        "timestamp": datetime.now().isoformat(),
        "confidence_level": "High" if abs(probability - 0.5) > 0.3 else "Medium",
        "risk_level": get_risk_level(probability)
    }
    
    # Add notification info
    notification_info = notification_service.create_notification_response({
        "prediction": prediction,
        "probability": probability,
        "message": recommendation
    })
    response["notification"] = notification_info
    
    # Log prediction
    notification_service.log_prediction(response, filename)
    
    return response

def get_risk_level(probability: float) -> str:
    """Get risk level based on failure probability"""
    if probability >= 0.8:
        return "Critical"
    elif probability >= 0.6:
        return "High"
    elif probability >= 0.4:
        return "Medium"
    else:
        return "Low"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ml_processor": "ready" if ml_processor else "not available",
        "version": "1.0.0"
    })

@app.route('/predict-file', methods=['POST'])
def predict_file():
    """Predict build outcome from uploaded YAML file"""
    try:
        # Check if ML processor is available
        if not ml_processor:
            return jsonify({
                "error": "ML model not available. Please check server configuration."
            }), 500
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                "error": "Invalid file type. Please upload a .yml or .yaml file."
            }), 400
        
        # Read file content
        file_content = file.read().decode('utf-8')
        
        # Parse YAML file
        parsed_features = parse_yml_file(file_content)
        
        if "error" in parsed_features:
            return jsonify(parsed_features), 400
        
        # Preprocess features for ML model
        processed_features = ml_processor.preprocess_yaml_features(parsed_features)
        
        # Make prediction
        prediction, probability = ml_processor.predict(processed_features)
        
        # Create response
        response = create_prediction_response(
            prediction, probability, parsed_features, 
            secure_filename(file.filename)
        )
        
        return jsonify(response)
        
    except Exception as e:
        app.logger.error(f"Error in predict_file: {str(e)}")
        return jsonify({
            "error": f"Server error during prediction: {str(e)}"
        }), 500

@app.route('/predict-form', methods=['POST'])
def predict_form():
    """Predict build outcome from manual form input"""
    try:
        # Check if ML processor is available
        if not ml_processor:
            return jsonify({
                "error": "ML model not available. Please check server configuration."
            }), 500
        
        # Get JSON data from request
        form_data = request.get_json()
        
        if not form_data:
            return jsonify({"error": "No form data provided"}), 400
        
        # Extract and validate manual features
        parsed_features = extract_manual_features(form_data)
        
        if "error" in parsed_features:
            return jsonify(parsed_features), 400
        
        # Preprocess features for ML model
        processed_features = ml_processor.preprocess_manual_features(parsed_features)
        
        # Make prediction
        prediction, probability = ml_processor.predict(processed_features)
        
        # Create response
        response = create_prediction_response(
            prediction, probability, parsed_features
        )
        
        return jsonify(response)
        
    except Exception as e:
        app.logger.error(f"Error in predict_form: {str(e)}")
        return jsonify({
            "error": f"Server error during prediction: {str(e)}"
        }), 500

@app.route('/notify', methods=['POST'])
def send_notification():
    """Send notification email for high-risk predictions"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Required fields
        required_fields = ['prediction', 'probability', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if notification should be sent
        probability = float(data['probability'])
        if not notification_service.should_notify(probability):
            return jsonify({
                "success": False,
                "message": f"Probability ({probability:.1%}) below notification threshold ({notification_service.notification_threshold:.1%})"
            })
        
        # Send email notification
        result = notification_service.send_email_notification(data, data['email'])
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Error in send_notification: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about the loaded ML model"""
    if not ml_processor:
        return jsonify({
            "error": "ML model not available"
        }), 500
    
    try:
        info = {
            "model_type": "XGBoost Classifier",
            "vectorizer_type": "TF-IDF Vectorizer",
            "model_loaded": ml_processor.model is not None,
            "vectorizer_loaded": ml_processor.vectorizer is not None,
            "notification_threshold": notification_service.notification_threshold,
            "supported_formats": list(ALLOWED_EXTENSIONS),
            "max_file_size": "16MB"
        }
        
        # Add model-specific info if available
        if ml_processor.model:
            try:
                info["model_features"] = ml_processor.model.n_features_in_ if hasattr(ml_processor.model, 'n_features_in_') else "Unknown"
            except:
                info["model_features"] = "Unknown"
        
        if ml_processor.vectorizer:
            try:
                info["vocabulary_size"] = len(ml_processor.vectorizer.vocabulary_) if hasattr(ml_processor.vectorizer, 'vocabulary_') else "Unknown"
            except:
                info["vocabulary_size"] = "Unknown"
        
        return jsonify(info)
        
    except Exception as e:
        return jsonify({
            "error": f"Error getting model info: {str(e)}"
        }), 500

@app.route('/upload-history', methods=['GET'])
def get_upload_history():
    """Get history of recent predictions (if logging is enabled)"""
    try:
        log_file = os.path.join("logs", "predictions.log")
        
        if not os.path.exists(log_file):
            return jsonify({"history": []})
        
        # Read last 50 entries
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Parse recent entries
        recent_entries = []
        for line in lines[-50:]:  # Last 50 entries
            if line.strip():
                try:
                    parts = line.strip().split(' | ')
                    if len(parts) >= 4:
                        entry = {
                            "timestamp": parts[0],
                            "filename": parts[1].replace("File: ", ""),
                            "prediction": parts[2].replace("Prediction: ", ""),
                            "probability": float(parts[3].replace("Probability: ", ""))
                        }
                        recent_entries.append(entry)
                except:
                    continue  # Skip malformed lines
        
        return jsonify({"history": recent_entries[-20:]})  # Return last 20 entries
        
    except Exception as e:
        app.logger.error(f"Error getting upload history: {str(e)}")
        return jsonify({"error": f"Error retrieving history: {str(e)}"}), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        "error": "File too large. Maximum file size is 16MB."
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    print("🚀 Starting CI/CD Failure Prediction API...")
    print(f"📁 Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"🤖 ML Processor: {'Ready' if ml_processor else 'Not Available'}")
    print(f"📧 Notification threshold: {notification_service.notification_threshold:.1%}")
    print("=" * 50)
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
