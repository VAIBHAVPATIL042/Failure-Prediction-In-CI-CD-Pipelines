import pickle
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Dict, Any, Tuple, Optional
import os
import warnings

# Suppress sklearn version warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

class MLPreprocessor:
    def __init__(self, model_path: str, vectorizer_path: str):
        """
        Initialize the ML preprocessor with model and vectorizer paths.
        
        Args:
            model_path (str): Path to the XGBoost model file
            vectorizer_path (str): Path to the TF-IDF vectorizer file
        """
        self.model_path = model_path
        self.vectorizer_path = vectorizer_path
        self.model = None
        self.vectorizer = None
        self.load_model_and_vectorizer()
    
    def load_model_and_vectorizer(self):
        """Load the pre-trained model and vectorizer"""
        try:
            # Load XGBoost model
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            print(f"✅ Model loaded successfully from {self.model_path}")
            
            # Load TF-IDF vectorizer using joblib
            self.vectorizer = joblib.load(self.vectorizer_path)
            print(f"✅ Vectorizer loaded successfully from {self.vectorizer_path}")
            
        except FileNotFoundError as e:
            print(f"❌ File not found: {e}")
            raise
        except Exception as e:
            print(f"❌ Error loading model/vectorizer: {e}")
            raise
    
    def preprocess_yaml_features(self, features: Dict[str, Any]) -> np.ndarray:
        """
        Preprocess YAML features for prediction.
        
        Args:
            features (Dict[str, Any]): Extracted features from YAML file
            
        Returns:
            np.ndarray: Preprocessed feature vector
        """
        try:
            # If we have raw text, use TF-IDF vectorization
            if 'raw_text' in features and self.vectorizer:
                text_features = self.vectorizer.transform([features['raw_text']])
                return text_features.toarray()
            
            # Otherwise, use numeric features (fallback)
            numeric_features = self._extract_numeric_features(features)
            return np.array([numeric_features])
            
        except Exception as e:
            print(f"❌ Error in preprocessing: {e}")
            raise
    
    def preprocess_manual_features(self, features: Dict[str, Any]) -> np.ndarray:
        """
        Preprocess manual form features for prediction.
        
        Args:
            features (Dict[str, Any]): Manual form features
            
        Returns:
            np.ndarray: Preprocessed feature vector
        """
        try:
            # Convert categorical features to numeric
            processed_features = []
            
            # Numeric features
            numeric_fields = [
                'build_duration', 'number_of_dependencies', 'lines_of_code_changed',
                'commit_frequency', 'test_coverage', 'number_of_build_steps',
                'code_complexity_score'
            ]
            
            for field in numeric_fields:
                processed_features.append(float(features.get(field, 0)))
            
            # Categorical features (encoded)
            environment_mapping = {'production': 2, 'staging': 1, 'development': 0, 'unknown': -1}
            trigger_mapping = {'push': 2, 'pull_request': 1, 'scheduled': 0, 'manual': -1}
            status_mapping = {'success': 1, 'failure': 0, 'unknown': -1}
            tool_mapping = {
                'github_actions': 4, 'gitlab_ci': 3, 'azure_devops': 2, 
                'circleci': 1, 'travis_ci': 0, 'unknown': -1
            }
            
            processed_features.extend([
                environment_mapping.get(features.get('environment_type', 'unknown'), -1),
                trigger_mapping.get(features.get('build_trigger_type', 'manual'), -1),
                status_mapping.get(features.get('previous_build_status', 'unknown'), -1),
                tool_mapping.get(features.get('pipeline_tool', 'unknown'), -1)
            ])
            
            return np.array([processed_features])
            
        except Exception as e:
            print(f"❌ Error in manual preprocessing: {e}")
            raise
    
    def _extract_numeric_features(self, features: Dict[str, Any]) -> list:
        """Extract numeric features from parsed YAML features"""
        return [
            features.get('number_of_build_steps', 0),
            features.get('number_of_dependencies', 0),
            features.get('yaml_complexity', 0),
            1 if features.get('has_test_stage', False) else 0,
            1 if features.get('has_deploy_stage', False) else 0,
            self._encode_pipeline_tool(features.get('pipeline_tool', 'unknown')),
            self._encode_environment(features.get('environment_type', 'unknown')),
            self._encode_trigger(features.get('build_trigger_type', 'manual'))
        ]
    
    def _encode_pipeline_tool(self, tool: str) -> int:
        """Encode pipeline tool to numeric value"""
        mapping = {
            'github_actions': 4, 'gitlab_ci': 3, 'azure_devops': 2,
            'circleci': 1, 'travis_ci': 0, 'unknown': -1
        }
        return mapping.get(tool, -1)
    
    def _encode_environment(self, env: str) -> int:
        """Encode environment type to numeric value"""
        mapping = {'production': 2, 'staging': 1, 'development': 0, 'unknown': -1}
        return mapping.get(env, -1)
    
    def _encode_trigger(self, trigger: str) -> int:
        """Encode build trigger to numeric value"""
        mapping = {'push': 2, 'pull_request': 1, 'scheduled': 0, 'manual': -1}
        return mapping.get(trigger, -1)
    
    def predict(self, features: np.ndarray) -> Tuple[str, float]:
        """
        Make prediction using the loaded model.
        
        Args:
            features (np.ndarray): Preprocessed features
            
        Returns:
            Tuple[str, float]: (prediction, probability)
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded")
            
            # Get prediction and probability
            prediction = self.model.predict(features)[0]
            probability = self.model.predict_proba(features)[0]
            
            # Convert to human-readable format
            predicted_class = "Fail" if prediction == 1 else "Success"
            confidence = float(probability[1])  # Probability of failure
            
            return predicted_class, confidence
            
        except Exception as e:
            print(f"❌ Error in prediction: {e}")
            raise
    
    def get_recommendation(self, prediction: str, probability: float, features: Dict[str, Any]) -> str:
        """
        Generate recommendation based on prediction and features.
        
        Args:
            prediction (str): Predicted outcome
            probability (float): Prediction confidence
            features (Dict[str, Any]): Original features
            
        Returns:
            str: Recommendation message
        """
        if prediction == "Fail":
            if probability > 0.8:
                return "⚠️ Very high risk of build failure. Review your pipeline configuration immediately."
            elif probability > 0.6:
                return "⚠️ High risk of build failure. Consider adding more testing stages."
            else:
                return "⚠️ Moderate risk of build failure. Review configuration before deployment."
        else:
            if probability < 0.3:
                return "✅ Very low risk of build failure. Configuration looks good!"
            elif probability < 0.5:
                return "✅ Low risk of build failure. Good pipeline configuration."
            else:
                return "✅ Build likely to succeed, but monitor for potential issues."
