from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import asyncio
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Keep-alive configuration
KEEP_ALIVE_URL = os.getenv("KEEP_ALIVE_URL", "https://backend-portfolio.onrender.com")
KEEP_ALIVE_INTERVAL = 4  # 4 seconds

# Keep-alive task using requests (sync) instead of httpx
async def keep_alive_task():
    """Background task to ping the server every 4 seconds to prevent sleep"""
    while True:
        try:
            # Use requests instead of httpx for keep-alive
            response = requests.get(f"{KEEP_ALIVE_URL}/ping", timeout=10)
            print(f"Keep-alive ping: {response.status_code} at {datetime.now()}")
        except Exception as e:
            print(f"Keep-alive ping failed: {e} at {datetime.now()}")
        
        await asyncio.sleep(KEEP_ALIVE_INTERVAL)

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if os.getenv("ENVIRONMENT") == "production":
        asyncio.create_task(keep_alive_task())
        print("Keep-alive task started for production environment")
    yield
    # Shutdown (if needed)
    pass

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="EL-Dev Portfolio API",
    description="API service for EL-Dev Chisom's portfolio website",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "EL-Dev Portfolio API Service", 
        "status": "active",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "ping": "/ping", 
            "github_repos": "/api/github/repos",
            "contact": "/api/contact"
        },
        "timestamp": datetime.now().isoformat()
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
    return {
        "message": "pong",
        "timestamp": datetime.now().isoformat(),
        "status": "alive",
        "keep_alive_interval": f"{KEEP_ALIVE_INTERVAL} seconds"
    }

@app.get("/api/github/repos")
async def get_github_repos():
    try:
        github_username = os.getenv("GITHUB_USERNAME", "QRTQuick")
        # Use requests instead of httpx for better compatibility
        response = requests.get(f"https://api.github.com/users/{github_username}/repos", timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch repositories")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/contact")
async def contact_form(
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...)
):
    # Basic validation
    if not name or len(name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")
    
    if not message or len(message.strip()) < 10:
        raise HTTPException(status_code=400, detail="Message must be at least 10 characters")
    
    # Log the contact form submission
    print(f"Contact form submission: {name} ({email}) - {message[:50]}...")
    
    return {
        "status": "success",
        "message": f"Thank you {name}! I'll get back to you soon.",
        "timestamp": datetime.now().isoformat()
    }

# Simple JSON endpoint for contact form (no Pydantic models)
@app.post("/api/contact/json")
async def contact_form_json(data: dict):
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()
    
    # Basic validation
    if not name or len(name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")
    
    if not message or len(message) < 10:
        raise HTTPException(status_code=400, detail="Message must be at least 10 characters")
    
    # Log the contact form submission
    print(f"Contact form JSON submission: {name} ({email}) - {message[:50]}...")
    
    return {
        "status": "success",
        "message": f"Thank you {name}! I'll get back to you soon at {email}.",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)