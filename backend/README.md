# SkillSphere Backend

## Run on Windows

```powershell
cd backend
py -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

Demo:
- trainee@skillsphere.com / 123456
- aarav@skillsphere.com / 123456
- neha@skillsphere.com / 123456
- rohan@skillsphere.com / 123456
- admin@skillsphere.com / 123456

SQLite database is created automatically as `skillsphere.db`.
