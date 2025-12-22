from fastapi import APIRouter, HTTPException
from app.services.github_service import github_service
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/profile", response_model=Dict[str, Any])
async def get_github_profile():
    """Get GitHub profile information"""
    try:
        profile = github_service.get_user_profile()
        
        if not profile:
            raise HTTPException(status_code=404, detail="GitHub profile not found")
        
        # Return formatted profile data
        return {
            "username": profile.get("login"),
            "name": profile.get("name"),
            "bio": profile.get("bio"),
            "avatar_url": profile.get("avatar_url"),
            "html_url": profile.get("html_url"),
            "public_repos": profile.get("public_repos"),
            "followers": profile.get("followers"),
            "following": profile.get("following"),
            "created_at": profile.get("created_at"),
            "updated_at": profile.get("updated_at")
        }
    
    except Exception as e:
        logger.error(f"Failed to get GitHub profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get GitHub profile")

@router.get("/repositories", response_model=List[Dict[str, Any]])
async def get_github_repositories(limit: int = 10):
    """Get GitHub repositories"""
    try:
        repositories = github_service.get_repositories(limit=limit)
        return repositories
    
    except Exception as e:
        logger.error(f"Failed to get GitHub repositories: {e}")
        raise HTTPException(status_code=500, detail="Failed to get repositories")

@router.get("/stats", response_model=Dict[str, Any])
async def get_github_stats():
    """Get GitHub statistics"""
    try:
        profile = github_service.get_user_profile()
        contribution_stats = github_service.get_contribution_stats()
        languages = github_service.get_languages()
        
        if not profile:
            raise HTTPException(status_code=404, detail="GitHub profile not found")
        
        return {
            "profile_stats": {
                "public_repos": profile.get("public_repos", 0),
                "followers": profile.get("followers", 0),
                "following": profile.get("following", 0)
            },
            "contribution_stats": contribution_stats,
            "top_languages": languages,
            "last_updated": profile.get("updated_at")
        }
    
    except Exception as e:
        logger.error(f"Failed to get GitHub stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get GitHub stats")

@router.get("/languages", response_model=Dict[str, int])
async def get_programming_languages():
    """Get programming languages used"""
    try:
        languages = github_service.get_languages()
        return languages
    
    except Exception as e:
        logger.error(f"Failed to get programming languages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get languages")

@router.get("/contributions", response_model=Dict[str, Any])
async def get_contribution_activity():
    """Get recent contribution activity"""
    try:
        stats = github_service.get_contribution_stats()
        return stats
    
    except Exception as e:
        logger.error(f"Failed to get contribution activity: {e}")
        raise HTTPException(status_code=500, detail="Failed to get contributions")