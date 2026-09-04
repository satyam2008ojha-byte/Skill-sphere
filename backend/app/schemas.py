from pydantic import BaseModel, EmailStr
from typing import List, Optional


# =========================
# AUTH
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    bio: Optional[str] = ""


# =========================
# TEST
# =========================

class TestAnswerItem(BaseModel):
    question_id: int
    answer: str


class TestSubmit(BaseModel):
    trainee_id: int
    course_id: int
    test_type: str
    answers: List[TestAnswerItem]


# =========================
# BOOKING
# =========================

class BookingRequest(BaseModel):
    trainee_id: int
    trainer_id: int
    slot_id: int
    topic_id: int


# =========================
# TRAINER SLOT
# =========================

class SlotCreate(BaseModel):
    start_time: str
    end_time: str


# =========================
# PROFILE
# =========================

class ProfileUpdate(BaseModel):
    name: str
    bio: Optional[str] = ""


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
