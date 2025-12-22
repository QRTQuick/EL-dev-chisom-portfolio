from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import asyncio
import httpx
from datetime import datetime
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

# Pydantic models for v2
class ContactRequest(BaseModel):
    name: str
    email: str
    message: str

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: str
    uptime: Optional[str] = "active"

# Initialize FastAPI app
app = FastAPI(
    title="EL-Dev Chisom Portfolio API",
    description="Backend API for EL-Dev Chisom's portfolio website",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep-alive configuration
KEEP_ALIVE_URL = os.getenv("KEEP_ALIVE_URL", "https://portfolio-backend-ux42.onrender.com")
KEEP_ALIVE_INTERVAL = 2  # 2 seconds

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
        
        await asyncio.sleep(KEEP_ALIVE_INTERVAL)

# Startup event
@app.on_event("startup")
async def startup_event():
    if os.getenv("ENVIRONMENT") == "production":
        asyncio.create_task(keep_alive_task())
        print("Keep-alive task started for production environment")

@app.get("/")
async def root():
    return {
        "message": "EL-Dev Chisom Portfolio API", 
        "status": "active",
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
        "status": "alive"
    }

@app.get("/api/github/repos")
async def get_github_repos():
    try:
        github_username = os.getenv("GITHUB_USERNAME", "QRTQuick")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.github.com/users/{github_username}/repos")
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
    return {
        "status": "success",
        "message": f"Thank you {name}! I'll get back to you soon.",
        "timestamp": datetime.now().isoformat()
    }

# JSON endpoint for contact form
@app.post("/api/contact/json")
async def contact_form_json(contact: ContactRequest):
    return {
        "status": "success",
        "message": f"Thank you {contact.name}! I'll get back to you soon at {contact.email}.",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)