import requests
from typing import Dict, List, Any, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "EL-Dev-Portfolio"
        }
        
        if settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"
    
    def get_user_profile(self) -> Optional[Dict[str, Any]]:
        """Get GitHub user profile"""
        try:
            response = requests.get(
                f"{self.base_url}/users/{settings.GITHUB_USERNAME}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            return None
    
    def get_repositories(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user repositories"""
        try:
            response = requests.get(
                f"{self.base_url}/users/{settings.GITHUB_USERNAME}/repos",
                headers=self.headers,
                params={
                    "sort": "updated",
                    "direction": "desc",
                    "per_page": limit,
                    "type": "public"
                }
            )
            response.raise_for_status()
            repos = response.json()
            
            # Filter and format repositories
            formatted_repos = []
            for repo in repos:
                if not repo.get('fork', False):  # Exclude forks
                    formatted_repos.append({
                        "name": repo["name"],
                        "description": repo.get("description", ""),
                        "html_url": repo["html_url"],
                        "language": repo.get("language"),
                        "stars": repo["stargazers_count"],
                        "forks": repo["forks_count"],
                        "updated_at": repo["updated_at"],
                        "topics": repo.get("topics", [])
                    })
            
            return formatted_repos
        except Exception as e:
            logger.error(f"Failed to get repositories: {e}")
            return []
    
    def get_contribution_stats(self) -> Dict[str, Any]:
        """Get contribution statistics"""
        try:
            # Get user events for contribution activity
            response = requests.get(
                f"{self.base_url}/users/{settings.GITHUB_USERNAME}/events/public",
                headers=self.headers,
                params={"per_page": 100}
            )
            response.raise_for_status()
            events = response.json()
            
            # Count different types of contributions
            stats = {
                "total_events": len(events),
                "push_events": len([e for e in events if e["type"] == "PushEvent"]),
                "pr_events": len([e for e in events if e["type"] == "PullRequestEvent"]),
                "issue_events": len([e for e in events if e["type"] == "IssuesEvent"]),
            }
            
            return stats
        except Exception as e:
            logger.error(f"Failed to get contribution stats: {e}")
            return {}
    
    def get_languages(self) -> Dict[str, int]:
        """Get programming languages used across repositories"""
        try:
            repos = self.get_repositories(limit=50)
            languages = {}
            
            for repo in repos:
                if repo.get("language"):
                    lang = repo["language"]
                    languages[lang] = languages.get(lang, 0) + 1
            
            return languages
        except Exception as e:
            logger.error(f"Failed to get languages: {e}")
            return {}

# Global GitHub service instance
github_service = GitHubService()