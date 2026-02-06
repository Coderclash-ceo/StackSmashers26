import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import base64
import tempfile
from dotenv import load_dotenv

load_dotenv()


def _write_temp_cred_file(json_str: str) -> str:
    tf = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
    tf.write(json_str.encode("utf-8"))
    tf.flush()
    tf.close()
    return tf.name


def initialize_firebase():
    """Initializes Firebase Admin SDK and returns Firestore client.

    Supports either:
    - `FIREBASE_CREDENTIALS_PATH` pointing to a JSON file, or
    - `FIREBASE_CREDENTIALS_JSON` containing the JSON payload (raw or base64 encoded).
    """
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
    cred_json_env = os.getenv("FIREBASE_CREDENTIALS_JSON")

    try:
        if not firebase_admin._apps:
            # Prefer direct JSON env var (allows secrets managers / deployments)
            if cred_json_env:
                try:
                    # Try base64 decode first, fall back to raw JSON
                    decoded = None
                    try:
                        decoded_bytes = base64.b64decode(cred_json_env)
                        decoded_str = decoded_bytes.decode("utf-8")
                        # validate
                        json.loads(decoded_str)
                        decoded = decoded_str
                    except Exception:
                        # treat as raw JSON
                        json.loads(cred_json_env)
                        decoded = cred_json_env

                    temp_path = _write_temp_cred_file(decoded)
                    cred = credentials.Certificate(temp_path)
                    firebase_admin.initialize_app(cred)
                    print(f"Firebase initialized successfully from FIREBASE_CREDENTIALS_JSON (temp file: {temp_path})")
                except Exception as e:
                    print(f"Failed to initialize Firebase from FIREBASE_CREDENTIALS_JSON: {e}")
                    return None
            elif os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print(f"Firebase initialized successfully with {cred_path}")
            else:
                print(f"WARNING: {cred_path} not found and FIREBASE_CREDENTIALS_JSON not set. Firebase not initialized.")
                return None

        # This part only runs if initialization succeeded or already existed
        return firestore.client()
    except Exception as e:
        print(f"Firebase Critical Error: {e}")
        return None


# Initialize on module load
db = initialize_firebase()
