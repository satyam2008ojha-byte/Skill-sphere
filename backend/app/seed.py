from .database import Base, engine, SessionLocal
from .models import (
    User,
    Course,
    Topic,
    Question,
    TrainerTopic,
    TrainerSlot
)


def seed():

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:

        # -------------------------------------------------
        # REMOVE OLD DEMO ACCOUNTS
        # -------------------------------------------------

        demo_emails = [
            "trainee@skillsphere.com",
            "aarav@skillsphere.com",
            "neha@skillsphere.com",
            "rohan@skillsphere.com",
            "admin@skillsphere.com"
        ]

        db.query(User).filter(
            User.email.in_(demo_emails)
        ).delete(
            synchronize_session=False
        )

        db.commit()

        # -------------------------------------------------
        # COURSES
        # -------------------------------------------------

        if db.query(Course).count() == 0:

            python = Course(
                title="Python Fundamentals",
                description="Core Python programming concepts"
            )

            sql = Course(
                title="SQL Fundamentals",
                description="Queries, joins and database basics"
            )

            cloud = Course(
                title="Cloud Computing Basics",
                description="Cloud computing and AWS fundamentals"
            )

            db.add_all([
                python,
                sql,
                cloud
            ])

            db.commit()

            # ---------------------------------------------
            # TOPICS
            # ---------------------------------------------

            topic_data = [
                (
                    python,
                    [
                        "Variables & Data Types",
                        "Control Flow",
                        "Functions"
                    ]
                ),
                (
                    sql,
                    [
                        "SELECT & Filtering",
                        "Joins",
                        "Aggregation"
                    ]
                ),
                (
                    cloud,
                    [
                        "Cloud Basics",
                        "AWS Services",
                        "Security Basics"
                    ]
                )
            ]

            topic_map = {}

            for course, names in topic_data:

                for name in names:

                    topic = Topic(
                        course_id=course.id,
                        name=name
                    )

                    db.add(topic)
                    db.flush()

                    topic_map[name] = topic.id

            # ---------------------------------------------
            # QUESTIONS
            # ---------------------------------------------

            questions = [

                # PYTHON
                (
                    python,
                    "Variables & Data Types",
                    "Which is immutable?",
                    "List",
                    "Dictionary",
                    "Tuple",
                    "Set",
                    "C"
                ),
                (
                    python,
                    "Variables & Data Types",
                    "What is the type of 10?",
                    "str",
                    "int",
                    "float",
                    "bool",
                    "B"
                ),
                (
                    python,
                    "Variables & Data Types",
                    "Which stores key-value pairs?",
                    "List",
                    "Tuple",
                    "Dictionary",
                    "Set",
                    "C"
                ),
                (
                    python,
                    "Control Flow",
                    "Which keyword starts a condition?",
                    "for",
                    "if",
                    "def",
                    "try",
                    "B"
                ),
                (
                    python,
                    "Control Flow",
                    "Which repeats over items?",
                    "if",
                    "for",
                    "class",
                    "import",
                    "B"
                ),
                (
                    python,
                    "Control Flow",
                    "What does break do?",
                    "Skips one item",
                    "Ends loop",
                    "Starts loop",
                    "Defines function",
                    "B"
                ),
                (
                    python,
                    "Functions",
                    "Which keyword defines a function?",
                    "func",
                    "function",
                    "def",
                    "lambda",
                    "C"
                ),
                (
                    python,
                    "Functions",
                    "How do you return a value?",
                    "give",
                    "return",
                    "send",
                    "output",
                    "B"
                ),
                (
                    python,
                    "Functions",
                    "Arguments are passed inside?",
                    "[]",
                    "{}",
                    "()",
                    "<>",
                    "C"
                ),

                # SQL
                (
                    sql,
                    "SELECT & Filtering",
                    "Which retrieves rows?",
                    "SELECT",
                    "GET",
                    "FETCH",
                    "READ",
                    "A"
                ),
                (
                    sql,
                    "SELECT & Filtering",
                    "Which filters rows?",
                    "WHERE",
                    "WHEN",
                    "FILTER",
                    "HAVING",
                    "A"
                ),
                (
                    sql,
                    "Joins",
                    "Which join matches rows in both tables?",
                    "INNER JOIN",
                    "LEFT JOIN",
                    "CROSS JOIN",
                    "SELF JOIN",
                    "A"
                ),
                (
                    sql,
                    "Joins",
                    "Which keeps all rows from the left table?",
                    "RIGHT JOIN",
                    "LEFT JOIN",
                    "INNER JOIN",
                    "CROSS JOIN",
                    "B"
                ),
                (
                    sql,
                    "Aggregation",
                    "Which function counts rows?",
                    "SUM",
                    "COUNT",
                    "TOTAL",
                    "ROWS",
                    "B"
                ),
                (
                    sql,
                    "Aggregation",
                    "Which function calculates average?",
                    "AVG",
                    "MEAN",
                    "AVERAGE",
                    "MID",
                    "A"
                ),

                # CLOUD
                (
                    cloud,
                    "Cloud Basics",
                    "IaaS provides?",
                    "Infrastructure",
                    "Software",
                    "Data",
                    "Email",
                    "A"
                ),
                (
                    cloud,
                    "Cloud Basics",
                    "Cloud scalability means?",
                    "Adjust capacity",
                    "Delete data",
                    "Encrypt password",
                    "Write code",
                    "A"
                ),
                (
                    cloud,
                    "AWS Services",
                    "EC2 is mainly used for?",
                    "Virtual servers",
                    "Object storage",
                    "DNS",
                    "Database",
                    "A"
                ),
                (
                    cloud,
                    "AWS Services",
                    "S3 is?",
                    "Object storage",
                    "Compute",
                    "Queue",
                    "Firewall",
                    "A"
                ),
                (
                    cloud,
                    "AWS Services",
                    "RDS provides?",
                    "Managed databases",
                    "DNS",
                    "Files",
                    "Containers",
                    "A"
                ),
                (
                    cloud,
                    "Security Basics",
                    "IAM controls?",
                    "Identity and access",
                    "Images",
                    "Servers",
                    "DNS",
                    "A"
                ),
                (
                    cloud,
                    "Security Basics",
                    "Least privilege means?",
                    "Minimum required access",
                    "Admin for everyone",
                    "No passwords",
                    "Public access",
                    "A"
                ),
                (
                    cloud,
                    "Security Basics",
                    "MFA adds?",
                    "Extra authentication factor",
                    "More storage",
                    "Faster CPU",
                    "Backup",
                    "A"
                )
            ]

            for (
                course,
                topic_name,
                text,
                a,
                b,
                c,
                d,
                correct
            ) in questions:

                db.add(
                    Question(
                        course_id=course.id,
                        topic_id=topic_map[topic_name],
                        text=text,
                        option_a=a,
                        option_b=b,
                        option_c=c,
                        option_d=d,
                        correct_answer=correct
                    )
                )

            db.commit()

        else:

            topic_map = {
                t.name: t.id
                for t in db.query(Topic).all()
            }

        # -------------------------------------------------
        # TRAINER ACCOUNTS
        # -------------------------------------------------

        trainer_data = [
            (
                "Python Trainer",
                "python.trainer@skillsphere.com",
                "Python programming and OOP mentor.",
                [
                    "Variables & Data Types",
                    "Control Flow",
                    "Functions"
                ]
            ),
            (
                "SQL Trainer",
                "sql.trainer@skillsphere.com",
                "SQL and database mentor.",
                [
                    "SELECT & Filtering",
                    "Joins",
                    "Aggregation"
                ]
            ),
            (
                "Cloud Trainer",
                "cloud.trainer@skillsphere.com",
                "Cloud and AWS mentor.",
                [
                    "Cloud Basics",
                    "AWS Services",
                    "Security Basics"
                ]
            )
        ]

        for (
            name,
            email,
            bio,
            expertise
        ) in trainer_data:

            trainer = db.query(User).filter(
                User.email == email
            ).first()

            if not trainer:

                trainer = User(
                    name=name,
                    email=email,
                    password="trainer123",
                    role="trainer",
                    bio=bio
                )

                db.add(trainer)
                db.commit()
                db.refresh(trainer)

            for topic_name in expertise:

                topic_id = topic_map.get(topic_name)

                if not topic_id:
                    continue

                exists = db.query(TrainerTopic).filter(
                    TrainerTopic.trainer_id == trainer.id,
                    TrainerTopic.topic_id == topic_id
                ).first()

                if not exists:

                    db.add(
                        TrainerTopic(
                            trainer_id=trainer.id,
                            topic_id=topic_id
                        )
                    )

            # Default trainer slots
            if db.query(TrainerSlot).filter(
                TrainerSlot.trainer_id == trainer.id
            ).count() == 0:

                for start, end in [
                    ("10:00", "11:00"),
                    ("14:00", "15:00"),
                    ("17:00", "18:00")
                ]:

                    db.add(
                        TrainerSlot(
                            trainer_id=trainer.id,
                            start_time=start,
                            end_time=end,
                            available=True
                        )
                    )

        db.commit()

    finally:
        db.close()


if __name__ == "__main__":
    seed()
