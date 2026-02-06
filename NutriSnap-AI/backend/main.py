from fastapi import FastAPI, UploadFile, File, HTTPException
# Force reload to pick up new .env changes
from backend.models import AnalysisResponse, NutritionInfo, ChatRequest, UserRegister, UserLogin
from backend.integration import FitnessIntegration
from backend.firebase_utils import db
from datetime import datetime
from firebase_admin import firestore
from ai_core.gemini_client import analyze_food_image, generate_text, analyze_audio
# from ai_core.openai_client import analyze_food_image
# from ai_core.groq_client import analyze_food_image
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import bcrypt

app = FastAPI(title="Food Vision API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you might want to specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """Diagnostic endpoint for deployment debugging."""
    return {
        "status": "online",
        "database": "connected" if db else "missing_credentials",
        "ai_key": "configured" if os.getenv("GOOGLE_API_KEY") else "missing",
        "env_vars": {
            "FIREBASE_CREDENTIALS_PATH": os.getenv("FIREBASE_CREDENTIALS_PATH", "default"),
            "GOOGLE_API_KEY_PRESENT": bool(os.getenv("GOOGLE_API_KEY")),
            "BACKEND_URL_EXTERNAL": os.getenv("RENDER_EXTERNAL_URL", "not_set")
        }
    }

@app.get("/")
def read_root():
    return {"status": "online", "message": "Food Vision Backend is Running. Visit /health for diagnostics."}

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
    # Use Groq result if available; on error return HTTP 502
    if "error" in ai_result:
        print(f"AI Error: {ai_result.get('error')}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {ai_result.get('error')}")

    # Build nutrition model from AI result
    nutrition_data = ai_result
    nutrition_info = NutritionInfo(**nutrition_data)
    final_message = "Food analyzed successfully"

    # 3. Store in Firebase

    
    # 3. Store in Firebase
    try:
        if db:
            doc_ref = db.collection(u'food_logs').document()
            doc_ref.set({
                u'user_id': user_id,
                u'food_name': nutrition_info.food_name,
                u'calories': nutrition_info.calories,
                u'timestamp': datetime.now(),
                u'nutrition': nutrition_info.dict()
            })
    except Exception as e:
        print(f"\n[WARNING] Database Write Failed: {e}")
        print("Continuing without saving to DB (Hackathon Mode)\n")
    
    # 4. Integrate with Fitness Platform
    sync_result = FitnessIntegration.sync_workout(
        user_id=user_id, 
        calories=nutrition_info.calories, 
        protein=nutrition_info.protein_g
    )
    
    # Clean up
    if os.path.exists(temp_filename):
        os.remove(temp_filename)
        
    return AnalysisResponse(
        nutrition=nutrition_info,
        message=final_message,
        fitness_sync_status=sync_result
    )


@app.post("/analyze_debug")
async def analyze_food_debug(file: UploadFile = File(...), user_id: str = "demo_user"):
    """Debug endpoint that returns raw AI output (no parsing) for troubleshooting."""
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ai_result = analyze_food_image(temp_filename)

    # Clean up
    if os.path.exists(temp_filename):
        os.remove(temp_filename)

    return {"ai_result": ai_result}

@app.get("/history/{user_id}")
async def get_history(user_id: str):
    """
    Fetches food history for a specific user from Firebase.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")
        
    try:
        logs_ref = db.collection(u'food_logs')
        query = logs_ref.where(u'user_id', u'==', user_id).order_by(u'timestamp', direction=firestore.Query.DESCENDING).limit(10)
        docs = query.stream()
        
        history = []
        for doc in docs:
            log_data = doc.to_dict()
            # Convert datetime to string for JSON serialization
            if 'timestamp' in log_data and log_data['timestamp']:
                log_data['timestamp'] = log_data['timestamp'].isoformat()
            history.append(log_data)
            
        return {"user_id": user_id, "history": history}
    except Exception as e:
        print(f"Error fetching history: {e}")
        # Fallback if index is not created yet (Firestore requires indexes for where + order_by)
        try:
            docs = logs_ref.where(u'user_id', u'==', user_id).limit(10).stream()
            history = []
            for doc in docs:
                log_data = doc.to_dict()
                if 'timestamp' in log_data and log_data['timestamp']:
                    log_data['timestamp'] = log_data['timestamp'].isoformat()
                history.append(log_data)
            return {"user_id": user_id, "history": history, "note": "Simple query used (no ordering)"}
        except:
            raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@app.get("/coach/{user_id}")
async def get_coaching(user_id: str):
    """
    Analyzes user history and provides coaching insights and meal suggestions.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")
        
    try:
        # 1. Fetch recent history
        logs_ref = db.collection(u'food_logs')
        docs = logs_ref.where(u'user_id', u'==', user_id).order_by(u'timestamp', direction=firestore.Query.DESCENDING).limit(10).stream()
        
        history_summary = []
        total_calories = 0
        for doc in docs:
            data = doc.to_dict()
            food_name = data.get('food_name', 'Unknown')
            calories = data.get('calories', 0)
            total_calories += calories
            history_summary.append(f"- {food_name}: {calories} kcal")
            
        if not history_summary:
            return {
                "insight": "I need to see some of your meals before I can give advice. Start by analyzing a food photo!",
                "suggestions": ["Upload your first meal!", "Take a photo of your breakfast", "Track a snack"]
            }

        # 2. Call AI for coaching
        history_str = "\n".join(history_summary)
        prompt = f"""
        You are an expert Nutrition Coach. Based on the user's recent food history:
        {history_str}
        
        Total Calories in last 10 meals: {total_calories} kcal.
        
        Provide:
        1. A concise, encouraging 'Coach Insight' (max 2 sentences).
        2. Three specific 'Smart Meal Suggestions' for their next meal that would balance their diet.
        
        Return the result in strictly this JSON format:
        {{
            "insight": "your insight here",
            "suggestions": ["option 1", "option 2", "option 3"]
        }}
        """
        
        import json
        text_response = generate_text(prompt)
        
        # Clean and parse JSON
        text_response = text_response.replace("```json", "").replace("```", "").strip()
        result = json.loads(text_response)
        
        return result

    except Exception as e:
        print(f"Error in coaching: {e}")
        # Try a simpler query if ordering fails
        try:
             # Logic for simple coaching without ordering if firestore index is missing
             return {
                "insight": "You're doing a great job logging your food! Keep it up for more personalized insights.",
                "suggestions": ["Drink more water", "Eat more greens", "Try a high-protein breakfast"]
             }
        except:
            return {
                "insight": "I'm having a bit of trouble analyzing your data right now, but keep up the great work logging your meals!",
                "suggestions": ["Continue tracking your food", "Stay hydrated", "Aim for variety in your diet"]
            }

@app.post("/chat/{user_id}")
async def chat_with_ai(user_id: str, request: ChatRequest):
    """
    Interactive chat with AI about nutrition and food history.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")
        
    try:
        # 1. Fetch recent history for context
        logs_ref = db.collection(u'food_logs')
        try:
            docs = logs_ref.where(u'user_id', u'==', user_id).order_by(u'timestamp', direction=firestore.Query.DESCENDING).limit(5).stream()
            history_context = []
            for doc in docs:
                data = doc.to_dict()
                food_name = data.get('food_name', 'Unknown')
                calories = data.get('calories', 0)
                history_context.append(f"{food_name} ({calories} kcal)")
        except Exception as e:
            print(f"Firestore ordered query failed (likely missing index): {e}")
            # Fallback to simple query
            docs = logs_ref.where(u'user_id', u'==', user_id).limit(5).stream()
            history_context = []
            for doc in docs:
                data = doc.to_dict()
                food_name = data.get('food_name', 'Unknown')
                calories = data.get('calories', 0)
                history_context.append(f"{food_name} ({calories} kcal)")
            
        context_str = ", ".join(history_context) if history_context else "No meals logged yet."

        # 2. Build prompt
        prompt = f"""
        You are NutriChat, an AI health assistant.
        User's recent food history: {context_str}
        
        User's question: {request.message}
        
        Provide a helpful, concise response. If they ask about their history, refer to the data provided above.
        Be scientific but friendly.
        """
        
        ai_response = generate_text(prompt)
        
        # 3. Store in Firebase
        try:
            chat_ref = db.collection(u'chats').document()
            chat_ref.set({
                u'user_id': user_id,
                u'role': u'user',
                u'content': request.message,
                u'timestamp': datetime.now()
            })
            chat_ref_ai = db.collection(u'chats').document()
            chat_ref_ai.set({
                u'user_id': user_id,
                u'role': u'assistant',
                u'content': ai_response,
                u'timestamp': datetime.now()
            })
        except Exception as e:
            print(f"Error saving chat to Firestore: {e}")

        return {"response": ai_response}

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        with open("chat_error.log", "a") as f:
            f.write(f"\n--- Chat Error at {datetime.now()} ---\n")
            f.write(error_msg)
        print(f"❌ NutriChat Error: {e}")
        print(error_msg) # Print to console too
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.post("/voice_chat/{user_id}")
async def voice_chat_with_ai(user_id: str, file: UploadFile = File(...)):
    """
    Handles audio recording and returns AI response.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")
        
    try:
        # 1. Read audio bytes
        audio_bytes = await file.read()
        
        # 2. Fetch recent history for context (simplified)
        logs_ref = db.collection(u'food_logs')
        docs = logs_ref.where(u'user_id', u'==', user_id).limit(5).stream()
        history_context = []
        for doc in docs:
            data = doc.to_dict()
            food_name = data.get('food_name', 'Unknown')
            history_context.append(food_name)
        
        context_str = ", ".join(history_context) if history_context else "No meals logged yet."
        
        # 3. Build prompt for audio context
        prompt = f"""
        You are NutriVoice, an AI health assistant.
        User's recent food history: {context_str}
        
        Listen to the audio and respond helpfully and concisely.
        If they ask about their history, refer to the data provided above.
        """
        
        # 4. Analyze Audio
        ai_response = analyze_audio(audio_bytes, mime_type=file.content_type, prompt=prompt)
        
        # 5. Store in Firebase
        try:
            chat_ref = db.collection(u'chats').document()
            chat_ref.set({
                u'user_id': user_id,
                u'role': u'user',
                u'content': u"🎤 (Voice Message)",
                u'timestamp': datetime.now()
            })
            chat_ref_ai = db.collection(u'chats').document()
            chat_ref_ai.set({
                u'user_id': user_id,
                u'role': u'assistant',
                u'content': ai_response,
                u'timestamp': datetime.now()
            })
        except Exception as e:
            print(f"Error saving voice chat to Firestore: {e}")

        return {"response": ai_response}

    except Exception as e:
        print(f"❌ NutriVoice Error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")

@app.get("/chats/{user_id}")
async def get_chats(user_id: str):
    """
    Fetches chat history for a specific user.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")
        
    try:
        chats_ref = db.collection(u'chats')
        # Ordering by timestamp to get correct flow
        docs = chats_ref.where(u'user_id', u'==', user_id).order_by(u'timestamp', direction=firestore.Query.ASCENDING).stream()
        
        history = []
        for doc in docs:
            chat_data = doc.to_dict()
            history.append({
                "role": chat_data.get("role"),
                "content": chat_data.get("content")
            })
        return {"user_id": user_id, "history": history}
    except Exception as e:
        print(f"Error fetching chats: {e}")
        # Fallback without ordering
        try:
            docs = chats_ref.where(u'user_id', u'==', user_id).limit(20).stream()
            history = []
            for doc in docs:
                chat_data = doc.to_dict()
                history.append({
                    "role": chat_data.get("role"),
                    "content": chat_data.get("content")
                })
            return {"user_id": user_id, "history": history}
        except:
            raise HTTPException(status_code=500, detail=f"Failed to fetch chats: {str(e)}")


@app.post("/register")
async def register_user(user: UserRegister):
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    # Check if user exists
    users_ref = db.collection("users")
    existing_user = users_ref.where("email", "==", user.email).limit(1).get()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Hash password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    
    # Create user
    new_user_ref = users_ref.document()
    new_user_ref.set({
        "full_name": user.full_name,
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.now()
    })
    
    return {"message": "User registered successfully", "user_id": new_user_ref.id}

@app.post("/login")
async def login_user(user: UserLogin):
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    users_ref = db.collection("users")
    user_docs = users_ref.where("email", "==", user.email).limit(1).get()
    
    if not user_docs:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_data = user_docs[0].to_dict()
    if not bcrypt.checkpw(user.password.encode('utf-8'), user_data["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "message": "Login successful",
        "user_id": user_docs[0].id,
        "full_name": user_data.get("full_name")
    }
