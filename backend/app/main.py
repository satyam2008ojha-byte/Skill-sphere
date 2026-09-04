from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import get_db
from .models import *
from .schemas import *
from .seed import seed

app=FastAPI(title="SkillSphere API",version="1.0.0")
seed()

@app.get("/")
def root(): return {"message":"SkillSphere API is running"}

@app.post("/auth/login")
def login(data:LoginRequest,db:Session=Depends(get_db)):
    u=db.query(User).filter(User.email==data.email,User.password==data.password).first()
    if not u: raise HTTPException(401,"Invalid email or password")
    return {"id":u.id,"name":u.name,"email":u.email,"role":u.role}

@app.get("/courses")
def courses(db:Session=Depends(get_db)):
    return db.query(Course).all()

@app.get("/courses/{course_id}/questions")
def questions(course_id:int,db:Session=Depends(get_db)):
    qs=db.query(Question).filter(Question.course_id==course_id).all()
    return [{"id":q.id,"topic_id":q.topic_id,"text":q.text,"options":[q.option_a,q.option_b,q.option_c,q.option_d]} for q in qs]

@app.post("/tests/submit")
def submit_test(data:TestSubmit,db:Session=Depends(get_db)):
    qs={q.id:q for q in db.query(Question).filter(Question.course_id==data.course_id).all()}
    if not qs: raise HTTPException(404,"Course questions not found")
    attempt=TestAttempt(trainee_id=data.trainee_id,course_id=data.course_id,test_type=data.test_type)
    db.add(attempt); db.flush()
    topic_total={}; topic_correct={}
    correct=0
    for item in data.answers:
        q=qs.get(item.question_id)
        if not q: continue
        ok=item.answer.upper()==q.correct_answer.upper()
        correct += int(ok)
        topic_total[q.topic_id]=topic_total.get(q.topic_id,0)+1
        topic_correct[q.topic_id]=topic_correct.get(q.topic_id,0)+int(ok)
        db.add(TestAnswer(attempt_id=attempt.id,question_id=q.id,answer=item.answer,is_correct=ok))
    attempt.score=round(correct/max(len(data.answers),1)*100,2)
    for tid,total in topic_total.items():
        pct=round(topic_correct.get(tid,0)/total*100,2)
        db.add(TopicResult(attempt_id=attempt.id,topic_id=tid,percentage=pct))
    db.commit()
    weak=[]
    for tid,total in topic_total.items():
        pct=topic_correct.get(tid,0)/total*100
        if pct<70: weak.append({"topic_id":tid,"percentage":round(pct,2)})
    return {"attempt_id":attempt.id,"score":attempt.score,"weak_topics":weak}

@app.get("/attempts/{attempt_id}/result")
def result(attempt_id:int,db:Session=Depends(get_db)):
    a=db.query(TestAttempt).filter(TestAttempt.id==attempt_id).first()
    if not a: raise HTTPException(404,"Attempt not found")
    rows=db.query(TopicResult,Topic).join(Topic,Topic.id==TopicResult.topic_id).filter(TopicResult.attempt_id==attempt_id).all()
    return {"attempt_id":a.id,"test_type":a.test_type,"score":a.score,
            "topics":[{"topic_id":t.id,"topic":t.name,"percentage":r.percentage} for r,t in rows]}

@app.get("/trainers/recommended/{topic_id}")
def recommended(topic_id:int,db:Session=Depends(get_db)):
    rows=db.query(User).join(TrainerTopic,TrainerTopic.trainer_id==User.id).filter(TrainerTopic.topic_id==topic_id,User.role=="trainer").all()
    return [{"id":u.id,"name":u.name,"bio":u.bio} for u in rows]

@app.get("/trainers/{trainer_id}/slots")
def slots(trainer_id:int,db:Session=Depends(get_db)):
    return [{"id":s.id,"start_time":s.start_time,"end_time":s.end_time} for s in db.query(TrainerSlot).filter(TrainerSlot.trainer_id==trainer_id,TrainerSlot.available==True).all()]

@app.post("/bookings")
def book(data:BookingRequest,db:Session=Depends(get_db)):
    slot=db.query(TrainerSlot).filter(TrainerSlot.id==data.slot_id,TrainerSlot.available==True).first()
    if not slot: raise HTTPException(400,"Slot is not available")
    booking=Booking(trainee_id=data.trainee_id,trainer_id=data.trainer_id,slot_id=data.slot_id,topic_id=data.topic_id)
    slot.available=False
    db.add(booking); db.flush()
    lecture=Lecture(booking_id=booking.id)
    db.add(lecture); db.commit()
    return {"booking_id":booking.id,"lecture_id":lecture.id,"status":"booked"}

@app.post("/lectures/{lecture_id}/complete")
def complete_lecture(lecture_id:int,db:Session=Depends(get_db)):
    l=db.query(Lecture).filter(Lecture.id==lecture_id).first()
    if not l: raise HTTPException(404,"Lecture not found")
    l.status="completed"; db.commit()
    return {"lecture_id":l.id,"status":l.status}

@app.get("/progress/{trainee_id}")
def progress(trainee_id:int,db:Session=Depends(get_db)):
    attempts=db.query(TestAttempt).filter(TestAttempt.trainee_id==trainee_id).order_by(TestAttempt.id).all()
    return [{"id":a.id,"course_id":a.course_id,"test_type":a.test_type,"score":a.score} for a in attempts]
