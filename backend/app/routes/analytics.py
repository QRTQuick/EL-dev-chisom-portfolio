from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.sqlite_db import get_db
from app.models.visitor import Visitor, VisitorCreate, VisitorResponse
from app.services.firebase_service import firebase_service
from typing import List, Dict, Any
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/track-visitor", response_model=Dict[str, str])
async def track_visitor(request: Request, visitor_data: VisitorCreate, db: Session = Depends(get_db)):
    """Track a new visitor"""
    try:
        # Get client IP
        client_ip = request.client.host
        if "x-forwarded-for" in request.headers:
            client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()
        
        # Create visitor record in SQLite
        db_visitor = Visitor(
            ip_address=client_ip,
            user_agent=visitor_data.user_agent,
            country=visitor_data.country,
            city=visitor_data.city,
            referrer=visitor_data.referrer
        )
        db.add(db_visitor)
        db.commit()
        db.refresh(db_visitor)
        
        # Track in Firebase for real-time analytics
        firebase_data = {
            "ip_address": client_ip,
            "user_agent": visitor_data.user_agent,
            "country": visitor_data.country,
            "city": visitor_data.city,
            "timestamp": datetime.utcnow().isoformat(),
            "referrer": visitor_data.referrer
        }
        
        firebase_service.track_visitor(firebase_data)
        
        return {"status": "success", "message": "Visitor tracked successfully"}
    
    except Exception as e:
        logger.error(f"Failed to track visitor: {e}")
        raise HTTPException(status_code=500, detail="Failed to track visitor")

@router.get("/stats", response_model=Dict[str, Any])
async def get_analytics_stats(db: Session = Depends(get_db)):
    """Get analytics statistics"""
    try:
        # Get stats from SQLite
        total_visitors = db.query(Visitor).count()
        
        # Get visitors from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_visitors = db.query(Visitor).filter(
            Visitor.timestamp >= thirty_days_ago
        ).count()
        
        # Get top countries
        country_stats = db.query(Visitor.country, db.func.count(Visitor.country).label('count'))\
            .filter(Visitor.country.isnot(None))\
            .group_by(Visitor.country)\
            .order_by(db.func.count(Visitor.country).desc())\
            .limit(10)\
            .all()
        
        # Get Firebase analytics
        firebase_stats = firebase_service.get_analytics()
        
        return {
            "total_visitors": total_visitors,
            "recent_visitors": recent_visitors,
            "top_countries": [{"country": country, "count": count} for country, count in country_stats],
            "firebase_stats": firebase_stats,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Failed to get analytics stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")

@router.post("/page-view")
async def track_page_view(page: str):
    """Track page view"""
    try:
        firebase_service.update_page_view(page)
        return {"status": "success", "message": "Page view tracked"}
    except Exception as e:
        logger.error(f"Failed to track page view: {e}")
        raise HTTPException(status_code=500, detail="Failed to track page view")

@router.get("/visitors", response_model=List[VisitorResponse])
async def get_recent_visitors(limit: int = 50, db: Session = Depends(get_db)):
    """Get recent visitors (for admin use)"""
    try:
        visitors = db.query(Visitor)\
            .order_by(Visitor.timestamp.desc())\
            .limit(limit)\
            .all()
        
        return visitors
    except Exception as e:
        logger.error(f"Failed to get visitors: {e}")
        raise HTTPException(status_code=500, detail="Failed to get visitors")