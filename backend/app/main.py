from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import engine, Base, get_db
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

from .seed import seed_database


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="SkillSphere API",
    version="2.0"
)


# =========================================================
# CORS
# =========================================================

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


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# SEED DATABASE
# =========================================================

# This automatically creates:
# Python
# Cyber Security
# Database
# 15 MCQs for each course
# Demo Trainers
# Trainer Topics
# Trainer Slots

try:
    seed_database()
    print("SkillSphere seed completed.")
except Exception as e:
    print("Seed error:", e)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "message": "SkillSphere API is running",
        "status": "ok",
        "version": "2.0"
    }


# =========================================================
# AUTH - REGISTER
# =========================================================

@app.post("/auth/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    allowed_roles = [
        "trainee",
        "trainer",
        "admin"
    ]

    if data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    user = User(
        name=data.name,
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
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "bio": user.bio or ""
        }
    }


# =========================================================
# AUTH - LOGIN
# =========================================================

@app.post("/auth/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

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
            "bio": user.bio or ""
        }
    }


# =========================================================
# USER
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


# =========================================================
# UPDATE PROFILE
# =========================================================

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

    user.name = data.name
    user.bio = data.bio or ""

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "bio": user.bio or ""
        }
    }


# =========================================================
# CHANGE PASSWORD
# =========================================================

@app.put("/users/{user_id}/password")
def update_password(
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

    if len(data.new_password) < 4:
        raise HTTPException(
            status_code=400,
            detail="New password must contain at least 4 characters"
        )

    user.password = data.new_password

    db.commit()

    return {
        "message": "Password updated successfully"
    }


# =========================================================
# COURSES
# =========================================================

@app.get("/courses")
def get_courses(
    db: Session = Depends(get_db)
):

    courses = (
        db.query(Course)
        .order_by(Course.id)
        .all()
    )

    result = []

    for course in courses:

        topic_count = (
            db.query(func.count(Topic.id))
            .filter(
                Topic.course_id == course.id
            )
            .scalar()
        )

        question_count = (
            db.query(func.count(Question.id))
            .filter(
                Question.course_id == course.id
            )
            .scalar()
        )

        result.append({
            "id": course.id,
            "title": course.title,
            "description": course.description or "",
            "topic_count": topic_count or 0,
            "question_count": question_count or 0
        })

    return result


# =========================================================
# COURSE TOPICS
# =========================================================

@app.get("/courses/{course_id}/topics")
def get_course_topics(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    topics = (
        db.query(Topic)
        .filter(
            Topic.course_id == course_id
        )
        .order_by(Topic.id)
        .all()
    )

    return [
        {
            "id": topic.id,
            "name": topic.name,
            "course_id": topic.course_id
        }
        for topic in topics
    ]


# =========================================================
# COURSE QUESTIONS
# =========================================================

@app.get("/courses/{course_id}/questions")
def get_course_questions(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    questions = (
        db.query(Question)
        .filter(
            Question.course_id == course_id
        )
        .order_by(Question.id)
        .all()
    )

    return [
        {
            "id": question.id,
            "course_id": question.course_id,
            "topic_id": question.topic_id,
            "text": question.text,
            "options": [
                question.option_a,
                question.option_b,
                question.option_c,
                question.option_d
            ]
        }
        for question in questions
    ]


# =========================================================
# SUBMIT TEST
# =========================================================

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

    course = db.query(Course).filter(
        Course.id == data.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if not data.answers:
        raise HTTPException(
            status_code=400,
            detail="No answers submitted"
        )

    # -----------------------------------------------------
    # Get course questions
    # -----------------------------------------------------

    course_questions = (
        db.query(Question)
        .filter(
            Question.course_id == data.course_id
        )
        .order_by(Question.id)
        .all()
    )

    question_map = {
        q.id: q
        for q in course_questions
    }

    # -----------------------------------------------------
    # Create attempt
    # -----------------------------------------------------

    attempt = TestAttempt(
        trainee_id=data.trainee_id,
        course_id=data.course_id,
        test_type=data.test_type,
        score=0,
        status="completed"
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # -----------------------------------------------------
    # Calculate answers
    # -----------------------------------------------------

    correct_count = 0
    total = len(data.answers)

    topic_stats = {}

    for answer_data in data.answers:

        question = question_map.get(
            answer_data.question_id
        )

        if not question:
            continue

        is_correct = (
            answer_data.answer.upper()
            == question.correct_answer.upper()
        )

        if is_correct:
            correct_count += 1

        answer = TestAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            answer=answer_data.answer,
            is_correct=is_correct
        )

        db.add(answer)

        # ---------------------------------------------
        # Topic statistics
        # ---------------------------------------------

        topic_id = question.topic_id

        if topic_id not in topic_stats:
            topic_stats[topic_id] = {
                "total": 0,
                "correct": 0
            }

        topic_stats[topic_id]["total"] += 1

        if is_correct:
            topic_stats[topic_id]["correct"] += 1

    # -----------------------------------------------------
    # Score
    # -----------------------------------------------------

    score = (
        correct_count / total * 100
        if total > 0
        else 0
    )

    attempt.score = score

    db.commit()

    # -----------------------------------------------------
    # Topic results
    # -----------------------------------------------------

    weak_topics = []

    for topic_id, stats in topic_stats.items():

        percentage = (
            stats["correct"]
            / stats["total"]
            * 100
            if stats["total"] > 0
            else 0
        )

        topic_result = TopicResult(
            attempt_id=attempt.id,
            topic_id=topic_id,
            percentage=percentage
        )

        db.add(topic_result)

        topic = db.query(Topic).filter(
            Topic.id == topic_id
        ).first()

        if percentage < 60:

            weak_topics.append({
                "topic_id": topic_id,
                "topic": (
                    topic.name
                    if topic
                    else "Unknown"
                ),
                "percentage": percentage
            })

    db.commit()

    return {
        "attempt_id": attempt.id,
        "score": round(score, 2),
        "correct": correct_count,
        "total": total,
        "test_type": data.test_type,
        "weak_topics": weak_topics
    }


# =========================================================
# TEST RESULT
# =========================================================

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

    answers = (
        db.query(TestAnswer)
        .filter(
            TestAnswer.attempt_id == attempt_id
        )
        .all()
    )

    questions_result = []

    for answer in answers:

        question = db.query(Question).filter(
            Question.id == answer.question_id
        ).first()

        if not question:
            continue

        topic = db.query(Topic).filter(
            Topic.id == question.topic_id
        ).first()

        questions_result.append({
            "question_id": question.id,
            "question": question.text,
            "options": [
                question.option_a,
                question.option_b,
                question.option_c,
                question.option_d
            ],
            "topic_id": question.topic_id,
            "topic": (
                topic.name
                if topic
                else "Unknown"
            ),
            "your_answer": answer.answer,
            "correct_answer": question.correct_answer,
            "is_correct": answer.is_correct
        })

    # -----------------------------------------------------
    # Topic analysis
    # -----------------------------------------------------

    topic_results = (
        db.query(TopicResult)
        .filter(
            TopicResult.attempt_id == attempt_id
        )
        .all()
    )

    topic_analysis = []
    weak_topics = []

    for result in topic_results:

        topic = db.query(Topic).filter(
            Topic.id == result.topic_id
        ).first()

        item = {
            "topic_id": result.topic_id,
            "topic": (
                topic.name
                if topic
                else "Unknown"
            ),
            "percentage": round(
                result.percentage,
                2
            )
        }

        topic_analysis.append(item)

        if result.percentage < 60:

            weak_topics.append(item)

    return {
        "attempt_id": attempt.id,
        "course_id": attempt.course_id,
        "test_type": attempt.test_type,
        "score": round(attempt.score, 2),
        "questions": questions_result,
        "topic_analysis": topic_analysis,
        "weak_topics": weak_topics
    }


# =========================================================
# ALL TRAINERS
# =========================================================

@app.get("/trainers")
def get_trainers(
    db: Session = Depends(get_db)
):

    trainers = (
        db.query(User)
        .filter(
            User.role == "trainer"
        )
        .order_by(User.id)
        .all()
    )

    result = []

    for trainer in trainers:

        available_slots = (
            db.query(func.count(TrainerSlot.id))
            .filter(
                TrainerSlot.trainer_id == trainer.id,
                TrainerSlot.available == True
            )
            .scalar()
        )

        result.append({
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or "",
            "available_slots": available_slots or 0
        })

    return result


# =========================================================
# SINGLE TRAINER
# =========================================================

@app.get("/trainers/{trainer_id}")
def get_trainer(
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

    available_slots = (
        db.query(func.count(TrainerSlot.id))
        .filter(
            TrainerSlot.trainer_id == trainer_id,
            TrainerSlot.available == True
        )
        .scalar()
    )

    return {
        "id": trainer.id,
        "name": trainer.name,
        "email": trainer.email,
        "bio": trainer.bio or "",
        "available_slots": available_slots or 0
    }


# =========================================================
# RECOMMENDED TRAINERS
# =========================================================

@app.get("/trainers/recommended/{topic_id}")
def recommended_trainers(
    topic_id: int,
    db: Session = Depends(get_db)
):

    topic = db.query(Topic).filter(
        Topic.id == topic_id
    ).first()

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    mappings = (
        db.query(TrainerTopic)
        .filter(
            TrainerTopic.topic_id == topic_id
        )
        .all()
    )

    result = []

    for mapping in mappings:

        trainer = db.query(User).filter(
            User.id == mapping.trainer_id,
            User.role == "trainer"
        ).first()

        if not trainer:
            continue

        slots = (
            db.query(TrainerSlot)
            .filter(
                TrainerSlot.trainer_id == trainer.id,
                TrainerSlot.available == True
            )
            .count()
        )

        result.append({
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or "",
            "available_slots": slots,
            "recommended": True
        })

    result.sort(
        key=lambda x: x["available_slots"],
        reverse=True
    )

    return result


# =========================================================
# TRAINER TOPICS
# =========================================================

@app.get("/trainers/{trainer_id}/topics")
def get_trainer_topics(
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

    mappings = (
        db.query(TrainerTopic)
        .filter(
            TrainerTopic.trainer_id == trainer_id
        )
        .all()
    )

    result = []

    for mapping in mappings:

        topic = db.query(Topic).filter(
            Topic.id == mapping.topic_id
        ).first()

        if topic:

            result.append({
                "id": topic.id,
                "name": topic.name,
                "course_id": topic.course_id
            })

    return result


# =========================================================
# TRAINER SLOTS
# =========================================================

@app.get("/trainers/{trainer_id}/slots")
def get_trainer_slots(
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
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "available": slot.available
        }
        for slot in slots
    ]


# =========================================================
# CREATE TRAINER SLOT
# =========================================================

@app.post("/trainers/{trainer_id}/slots")
def create_trainer_slot(
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
        "available": slot.available
    }


# =========================================================
# DELETE TRAINER SLOT
# =========================================================

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

    db.delete(slot)
    db.commit()

    return {
        "message": "Slot deleted successfully"
    }


# =========================================================
# CREATE BOOKING
# =========================================================

@app.post("/bookings")
def create_booking(
    data: BookingRequest,
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

    trainer = db.query(User).filter(
        User.id == data.trainer_id,
        User.role == "trainer"
    ).first()

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    topic = db.query(Topic).filter(
        Topic.id == data.topic_id
    ).first()

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    slot = db.query(TrainerSlot).filter(
        TrainerSlot.id == data.slot_id,
        TrainerSlot.trainer_id == data.trainer_id
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    if not slot.available:
        raise HTTPException(
            status_code=400,
            detail="This slot is already booked"
        )

    # -----------------------------------------------------
    # Check trainer teaches this topic
    # -----------------------------------------------------

    trainer_topic = (
        db.query(TrainerTopic)
        .filter(
            TrainerTopic.trainer_id == data.trainer_id,
            TrainerTopic.topic_id == data.topic_id
        )
        .first()
    )

    if not trainer_topic:
        raise HTTPException(
            status_code=400,
            detail="Trainer does not teach this topic"
        )

    # -----------------------------------------------------
    # Create booking
    # -----------------------------------------------------

    booking = Booking(
        trainee_id=data.trainee_id,
        trainer_id=data.trainer_id,
        slot_id=data.slot_id,
        topic_id=data.topic_id,
        status="booked"
    )

    db.add(booking)

    # Slot becomes unavailable
    slot.available = False

    db.commit()
    db.refresh(booking)

    # -----------------------------------------------------
    # Create lecture
    # -----------------------------------------------------

    lecture = Lecture(
        booking_id=booking.id,
        status="scheduled"
    )

    db.add(lecture)
    db.commit()
    db.refresh(lecture)

    return {
        "message": "Booking successful",
        "booking_id": booking.id,
        "lecture_id": lecture.id,
        "status": booking.status
    }


# =========================================================
# TRAINEE BOOKINGS
# =========================================================

@app.get("/bookings/trainee/{trainee_id}")
def get_trainee_bookings(
    trainee_id: int,
    db: Session = Depends(get_db)
):

    bookings = (
        db.query(Booking)
        .filter(
            Booking.trainee_id == trainee_id
        )
        .order_by(Booking.id.desc())
        .all()
    )

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
            "trainer": (
                trainer.name
                if trainer
                else "Unknown Trainer"
            ),
            "trainer_id": booking.trainer_id,
            "topic": (
                topic.name
                if topic
                else "Unknown Topic"
            ),
            "topic_id": booking.topic_id,
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
            "lecture_id": (
                lecture.id
                if lecture
                else None
            ),
            "lecture_status": (
                lecture.status
                if lecture
                else None
            )
        })

    return result


# =========================================================
# COMPLETE LECTURE
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
        "message": "Lecture completed",
        "lecture_id": lecture.id,
        "status": lecture.status
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
        .order_by(TestAttempt.id.desc())
        .all()
    )

    result = []

    for attempt in attempts:

        course = db.query(Course).filter(
            Course.id == attempt.course_id
        ).first()

        topic_results = (
            db.query(TopicResult)
            .filter(
                TopicResult.attempt_id == attempt.id
            )
            .all()
        )

        topics = []

        for topic_result in topic_results:

            topic = db.query(Topic).filter(
                Topic.id == topic_result.topic_id
            ).first()

            topics.append({
                "topic": (
                    topic.name
                    if topic
                    else "Unknown"
                ),
                "percentage": round(
                    topic_result.percentage,
                    2
                )
            })

        result.append({
            "attempt_id": attempt.id,
            "course_id": attempt.course_id,
            "course": (
                course.title
                if course
                else "Unknown Course"
            ),
            "test_type": attempt.test_type,
            "score": round(
                attempt.score,
                2
            ),
            "topics": topics
        })

    return result


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

    # -----------------------------------------------------
    # Expertise
    # -----------------------------------------------------

    mappings = (
        db.query(TrainerTopic)
        .filter(
            TrainerTopic.trainer_id == trainer_id
        )
        .all()
    )

    expertise = []

    for mapping in mappings:

        topic = db.query(Topic).filter(
            Topic.id == mapping.topic_id
        ).first()

        if topic:

            expertise.append({
                "id": topic.id,
                "name": topic.name,
                "course_id": topic.course_id
            })

    # -----------------------------------------------------
    # Bookings
    # -----------------------------------------------------

    bookings = (
        db.query(Booking)
        .filter(
            Booking.trainer_id == trainer_id
        )
        .order_by(Booking.id.desc())
        .all()
    )

    booking_data = []

    student_ids = set()

    for booking in bookings:

        student = db.query(User).filter(
            User.id == booking.trainee_id
        ).first()

        topic = db.query(Topic).filter(
            Topic.id == booking.topic_id
        ).first()

        slot = db.query(TrainerSlot).filter(
            TrainerSlot.id == booking.slot_id
        ).first()

        student_ids.add(
            booking.trainee_id
        )

        booking_data.append({
            "booking_id": booking.id,
            "trainee": (
                student.name
                if student
                else "Unknown Student"
            ),
            "student_id": booking.trainee_id,
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
            "status": booking.status
        })

    # -----------------------------------------------------
    # Students
    # -----------------------------------------------------

    students = []

    for student_id in student_ids:

        student = db.query(User).filter(
            User.id == student_id
        ).first()

        if student:

            students.append({
                "id": student.id,
                "name": student.name,
                "email": student.email
            })

    available_slots = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.trainer_id == trainer_id,
            TrainerSlot.available == True
        )
        .count()
    )

    return {
        "profile": {
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or ""
        },

        "expertise": expertise,

        "stats": {
            "students": len(students),
            "bookings": len(bookings),
            "available_slots": available_slots
        },

        "students": students,

        "bookings": booking_data
    }


# =========================================================
# TRAINER → STUDENT PROGRESS
# =========================================================

@app.get(
    "/trainers/{trainer_id}/students/{student_id}/progress"
)
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
        User.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    attempts = (
        db.query(TestAttempt)
        .filter(
            TestAttempt.trainee_id == student_id
        )
        .order_by(TestAttempt.id.desc())
        .all()
    )

    tests = []

    for attempt in attempts:

        course = db.query(Course).filter(
            Course.id == attempt.course_id
        ).first()

        topic_results = (
            db.query(TopicResult)
            .filter(
                TopicResult.attempt_id == attempt.id
            )
            .all()
        )

        topics = []

        for topic_result in topic_results:

            topic = db.query(Topic).filter(
                Topic.id == topic_result.topic_id
            ).first()

            topics.append({
                "topic": (
                    topic.name
                    if topic
                    else "Unknown"
                ),
                "percentage": round(
                    topic_result.percentage,
                    2
                )
            })

        tests.append({
            "attempt_id": attempt.id,
            "course": (
                course.title
                if course
                else "Unknown"
            ),
            "test_type": attempt.test_type,
            "score": round(
                attempt.score,
                2
            ),
            "topics": topics
        })

    bookings = (
        db.query(Booking)
        .filter(
            Booking.trainee_id == student_id,
            Booking.trainer_id == trainer_id
        )
        .all()
    )

    lectures = []

    for booking in bookings:

        lecture = db.query(Lecture).filter(
            Lecture.booking_id == booking.id
        ).first()

        if lecture:

            lectures.append({
                "lecture_id": lecture.id,
                "booking_id": booking.id,
                "status": lecture.status
            })

    return {
        "student": {
            "id": student.id,
            "name": student.name,
            "email": student.email
        },
        "tests": tests,
        "lectures": lectures
    }


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.get("/admin/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db)
):

    total_users = db.query(
        func.count(User.id)
    ).scalar()

    total_trainees = db.query(
        func.count(User.id)
    ).filter(
        User.role == "trainee"
    ).scalar()

    total_trainers = db.query(
        func.count(User.id)
    ).filter(
        User.role == "trainer"
    ).scalar()

    total_admins = db.query(
        func.count(User.id)
    ).filter(
        User.role == "admin"
    ).scalar()

    total_courses = db.query(
        func.count(Course.id)
    ).scalar()

    total_questions = db.query(
        func.count(Question.id)
    ).scalar()

    total_topics = db.query(
        func.count(Topic.id)
    ).scalar()

    total_bookings = db.query(
        func.count(Booking.id)
    ).scalar()

    total_attempts = db.query(
        func.count(TestAttempt.id)
    ).scalar()

    return {
        "users": total_users or 0,
        "trainees": total_trainees or 0,
        "trainers": total_trainers or 0,
        "admins": total_admins or 0,

        "courses": total_courses or 0,
        "topics": total_topics or 0,
        "questions": total_questions or 0,

        "bookings": total_bookings or 0,
        "attempts": total_attempts or 0
    }
