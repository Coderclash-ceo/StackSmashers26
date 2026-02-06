from fastapi import FastAPI, UploadFile, File, HTTPException
from backend.models import AnalysisResponse, NutritionInfo
from backend.integration import FitnessIntegration
from backend.firebase_utils import db
from ai_core.gemini_client import analyze_food_image
import shutil
import os
from datetime import datetime

app = FastAPI(title="Food Vision API")

@app.get("/")
def read_root():
    return {"status": "online", "message": "Food Vision Backend is Running"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_food(file: UploadFile = File(...), user_id: str = "demo_user"):
    """
    Receives an image, processing it via AI, 
    saves to Firebase, and syncs with Fitness Platform.
    """
    
    # 1. Save temp file
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Call AI
    ai_result = analyze_food_image(temp_filename)
    
    # Check if AI returned valid data, else fallback to mock for safety
    if "error" not in ai_result:
        nutrition_data = ai_result
        # Ensure it matches model
        mock_nutrition = NutritionInfo(**nutrition_data)
    else:
        print(f"AI Error: {ai_result['error']} - Using Mock Fallback")
        mock_nutrition = NutritionInfo(
            food_name="Mock Burger (AI Failed)",
            calories=550,
            protein_g=25.5,
            carbs_g=45.0,
            fats_g=20.0,
            confidence=0.0
        )

    
    # 3. Store in Firebase
    if db:
        doc_ref = db.collection(u'food_logs').document()
        doc_ref.set({
            u'user_id': user_id,
            u'food_name': mock_nutrition.food_name,
            u'calories': mock_nutrition.calories,
            u'timestamp': datetime.now(),
            u'nutrition': mock_nutrition.dict()
        })
    
    # 4. Integrate with Fitness Platform
    sync_result = FitnessIntegration.sync_workout(
        user_id=user_id, 
        calories=mock_nutrition.calories, 
        protein=mock_nutrition.protein_g
    )
    
    # Clean up
    if os.path.exists(temp_filename):
        os.remove(temp_filename)
        
    return AnalysisResponse(
        nutrition=mock_nutrition,
        message="Food analyzed successfully",
        fitness_sync_status=sync_result
    )
