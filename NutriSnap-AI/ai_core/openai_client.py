from openai import OpenAI
import os
import base64
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def analyze_food_image(image_path):
    """
    Sends image to OpenAI GPT-4o and returns parsed JSON.
    """
    if not client:
        return {"error": "OPENAI_API_KEY not found"}

    try:
        # Encode image to base64
        base64_image = encode_image(image_path)
        
        prompt = """
        You are an expert Nutritionist AI. Analyse the image provided and:
        1. Identify the food item(s).
        2. Estimate the serving size.
        3. Provide an estimation of the nutritional content (Calories, Protein, Carbs, Fats) for that portion.
        4. Return ONLY a valid JSON object (no markdown, no backticks) in this format:
        {
            "food_name": "Name of food",
            "calories": 100,
            "protein_g": 10.5,
            "carbs_g": 20.0,
            "fats_g": 5.0,
            "confidence": 0.95
        }
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            },
                        },
                    ],
                }
            ],
            max_tokens=300,
            response_format={ "type": "json_object" } # Force JSON mode
        )
        
        result_text = response.choices[0].message.content
        return json.loads(result_text)
        
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return {"error": str(e)}
