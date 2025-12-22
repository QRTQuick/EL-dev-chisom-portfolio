from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import os
import asyncio
import httpx
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Optional, Dict, Any

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="EL-Dev Chisom Portfolio API",
    description="Backend API for EL-Dev Chisom's portfolio website with authentication",
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

# Security
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory user storage (replace with database in production)
users_db = {
    "admin@eldev.com": {
        "email": "admin@eldev.com",
        "hashed_password": hashlib.sha256("admin123".encode()).hexdigest(),
        "full_name": "EL-Dev Admin",
        "is_active": True
    },
    "chisomlifeeke@gmail.com": {
        "email": "chisomlifeeke@gmail.com", 
        "hashed_password": hashlib.sha256("chisom123".encode()).hexdigest(),
        "full_name": "Chisom Life Eke",
        "is_active": True
    }
}

# Pydantic models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Keep-alive configuration
KEEP_ALIVE_URL = os.getenv("KEEP_ALIVE_URL", "https://portfolio-backend-ux42.onrender.com")
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

# Initialize database (simplified)
@app.on_event("startup")
async def startup_event():
    # Start keep-alive task only in production
    if os.getenv("ENVIRONMENT") == "production":
        asyncio.create_task(keep_alive_task())
        print("Keep-alive task started for production environment")

# Root endpoints
@app.get("/")
async def root():
    return {
        "message": "EL-Dev Chisom Portfolio API", 
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "keep_alive": os.getenv("ENVIRONMENT") == "production",
        "frontend_url": os.getenv("CORS_ORIGINS", "").split(",")[0] if os.getenv("CORS_ORIGINS") else "Not configured"
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

# Authentication endpoints
@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login endpoint"""
    user = users_db.get(user_data.email)
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "full_name": user["full_name"],
            "is_active": user["is_active"]
        }
    }

@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    """Register new user"""
    if user_data.email in users_db:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    users_db[user_data.email] = {
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "is_active": True
    }
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "is_active": True
        }
    }

@app.get("/api/auth/me")
async def get_current_user(current_user_email: str = Depends(verify_token)):
    """Get current user info"""
    user = users_db.get(current_user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "email": user["email"],
        "full_name": user["full_name"],
        "is_active": user["is_active"]
    }

@app.post("/api/auth/logout")
async def logout():
    """Logout endpoint (client should remove token)"""
    return {"message": "Successfully logged out"}

# GitHub API endpoints
@app.get("/api/github/repos")
async def get_github_repos():
    """Get GitHub repositories"""
    try:
        github_username = os.getenv("GITHUB_USERNAME", "QRTQuick")
        github_token = os.getenv("GITHUB_TOKEN")
        
        headers = {}
        if github_token:
            headers["Authorization"] = f"token {github_token}"
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/users/{github_username}/repos",
                headers=headers
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch repositories")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/github/user")
async def get_github_user():
    """Get GitHub user info"""
    try:
        github_username = os.getenv("GITHUB_USERNAME", "QRTQuick")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.github.com/users/{github_username}")
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch user info")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Contact endpoints
@app.post("/api/contact")
async def contact_form(contact_data: ContactMessage):
    """Contact form endpoint"""
    # Here you could save to database, send email, etc.
    return {
        "status": "success",
        "message": f"Thank you {contact_data.name}! I'll get back to you soon at {contact_data.email}.",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/contact/messages")
async def get_contact_messages(current_user_email: str = Depends(verify_token)):
    """Get contact messages (protected route)"""
    # Only admin can view messages
    user = users_db.get(current_user_email)
    if not user or current_user_email != "chisomlifeeke@gmail.com":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        "messages": [],  # Would fetch from database
        "count": 0,
        "timestamp": datetime.now().isoformat()
    }

# Analytics endpoints
@app.post("/api/analytics/visit")
async def track_visit(visitor_data: dict):
    """Track website visit"""
    return {
        "status": "success",
        "message": "Visit tracked",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/analytics/stats")
async def get_analytics(current_user_email: str = Depends(verify_token)):
    """Get analytics data (protected route)"""
    return {
        "total_visits": 0,
        "unique_visitors": 0,
        "top_pages": [],
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)