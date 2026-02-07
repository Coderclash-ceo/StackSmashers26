from backend.main import app

# This file acts as a proxy for deployment platforms (like Render or Vercel)
# that default to looking for an 'app' object in an 'app.py' file.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
