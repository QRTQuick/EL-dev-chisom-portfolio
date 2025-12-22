from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.sqlite_db import get_db
from app.models.contact import ContactMessage, ContactMessageCreate, ContactMessageResponse
from typing import List, Dict
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/send-message", response_model=Dict[str, str])
async def send_contact_message(
    request: Request, 
    message_data: ContactMessageCreate, 
    db: Session = Depends(get_db)
):
    """Send a contact message"""
    try:
        # Get client IP
        client_ip = request.client.host
        if "x-forwarded-for" in request.headers:
            client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()
        
        # Create contact message record
        db_message = ContactMessage(
            name=message_data.name,
            email=message_data.email,
            subject=message_data.subject,
            message=message_data.message,
            ip_address=client_ip
        )
        
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        
        # TODO: Send email notification (implement email service)
        # await send_email_notification(message_data)
        
        logger.info(f"Contact message received from {message_data.email}")
        
        return {
            "status": "success", 
            "message": "Your message has been sent successfully! I'll get back to you soon."
        }
    
    except Exception as e:
        logger.error(f"Failed to send contact message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")

@router.get("/messages", response_model=List[ContactMessageResponse])
async def get_contact_messages(
    limit: int = 50, 
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get contact messages (for admin use)"""
    try:
        query = db.query(ContactMessage)
        
        if unread_only:
            query = query.filter(ContactMessage.is_read == False)
        
        messages = query.order_by(ContactMessage.timestamp.desc())\
            .limit(limit)\
            .all()
        
        return messages
    
    except Exception as e:
        logger.error(f"Failed to get contact messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get messages")

@router.put("/messages/{message_id}/mark-read")
async def mark_message_read(message_id: int, db: Session = Depends(get_db)):
    """Mark a message as read"""
    try:
        message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
        
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        message.is_read = True
        db.commit()
        
        return {"status": "success", "message": "Message marked as read"}
    
    except Exception as e:
        logger.error(f"Failed to mark message as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to update message")

@router.get("/stats")
async def get_contact_stats(db: Session = Depends(get_db)):
    """Get contact statistics"""
    try:
        total_messages = db.query(ContactMessage).count()
        unread_messages = db.query(ContactMessage).filter(ContactMessage.is_read == False).count()
        
        # Get messages from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_messages = db.query(ContactMessage).filter(
            ContactMessage.timestamp >= thirty_days_ago
        ).count()
        
        return {
            "total_messages": total_messages,
            "unread_messages": unread_messages,
            "recent_messages": recent_messages,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Failed to get contact stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get contact stats")