from pathlib import Path

IMAGE_SIZE = (224, 224)
CLASS_NAMES = ['Chickenpox', 'Measles', 'Monkeypox', 'Normal']

MODEL_PATH = Path("model.h5")

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

MAX_FILE_SIZE = 10

