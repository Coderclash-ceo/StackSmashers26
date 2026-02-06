
from backend.ai_core.gemini_client import analyze_food_image
import os

# Create a dummy image if one doesn't exist to test the client
if not os.path.exists("test_image.jpg"):
    # Create a small blank image using PIL
    from PIL import Image
    img = Image.new('RGB', (100, 100), color = 'red')
    img.save('test_image.jpg')

print("Testing Gemini Client...")
try:
    result = analyze_food_image("test_image.jpg")
    print("Result:", result)
except Exception as e:
    print("FATAL ERROR:", e)
