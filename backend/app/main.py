from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

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
from .schemas import (
    LoginRequest,
    RegisterRequest,
    TestSubmit,
    BookingRequest,
    TrainerProfileUpdate,
)
from .seed import seed


app = FastAPI(title="SkillSphere API")


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
# DATABASE
# ---------------------------------------------------------

Base.metadata.create_all(bind=engine)

try:
    seed()
except Exception as e:
    print("Seed warning:", e)


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "SkillSphere API is running"
    }


# ---------------------------------------------------------
# AUTH - LOGIN
# ---------------------------------------------------------

@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = (
        db.query(User)
        .filter(User.email == data.email.lower())
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
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "bio": user.bio or "",
    }


# ---------------------------------------------------------
# AUTH - REGISTER
# ---------------------------------------------------------

@app.post("/auth/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    new_user = User(
        name=data.name.strip(),
        email=email,
        password=data.password,
        role="trainee",
        bio="",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
    }


# ---------------------------------------------------------
# COURSES
# ---------------------------------------------------------

@app.get("/courses")
def get_courses(db: Session = Depends(get_db)):

    courses = db.query(Course).all()

    return [
        {
            "id": course.id,
            "title": course.title,
            "description": course.description or "",
        }
        for course in courses
    ]


# ---------------------------------------------------------
# COURSE QUESTIONS
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# SUBMIT TEST
# ---------------------------------------------------------

@app.post("/tests/submit")
def submit_test(
    data: TestSubmit,
    db: Session = Depends(get_db)
):

    questions = (
        db.query(Question)
        .filter(Question.course_id == data.course_id)
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No questions found"
        )

    answer_map = {
        item.question_id: item.answer
        for item in data.answers
    }

    attempt = TestAttempt(
        trainee_id=data.trainee_id,
        course_id=data.course_id,
        test_type=data.test_type,
        score=0,
        status="completed",
    )

    db.add(attempt)
    db.flush()

    total_correct = 0

    topic_total = {}
    topic_correct = {}

    for question in questions:

        user_answer = answer_map.get(question.id, "")

        user_answer = str(user_answer).strip().upper()
        correct_answer = str(
            question.correct_answer
        ).strip().upper()

        # Support A/B/C/D as well as actual option text
        if user_answer == str(question.option_a).strip().upper():
            user_answer = "A"
        elif user_answer == str(question.option_b).strip().upper():
            user_answer = "B"
        elif user_answer == str(question.option_c).strip().upper():
            user_answer = "C"
        elif user_answer == str(question.option_d).strip().upper():
            user_answer = "D"

        if correct_answer == str(question.option_a).strip().upper():
            correct_answer = "A"
        elif correct_answer == str(question.option_b).strip().upper():
            correct_answer = "B"
        elif correct_answer == str(question.option_c).strip().upper():
            correct_answer = "C"
        elif correct_answer == str(question.option_d).strip().upper():
            correct_answer = "D"

        is_correct = user_answer == correct_answer

        if is_correct:
            total_correct += 1

        topic_total[question.topic_id] = (
            topic_total.get(question.topic_id, 0) + 1
        )

        if is_correct:
            topic_correct[question.topic_id] = (
                topic_correct.get(question.topic_id, 0) + 1
            )

        answer = TestAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            answer=user_answer,
            is_correct=is_correct,
        )

        db.add(answer)

    overall_score = (
        total_correct / len(questions)
    ) * 100

    attempt.score = round(overall_score, 2)

    # Topic results
    for topic_id, total in topic_total.items():

        correct = topic_correct.get(topic_id, 0)

        percentage = (
            correct / total
        ) * 100

        result = TopicResult(
            attempt_id=attempt.id,
            topic_id=topic_id,
            percentage=round(percentage, 2),
        )

        db.add(result)

    db.commit()

    return {
        "attempt_id": attempt.id,
        "score": round(overall_score, 2),
        "total_questions": len(questions),
        "correct_answers": total_correct,
        "test_type": data.test_type,
    }


# ---------------------------------------------------------
# TEST RESULT
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

    results = (
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

    topics = []

    for result, topic in results:

        topics.append({
            "topic_id": topic.id,
            "topic": topic.name,
            "percentage": result.percentage,
            "weak": result.percentage < 70,
        })

    return {
        "attempt_id": attempt.id,
        "trainee_id": attempt.trainee_id,
        "course_id": attempt.course_id,
        "test_type": attempt.test_type,
        "score": attempt.score,
        "topics": topics,
    }


# ---------------------------------------------------------
# TRAINERS RECOMMENDED FOR TOPIC
# ---------------------------------------------------------

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
            "email": trainer.email,
            "bio": trainer.bio or "",
        }
        for trainer in trainers
    ]


# ---------------------------------------------------------
# TRAINER SLOTS
# ---------------------------------------------------------

@app.get("/trainers/{trainer_id}/slots")
def trainer_slots(
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
            "available": slot.available,
        }
        for slot in slots
    ]


# ---------------------------------------------------------
# BOOK SLOT
# ---------------------------------------------------------

@app.post("/bookings")
def create_booking(
    data: BookingRequest,
    db: Session = Depends(get_db)
):

    slot = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.id == data.slot_id,
            TrainerSlot.trainer_id == data.trainer_id,
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

    trainee = (
        db.query(User)
        .filter(
            User.id == data.trainee_id,
            User.role == "trainee",
        )
        .first()
    )

    if not trainee:
        raise HTTPException(
            status_code=404,
            detail="Trainee not found"
        )

    booking = Booking(
        trainee_id=data.trainee_id,
        trainer_id=data.trainer_id,
        slot_id=data.slot_id,
        topic_id=data.topic_id,
        status="booked",
    )

    db.add(booking)
    db.flush()

    lecture = Lecture(
        booking_id=booking.id,
        status="scheduled",
    )

    db.add(lecture)

    slot.available = False

    db.commit()

    db.refresh(booking)
    db.refresh(lecture)

    return {
        "message": "Slot booked successfully",
        "booking_id": booking.id,
        "lecture_id": lecture.id,
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
        .filter(Lecture.id == lecture_id)
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
        "message": "Lecture completed",
        "lecture_id": lecture.id,
        "status": lecture.status,
    }


# ---------------------------------------------------------
# TRAINEE PROGRESS
# ---------------------------------------------------------

@app.get("/progress/{trainee_id}")
def trainee_progress(
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

    return [
        {
            "attempt_id": attempt.id,
            "course_id": attempt.course_id,
            "test_type": attempt.test_type,
            "score": attempt.score,
            "status": attempt.status,
        }
        for attempt in attempts
    ]


# ---------------------------------------------------------
# TRAINER DASHBOARD
# ---------------------------------------------------------

@app.get("/trainer/{trainer_id}/dashboard")
def trainer_dashboard(
    trainer_id: int,
    db: Session = Depends(get_db)
):

    trainer = (
        db.query(User)
        .filter(
            User.id == trainer_id,
            User.role == "trainer",
        )
        .first()
    )

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    topics = (
        db.query(Topic)
        .join(
            TrainerTopic,
            TrainerTopic.topic_id == Topic.id
        )
        .filter(
            TrainerTopic.trainer_id == trainer_id
        )
        .all()
    )

    slots = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.trainer_id == trainer_id
        )
        .all()
    )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.trainer_id == trainer_id
        )
        .order_by(Booking.id.desc())
        .all()
    )

    booking_data = []

    for booking in bookings:

        trainee = (
            db.query(User)
            .filter(
                User.id == booking.trainee_id
            )
            .first()
        )

        topic = (
            db.query(Topic)
            .filter(
                Topic.id == booking.topic_id
            )
            .first()
        )

        lecture = (
            db.query(Lecture)
            .filter(
                Lecture.booking_id == booking.id
            )
            .first()
        )

        booking_data.append({
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
            "status": booking.status,
            "lecture_id": (
                lecture.id
                if lecture
                else None
            ),
            "lecture_status": (
                lecture.status
                if lecture
                else None
            ),
        })

    return {
        "trainer": {
            "id": trainer.id,
            "name": trainer.name,
            "email": trainer.email,
            "bio": trainer.bio or "",
        },
        "topics": [
            {
                "id": topic.id,
                "name": topic.name,
            }
            for topic in topics
        ],
        "slots": [
            {
                "id": slot.id,
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "available": slot.available,
            }
            for slot in slots
        ],
        "bookings": booking_data,
    }


# ---------------------------------------------------------
# TRAINER PROFILE UPDATE
# ---------------------------------------------------------

@app.put("/trainer/{trainer_id}/profile")
def update_trainer_profile(
    trainer_id: int,
    data: TrainerProfileUpdate,
    db: Session = Depends(get_db)
):

    trainer = (
        db.query(User)
        .filter(
            User.id == trainer_id,
            User.role == "trainer",
        )
        .first()
    )

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    if data.name is not None:
        trainer.name = data.name.strip()

    if data.bio is not None:
        trainer.bio = data.bio.strip()

    db.commit()
    db.refresh(trainer)

    return {
        "message": "Profile updated",
        "id": trainer.id,
        "name": trainer.name,
        "email": trainer.email,
        "bio": trainer.bio or "",
    }


# ---------------------------------------------------------
# TRAINER ADD SLOT
# ---------------------------------------------------------

@app.post("/trainer/{trainer_id}/slots")
def add_trainer_slot(
    trainer_id: int,
    start_time: str,
    end_time: str,
    db: Session = Depends(get_db)
):

    trainer = (
        db.query(User)
        .filter(
            User.id == trainer_id,
            User.role == "trainer",
        )
        .first()
    )

    if not trainer:
        raise HTTPException(
            status_code=404,
            detail="Trainer not found"
        )

    slot = TrainerSlot(
        trainer_id=trainer_id,
        start_time=start_time,
        end_time=end_time,
        available=True,
    )

    db.add(slot)
    db.commit()
    db.refresh(slot)

    return {
        "message": "Slot added",
        "id": slot.id,
        "start_time": slot.start_time,
        "end_time": slot.end_time,
        "available": slot.available,
    }


# ---------------------------------------------------------
# TRAINER REMOVE SLOT
# ---------------------------------------------------------

@app.delete("/trainer/{trainer_id}/slots/{slot_id}")
def delete_trainer_slot(
    trainer_id: int,
    slot_id: int,
    db: Session = Depends(get_db)
):

    slot = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.id == slot_id,
            TrainerSlot.trainer_id == trainer_id,
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
        "message": "Slot deleted"
    }


# ---------------------------------------------------------
# TRAINER BOOKINGS
# ---------------------------------------------------------

@app.get("/trainer/{trainer_id}/bookings")
def trainer_bookings(
    trainer_id: int,
    db: Session = Depends(get_db)
):

    bookings = (
        db.query(Booking)
        .filter(
            Booking.trainer_id == trainer_id
        )
        .order_by(Booking.id.desc())
        .all()
    )

    result = []

    for booking in bookings:

        trainee = (
            db.query(User)
            .filter(
                User.id == booking.trainee_id
            )
            .first()
        )

        topic = (
            db.query(Topic)
            .filter(
                Topic.id == booking.topic_id
            )
            .first()
        )

        lecture = (
            db.query(Lecture)
            .filter(
                Lecture.booking_id == booking.id
            )
            .first()
        )

        result.append({
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
            "topic": (
                topic.name
                if topic
                else "Unknown"
            ),
            "status": booking.status,
            "lecture_id": (
                lecture.id
                if lecture
                else None
            ),
            "lecture_status": (
                lecture.status
                if lecture
                else None
            ),
        })

    return result
