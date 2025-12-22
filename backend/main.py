from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import asyncio
import httpx
from datetime import datetime
from dotenv import load_dotenv

from app.routes import analytics, contact, github
from app.database.sqlite_db import init_db

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="EL-Dev Chisom Portfolio API",
    description="Backend API for EL-Dev Chisom's portfolio website",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep-alive configuration
KEEP_ALIVE_URL = os.getenv("KEEP_ALIVE_URL", "https://your-app-name.onrender.com")
KEEP_ALIVE_INTERVAL = 2  # 2 seconds - very frequent pinging

# Keep-alive task
async def keep_alive_task():
    """Background task to ping the server every 2 seconds to prevent sleep"""
    while True:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{KEEP_ALIVE_URL}/ping", timeout=10)
                print(f"Keep-alive ping: {response.status_code} at {datetime.now()}")
        except Exception as e:
            print(f"Keep-alive ping failed: {e} at {datetime.now()}")
        
        # Wait for 2 seconds before next ping
        await asyncio.sleep(KEEP_ALIVE_INTERVAL)

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()
    # Start keep-alive task only in production
    if os.getenv("ENVIRONMENT") == "production":
        asyncio.create_task(keep_alive_task())
        print("Keep-alive task started for production environment")

# Include routers
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(github.router, prefix="/api/github", tags=["github"])

@app.get("/")
async def root():
    return {
        "message": "EL-Dev Chisom Portfolio API", 
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "keep_alive": os.getenv("ENVIRONMENT") == "production"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "portfolio-api",
        "timestamp": datetime.now().isoformat(),
        "uptime": "active"
    }

@app.get("/ping")
async def ping():
    """Simple ping endpoint for keep-alive functionality"""
    return {
        "message": "pong",
        "timestamp": datetime.now().isoformat(),
        "status": "alive"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)