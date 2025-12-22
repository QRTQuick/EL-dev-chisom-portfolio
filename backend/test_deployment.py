#!/usr/bin/env python3
"""
Simple test script to verify deployment readiness
"""
import sys
import importlib

def test_imports():
    """Test that all required packages can be imported"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'requests',
        'python_dotenv',
        'PyJWT',
        'httpx',
        'sqlalchemy',
        'email_validator',
        'firebase_admin',
        'typing_extensions'
    ]
    
    failed_imports = []
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✓ {package}")
        except ImportError as e:
            print(f"✗ {package}: {e}")
            failed_imports.append(package)
    
    if failed_imports:
        print(f"\nFailed to import: {', '.join(failed_imports)}")
        return False
    
    print("\n✓ All packages imported successfully!")
    return True

def test_app_creation():
    """Test that the FastAPI app can be created"""
    try:
        from main import app
        print("✓ FastAPI app created successfully!")
        return True
    except Exception as e:
        print(f"✗ Failed to create FastAPI app: {e}")
        return False

if __name__ == "__main__":
    print("Testing deployment readiness...\n")
    
    import_success = test_imports()
    app_success = test_app_creation()
    
    if import_success and app_success:
        print("\n🎉 Deployment ready!")
        sys.exit(0)
    else:
        print("\n❌ Deployment not ready!")
        sys.exit(1)