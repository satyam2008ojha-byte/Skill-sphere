from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os

from twilio.rest import Client

from .database import get_db
from .models import *
from .schemas import *
from .seed import seed


app = FastAPI(
    title="SkillSphere API",
    version="2.0.0"
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
# DATABASE
# =========================================================

seed()


# =========================================================
# TWILIO
# =========================================================

TWILIO_ACCOUNT_SID = os.getenv(
    "TWILIO_ACCOUNT_SID"
)

TWILIO_AUTH_TOKEN = os.getenv(
    "TWILIO_AUTH_TOKEN"
)

TWILIO_VERIFY_SERVICE_SID = os.getenv(
    "TWILIO_VERIFY_SERVICE_SID"
)


def get_twilio_client():

    if not TWILIO_ACCOUNT_SID:
        raise HTTPException(
            status_code=500,
            detail="TWILIO_ACCOUNT_SID is not configured"
        )

    if not TWILIO_AUTH_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="TWILIO_AUTH_TOKEN is not configured"
        )

    if not TWILIO_VERIFY_SERVICE_SID:
        raise HTTPException(
            status_code=500,
            detail="TWILIO_VERIFY_SERVICE_SID is not configured"
        )

    return Client(
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN
    )


# =========================================================
# REGISTRATION SCHEMAS
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    channel: str


class SendOTPRequest(BaseModel):
    contact: str
    channel: str


class VerifyOTPRequest(BaseModel):
    contact: str
    code: str


# =========================================================
# HOME
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

    user = db.query(User).filter(
        User.email == email,
        User.password == data.password
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


# =========================================================
# SEND OTP
# =========================================================

@app.post("/auth/send-otp")
def send_otp(
    data: SendOTPRequest,
    db: Session = Depends(get_db)
):

    channel = data.channel.lower().strip()
    contact = data.contact.strip()

    if channel not in ["email", "sms"]:
        raise HTTPException(
            status_code=400,
            detail="Channel must be email or sms"
        )

    # Check if email already registered
    if channel == "email":

        existing = db.query(User).filter(
            func.lower(User.email) ==
            contact.lower()
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email is already registered"
            )

    client = get_twilio_client()

    try:

        verification = client.verify \
            .v2 \
            .services(
                TWILIO_VERIFY_SERVICE_SID
            ) \
            .verifications \
            .create(
                to=contact,
                channel=channel
            )

        return {
            "success": True,
            "status": verification.status,
            "channel": channel
        }

    except Exception as e:

        print("TWILIO SEND OTP ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=f"Unable to send OTP: {str(e)}"
        )


# =========================================================
# VERIFY OTP
# =========================================================

@app.post("/auth/verify-otp")
def verify_otp(
    data: VerifyOTPRequest
):

    contact = data.contact.strip()
    code = data.code.strip()

    if not code:
        raise HTTPException(
            status_code=400,
            detail="OTP is required"
        )

    client = get_twilio_client()

    try:

        result = client.verify \
            .v2 \
            .services(
                TWILIO_VERIFY_SERVICE_SID
            ) \
            .verification_checks \
            .create(
                to=contact,
                code=code
            )

        if result.status != "approved":

            raise HTTPException(
                status_code=400,
                detail="Invalid or expired OTP"
            )

        return {
            "success": True,
            "verified": True,
            "message": "OTP verified successfully"
        }

    except HTTPException:
        raise

    except Exception as e:

        print("TWILIO VERIFY OTP ERROR:", e)

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP"
        )


# =========================================================
# REGISTER USER
# =========================================================

@app.post("/auth/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    name = data.name.strip()
    email = data.email.strip().lower()
    password = data.password

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required"
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    existing = db.query(User).filter(
        func.lower(User.email) == email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    user = User(
        name=name,
        email=email,
        password=password,
        role="trainee"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
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

    questions = db.query(Quiz).filter(
        Quiz.course_id == course_id
    ).all()

    return questions


# =========================================================
# SUBMIT TEST
# =========================================================

@app.post("/tests/submit")
def submit_test(
    data: TestSubmit,
    db: Session = Depends(get_db)
):

    questions = db.query(Quiz).filter(
        Quiz.course_id == data.course_id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No questions found"
        )

    answer_map = {
        item.question_id: item.answer
        for item in data.answers
    }

    correct = 0

    topic_total = {}
    topic_correct = {}

    for question in questions:

        topic_id = question.topic_id

        topic_total[topic_id] = (
            topic_total.get(topic_id, 0) + 1
        )

        if answer_map.get(question.id) == question.answer:

            correct += 1

            topic_correct[topic_id] = (
                topic_correct.get(topic_id, 0) + 1
            )

    score = round(
        (correct / len(questions)) * 100
    )

    attempt = Attempt(
        trainee_id=data.trainee_id,
        course_id=data.course_id,
        score=score,
        test_type=data.test_type
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    weak_topics = []

    for topic_id, total in topic_total.items():

        topic_score = round(
            (
                topic_correct.get(
                    topic_id,
                    0
                ) / total
            ) * 100
        )

        if topic_score < 70:
            weak_topics.append({
                "topic_id": topic_id,
                "percentage": topic_score
            })

    return {
        "attempt_id": attempt.id,
        "score": score,
        "weak_topics": weak_topics
    }


# =========================================================
# ATTEMPT RESULT
# =========================================================

@app.get("/attempts/{attempt_id}/result")
def attempt_result(
    attempt_id: int,
    db: Session = Depends(get_db)
):

    attempt = db.query(Attempt).filter(
        Attempt.id == attempt_id
    ).first()

    if not attempt:
        raise HTTPException(
            status_code=404,
            detail="Attempt not found"
        )

    questions = db.query(Quiz).filter(
        Quiz.course_id == attempt.course_id
    ).all()

    return {
        "attempt_id": attempt.id,
        "test_type": attempt.test_type,
        "score": attempt.score,
        "topics": []
    }


# =========================================================
# TRAINER RECOMMENDATION
# =========================================================

@app.get("/trainers/recommended/{topic_id}")
def recommended_trainers(
    topic_id: int,
    db: Session = Depends(get_db)
):

    expertise = db.query(
        TrainerExpertise
    ).filter(
        TrainerExpertise.topic_id ==
        topic_id
    ).all()

    result = []

    for item in expertise:

        trainer = db.query(User).filter(
            User.id == item.trainer_id,
            User.role == "trainer"
        ).first()

        if trainer:

            result.append({
                "id": trainer.id,
                "name": trainer.name,
                "bio": trainer.bio
            })

    return result


# =========================================================
# TRAINER SLOTS
# =========================================================

@app.get("/trainers/{trainer_id}/slots")
def trainer_slots(
    trainer_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Slot).filter(
        Slot.trainer_id == trainer_id,
        Slot.is_booked == False
    ).all()


# =========================================================
# BOOKING
# =========================================================

@app.post("/bookings")
def create_booking(
    data: BookingRequest,
    db: Session = Depends(get_db)
):

    slot = db.query(Slot).filter(
        Slot.id == data.slot_id,
        Slot.trainer_id == data.trainer_id,
        Slot.is_booked == False
    ).first()

    if not slot:
        raise HTTPException(
            status_code=400,
            detail="Slot is not available"
        )

    slot.is_booked = True

    booking = Booking(
        trainee_id=data.trainee_id,
        trainer_id=data.trainer_id,
        slot_id=data.slot_id,
        topic_id=data.topic_id
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
        "booking_id": booking.id,
        "lecture_id": booking.id
    }


# =========================================================
# COMPLETE LECTURE
# =========================================================

@app.post("/lectures/{lecture_id}/complete")
def complete_lecture(
    lecture_id: int,
    db: Session = Depends(get_db)
):

    booking = db.query(Booking).filter(
        Booking.id == lecture_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Lecture not found"
        )

    booking.completed = True

    db.commit()

    return {
        "success": True,
        "message": "Lecture completed"
    }


# =========================================================
# PROGRESS
# =========================================================

@app.get("/progress/{trainee_id}")
def progress(
    trainee_id: int,
    db: Session = Depends(get_db)
):

    attempts = db.query(Attempt).filter(
        Attempt.trainee_id == trainee_id
    ).all()

    return [
        {
            "id": attempt.id,
            "course_id": attempt.course_id,
            "score": attempt.score,
            "test_type": attempt.test_type
        }
        for attempt in attempts
    ]
