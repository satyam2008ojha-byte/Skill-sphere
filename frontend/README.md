# SkillSphere

SkillSphere is a frontend prototype for a competency-based training flow:

1. Trainee selects a course.
2. Trainee takes a 15-question diagnostic test.
3. Questions are mapped to specific topics.
4. Wrong answers identify weak topics (below 70%).
5. The system recommends a trainer whose expertise matches the weak topics.
6. Trainee selects an available trainer slot and books a lecture.
7. After the lecture, the trainee takes the post-test.
8. Skill improvement is shown before vs after the lecture.

## Run

```bash
npm install
npm run dev
```

This version is a frontend-only functional prototype. Data is currently in React state; connect the screens to the FastAPI/database backend for persistent users, questions, trainers, bookings and results.
