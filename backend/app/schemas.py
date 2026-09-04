from pydantic import BaseModel, EmailStr
from typing import List, Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    bio: Optional[str] = ""


class TestAnswerItem(BaseModel):
    question_id: int
    answer: str


class TestSubmit(BaseModel):
    trainee_id: int
    course_id: int
    test_type: str
    answers: List[TestAnswerItem]


class BookingRequest(BaseModel):
    trainee_id: int
    trainer_id: int
    slot_id: int
    topic_id: int


class SlotCreate(BaseModel):
    start_time: str
    end_time: str


class ProfileUpdate(BaseModel):
    name: str
    bio: Optional[str] = ""
