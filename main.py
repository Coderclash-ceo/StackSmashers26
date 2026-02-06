from backend.main import app

# This root-level file acts as the entrypoint for Vercel deployment
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
