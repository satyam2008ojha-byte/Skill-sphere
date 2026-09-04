# SkillSphere — Competency Based Learning Platform

This project is based on the requested idea:
Trainee → Course → 15-question diagnostic test → topic-wise weakness → trainer recommendation → slot booking → lecture → post-test → improvement.

## Project structure
- `frontend/` React + TypeScript + Vite UI prototype
- `backend/` FastAPI + SQLAlchemy + SQLite API

## Backend quick start
```powershell
cd backend
py -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Then open `http://127.0.0.1:8000/docs`.

Demo trainee:
`trainee@skillsphere.com` / `123456`

The backend automatically creates and seeds the SQLite database.
