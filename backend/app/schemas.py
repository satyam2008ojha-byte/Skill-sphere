from pydantic import BaseModel
from typing import List

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
