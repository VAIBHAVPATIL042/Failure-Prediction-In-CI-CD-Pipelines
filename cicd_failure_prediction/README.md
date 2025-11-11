# CI/CD Failure Prediction System

A full-stack web application that predicts the likelihood of CI/CD pipeline failures using machine learning. The system analyzes YAML configuration files and pipeline metrics to provide real-time failure probability predictions with confidence scores.

## 🚀 Features

- **Real-time Prediction**: Upload YAML files or enter manual data for instant predictions
- **ML-Powered**: Uses pre-trained XGBoost model with TF-IDF vectorization
- **Multi-Platform Support**: GitHub Actions, GitLab CI, Azure DevOps, CircleCI, Travis CI
- **Risk Assessment**: Color-coded risk levels with actionable recommendations
- **Notification System**: Email alerts for high-risk predictions
- **Interactive Dashboard**: Modern React UI with real-time updates
- **Prediction History**: Track and review past predictions

## 📦 Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19 + TypeScript + TailwindCSS + Vite |
| **Backend** | Python Flask + Flask-CORS |
| **ML Model** | XGBoost Classifier |
| **Vectorization** | TF-IDF (scikit-learn) |
| **Notifications** | Email (SMTP) + Frontend Toasts |
| **API** | RESTful API with JSON responses |

## 🏗️ Project Structure

```
cicd_failure_prediction/
├── backend/
│   ├── app.py                   # Flask API server
│   ├── requirements.txt         # Python dependencies
│   ├── model/                   # ML model storage
│   ├── utils/
│   │   ├── parser.py           # YAML parsing logic
│   │   ├── preprocess.py       # ML preprocessing
│   │   └── notifier.py         # Notification service
│   ├── uploads/                # File upload storage
│   └── logs/                   # Prediction logs
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   ├── NotificationPanel.tsx
│   │   │   └── ManualForm.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx   # Main dashboard
│   │   ├── api/
│   │   │   └── api.ts          # API service layer
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── xgb_cicd_model.pkl          # Pre-trained ML model
├── tfidf_vectorizer.pkl        # TF-IDF vectorizer
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **npm or yarn** (for package management)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd cicd_failure_prediction/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Copy model files:**
   Ensure `xgb_cicd_model.pkl` and `tfidf_vectorizer.pkl` are in the root directory (two levels up from backend)

5. **Configure environment variables (optional):**
   Create a `.env` file in the backend directory:
   ```env
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SENDER_EMAIL=your-email@gmail.com
   SENDER_PASSWORD=your-app-password
   NOTIFICATION_THRESHOLD=0.7
   ```

6. **Start the Flask server:**
   ```bash
   python app.py
   ```
   
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd cicd_failure_prediction/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## 🎯 Usage

### Method 1: Upload YAML File

1. Click on the "Upload YAML" tab
2. Drag & drop or select your CI/CD configuration file (.yml or .yaml)
3. Preview the file content
4. Click "Predict Build Outcome"
5. View results with confidence scores and recommendations

### Method 2: Manual Entry

1. Click on the "Manual Entry" tab
2. Fill in the pipeline metrics:
   - Build Duration (minutes)
   - Number of Dependencies
   - Lines of Code Changed
   - Commit Frequency (per day)
   - Test Coverage (%)
   - Number of Build Steps
   - Environment Type
   - Build Trigger Type
   - Previous Build Status
   - Code Complexity Score
   - Pipeline Tool
3. Click "Predict Build Outcome"
4. Review the prediction results

### Understanding Results

- **Prediction**: Success or Failure
- **Probability**: Likelihood of failure (0-100%)
- **Risk Level**: Critical, High, Medium, or Low
- **Recommendation**: Actionable advice based on analysis
- **Notification**: Alerts for high-risk predictions

## 📧 Email Notifications

Configure email notifications for high-risk predictions:

1. Set up environment variables in the backend
2. Enter your email address in the notification panel
3. Click "Send Alert" for predictions above the threshold
4. Receive detailed email with analysis and recommendations

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and system status |
| `/predict-file` | POST | Predict from uploaded YAML file |
| `/predict-form` | POST | Predict from manual form data |
| `/notify` | POST | Send email notification |
| `/model-info` | GET | Get model information |
| `/upload-history` | GET | Get prediction history |

### Example API Usage

```bash
# Health check
curl http://localhost:5000/health

# File prediction
curl -X POST -F "file=@pipeline.yml" http://localhost:5000/predict-file

# Manual prediction
curl -X POST -H "Content-Type: application/json" \
  -d '{"build_duration": 5.2, "number_of_dependencies": 15, ...}' \
  http://localhost:5000/predict-form
```

## 🧠 ML Model Details

- **Algorithm**: XGBoost Classifier
- **Features**: Text-based (TF-IDF) + Numeric pipeline metrics
- **Training Data**: CI/CD pipeline configurations with success/failure labels
- **Vectorization**: TF-IDF with 5000 features
- **Performance**: Optimized for production use

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live prediction results
- **File Preview**: View YAML content before prediction
- **Progress Indicators**: Visual feedback during processing
- **Toast Notifications**: Non-intrusive alerts
- **Dark/Light Mode**: System preference detection
- **Accessibility**: WCAG compliant interface

## 🔒 Security & Privacy

- **File Validation**: Strict file type and size limits
- **Input Sanitization**: All inputs validated and sanitized
- **No Data Storage**: Files processed in memory only
- **Optional Logging**: Prediction history stored locally
- **Email Security**: SMTP over TLS/SSL

## 🚀 Deployment

### Production Build

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure production settings:**
   - Update API URLs in frontend
   - Set production environment variables
   - Configure reverse proxy (nginx/Apache)

3. **Deploy backend:**
   - Use production WSGI server (Gunicorn, uWSGI)
   - Configure database for prediction history
   - Set up monitoring and logging

### Docker Deployment (Optional)

Create `Dockerfile` for containerized deployment:

```dockerfile
# Backend
FROM python:3.9-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["python", "app.py"]

# Frontend
FROM node:18-alpine
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Troubleshooting

### Common Issues

1. **Model not loading:**
   - Ensure `xgb_cicd_model.pkl` and `tfidf_vectorizer.pkl` are in the correct location
   - Check file permissions and paths

2. **CORS errors:**
   - Verify Flask-CORS is installed
   - Check frontend API base URL

3. **Email notifications not working:**
   - Verify SMTP settings and credentials
   - Check firewall and security settings

4. **File upload errors:**
   - Check file size (max 16MB)
   - Ensure file has .yml or .yaml extension
   - Verify file is valid YAML format

### Development Tips

- Use browser developer tools for debugging
- Check Flask console for backend errors
- Enable verbose logging for troubleshooting
- Test with sample YAML files first

## 📊 Performance

- **API Response Time**: < 1.5s for typical files
- **Frontend Load Time**: < 3s initial load
- **File Processing**: Supports up to 16MB YAML files
- **Concurrent Users**: Configurable based on deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- XGBoost team for the machine learning framework
- React and Flask communities
- Open source contributors

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review API documentation

---

**Happy Predicting! 🎯**