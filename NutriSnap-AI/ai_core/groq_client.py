from groq import Groq
import os
import base64
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def analyze_food_image(image_path):
    """
    Sends image to Groq (Llama 3.2 Vision) and returns parsed JSON.
    """
    if not client:
        return {"error": "GROQ_API_KEY not found"}

    try:
        # Detect MIME type
        import mimetypes
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type:
            mime_type = "image/jpeg" # Default fallback
            
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

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="llama-3.2-90b-vision-preview",
            temperature=0,
            stream=False,
            response_format={"type": "json_object"},
        )

        # Extract content from the SDK's response. The SDK may return
        # a dict, a JSON string, or a list of content parts depending
        # on model/SDK behavior. Be robust here.
        raw_content = None
        try:
            raw_content = chat_completion.choices[0].message.content
        except Exception:
            return {"error": "Unexpected Groq response shape"}

        def extract_json(content):
            # If it's already a dict, assume it's parsed JSON
            if isinstance(content, dict):
                return content

            # If it's a string, try to load JSON
            if isinstance(content, str):
                try:
                    return json.loads(content)
                except Exception:
                    return None

            # If it's a list of parts, try to join any text pieces
            if isinstance(content, list):
                # Try to collect textual pieces
                text_parts = []
                for part in content:
                    if isinstance(part, dict):
                        # common keys: 'text' or 'content' or nested dict
                        if "text" in part and isinstance(part["text"], str):
                            text_parts.append(part["text"]) 
                        elif "content" in part and isinstance(part["content"], str):
                            text_parts.append(part["content"]) 
                        else:
                            # try to stringify the dict
                            try:
                                text_parts.append(json.dumps(part))
                            except Exception:
                                pass
                    elif isinstance(part, str):
                        text_parts.append(part)

                joined = "".join(text_parts)
                if joined:
                    try:
                        return json.loads(joined)
                    except Exception:
                        # As a last resort, if any element is a dict, return the first
                        for part in content:
                            if isinstance(part, dict):
                                return part
                return None

            return None

        parsed = extract_json(raw_content)
        if not parsed:
            return {"error": "Could not parse JSON from Groq response"}

        # Validate and coerce expected fields
        expected = ["food_name", "calories", "protein_g", "carbs_g", "fats_g", "confidence"]
        result = {}
        for key in expected:
            if key not in parsed:
                return {"error": f"Missing key in response: {key}"}
            result[key] = parsed[key]

        # Cast numeric types where appropriate
        try:
            result["calories"] = int(result["calories"]) 
            result["protein_g"] = float(result["protein_g"]) 
            result["carbs_g"] = float(result["carbs_g"]) 
            result["fats_g"] = float(result["fats_g"]) 
            result["confidence"] = float(result["confidence"]) 
        except Exception as e:
            return {"error": f"Type coercion failed: {e}"}

        return result
        
    except Exception as e:
        print(f"Error calling Groq: {e}")
        # Try to print more details if available
        if hasattr(e, 'response'):
             print(f"Groq Response: {e.response.text}") # Debugging info
        return {"error": str(e)}
