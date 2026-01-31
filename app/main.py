from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.prediction import router as prediction_router

app = FastAPI(
    title="Skin Disease Prediction API",
    version="1.0.0",
)



# cors for MERN / React frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],    
)


# Register routers

app.include_router(prediction_router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Skin Disease Prediction API is running."}   