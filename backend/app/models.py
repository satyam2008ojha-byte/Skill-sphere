from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="trainee")
    bio = Column(Text, default="")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    name = Column(String, nullable=False)


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    text = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)


class TrainerTopic(Base):
    __tablename__ = "trainer_topics"

    id = Column(Integer, primary_key=True)
    trainer_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))


class TrainerSlot(Base):
    __tablename__ = "trainer_slots"

    id = Column(Integer, primary_key=True)
    trainer_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    available = Column(Boolean, default=True)


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(Integer, primary_key=True)
    trainee_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    test_type = Column(String, nullable=False)
    score = Column(Float, default=0)
    status = Column(String, default="completed")


class TestAnswer(Base):
    __tablename__ = "test_answers"

    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("test_attempts.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    answer = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True)
    trainee_id = Column(Integer, ForeignKey("users.id"))
    trainer_id = Column(Integer, ForeignKey("users.id"))
    slot_id = Column(Integer, ForeignKey("trainer_slots.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    status = Column(String, default="booked")


class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    status = Column(String, default="scheduled")


class TopicResult(Base):
    __tablename__ = "topic_results"

    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("test_attempts.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    percentage = Column(Float, default=0)
