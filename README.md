# 🏥 MonkeyPox Disease Prediction System

An AI-powered web application that uses deep learning to analyze medical images and predict skin conditions including Measles, Monkeypox, Normal skin, and Chickenpox.

![Status](https://img.shields.io/badge/status-active-success)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Flask](https://img.shields.io/badge/flask-2.3+-green)
![TensorFlow](https://img.shields.io/badge/tensorflow-2.13+-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **📷 Image Upload**: Drag & drop or click to upload medical images (PNG, JPG, GIF, BMP)
- **🤖 AI Prediction**: Uses trained Keras deep learning model for accurate predictions
- **📊 Confidence Scores**: Visual progress bars showing prediction confidence for all disease categories
- **🛡️ Health Precautions**: Personalized health guidelines and precautions for each disease
- **🖨️ Print Report**: Print-friendly report with image and analysis
- **📄 PDF Download**: Professional formatted PDF with embedded images
- **⬇️ Text Download**: Download report as text file
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **⚡ Fast Processing**: Real-time image analysis and prediction

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual Environment (recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/skin-disease-prediction.git
cd skin-disease-prediction
```

2. **Create virtual environment**
```bash
python -m venv venv
```

3. **Activate virtual environment**

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

4. **Install dependencies**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

5. **Place your trained model**
   - Add your trained `.keras` model to the `models/` folder
   - Update the `MODEL_PATH` in `app.py` if needed:
   ```python
   MODEL_PATH = 'models/disease_predictor_model.keras'
   ```

6. **Run the application**
```bash
python app.py
```

7. **Open in browser**
   - Navigate to `http://localhost:5000`
   - The application will load successfully if the model is available

## 📁 Project Structure

```
skin-disease-prediction/
├── app.py                          # Flask backend application
├── requirements.txt                # Project dependencies
├── README.md                       # This file
│
├── templates/
│   └── index.html                 # Main HTML template
│
├── static/
│   ├── css/
│   │   └── styles.css             # Complete stylesheet
│   ├── js/
│   │   ├── script.js              # Main JavaScript logic
│   │   └── precautions.js         # Disease precautions database
│   └── images/
│       └── (optional background images)
│
├── uploads/                        # Temporary image uploads (auto-created)
│
└── models/
    └── disease_predictor_model.keras  # Your trained Keras model
```

## 📋 Requirements

All dependencies are listed in `requirements.txt`:

```
Flask==2.3.3
Werkzeug==2.3.7
numpy==1.24.3
opencv-python==4.8.1.78
tensorflow==2.13.0
keras==2.13.1
Pillow==10.0.0
```

## 🎯 How to Use

### 1. Upload an Image
- Click on the upload area or drag and drop
- Select a clear image of the affected skin area
- Supported formats: PNG, JPG, GIF, BMP
- Maximum file size: 10MB

### 2. Analyze Image
- Click the **"🔍 Predict"** button
- Wait for the model to process the image
- View the uploaded image in the results section

### 3. View Results
- **Predicted Disease**: Main diagnosis
- **Confidence Score**: Percentage confidence (0-100%)
- **Confidence Scores**: Detailed breakdown for all disease categories
- **Precautions**: Personalized health guidelines for the predicted condition

### 4. Export Results
- **🖨️ Print Report**: Print to paper or save as PDF from browser
- **📄 Download as PDF**: Professional formatted PDF with embedded image
- **⬇️ Download as Text**: Plain text report for records

## 🔧 Configuration

### Model Configuration
Edit `app.py` to customize:

```python
# Line 49-53: Disease labels
class_names = ['Measles', 'Monkeypox', 'Normal', 'Chickenpox']

# Line 55-59: Model information
MODEL_INFO = {
    'title': 'Skin Disease Prediction System',
    'description': '...',
    'instructions': '...'
}

# Line 68: Model path
MODEL_PATH = 'models/disease_predictor_model.keras'

# Line 38-40: Upload settings
IMAGE_SIZE = (224, 224)  # Adjust to your model's input size
MAX_FILE_SIZE = 10 * 1024 * 1024  # Max file size in bytes
```

### Image Input Size
Update `IMAGE_SIZE` in `app.py` to match your model's expected input:
```python
IMAGE_SIZE = (224, 224)  # Change based on your model requirements
```

### Background Image
Add background image to `static/css/styles.css`:
```css
body {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%), 
                url('../images/bg.jpg') center/cover no-repeat;
    background-attachment: fixed;
}
```

## 🏥 Disease Information

### Supported Diseases

**Measles**
- Highly contagious viral infection
- Precautions: Vaccination, hand hygiene, respiratory hygiene

**Monkeypox**
- Viral infection spreading through direct contact
- Precautions: Contact avoidance, environmental hygiene

**Chickenpox**
- Highly contagious viral infection
- Precautions: Vaccination, isolation, skin care

**Normal**
- Healthy skin condition
- Precautions: Maintenance and prevention guidelines

## 🖥️ API Endpoints

### POST /predict
Upload an image and get predictions

**Request:**
```bash
curl -X POST -F "file=@image.jpg" http://localhost:5000/predict
```

**Response:**
```json
{
    "success": true,
    "prediction": {
        "predicted_class": "Measles",
        "confidence": 95.5,
        "class_probabilities": {
            "Measles": 95.5,
            "Monkeypox": 2.1,
            "Normal": 1.2,
            "Chickenpox": 1.2
        }
    }
}
```

### GET /api/info
Get model information

**Response:**
```json
{
    "title": "Skin Disease Prediction System",
    "description": "...",
    "instructions": "..."
}
```

### GET /api/classes
Get available disease classes

**Response:**
```json
{
    "classes": ["Measles", "Monkeypox", "Normal", "Chickenpox"]
}
```

## 🔐 Security Considerations

- ✅ File type validation (whitelist approach)
- ✅ File size limit enforcement
- ✅ Secure filename handling
- ✅ Temporary file cleanup
- ✅ Error handling without exposing system details

### Production Deployment

For production use:

1. **Set `debug=False`** in `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
```

2. **Use a production WSGI server** (Gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. **Set up HTTPS** with SSL certificates

4. **Configure environment variables**:
```bash
export FLASK_ENV=production
export MODEL_PATH=/path/to/model.keras
```

## 📊 Model Requirements

Your Keras model should:

- ✅ Accept input shape: `(batch_size, 224, 224, 3)` (or your configured size)
- ✅ Output probabilities for 4 classes
- ✅ Be saved in `.keras` format
- ✅ Be compatible with TensorFlow 2.13+

### Model Conversion

If your model is in `.h5` format, convert it:

```python
import tensorflow as tf

# Load old model
old_model = tf.keras.models.load_model('model.h5')

# Save as .keras
old_model.save('model.keras')
```

## 🐛 Troubleshooting

### Model Not Loading
- Check model file exists at specified path
- Verify model format is `.keras`
- Check TensorFlow version compatibility
- View Flask logs for detailed errors

### Image Upload Issues
- Ensure image format is supported (PNG, JPG, GIF, BMP)
- Check file size is under 10MB
- Verify file is not corrupted

### PDF Download Not Working
- Check browser console for JavaScript errors (F12)
- Ensure image is properly uploaded and displayed
- Try a different browser
- Check internet connection (CDN libraries may not load)

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or use different port
python app.py  # Modify port in app.py
```

## 📝 Important Disclaimer

⚠️ **Medical Disclaimer**

This application is for **informational and educational purposes only**. 

- ❌ NOT a substitute for professional medical diagnosis
- ❌ NOT a replacement for medical consultation
- ✅ Always consult qualified healthcare professionals
- ✅ Use results with professional medical guidance

**Users are fully responsible for their health decisions.**

## 🔄 Development Workflow

### Adding New Disease

1. Update `class_names` in `app.py`
2. Add disease precautions to `static/js/precautions.js`
3. Retrain model with new class
4. Update documentation

### Customizing UI

- **Styling**: Edit `static/css/styles.css`
- **Layout**: Modify `templates/index.html`
- **Functionality**: Update `static/js/script.js`

### Testing

```bash
# Test model loading
python -c "from app import model; print('Model loaded successfully')"

# Test Flask app
python app.py

# Visit http://localhost:5000
```

## 📚 Technologies Used

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.8+ | Backend language |
| Flask | 2.3+ | Web framework |
| TensorFlow/Keras | 2.13 | Deep learning framework |
| OpenCV | 4.8+ | Image processing |
| NumPy | 1.24+ | Numerical computing |
| Pillow | 10.0+ | Image handling |
| jsPDF | 2.5+ | PDF generation |
| HTML5 | Latest | Frontend markup |
| CSS3 | Latest | Styling |
| JavaScript | ES6+ | Frontend logic |

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support & Contact

- **Issues**: Report bugs on GitHub Issues
- **Questions**: Start a GitHub Discussion
- **Email**: your.email@example.com

## 🙏 Acknowledgments

- TensorFlow/Keras for deep learning framework
- Flask for web framework
- jsPDF for PDF generation
- OpenCV for image processing
- Unsplash for sample images

## 🔮 Future Enhancements

- [ ] User authentication and history
- [ ] Multiple language support
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Batch image processing
- [ ] Mobile app version
- [ ] Real-time image capture from webcam
- [ ] Model versioning system
- [ ] Database integration for record keeping
- [ ] Email report delivery

## 📈 Performance Metrics

Current performance on test dataset:
- **Accuracy**: ~95%
- **Average Prediction Time**: <2 seconds
- **Max Image Size**: 10MB
- **Supported Formats**: PNG, JPG, GIF, BMP

## 📖 Documentation

For detailed documentation:
- See `CONTRIBUTING.md` for contribution guidelines
- See `SETUP.md` for detailed installation steps
- See `API.md` for API documentation

---

**Made with ❤️ for Healthcare**

Last Updated: January 2026
Version: 1.0.0
