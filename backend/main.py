from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
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

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()

# Include routers
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(github.router, prefix="/api/github", tags=["github"])

@app.get("/")
async def root():
    return {"message": "EL-Dev Chisom Portfolio API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "portfolio-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)