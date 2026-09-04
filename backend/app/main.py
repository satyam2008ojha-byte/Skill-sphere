from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import get_db
from .models import (
    User,
    Course,
    Topic,
    Question,
    TrainerTopic,
    TrainerSlot,
    TestAttempt,
    TestAnswer,
    TopicResult,
    Booking,
    Lecture,
)
from .schemas import (
    LoginRequest,
    TestSubmit,
    BookingRequest,
)
from .seed import seed


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="SkillSphere API",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://skill-sphere-ybm7.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# SEED DATABASE
# =========================================================

seed()


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "SkillSphere API is running"
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/auth/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    email = data.email.strip().lower()
    password = data.password.strip()

    user = (
        db.query(User)
        .filter(
            User.email == email,
            User.password == password
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


# =========================================================
# COURSES
# =========================================================

@app.get("/courses")
def get_courses(
    db: Session = Depends(get_db)
):
    return db.query(Course).all()


# =========================================================
# QUESTIONS
# =========================================================

@app.get("/courses/{course_id}/questions")
def get_questions(
    course_id: int,
    db: Session = Depends(get_db)
):
    questions = (
        db.query(Question)
        .filter(Question.course_id == course_id)
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Course questions not found"
        )

    return [
        {
            "id": q.id,
            "topic_id": q.topic_id,
            "text": q.text,
            "options": [
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
            ],
        }
        for q in questions
    ]


# =========================================================
# SUBMIT TEST
# =========================================================

@app.post("/tests/submit")
def submit_test(
    data: TestSubmit,
    db: Session = Depends(get_db)
):
    questions = (
        db.query(Question)
        .filter(
            Question.course_id == data.course_id
        )
        .all()
    )

    question_map = {
        q.id: q
        for q in questions
    }

    if not question_map:
        raise HTTPException(
            status_code=404,
            detail="Course questions not found"
        )

    attempt = TestAttempt(
        trainee_id=data.trainee_id,
        course_id=data.course_id,
        test_type=data.test_type,
        score=0,
        status="completed",
    )

    db.add(attempt)
    db.flush()

    topic_total = {}
    topic_correct = {}

    correct_count = 0
    answered_count = 0

    for item in data.answers:
        question = question_map.get(item.question_id)

        if not question:
            continue

        answer = item.answer.strip().upper()

        is_correct = (
            answer == question.correct_answer.strip().upper()
        )

        answered_count += 1

        if is_correct:
            correct_count += 1

        topic_id = question.topic_id

        topic_total[topic_id] = (
            topic_total.get(topic_id, 0) + 1
        )

        topic_correct[topic_id] = (
            topic_correct.get(topic_id, 0)
            + int(is_correct)
        )

        db.add(
            TestAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                answer=item.answer,
                is_correct=is_correct,
            )
        )

    if answered_count > 0:
        attempt.score = round(
            correct_count / answered_count * 100,
            2
        )
    else:
        attempt.score = 0

    weak_topics = []

    for topic_id, total in topic_total.items():

        percentage = round(
            topic_correct.get(topic_id, 0)
            / total
            * 100,
            2,
        )

        db.add(
            TopicResult(
                attempt_id=attempt.id,
                topic_id=topic_id,
                percentage=percentage,
            )
        )

        if percentage < 70:
            topic = (
                db.query(Topic)
                .filter(Topic.id == topic_id)
                .first()
            )

            weak_topics.append(
                {
                    "topic_id": topic_id,
                    "topic": topic.name if topic else "Unknown",
                    "percentage": percentage,
                }
            )

    db.commit()

    return {
        "attempt_id": attempt.id,
        "score": attempt.score,
        "weak_topics": weak_topics,
    }


# =========================================================
# TEST RESULT
# =========================================================

@app.get("/attempts/{attempt_id}/result")
def get_result(
    attempt_id: int,
    db: Session = Depends(get_db)
):
    attempt = (
        db.query(TestAttempt)
        .filter(
            TestAttempt.id == attempt_id
        )
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=404,
            detail="Attempt not found"
        )

    rows = (
        db.query(TopicResult, Topic)
        .join(
            Topic,
            Topic.id == TopicResult.topic_id
        )
        .filter(
            TopicResult.attempt_id == attempt_id
        )
        .all()
    )

    return {
        "attempt_id": attempt.id,
        "test_type": attempt.test_type,
        "score": attempt.score,
        "topics": [
            {
                "topic_id": topic.id,
                "topic": topic.name,
                "percentage": result.percentage,
            }
            for result, topic in rows
        ],
    }


# =========================================================
# RECOMMENDED TRAINER
# =========================================================

@app.get("/trainers/recommended/{topic_id}")
def recommended_trainers(
    topic_id: int,
    db: Session = Depends(get_db)
):
    trainers = (
        db.query(User)
        .join(
            TrainerTopic,
            TrainerTopic.trainer_id == User.id
        )
        .filter(
            TrainerTopic.topic_id == topic_id,
            User.role == "trainer",
        )
        .all()
    )

    return [
        {
            "id": trainer.id,
            "name": trainer.name,
            "bio": trainer.bio,
        }
        for trainer in trainers
    ]


# =========================================================
# TRAINER SLOTS
# =========================================================

@app.get("/trainers/{trainer_id}/slots")
def get_trainer_slots(
    trainer_id: int,
    db: Session = Depends(get_db)
):
    slots = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.trainer_id == trainer_id,
            TrainerSlot.available == True,
        )
        .all()
    )

    return [
        {
            "id": slot.id,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
        }
        for slot in slots
    ]


# =========================================================
# BOOK SLOT
# =========================================================

@app.post("/bookings")
def book_slot(
    data: BookingRequest,
    db: Session = Depends(get_db)
):
    slot = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.id == data.slot_id,
            TrainerSlot.available == True,
        )
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=400,
            detail="Slot is not available"
        )

    booking = Booking(
        trainee_id=data.trainee_id,
        trainer_id=data.trainer_id,
        slot_id=data.slot_id,
        topic_id=data.topic_id,
        status="booked",
    )

    slot.available = False

    db.add(booking)
    db.flush()

    lecture = Lecture(
        booking_id=booking.id,
        status="scheduled",
    )

    db.add(lecture)
    db.commit()

    return {
        "booking_id": booking.id,
        "lecture_id": lecture.id,
        "status": "booked",
    }


# =========================================================
# COMPLETE LECTURE
# =========================================================

@app.post("/lectures/{lecture_id}/complete")
def complete_lecture(
    lecture_id: int,
    db: Session = Depends(get_db)
):
    lecture = (
        db.query(Lecture)
        .filter(
            Lecture.id == lecture_id
        )
        .first()
    )

    if not lecture:
        raise HTTPException(
            status_code=404,
            detail="Lecture not found"
        )

    lecture.status = "completed"

    db.commit()

    return {
        "lecture_id": lecture.id,
        "status": lecture.status,
    }


# =========================================================
# TRAINEE PROGRESS
# =========================================================

@app.get("/progress/{trainee_id}")
def get_progress(
    trainee_id: int,
    db: Session = Depends(get_db)
):
    attempts = (
        db.query(TestAttempt)
        .filter(
            TestAttempt.trainee_id == trainee_id
        )
        .order_by(TestAttempt.id)
        .all()
    )

    return [
        {
            "id": attempt.id,
            "course_id": attempt.course_id,
            "test_type": attempt.test_type,
            "score": attempt.score,
        }
        for attempt in attempts
    ]
