from typing import List, Optional
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = ""


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


class TrainerProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
