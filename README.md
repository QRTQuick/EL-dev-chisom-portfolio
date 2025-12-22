# EL-Dev Chisom Portfolio

A professional portfolio website showcasing software engineering expertise and projects.

## 🚀 Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Font Awesome icons
- Responsive design

**Backend:**
- Python FastAPI
- Minimal dependencies for stability
- RESTful API endpoints

**Deployment:**
- Frontend: Static hosting
- Backend: Render.com

## 📁 Project Structure

```
├── frontend/
│   ├── index.html          # Main portfolio page
│   ├── styles/
│   │   └── main.css        # Styling
│   ├── scripts/
│   │   ├── main.js         # Portfolio animations & interactions
│   │   └── api.js          # API client for backend communication
│   └── images/
│       └── profile-svg.svg # Profile image
├── backend/
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── runtime.txt         # Python version
├── render.yaml             # Render deployment configuration
└── README.md
```

## 🌐 API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /ping` - Keep-alive endpoint (4-second intervals)
- `GET /api/github/repos` - GitHub repositories
- `POST /api/contact/json` - Contact form submission

## 🔧 Local Development

**Frontend:**
```bash
cd frontend
python -m http.server 8080
# Visit http://localhost:8080
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
# API available at http://localhost:8000
```

## 🚀 Deployment

**Backend:** Deployed via Render Blueprint using `render.yaml`
**Frontend:** Static site deployment

## 📧 Contact

- **Email:** chisomlifeeke@gmail.com
- **GitHub:** [QRTQuick](https://github.com/QRTQuick)
- **LinkedIn:** [Chisom Life Eke](https://linkedin.com/in/chisom-life-eke)
- **Twitter:** [@ELdevChisom](https://x.com/ELdevChisom)

---

Built with ❤️ by EL-Dev Chisom