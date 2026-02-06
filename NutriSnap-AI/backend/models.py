from pydantic import BaseModel
from typing import Optional, Dict

class AnalysisRequest(BaseModel):
    # Depending on how we send the image, this might just be metadata
    # or base64 if not using multipart form data
    user_id: str = "demo_user"

class NutritionInfo(BaseModel):
    food_name: str
    calories: int
    protein_g: float
    carbs_g: float
    fats_g: float
    confidence: float

class AnalysisResponse(BaseModel):
    nutrition: NutritionInfo
    message: str
    fitness_sync_status: Optional[Dict] = None

class ChatRequest(BaseModel):
    message: str

class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
