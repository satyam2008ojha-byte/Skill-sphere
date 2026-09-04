from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import SessionLocal, engine, Base
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
from .schemas import (
    LoginRequest,
    RegisterRequest,
    TestSubmit,
    BookingRequest,
    SlotCreate,
    ProfileUpdate,
    PasswordUpdate,
)

# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="SkillSphere API",
    version="2.0"
)

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

Base.metadata.create_all(bind=engine)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# BASIC
# ============================================================

@app.get("/")
def home():
    return {
        "message": "SkillSphere API is running",
        "version": "2.0"
    }


# ============================================================
# AUTH - REGISTER
# ============================================================

@app.post("/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    role = data.role.lower().strip()

    if role not in ["trainee", "trainer", "admin"]:
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

    if len(data.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )

    user = User(
        name=data.name.strip(),
        email=data.email.lower().strip(),
        password=data.password,
        role=role,
        bio=data.bio or "",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "bio": user.bio,
        }
    }


# ============================================================
# AUTH - LOGIN
# ============================================================

@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == data.email.lower().strip()
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.password != data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "bio": user.bio or "",
        }
    }


# ============================================================
# USER PROFILE
# ============================================================

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
        "bio": user.bio or "",
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
        "message": "Profile updated",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "bio": user.bio or "",
        }
    }


# ============================================================
# PASSWORD CHANGE
# ============================================================

@app.put("/users/{user_id}/password")
def change_password(
    user_id: int,
    data: PasswordUpdate,
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

    if user.password != data.current_password:
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="New password must contain at least 6 characters"
        )

    user.password = data.new_password

    db.commit()

    return {
        "message": "Password changed successfully"
    }


# ============================================================
# COURSES
# ============================================================

@app.get("/courses")
def get_courses(
    db: Session = Depends(get_db)
):

    courses = db.query(Course).all()

    result = []

    for course in courses:

        topic_count = db.query(Topic).filter(
            Topic.course_id == course.id
        ).count()

        question_count = db.query(Question).filter(
            Question.course_id == course.id
        ).count()

        result.append({
            "id": course.id,
            "title": course.title,
            "description": course.description or "",
            "topic_count": topic_count,
            "question_count": question_count,
        })

    return result


# ============================================================
# COURSE TOPICS
# ============================================================

@app.get("/courses/{course_id}/topics")
def get_course_topics(
    course_id: int,
    db: Session = Depends(get_db)
):

    topics = db.query(Topic).filter(
        Topic.course_id == course_id
    ).all()

    return [
        {
            "id": topic.id,
            "name": topic.name,
            "course_id": topic.course_id,
        }
        for topic in topics
    ]


# ============================================================
# COURSE QUESTIONS
# ============================================================

@app.get("/courses/{course_id}/questions")
def get_questions(
    course_id: int,
    db: Session = Depends(get_db)
):

    questions = db.query(Question).filter(
        Question.course_id == course_id
    ).all()

    return [
        {
            "id": q.id,
            "course_id": q.course_id,
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


# ============================================================
# TEST SUBMISSION
# ============================================================

@app.post("/tests/submit")
def submit_test(
    data: TestSubmit,
    db: Session = Depends(get_db)
):

    trainee = db.query(User).filter(
        User.id == data.trainee_id
    ).first()

    if not trainee:
        raise HTTPException(
            status_code=404,
            detail="Trainee not found"
        )

    questions = db.query(Question).filter(
        Question.course_id == data.course_id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No questions found"
        )

    # Create attempt first
    attempt = TestAttempt(
        trainee_id=data.trainee_id,
        course_id=data.course_id,
        test_type=data.test_type,
        score=0,
        status="completed",
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    question_map = {
        q.id: q
        for q in questions
    }

    topic_stats = {}

    correct_count = 0

    for submitted in data.answers:

        question = question_map.get(
            submitted.question_id
        )

        if not question:
            continue

        answer = submitted.answer.strip()

        correct = (
            answer.lower()
            == question.correct_answer.strip().lower()
        )

        if correct:
            correct_count += 1

        answer_record = TestAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            answer=answer,
            is_correct=correct,
        )

        db.add(answer_record)

        if question.topic_id not in topic_stats:
            topic_stats[question.topic_id] = {
                "total": 0,
                "correct": 0,
            }

        topic_stats[question.topic_id]["total"] += 1

        if correct:
            topic_stats[question.topic_id]["correct"] += 1

    total_answered = len(data.answers)

    if total_answered > 0:
        score = (
            correct_count / total_answered
        ) * 100
    else:
        score = 0

    attempt.score = score

    # Topic results
    for topic_id, stats in topic_stats.items():

        percentage = (
            stats["correct"]
            / stats["total"]
        ) * 100

        result = TopicResult(
            attempt_id=attempt.id,
            topic_id=topic_id,
            percentage=percentage,
        )

        db.add(result)

    db.commit()

    # Find weak topics
    weak_topics = []

    for topic_id, stats in topic_stats.items():

        percentage = (
            stats["correct"]
            / stats["total"]
        ) * 100

        if percentage < 60:

            topic = db.query(Topic).filter(
                Topic.id == topic_id
            ).first()

            if topic:
                weak_topics.append({
                    "id": topic.id,
                    "name": topic.name,
                    "percentage": round(
                        percentage,
                        1
                    ),
                })

    weak_topics.sort(
        key=lambda x: x["percentage"]
    )

    return {
        "attempt_id": attempt.id,
        "score": round(score, 1),
        "correct": correct_count,
        "total": total_answered,
        "test_type": data.test_type,
        "weak_topics": weak_topics,
    }


# ============================================================
# TEST RESULT
# ============================================================

@app.get("/attempts/{attempt_id}/result")
def get_attempt_result(
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

    answers = db.query(TestAnswer).filter(
        TestAnswer.attempt_id == attempt_id
    ).all()

    result_items = []

    for answer in answers:

        question = db.query(Question).filter(
            Question.id == answer.question_id
        ).first()

        if not question:
            continue

        topic = db.query(Topic).filter(
            Topic.id == question.topic_id
        ).first()

        options = [
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
        ]

        result_items.append({
            "question_id": question.id,
            "question": question.text,
            "options": options,
            "topic_id": question.topic_id,
            "topic": topic.name if topic else "General",
            "your_answer": answer.answer,
            "correct_answer": question.correct_answer,
            "is_correct": answer.is_correct,
        })

    topic_results = db.query(TopicResult).filter(
        TopicResult.attempt_id == attempt_id
    ).all()

    topic_analysis = []

    for result in topic_results:

        topic = db.query(Topic).filter(
            Topic.id == result.topic_id
        ).first()

        topic_analysis.append({
            "topic_id": result.topic_id,
            "topic": topic.name if topic else "General",
            "percentage": round(
                result.percentage,
                1
            ),
            "weak": result.percentage < 60,
        })

    topic_analysis.sort(
        key=lambda x: x["percentage"]
    )

    weak_topics = [
        x for x in topic_analysis
        if x["weak"]
    ]

    return {
        "attempt_id": attempt.id,
        "course_id": attempt.course_id,
        "test_type": attempt.test_type,
        "score": round(attempt.score, 1),
        "questions": result_items,
        "topic_analysis": topic_analysis,
        "weak_topics": weak_topics,
    }


# ============================================================
# TRAINERS
# ============================================================

@app.get("/trainers")
def get_trainers(
    db: Session = Depends(get_db)
):

    trainers = db.query(User).filter(
        User.role == "trainer"
    ).all()

    result = []

    for trainer in trainers:

        expertise_rows = db.query(TrainerTopic).filter(
            TrainerTopic.trainer_id == trainer.id
        ).all()

        expertise = []

        for row in expertise_rows:

            topic = db.query(Topic).filter(
                Topic.id == row.topic_id
            ).first()

            if topic:
                expertise.append({
                    "id": topic.id,
                    "name": topic.name,
                })

        slot_count = db.query(TrainerSlot).filter(
            TrainerSlot.trainer_id == trainer.id,
            TrainerSlot.available == True,
        ).count()

        result.append({
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or "",
            "expertise": expertise,
            "available_slots": slot_count,
        })

    return result


# ============================================================
# TRAINER DETAILS
# ============================================================

@app.get("/trainers/{trainer_id}")
def get_trainer(
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

    expertise_rows = db.query(TrainerTopic).filter(
        TrainerTopic.trainer_id == trainer.id
    ).all()

    expertise = []

    for row in expertise_rows:

        topic = db.query(Topic).filter(
            Topic.id == row.topic_id
        ).first()

        if topic:
            expertise.append({
                "id": topic.id,
                "name": topic.name,
            })

    return {
        "id": trainer.id,
        "name": trainer.name,
        "email": trainer.email,
        "bio": trainer.bio or "",
        "expertise": expertise,
    }


# ============================================================
# AUTOMATIC TRAINER RECOMMENDATION
# ============================================================

@app.get("/trainers/recommended/{topic_id}")
def recommended_trainers(
    topic_id: int,
    db: Session = Depends(get_db)
):

    trainer_topic_rows = db.query(
        TrainerTopic
    ).filter(
        TrainerTopic.topic_id == topic_id
    ).all()

    result = []

    for row in trainer_topic_rows:

        trainer = db.query(User).filter(
            User.id == row.trainer_id,
            User.role == "trainer"
        ).first()

        if not trainer:
            continue

        available_slots = db.query(
            TrainerSlot
        ).filter(
            TrainerSlot.trainer_id == trainer.id,
            TrainerSlot.available == True,
        ).count()

        result.append({
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or "",
            "available_slots": available_slots,
            "recommended": available_slots > 0,
        })

    # Trainer having available slots first
    result.sort(
        key=lambda x: (
            not x["recommended"],
            -x["available_slots"]
        )
    )

    return result


# ============================================================
# TRAINER TOPICS
# ============================================================

@app.get("/trainers/{trainer_id}/topics")
def get_trainer_topics(
    trainer_id: int,
    db: Session = Depends(get_db)
):

    rows = db.query(TrainerTopic).filter(
        TrainerTopic.trainer_id == trainer_id
    ).all()

    result = []

    for row in rows:

        topic = db.query(Topic).filter(
            Topic.id == row.topic_id
        ).first()

        if topic:
            result.append({
                "id": topic.id,
                "name": topic.name,
                "course_id": topic.course_id,
            })

    return result


# ============================================================
# TRAINER SLOTS - GET
# ============================================================

@app.get("/trainers/{trainer_id}/slots")
def get_trainer_slots(
    trainer_id: int,
    db: Session = Depends(get_db)
):

    slots = db.query(TrainerSlot).filter(
        TrainerSlot.trainer_id == trainer_id
    ).order_by(
        TrainerSlot.id.desc()
    ).all()

    result = []

    for slot in slots:

        result.append({
            "id": slot.id,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "available": slot.available,
        })

    return result


# ============================================================
# TRAINER SLOTS - CREATE
# ============================================================

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

    if not data.start_time or not data.end_time:
        raise HTTPException(
            status_code=400,
            detail="Start and end time are required"
        )

    slot = TrainerSlot(
        trainer_id=trainer_id,
        start_time=data.start_time,
        end_time=data.end_time,
        available=True,
    )

    db.add(slot)
    db.commit()
    db.refresh(slot)

    return {
        "message": "Slot created",
        "slot": {
            "id": slot.id,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "available": slot.available,
        }
    }


# ============================================================
# TRAINER SLOTS - DELETE
# ============================================================

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

    booking = db.query(Booking).filter(
        Booking.slot_id == slot_id,
        Booking.status == "booked"
    ).first()

    if booking:
        raise HTTPException(
            status_code=400,
            detail="Booked slot cannot be deleted"
        )

    db.delete(slot)
    db.commit()

    return {
        "message": "Slot deleted"
    }


# ============================================================
# BOOKING
# ============================================================

@app.post("/bookings")
def create_booking(
    data: BookingRequest,
    db: Session = Depends(get_db)
):

    trainee = db.query(User).filter(
        User.id == data.trainee_id,
        User.role == "trainee"
    ).first()

    if not trainee:
        raise HTTPException(
            status_code=404,
            detail="Trainee not found"
        )

    trainer = db.query(User).filter(
        User.id == data.trainer_id,
        User.role == "trainer"
    ).first()

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    slot = db.query(TrainerSlot).filter(
        TrainerSlot.id == data.slot_id,
        TrainerSlot.trainer_id == data.trainer_id,
        TrainerSlot.available == True,
    ).first()

    if not slot:
        raise HTTPException(
            status_code=400,
            detail="Slot is no longer available"
        )

    expertise = db.query(TrainerTopic).filter(
        TrainerTopic.trainer_id == data.trainer_id,
        TrainerTopic.topic_id == data.topic_id
    ).first()

    if not expertise:
        raise HTTPException(
            status_code=400,
            detail="Trainer does not teach this topic"
        )

    booking = Booking(
        trainee_id=data.trainee_id,
        trainer_id=data.trainer_id,
        slot_id=data.slot_id,
        topic_id=data.topic_id,
        status="booked",
    )

    db.add(booking)

    # Make slot unavailable
    slot.available = False

    db.commit()
    db.refresh(booking)

    lecture = Lecture(
        booking_id=booking.id,
        status="scheduled",
    )

    db.add(lecture)
    db.commit()
    db.refresh(lecture)

    return {
        "message": "Lecture booked successfully",
        "booking": {
            "id": booking.id,
            "trainer_id": booking.trainer_id,
            "trainee_id": booking.trainee_id,
            "topic_id": booking.topic_id,
            "slot_id": booking.slot_id,
            "status": booking.status,
        },
        "lecture": {
            "id": lecture.id,
            "status": lecture.status,
        }
    }


# ============================================================
# TRAINEE BOOKINGS
# ============================================================

@app.get("/bookings/trainee/{trainee_id}")
def trainee_bookings(
    trainee_id: int,
    db: Session = Depends(get_db)
):

    bookings = db.query(Booking).filter(
        Booking.trainee_id == trainee_id
    ).order_by(
        Booking.id.desc()
    ).all()

    result = []

    for booking in bookings:

        trainer = db.query(User).filter(
            User.id == booking.trainer_id
        ).first()

        topic = db.query(Topic).filter(
            Topic.id == booking.topic_id
        ).first()

        slot = db.query(TrainerSlot).filter(
            TrainerSlot.id == booking.slot_id
        ).first()

        lecture = db.query(Lecture).filter(
            Lecture.booking_id == booking.id
        ).first()

        result.append({
            "booking_id": booking.id,
            "status": booking.status,
            "trainer": trainer.name if trainer else "Unknown",
            "trainer_id": booking.trainer_id,
            "topic": topic.name if topic else "Unknown",
            "topic_id": booking.topic_id,
            "start_time": slot.start_time if slot else "",
            "end_time": slot.end_time if slot else "",
            "lecture_id": lecture.id if lecture else None,
            "lecture_status": (
                lecture.status
                if lecture
                else None
            ),
        })

    return result


# ============================================================
# LECTURE COMPLETE
# ============================================================

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

    booking = db.query(Booking).filter(
        Booking.id == lecture.booking_id
    ).first()

    if booking:
        booking.status = "completed"

    db.commit()

    return {
        "message": "Lecture completed",
        "lecture_id": lecture.id,
        "status": lecture.status,
    }


# ============================================================
# TRAINEE PROGRESS
# ============================================================

@app.get("/progress/{trainee_id}")
def trainee_progress(
    trainee_id: int,
    db: Session = Depends(get_db)
):

    attempts = db.query(TestAttempt).filter(
        TestAttempt.trainee_id == trainee_id
    ).order_by(
        TestAttempt.id.desc()
    ).all()

    result = []

    for attempt in attempts:

        course = db.query(Course).filter(
            Course.id == attempt.course_id
        ).first()

        topic_results = db.query(
            TopicResult
        ).filter(
            TopicResult.attempt_id == attempt.id
        ).all()

        topics = []

        for tr in topic_results:

            topic = db.query(Topic).filter(
                Topic.id == tr.topic_id
            ).first()

            topics.append({
                "topic": topic.name if topic else "Unknown",
                "percentage": round(
                    tr.percentage,
                    1
                ),
            })

        result.append({
            "attempt_id": attempt.id,
            "course_id": attempt.course_id,
            "course": (
                course.title
                if course
                else "Unknown"
            ),
            "test_type": attempt.test_type,
            "score": round(
                attempt.score,
                1
            ),
            "topics": topics,
        })

    return result


# ============================================================
# TRAINER DASHBOARD
# ============================================================

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

    # --------------------------------------------------------
    # Stats
    # --------------------------------------------------------

    total_slots = db.query(
        TrainerSlot
    ).filter(
        TrainerSlot.trainer_id == trainer_id
    ).count()

    available_slots = db.query(
        TrainerSlot
    ).filter(
        TrainerSlot.trainer_id == trainer_id,
        TrainerSlot.available == True
    ).count()

    total_bookings = db.query(
        Booking
    ).filter(
        Booking.trainer_id == trainer_id
    ).count()

    completed_lectures = (
        db.query(Lecture)
        .join(
            Booking,
            Lecture.booking_id == Booking.id
        )
        .filter(
            Booking.trainer_id == trainer_id,
            Lecture.status == "completed"
        )
        .count()
    )

    # --------------------------------------------------------
    # Expertise
    # --------------------------------------------------------

    expertise_rows = db.query(
        TrainerTopic
    ).filter(
        TrainerTopic.trainer_id == trainer_id
    ).all()

    expertise = []

    for row in expertise_rows:

        topic = db.query(Topic).filter(
            Topic.id == row.topic_id
        ).first()

        if topic:
            expertise.append({
                "id": topic.id,
                "name": topic.name,
            })

    # --------------------------------------------------------
    # Students
    # --------------------------------------------------------

    bookings = db.query(Booking).filter(
        Booking.trainer_id == trainer_id
    ).order_by(
        Booking.id.desc()
    ).all()

    student_ids = list(
        set(
            booking.trainee_id
            for booking in bookings
        )
    )

    students = []

    for student_id in student_ids:

        student = db.query(User).filter(
            User.id == student_id
        ).first()

        if not student:
            continue

        attempts = db.query(
            TestAttempt
        ).filter(
            TestAttempt.trainee_id == student_id
        ).order_by(
            TestAttempt.id.desc()
        ).all()

        latest_score = (
            attempts[0].score
            if attempts
            else None
        )

        completed = db.query(
            Lecture
        ).join(
            Booking,
            Lecture.booking_id == Booking.id
        ).filter(
            Booking.trainer_id == trainer_id,
            Booking.trainee_id == student_id,
            Lecture.status == "completed"
        ).count()

        students.append({
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "bio": student.bio or "",
            "latest_score": (
                round(latest_score, 1)
                if latest_score is not None
                else None
            ),
            "total_tests": len(attempts),
            "completed_lectures": completed,
        })

    # --------------------------------------------------------
    # Upcoming / all bookings
    # --------------------------------------------------------

    booking_list = []

    for booking in bookings:

        trainee = db.query(User).filter(
            User.id == booking.trainee_id
        ).first()

        topic = db.query(Topic).filter(
            Topic.id == booking.topic_id
        ).first()

        slot = db.query(TrainerSlot).filter(
            TrainerSlot.id == booking.slot_id
        ).first()

        lecture = db.query(Lecture).filter(
            Lecture.booking_id == booking.id
        ).first()

        booking_list.append({
            "booking_id": booking.id,
            "trainee_id": booking.trainee_id,
            "trainee_name": (
                trainee.name
                if trainee
                else "Unknown"
            ),
            "trainee_email": (
                trainee.email
                if trainee
                else ""
            ),
            "topic_id": booking.topic_id,
            "topic": (
                topic.name
                if topic
                else "Unknown"
            ),
            "start_time": (
                slot.start_time
                if slot
                else ""
            ),
            "end_time": (
                slot.end_time
                if slot
                else ""
            ),
            "booking_status": booking.status,
            "lecture_status": (
                lecture.status
                if lecture
                else ""
            ),
        })

    # --------------------------------------------------------
    # Return dashboard
    # --------------------------------------------------------

    return {
        "profile": {
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or "",
        },

        "expertise": expertise,

        "stats": {
            "total_slots": total_slots,
            "available_slots": available_slots,
            "total_bookings": total_bookings,
            "completed_lectures": completed_lectures,
            "total_students": len(students),
        },

        "students": students,

        "bookings": booking_list,
    }


# ============================================================
# TRAINER - STUDENT PROGRESS
# ============================================================

@app.get("/trainers/{trainer_id}/students/{student_id}/progress")
def trainer_student_progress(
    trainer_id: int,
    student_id: int,
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

    student = db.query(User).filter(
        User.id == student_id,
        User.role == "trainee"
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # Check whether this student has booking with trainer
    booking_exists = db.query(Booking).filter(
        Booking.trainer_id == trainer_id,
        Booking.trainee_id == student_id
    ).first()

    if not booking_exists:
        raise HTTPException(
            status_code=403,
            detail="Student is not assigned to this trainer"
        )

    attempts = db.query(
        TestAttempt
    ).filter(
        TestAttempt.trainee_id == student_id
    ).order_by(
        TestAttempt.id.asc()
    ).all()

    attempt_list = []

    for attempt in attempts:

        course = db.query(Course).filter(
            Course.id == attempt.course_id
        ).first()

        topic_results = db.query(
            TopicResult
        ).filter(
            TopicResult.attempt_id == attempt.id
        ).all()

        topics = []

        for tr in topic_results:

            topic = db.query(Topic).filter(
                Topic.id == tr.topic_id
            ).first()

            topics.append({
                "topic_id": tr.topic_id,
                "topic": (
                    topic.name
                    if topic
                    else "Unknown"
                ),
                "percentage": round(
                    tr.percentage,
                    1
                ),
            })

        attempt_list.append({
            "attempt_id": attempt.id,
            "course": (
                course.title
                if course
                else "Unknown"
            ),
            "test_type": attempt.test_type,
            "score": round(
                attempt.score,
                1
            ),
            "topics": topics,
        })

    bookings = db.query(Booking).filter(
        Booking.trainer_id == trainer_id,
        Booking.trainee_id == student_id
    ).all()

    lecture_history = []

    for booking in bookings:

        topic = db.query(Topic).filter(
            Topic.id == booking.topic_id
        ).first()

        slot = db.query(TrainerSlot).filter(
            TrainerSlot.id == booking.slot_id
        ).first()

        lecture = db.query(Lecture).filter(
            Lecture.booking_id == booking.id
        ).first()

        lecture_history.append({
            "booking_id": booking.id,
            "topic": (
                topic.name
                if topic
                else "Unknown"
            ),
            "start_time": (
                slot.start_time
                if slot
                else ""
            ),
            "end_time": (
                slot.end_time
                if slot
                else ""
            ),
            "status": (
                lecture.status
                if lecture
                else booking.status
            ),
        })

    return {
        "student": {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "bio": student.bio or "",
        },
        "tests": attempt_list,
        "lectures": lecture_history,
    }


# ============================================================
# ADMIN BASIC DASHBOARD
# ============================================================

@app.get("/admin/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db)
):

    trainees = db.query(User).filter(
        User.role == "trainee"
    ).count()

    trainers = db.query(User).filter(
        User.role == "trainer"
    ).count()

    admins = db.query(User).filter(
        User.role == "admin"
    ).count()

    courses = db.query(Course).count()

    questions = db.query(Question).count()

    bookings = db.query(Booking).count()

    return {
        "users": {
            "trainees": trainees,
            "trainers": trainers,
            "admins": admins,
        },
        "courses": courses,
        "questions": questions,
        "bookings": bookings,
    }
