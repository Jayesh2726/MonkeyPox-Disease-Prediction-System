import cv2
import numpy as np
from tensorflow.keras.applications.restnet50 import preprocess_input
from app.config import IMAGE_SIZE, CLASS_NAMES
from app.model_loader import load_model

def preprocess_image(image_bytes: bytes):
    """Preprocess the image for model prediction."""
    np.img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np.img, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image data")    
    
    img = cv2.resize(img, IMAGE_SIZE)
    img = preprocess_input(img.astype("float32"))
    return np.expand_dims(img, axis=0)


def predict_image(image_array):
    """Predict the class of the image using the loaded model."""
    model = load_model()
    preds = model.predict(image_array, verbose=0)[0]

    index = int(preds.argmax())

    return {
        "predicted_class": CLASS_NAMES[index],
        "confidence": round(float(preds[index])* 100, 2)
    }