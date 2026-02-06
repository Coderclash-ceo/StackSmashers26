import os
import json
from dotenv import load_dotenv

def check_setup():
    print("🔍 Inspecting Project Setup...\n")
    
    # 1. Check .env
    if os.path.exists(".env"):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("❌ .env exists, but GOOGLE_API_KEY is missing.")
        elif not api_key.startswith("AIza"):
             print(f"⚠️  GOOGLE_API_KEY looks suspicious: '{api_key}'.\n    It usually starts with 'AIza'. check AI Studio.")
        else:
            print("✅ .env found and GOOGLE_API_KEY format looks correct.")
    else:
        print("❌ .env file missing!")
        
    # 2. Check Firebase Key
    key_path = "serviceAccountKey.json"
    if os.path.exists(key_path):
        try:
            with open(key_path, 'r') as f:
                data = json.load(f)
                if "private_key" in data and "project_id" in data:
                    print(f"✅ {key_path} looks valid (Project: {data.get('project_id')}).")
                else:
                    print(f"❌ {key_path} is missing critical fields (private_key or project_id).")
                    print(f"   Current keys: {list(data.keys())}")
        except json.JSONDecodeError:
            print(f"❌ {key_path} is not valid JSON.")
    else:
        print(f"❌ {key_path} not found. Please rename your downloaded JSON to '{key_path}'.")

    print("\nNext Steps:")
    print("1. pip install -r requirements.txt")
    print("2. python -m uvicorn backend.main:app --reload")

if __name__ == "__main__":
    check_setup()
