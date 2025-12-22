import firebase_admin
from firebase_admin import credentials, db
from app.config import settings
import json
import os
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.initialized = False
        self.init_firebase()
    
    def init_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                # Try to use service account file first
                if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                    logger.info("Using Firebase service account file")
                # Use environment variables for Render deployment
                elif os.getenv("FIREBASE_PRIVATE_KEY") and os.getenv("FIREBASE_CLIENT_EMAIL"):
                    # Create service account dict from environment variables
                    service_account_info = {
                        "type": "service_account",
                        "project_id": settings.FIREBASE_PROJECT_ID,
                        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
                        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
                        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL", ""),
                        "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.getenv('FIREBASE_CLIENT_EMAIL', '')}"
                    }
                    cred = credentials.Certificate(service_account_info)
                    logger.info("Using Firebase service account from environment variables")
                else:
                    # Fallback to default credentials (for local development)
                    cred = credentials.ApplicationDefault()
                    logger.info("Using Firebase default credentials")
                
                firebase_admin.initialize_app(cred, {
                    'databaseURL': settings.FIREBASE_DATABASE_URL
                })
            
            self.initialized = True
            logger.info("Firebase initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            self.initialized = False
    
    def track_visitor(self, visitor_data: Dict[str, Any]) -> bool:
        """Track visitor in Firebase Realtime Database"""
        if not self.initialized:
            logger.warning("Firebase not initialized, skipping visitor tracking")
            return False
        
        try:
            ref = db.reference('visitors')
            ref.push(visitor_data)
            
            # Update visitor count
            count_ref = db.reference('analytics/visitor_count')
            current_count = count_ref.get() or 0
            count_ref.set(current_count + 1)
            
            return True
        except Exception as e:
            logger.error(f"Failed to track visitor: {e}")
            return False
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get analytics data from Firebase"""
        if not self.initialized:
            return {}
        
        try:
            analytics_ref = db.reference('analytics')
            return analytics_ref.get() or {}
        except Exception as e:
            logger.error(f"Failed to get analytics: {e}")
            return {}
    
    def update_page_view(self, page: str) -> bool:
        """Update page view count"""
        if not self.initialized:
            return False
        
        try:
            ref = db.reference(f'analytics/page_views/{page}')
            current_count = ref.get() or 0
            ref.set(current_count + 1)
            return True
        except Exception as e:
            logger.error(f"Failed to update page view: {e}")
            return False

# Global Firebase service instance
firebase_service = FirebaseService()