# Frontend ↔ Backend integration

Backend runs at `http://127.0.0.1:8000`.

Available endpoints:
- POST `/auth/login`
- GET `/courses`
- GET `/courses/{course_id}/questions`
- POST `/tests/submit`
- GET `/attempts/{attempt_id}/result`
- GET `/trainers/recommended/{topic_id}`
- GET `/trainers/{trainer_id}/slots`
- POST `/bookings`
- POST `/lectures/{lecture_id}/complete`
- GET `/progress/{trainee_id}`

The included frontend is the UI prototype. Its current mock-data flow can be progressively switched to these APIs. The backend itself is fully seeded and usable independently through Swagger at `/docs`.
