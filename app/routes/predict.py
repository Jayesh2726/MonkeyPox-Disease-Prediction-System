from fastapi import APIRouter, File, UploadFile, HTTPException
from app.utils import preprocess_image, predict_disease
from app.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    ext = file.filename.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file format ")
    
    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds limit")
    

    try:
        img_array = preprocess_image(image_bytes)
        result = predict_disease(img_array)
        return {"success": True, "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 