
from backend.ai_core.gemini_client import get_client
import os

client = get_client()
if not client:
    print("No client (check API key)")
else:
    try:
        print("Listing models...")
        # The new SDK might have a different way to list models, checking typical pattern
        # Usually it is client.models.list()
        for m in client.models.list():
            print(f"- {m.name}")
    except Exception as e:
        print("Error listing models:", e)
