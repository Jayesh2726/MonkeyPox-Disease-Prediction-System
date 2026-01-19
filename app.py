from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
import os
import numpy as np
import cv2
import tensorflow as tf
from tensorflow import keras
from datetime import datetime

# Initialize Flask application
app = Flask(__name__)

# ==================== CONFIGURATION ====================
# File upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB max file size
IMAGE_SIZE = (224, 224)  # Adjust based on your model's input size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# ==================== MODEL CONFIGURATION ====================
# Define prediction categories and model information
class_names = ['Measles', 'Monkeypox', 'Normal', 'Chickenpox']

MODEL_INFO = {
    'title': 'Skin Disease Prediction System',
    'description': 'This deep learning model uses a trained Keras neural network to analyze medical images and predict the likelihood of various skin conditions including Measles, Monkeypox, Normal skin, and Chickenpox.',
    'instructions': 'Upload a clear image of the affected skin area in JPG, PNG, or GIF format. The image will be analyzed and a prediction with confidence scores will be provided.'
}

# Load the trained Keras model (.keras format)
# Replace 'your_model.keras' with your actual model file path
try:
    MODEL_PATH = 'E:\MaxGen\git2025\MPDD\MonkeyPox-Disease-Prediction-System\cnn_mpdd67%_optimized_model.keras'
    model = keras.models.load_model(MODEL_PATH)
    MODEL_LOADED = True
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Warning: Could not load model from {MODEL_PATH}: {e}")
    print("Application will run but predictions will not be available.")
    MODEL_LOADED = False
    model = None

# ==================== UTILITY FUNCTIONS ====================
def allowed_file(filename):
    """Check if uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    """
    Load and preprocess image for model prediction using OpenCV.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        np.array: Preprocessed image array ready for prediction
        
    Raises:
        ValueError: If image cannot be loaded or processed
    """
    try:
        # Read image using OpenCV
        img = cv2.imread(image_path)
        
        # Check if image was loaded successfully
        if img is None:
            raise ValueError("Failed to load image. Image may be corrupted or in unsupported format.")
        
        # Resize to model's expected input size
        img = cv2.resize(img, IMAGE_SIZE)
        
        # Convert BGR to RGB (OpenCV loads as BGR by default)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Normalize pixel values to [0, 1] range
        img = img / 255.0
        
        # Add batch dimension (model expects 4D input: batch_size, height, width, channels)
        img = np.expand_dims(img, axis=0)
        
        return img
    
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def make_prediction(image_array):
    """
    Generate prediction from the model.
    
    Args:
        image_array (np.array): Preprocessed image array
        
    Returns:
        dict: Prediction results with disease labels and confidence scores
    """
    try:
        # Get model predictions
        preds = model.predict(image_array, verbose=0)
        
        # Get the predicted class index (highest probability)
        pred_index = int(np.argmax(preds))
        
        # Get confidence score for the predicted class
        confidence = float(preds[0][pred_index] * 100)
        
        # Create class probabilities dictionary
        class_probabilities = {
            class_names[i]: round(float(preds[0][i]) * 100, 2)
            for i in range(len(class_names))
        }
        
        # Sort by confidence
        sorted_probs = dict(sorted(class_probabilities.items(), key=lambda x: x[1], reverse=True))
        
        return {
            'predicted_class': class_names[pred_index],
            'confidence': round(confidence, 2),
            'class_probabilities': sorted_probs
        }
    
    except Exception as e:
        raise ValueError(f"Error during prediction: {str(e)}")

# ==================== ROUTES ====================
@app.route('/')
def home():
    """Render the homepage."""
    return render_template('index.html', model_info=MODEL_INFO, model_loaded=MODEL_LOADED)

@app.route('/predict', methods=['POST'])
def predict():
    """
    Handle image upload and return predictions.
    Accepts both file uploads and JSON with image_path.
    
    Returns:
        JSON: Prediction results or error message
    """
    # Check if model is loaded
    if not MODEL_LOADED:
        return jsonify({
            'success': False,
            'error': 'Model is not loaded. Please ensure the model file exists.'
        }), 503
    
    image_path = None
    
    # Check if request contains JSON with image_path
    try:
        data = request.get_json(silent=True)
        if data and 'image_path' in data:
            image_path = data['image_path']
            
            # Validate that image_path exists
            if not os.path.exists(image_path):
                return jsonify({
                    'success': False,
                    'error': 'Invalid image path. File does not exist.'
                }), 400
    except Exception as e:
        pass
    
    # If no image_path in JSON, check for file upload
    if image_path is None:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided. Please select an image to upload.'
            }), 400
        
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected. Please choose an image.'
            }), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'Invalid file format. Allowed formats: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        try:
            # Generate secure filename
            filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save uploaded file
            file.save(image_path)
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Error saving file: {str(e)}'
            }), 400
    
    try:
        # Preprocess image
        img_array = preprocess_image(image_path)
        
        # Make prediction
        prediction_result = make_prediction(img_array)
        
        # Clean up uploaded file if it was a temporary upload
        if 'file' in request.files and os.path.exists(image_path):
            try:
                os.remove(image_path)
            except Exception as e:
                print(f"Warning: Could not delete temporary file {image_path}: {e}")
        
        # Return successful prediction
        return jsonify({
            'success': True,
            'prediction': prediction_result
        }), 200
    
    except ValueError as e:
        # Handle preprocessing or prediction errors
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    except Exception as e:
        # Handle unexpected errors
        return jsonify({
            'success': False,
            'error': f'An unexpected error occurred: {str(e)}'
        }), 500

@app.route('/api/info')
def get_model_info():
    """Return model information as JSON."""
    return jsonify(MODEL_INFO), 200

@app.route('/api/classes')
def get_classes():
    """Return available prediction classes."""
    return jsonify({'classes': class_names}), 200

# ==================== ERROR HANDLERS ====================
@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error."""
    return jsonify({
        'success': False,
        'error': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB.'
    }), 413

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'error': 'The requested resource was not found.'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'success': False,
        'error': 'An internal server error occurred.'
    }), 500

# ==================== MAIN ====================
if __name__ == '__main__':
    # Run Flask development server
    # Set debug=False in production
    app.run(debug=True, host='0.0.0.0', port=5000)