from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import get_db
from .models import *
from .schemas import *
from .seed import seed


app = FastAPI(
    title="SkillSphere API",
    version="2.0.0"
)


# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://skill-sphere-ybm7.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# DATABASE INITIALIZATION
# -----------------------------

seed()


# -----------------------------
# ROOT
# -----------------------------

@app.get("/")
def root():
    return {
        "message": "SkillSphere API is running",
        "version": "2.0"
    }


# =========================================================
# AUTH
# =========================================================

@app.post("/auth/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    if data.role not in ["trainee", "trainer", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    existing = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        name=data.name.strip(),
        email=data.email,
        password=data.password,
        role=data.role,
        bio=data.bio or ""
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registration successful",
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "bio": user.bio
    }


@app.post("/auth/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email,
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
        "role": user.role,
        "bio": user.bio or ""
    }


# =========================================================
# PROFILE
# =========================================================

@app.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "bio": user.bio or ""
    }


@app.put("/users/{user_id}/profile")
def update_profile(
    user_id: int,
    data: ProfileUpdate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.name = data.name.strip()
    user.bio = data.bio or ""

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "bio": user.bio or ""
    }


# =========================================================
# COURSES
# =========================================================

@app.get("/courses")
def courses(
    db: Session = Depends(get_db)
):

    rows = db.query(Course).all()

    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description or ""
        }
        for c in rows
    ]


@app.get("/courses/{course_id}/topics")
def course_topics(
    course_id: int,
    db: Session = Depends(get_db)
):

    topics = db.query(Topic).filter(
        Topic.course_id == course_id
    ).all()

    return [
        {
            "id": t.id,
            "name": t.name
        }
        for t in topics
    ]


@app.get("/courses/{course_id}/questions")
def questions(
    course_id: int,
    db: Session = Depends(get_db)
):

    qs = db.query(Question).filter(
        Question.course_id == course_id
    ).all()

    return [
        {
            "id": q.id,
            "topic_id": q.topic_id,
            "text": q.text,
            "options": [
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d
            ]
        }
        for q in qs
    ]


# =========================================================
# TEST
# =========================================================

@app.post("/tests/submit")
def submit_test(
    data: TestSubmit,
    db: Session = Depends(get_db)
):

    questions = db.query(Question).filter(
        Question.course_id == data.course_id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Course questions not found"
        )

    question_map = {
        q.id: q for q in questions
    }

    attempt = TestAttempt(
        trainee_id=data.trainee_id,
        course_id=data.course_id,
        test_type=data.test_type,
        score=0
    )

    db.add(attempt)
    db.flush()

    correct_count = 0

    topic_total = {}
    topic_correct = {}

    for item in data.answers:

        q = question_map.get(item.question_id)

        if not q:
            continue

        is_correct = (
            item.answer.upper()
            == q.correct_answer.upper()
        )

        if is_correct:
            correct_count += 1

        topic_total[q.topic_id] = (
            topic_total.get(q.topic_id, 0) + 1
        )

        topic_correct[q.topic_id] = (
            topic_correct.get(q.topic_id, 0)
            + int(is_correct)
        )

        db.add(
            TestAnswer(
                attempt_id=attempt.id,
                question_id=q.id,
                answer=item.answer,
                is_correct=is_correct
            )
        )

    total = max(len(data.answers), 1)

    attempt.score = round(
        correct_count / total * 100,
        2
    )

    weak_topics = []

    for topic_id, total_questions in topic_total.items():

        percentage = round(
            topic_correct.get(topic_id, 0)
            / total_questions
            * 100,
            2
        )

        db.add(
            TopicResult(
                attempt_id=attempt.id,
                topic_id=topic_id,
                percentage=percentage
            )
        )

        if percentage < 70:

            weak_topics.append(
                {
                    "topic_id": topic_id,
                    "percentage": percentage
                }
            )

    db.commit()

    return {
        "attempt_id": attempt.id,
        "score": attempt.score,
        "weak_topics": weak_topics
    }


@app.get("/attempts/{attempt_id}/result")
def result(
    attempt_id: int,
    db: Session = Depends(get_db)
):

    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id
    ).first()

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
                "percentage": result.percentage
            }
            for result, topic in rows
        ]
    }


# =========================================================
# TRAINERS
# =========================================================

@app.get("/trainers")
def get_trainers(
    db: Session = Depends(get_db)
):

    trainers = db.query(User).filter(
        User.role == "trainer"
    ).all()

    result = []

    for trainer in trainers:

        rows = (
            db.query(Topic.id, Topic.name)
            .join(
                TrainerTopic,
                TrainerTopic.topic_id == Topic.id
            )
            .filter(
                TrainerTopic.trainer_id == trainer.id
            )
            .all()
        )

        result.append(
            {
                "id": trainer.id,
                "name": trainer.name,
                "email": trainer.email,
                "bio": trainer.bio or "",
                "expertise": [
                    {
                        "topic_id": topic_id,
                        "topic_name": topic_name
                    }
                    for topic_id, topic_name in rows
                ]
            }
        )

    return result


@app.get("/trainers/recommended/{topic_id}")
def recommended(
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
            User.role == "trainer"
        )
        .all()
    )

    return [
        {
            "id": t.id,
            "name": t.name,
            "bio": t.bio or ""
        }
        for t in trainers
    ]


# =========================================================
# TRAINER SLOTS
# =========================================================

@app.get("/trainers/{trainer_id}/slots")
def slots(
    trainer_id: int,
    db: Session = Depends(get_db)
):

    rows = db.query(TrainerSlot).filter(
        TrainerSlot.trainer_id == trainer_id,
        TrainerSlot.available == True
    ).all()

    return [
        {
            "id": slot.id,
            "start_time": slot.start_time,
            "end_time": slot.end_time
        }
        for slot in rows
    ]


@app.post("/trainers/{trainer_id}/slots")
def create_slot(
    trainer_id: int,
    data: SlotCreate,
    db: Session = Depends(get_db)
):

    trainer = db.query(User).filter(
        User.id == trainer_id,
        User.role == "trainer"
    ).first()

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    slot = TrainerSlot(
        trainer_id=trainer_id,
        start_time=data.start_time,
        end_time=data.end_time,
        available=True
    )

    db.add(slot)
    db.commit()
    db.refresh(slot)

    return {
        "id": slot.id,
        "start_time": slot.start_time,
        "end_time": slot.end_time,
        "available": True
    }


@app.delete("/trainers/{trainer_id}/slots/{slot_id}")
def delete_slot(
    trainer_id: int,
    slot_id: int,
    db: Session = Depends(get_db)
):

    slot = db.query(TrainerSlot).filter(
        TrainerSlot.id == slot_id,
        TrainerSlot.trainer_id == trainer_id
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    db.delete(slot)
    db.commit()

    return {
        "message": "Slot deleted"
    }


# =========================================================
# BOOKINGS
# =========================================================

@app.post("/bookings")
def book(
    data: BookingRequest,
    db: Session = Depends(get_db)
):

    slot = db.query(TrainerSlot).filter(
        TrainerSlot.id == data.slot_id,
        TrainerSlot.trainer_id == data.trainer_id,
        TrainerSlot.available == True
    ).first()

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
        status="booked"
    )

    slot.available = False

    db.add(booking)
    db.flush()

    lecture = Lecture(
        booking_id=booking.id,
        status="scheduled"
    )

    db.add(lecture)
    db.commit()

    return {
        "booking_id": booking.id,
        "lecture_id": lecture.id,
        "status": "booked"
    }


# =========================================================
# LECTURE
# =========================================================

@app.post("/lectures/{lecture_id}/complete")
def complete_lecture(
    lecture_id: int,
    db: Session = Depends(get_db)
):

    lecture = db.query(Lecture).filter(
        Lecture.id == lecture_id
    ).first()

    if not lecture:
        raise HTTPException(
            status_code=404,
            detail="Lecture not found"
        )

    lecture.status = "completed"

    db.commit()

    return {
        "lecture_id": lecture.id,
        "status": lecture.status
    }


# =========================================================
# PROGRESS
# =========================================================

@app.get("/progress/{trainee_id}")
def progress(
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
            "id": a.id,
            "course_id": a.course_id,
            "test_type": a.test_type,
            "score": a.score
        }
        for a in attempts
    ]


# =========================================================
# TRAINER DASHBOARD
# =========================================================

@app.get("/trainers/{trainer_id}/dashboard")
def trainer_dashboard(
    trainer_id: int,
    db: Session = Depends(get_db)
):

    trainer = db.query(User).filter(
        User.id == trainer_id,
        User.role == "trainer"
    ).first()

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    slots = db.query(TrainerSlot).filter(
        TrainerSlot.trainer_id == trainer_id
    ).all()

    booking_rows = (
        db.query(Booking, User, Topic, TrainerSlot)
        .join(
            User,
            User.id == Booking.trainee_id
        )
        .join(
            Topic,
            Topic.id == Booking.topic_id
        )
        .join(
            TrainerSlot,
            TrainerSlot.id == Booking.slot_id
        )
        .filter(
            Booking.trainer_id == trainer_id
        )
        .all()
    )

    return {
        "trainer": {
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or ""
        },
        "slots": [
            {
                "id": s.id,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "available": s.available
            }
            for s in slots
        ],
        "bookings": [
            {
                "id": booking.id,
                "trainee_name": trainee.name,
                "topic": topic.name,
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "status": booking.status
            }
            for booking, trainee, topic, slot in booking_rows
        ]
    }
