from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

Base = declarative_base()

class Visitor(Base):
    __tablename__ = "visitors"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, index=True)
    user_agent = Column(String)
    country = Column(String)
    city = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_duration = Column(Float, default=0.0)
    pages_visited = Column(Integer, default=1)
    referrer = Column(String)

class VisitorCreate(BaseModel):
    ip_address: str
    user_agent: str
    country: Optional[str] = None
    city: Optional[str] = None
    referrer: Optional[str] = None

class VisitorResponse(BaseModel):
    id: int
    ip_address: str
    country: Optional[str]
    city: Optional[str]
    timestamp: datetime
    session_duration: float
    pages_visited: int
    
    class Config:
        from_attributes = True