import tesorflow as tf
from app.config import MODEL_PATH

model = None

def load_model():
    global model
    if model is None:
        model = tf.keras.models.load_model(MODEL_PATH)
    return model