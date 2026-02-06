import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from ai_core.prompts import NUTRITION_PROMPT
from PIL import Image

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

def analyze_food_image(image_path):
    """
    Sends image to Gemini 1.5 Flash and returns parsed JSON.
    """
    if not API_KEY:
        return {"error": "API Key not found"}

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        img = Image.open(image_path)
        
        response = model.generate_content([NUTRITION_PROMPT, img])
        
        # Simple cleanup to ensure JSON
        text_response = response.text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(text_response)
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {"error": str(e)}
