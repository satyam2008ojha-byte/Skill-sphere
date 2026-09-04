from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session, aliased

from .database import get_db, Base, engine
from .models import (
    User,
    Course,
    Topic,
    Question,
    TrainerTopic,
    TrainerSlot,
    TestAttempt,
    TestAnswer,
    Booking,
    Lecture,
    TopicResult,
)


app = FastAPI(title="SkillSphere API")


# ---------------------------------------------------------
# DATABASE
# ---------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://skill-sphere-ybm7.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# REQUEST SCHEMAS
# ---------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AnswerItem(BaseModel):
    question_id: int
    answer: str


class TestSubmit(BaseModel):
    trainee_id: int
    course_id: int
    answers: List[AnswerItem]
    test_type: str


class BookingRequest(BaseModel):
    trainee_id: int
    trainer_id: int
    slot_id: int
    topic_id: int


class SlotCreate(BaseModel):
    start_time: str
    end_time: str


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "SkillSphere API is running"
    }


# ---------------------------------------------------------
# AUTH - REGISTER
# ---------------------------------------------------------

@app.post("/auth/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )

    user = User(
        name=request.name,
        email=request.email,
        password=request.password,
        role="trainee",
        bio=""
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registration successful",
        "user_id": user.id
    }


# ---------------------------------------------------------
# AUTH - LOGIN
# ---------------------------------------------------------

@app.post("/auth/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.password != request.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "bio": user.bio or ""
    }


# ---------------------------------------------------------
# COURSES
# ---------------------------------------------------------

@app.get("/courses")
def get_courses(
    db: Session = Depends(get_db)
):
    courses = db.query(Course).all()

    return [
        {
            "id": course.id,
            "title": course.title,
            "description": course.description or ""
        }
        for course in courses
    ]


# ---------------------------------------------------------
# COURSE QUESTIONS
# ---------------------------------------------------------

@app.get("/courses/{course_id}/questions")
def get_course_questions(
    course_id: int,
    db: Session = Depends(get_db)
):
    questions = (
        db.query(Question)
        .filter(Question.course_id == course_id)
        .all()
    )

    result = []

    for question in questions:
        topic = (
            db.query(Topic)
            .filter(Topic.id == question.topic_id)
            .first()
        )

        result.append({
            "id": question.id,
            "course_id": question.course_id,
            "topic_id": question.topic_id,
            "topic_name": topic.name if topic else "",
            "text": question.text,
            "option_a": question.option_a,
            "option_b": question.option_b,
            "option_c": question.option_c,
            "option_d": question.option_d
        })

    return result


# ---------------------------------------------------------
# SUBMIT TEST
# ---------------------------------------------------------

@app.post("/tests/submit")
def submit_test(
    request: TestSubmit,
    db: Session = Depends(get_db)
):
    trainee = (
        db.query(User)
        .filter(User.id == request.trainee_id)
        .first()
    )

    if not trainee:
        raise HTTPException(
            status_code=404,
            detail="Trainee not found"
        )

    course = (
        db.query(Course)
        .filter(Course.id == request.course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    attempt = TestAttempt(
        trainee_id=request.trainee_id,
        course_id=request.course_id,
        test_type=request.test_type,
        score=0,
        status="completed"
    )

    db.add(attempt)
    db.flush()

    correct_count = 0
    topic_stats = {}

    for item in request.answers:

        question = (
            db.query(Question)
            .filter(Question.id == item.question_id)
            .first()
        )

        if not question:
            continue

        is_correct = (
            item.answer.upper()
            == question.correct_answer.upper()
        )

        if is_correct:
            correct_count += 1

        answer = TestAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            answer=item.answer,
            is_correct=is_correct
        )

        db.add(answer)

        if question.topic_id not in topic_stats:
            topic_stats[question.topic_id] = {
                "total": 0,
                "correct": 0
            }

        topic_stats[question.topic_id]["total"] += 1

        if is_correct:
            topic_stats[question.topic_id]["correct"] += 1

    total_questions = len(request.answers)

    score = (
        (correct_count / total_questions) * 100
        if total_questions > 0
        else 0
    )

    attempt.score = score

    for topic_id, stats in topic_stats.items():

        percentage = (
            stats["correct"] / stats["total"]
        ) * 100

        topic_result = TopicResult(
            attempt_id=attempt.id,
            topic_id=topic_id,
            percentage=percentage
        )

        db.add(topic_result)

    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "score": score,
        "total": total_questions
    }


# ---------------------------------------------------------
# ATTEMPT RESULT
# ---------------------------------------------------------

@app.get("/attempts/{attempt_id}/result")
def get_attempt_result(
    attempt_id: int,
    db: Session = Depends(get_db)
):
    attempt = (
        db.query(TestAttempt)
        .filter(TestAttempt.id == attempt_id)
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=404,
            detail="Attempt not found"
        )

    topic_results = (
        db.query(TopicResult)
        .filter(
            TopicResult.attempt_id == attempt_id
        )
        .all()
    )

    result = []

    for topic_result in topic_results:

        topic = (
            db.query(Topic)
            .filter(Topic.id == topic_result.topic_id)
            .first()
        )

        result.append({
            "topic_id": topic_result.topic_id,
            "topic_name": topic.name if topic else "",
            "percentage": topic_result.percentage
        })

    return {
        "attempt_id": attempt.id,
        "score": attempt.score,
        "total": len(
            db.query(TestAnswer)
            .filter(
                TestAnswer.attempt_id == attempt_id
            )
            .all()
        ),
        "topic_results": result
    }


# ---------------------------------------------------------
# RECOMMENDED TRAINER
# ---------------------------------------------------------

@app.get("/trainers/recommended/{topic_id}")
def recommended_trainer(
    topic_id: int,
    db: Session = Depends(get_db)
):
    trainer_topic = (
        db.query(TrainerTopic)
        .filter(
            TrainerTopic.topic_id == topic_id
        )
        .first()
    )

    if not trainer_topic:
        raise HTTPException(
            status_code=404,
            detail="No trainer found for this topic"
        )

    trainer = (
        db.query(User)
        .filter(
            User.id == trainer_topic.trainer_id,
            User.role == "trainer"
        )
        .first()
    )

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    return {
        "id": trainer.id,
        "name": trainer.name,
        "email": trainer.email,
        "bio": trainer.bio or ""
    }


# ---------------------------------------------------------
# TRAINER SLOTS
# ---------------------------------------------------------

@app.get("/trainers/{trainer_id}/slots")
def get_trainer_slots(
    trainer_id: int,
    db: Session = Depends(get_db)
):
    trainer = (
        db.query(User)
        .filter(
            User.id == trainer_id,
            User.role == "trainer"
        )
        .first()
    )

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    slots = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.trainer_id == trainer_id
        )
        .order_by(TrainerSlot.id)
        .all()
    )

    return [
        {
            "id": slot.id,
            "trainer_id": slot.trainer_id,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "available": slot.available
        }
        for slot in slots
    ]


# ---------------------------------------------------------
# TRAINER DASHBOARD
# ---------------------------------------------------------

@app.get("/trainers/{trainer_id}/dashboard")
def trainer_dashboard(
    trainer_id: int,
    db: Session = Depends(get_db)
):
    trainer = (
        db.query(User)
        .filter(
            User.id == trainer_id,
            User.role == "trainer"
        )
        .first()
    )

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    trainer_topics = (
        db.query(TrainerTopic)
        .filter(
            TrainerTopic.trainer_id == trainer_id
        )
        .all()
    )

    topics = []

    for trainer_topic in trainer_topics:

        topic = (
            db.query(Topic)
            .filter(
                Topic.id == trainer_topic.topic_id
            )
            .first()
        )

        if topic:
            topics.append({
                "id": topic.id,
                "name": topic.name
            })

    slots = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.trainer_id == trainer_id
        )
        .order_by(TrainerSlot.id)
        .all()
    )

    trainee_alias = aliased(User)

    bookings = (
        db.query(
            Booking,
            trainee_alias
        )
        .join(
            trainee_alias,
            Booking.trainee_id == trainee_alias.id
        )
        .filter(
            Booking.trainer_id == trainer_id
        )
        .order_by(Booking.id.desc())
        .all()
    )

    booking_result = []

    for booking, trainee in bookings:
        booking_result.append({
            "id": booking.id,
            "trainee_id": booking.trainee_id,
            "trainee_name": trainee.name,
            "trainee_email": trainee.email,
            "topic_id": booking.topic_id,
            "status": booking.status
        })

    return {
        "trainer": {
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or ""
        },
        "topics": topics,
        "slots": [
            {
                "id": slot.id,
                "trainer_id": slot.trainer_id,
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "available": slot.available
            }
            for slot in slots
        ],
        "bookings": booking_result
    }


# ---------------------------------------------------------
# ADD TRAINER SLOT
# ---------------------------------------------------------

@app.post("/trainers/{trainer_id}/slots")
def add_trainer_slot(
    trainer_id: int,
    request: SlotCreate,
    db: Session = Depends(get_db)
):
    trainer = (
        db.query(User)
        .filter(
            User.id == trainer_id,
            User.role == "trainer"
        )
        .first()
    )

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    if not request.start_time.strip():
        raise HTTPException(
            status_code=400,
            detail="Start time is required"
        )

    if not request.end_time.strip():
        raise HTTPException(
            status_code=400,
            detail="End time is required"
        )

    slot = TrainerSlot(
        trainer_id=trainer_id,
        start_time=request.start_time,
        end_time=request.end_time,
        available=True
    )

    db.add(slot)
    db.commit()
    db.refresh(slot)

    return {
        "message": "Slot added successfully",
        "slot": {
            "id": slot.id,
            "trainer_id": slot.trainer_id,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "available": slot.available
        }
    }


# ---------------------------------------------------------
# DELETE TRAINER SLOT
# ---------------------------------------------------------

@app.delete("/trainers/{trainer_id}/slots/{slot_id}")
def delete_trainer_slot(
    trainer_id: int,
    slot_id: int,
    db: Session = Depends(get_db)
):
    slot = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.id == slot_id,
            TrainerSlot.trainer_id == trainer_id
        )
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    if not slot.available:
        raise HTTPException(
            status_code=400,
            detail="Booked slot cannot be deleted"
        )

    db.delete(slot)
    db.commit()

    return {
        "message": "Slot deleted successfully"
    }


# ---------------------------------------------------------
# BOOK SLOT
# ---------------------------------------------------------

@app.post("/bookings")
def create_booking(
    request: BookingRequest,
    db: Session = Depends(get_db)
):
    trainee = (
        db.query(User)
        .filter(
            User.id == request.trainee_id
        )
        .first()
    )

    if not trainee:
        raise HTTPException(
            status_code=404,
            detail="Trainee not found"
        )

    trainer = (
        db.query(User)
        .filter(
            User.id == request.trainer_id,
            User.role == "trainer"
        )
        .first()
    )

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    slot = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.id == request.slot_id,
            TrainerSlot.trainer_id == request.trainer_id
        )
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    if not slot.available:
        raise HTTPException(
            status_code=400,
            detail="Slot is already booked"
        )

    booking = Booking(
        trainee_id=request.trainee_id,
        trainer_id=request.trainer_id,
        slot_id=request.slot_id,
        topic_id=request.topic_id,
        status="booked"
    )

    db.add(booking)

    slot.available = False

    db.flush()

    lecture = Lecture(
        booking_id=booking.id,
        status="scheduled"
    )

    db.add(lecture)

    db.commit()
    db.refresh(booking)
    db.refresh(lecture)

    return {
        "message": "Booking successful",
        "booking_id": booking.id,
        "lecture_id": lecture.id,
        "status": booking.status
    }


# ---------------------------------------------------------
# COMPLETE LECTURE
# ---------------------------------------------------------

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

    booking = (
        db.query(Booking)
        .filter(
            Booking.id == lecture.booking_id
        )
        .first()
    )

    if booking:
        booking.status = "completed"

    db.commit()

    return {
        "message": "Lecture completed successfully"
    }


# ---------------------------------------------------------
# TRAINEE PROGRESS
# ---------------------------------------------------------

@app.get("/progress/{trainee_id}")
def get_progress(
    trainee_id: int,
    db: Session = Depends(get_db)
):
    trainee = (
        db.query(User)
        .filter(User.id == trainee_id)
        .first()
    )

    if not trainee:
        raise HTTPException(
            status_code=404,
            detail="Trainee not found"
        )

    attempts = (
        db.query(TestAttempt)
        .filter(
            TestAttempt.trainee_id == trainee_id
        )
        .order_by(TestAttempt.id.desc())
        .all()
    )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.trainee_id == trainee_id
        )
        .order_by(Booking.id.desc())
        .all()
    )

    lectures = []

    for booking in bookings:

        lecture = (
            db.query(Lecture)
            .filter(
                Lecture.booking_id == booking.id
            )
            .first()
        )

        if lecture:
            lectures.append({
                "lecture_id": lecture.id,
                "booking_id": booking.id,
                "status": lecture.status
            })

    return {
        "trainee": {
            "id": trainee.id,
            "name": trainee.name,
            "email": trainee.email
        },
        "attempts": [
            {
                "id": attempt.id,
                "course_id": attempt.course_id,
                "test_type": attempt.test_type,
                "score": attempt.score,
                "status": attempt.status
            }
            for attempt in attempts
        ],
        "bookings": [
            {
                "id": booking.id,
                "trainer_id": booking.trainer_id,
                "topic_id": booking.topic_id,
                "status": booking.status
            }
            for booking in bookings
        ],
        "lectures": lectures
    }
