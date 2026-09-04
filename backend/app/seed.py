from .database import Base, engine, SessionLocal
from .models import User, Course, Topic, Question, TrainerTopic, TrainerSlot

def seed():
    Base.metadata.create_all(bind=engine)
    db=SessionLocal()
    try:
        if db.query(User).count():
            return

        trainee=User(name="Demo Trainee", email="trainee@skillsphere.com", password="123456", role="trainee")
        trainer1=User(name="Aarav Sharma", email="aarav@skillsphere.com", password="123456", role="trainer", bio="Python and programming mentor.")
        trainer2=User(name="Neha Verma", email="neha@skillsphere.com", password="123456", role="trainer", bio="SQL and database mentor.")
        trainer3=User(name="Rohan Singh", email="rohan@skillsphere.com", password="123456", role="trainer", bio="Cloud and AWS fundamentals mentor.")
        admin=User(name="Admin", email="admin@skillsphere.com", password="123456", role="admin")
        db.add_all([trainee,trainer1,trainer2,trainer3,admin]); db.commit()

        courses=[
            Course(title="Python Fundamentals",description="Core Python concepts for beginners"),
            Course(title="SQL Fundamentals",description="Queries, joins and database basics"),
            Course(title="Cloud Computing Basics",description="Cloud and AWS fundamentals")
        ]
        db.add_all(courses); db.commit()

        topic_map={}
        for c, names in zip(courses,[
            ["Variables & Data Types","Control Flow","Functions"],
            ["SELECT & Filtering","Joins","Aggregation"],
            ["Cloud Basics","AWS Services","Security Basics"]
        ]):
            for n in names:
                t=Topic(course_id=c.id,name=n); db.add(t); db.flush(); topic_map[n]=t.id

        # 15 questions per course, 5 per topic
        qsets=[
            (courses[0],[
                ("Variables & Data Types",[
                    ("Which is immutable?","List","Dictionary","Tuple","Set","C"),
                    ("What is the type of 10?","str","int","float","bool","B"),
                    ("Which stores key-value pairs?","List","Tuple","Dictionary","Set","C"),
                    ("What does len('hello') return?","4","5","6","0","B"),
                    ("Which converts text to integer?","str()","float()","int()","list()","C")]),
                ("Control Flow",[
                    ("Which keyword starts a condition?","for","if","def","try","B"),
                    ("Which repeats over items?","if","for","class","import","B"),
                    ("What does break do?","Skips one item","Ends loop","Starts loop","Defines function","B"),
                    ("Which is a comparison operator?","=","==","+","//","B"),
                    ("What is elif used for?","Another condition","Loop","Function","Import","A")]),
                ("Functions",[
                    ("Which keyword defines a function?","func","function","def","lambda","C"),
                    ("How do you return a value?","give","return","send","output","B"),
                    ("Arguments are passed inside?","[]","{}","()","<>","C"),
                    ("A function can return?","Only numbers","Only text","Multiple values","Nothing ever","C"),
                    ("Anonymous function is commonly called?","lambda","inline","anon","quick","A")])]),
            (courses[1],[
                ("SELECT & Filtering",[
                    ("Which retrieves rows?","SELECT","GET","FETCHROW","READ","A"),
                    ("Which filters rows?","WHERE","WHEN","FILTER","HAVINGONLY","A"),
                    ("Sort results with?","ORDER BY","SORT","GROUP","ARRANGE","A"),
                    ("Remove duplicate rows with?","UNIQUE","DISTINCT","ONLY","DEDUP","B"),
                    ("Wildcard for any characters?","_","%","*","?","B")]),
                ("Joins",[
                    ("Matches rows in both tables?","INNER JOIN","LEFT JOIN","CROSS JOIN","SELF JOIN","A"),
                    ("Keeps all left rows?","RIGHT JOIN","LEFT JOIN","INNER JOIN","CROSS JOIN","B"),
                    ("Cartesian product is?","INNER","LEFT","CROSS","RIGHT","C"),
                    ("Join condition commonly uses?","ON","AT","WITH","BY","A"),
                    ("A table can be joined to itself using?","SELF JOIN","DOUBLE JOIN","LOOP JOIN","REPEAT","A")]),
                ("Aggregation",[
                    ("Counts rows with?","SUM","COUNT","TOTAL","ROWS","B"),
                    ("Average uses?","AVG","MEAN","AVERAGE","MID","A"),
                    ("Groups rows with?","GROUP BY","ORDER BY","COLLECT","PACK","A"),
                    ("Filters groups with?","WHERE","HAVING","GROUPFILTER","AFTER","B"),
                    ("Largest value with?","MAX","TOP","HIGH","LARGE","A")])]),
            (courses[2],[
                ("Cloud Basics",[
                    ("Cloud provides computing over?","Internet","USB","Printer","Bluetooth","A"),
                    ("Pay-as-you-go means?","Fixed yearly only","Pay for usage","Free forever","One-time payment","B"),
                    ("IaaS provides?","Infrastructure","Only software","Only data","Emails","A"),
                    ("Scalability means?","Adjust capacity","Delete data","Encrypt password","Write code","A"),
                    ("Public cloud is?","Shared provider infrastructure","Your laptop","Offline server","USB drive","A")]),
                ("AWS Services",[
                    ("EC2 is for?","Virtual servers","Object storage","DNS only","Database only","A"),
                    ("S3 is?","Object storage","Compute","Queue","Firewall","A"),
                    ("RDS provides?","Managed databases","DNS","Files only","Containers only","A"),
                    ("Lambda is?","Serverless compute","Storage","Networking","Monitoring","A"),
                    ("CloudFront is?","CDN","Database","VM","IAM user","A")]),
                ("Security Basics",[
                    ("IAM controls?","Identity and access","Images","Servers only","DNS","A"),
                    ("Least privilege means?","Minimum required access","Admin for all","No passwords","Public access","A"),
                    ("MFA adds?","Extra authentication factor","More storage","Faster CPU","Backup","A"),
                    ("Encryption protects?","Data","Only CPU","Network speed","Billing","A"),
                    ("Security groups act as?","Virtual firewall","Database","Storage","DNS","A")])]
        ]
        for course, topics in qsets:
            for topic_name, qs in topics:
                tid=topic_map[topic_name]
                for text,a,b,c,d,correct in qs:
                    db.add(Question(course_id=course.id,topic_id=tid,text=text,option_a=a,option_b=b,option_c=c,option_d=d,correct_answer=correct))
        db.commit()

        # trainer expertise
        for trainer, topic_names in [(trainer1,["Variables & Data Types","Control Flow","Functions"]),
                                     (trainer2,["SELECT & Filtering","Joins","Aggregation"]),
                                     (trainer3,["Cloud Basics","AWS Services","Security Basics"])]:
            for n in topic_names: db.add(TrainerTopic(trainer_id=trainer.id,topic_id=topic_map[n]))
        for trainer in [trainer1,trainer2,trainer3]:
            for s,e in [("10:00","11:00"),("14:00","15:00"),("17:00","18:00")]:
                db.add(TrainerSlot(trainer_id=trainer.id,start_time=s,end_time=e))
        db.commit()
    finally:
        db.close()

if __name__=="__main__":
    seed()
