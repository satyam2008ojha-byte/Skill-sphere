from .database import Base, engine, SessionLocal
from .models import User, Course, Topic, Question, TrainerTopic, TrainerSlot


def seed():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # If database already has users, don't seed again
        if db.query(User).count():
            return

        # ---------------------------------------------------------
        # USERS
        # ---------------------------------------------------------

        trainee = User(
            name="Demo Trainee",
            email="trainee@skillsphere.com",
            password="123456",
            role="trainee"
        )

        trainer1 = User(
            name="Aarav Sharma",
            email="aarav@skillsphere.com",
            password="123456",
            role="trainer",
            bio="Python and programming mentor."
        )

        trainer2 = User(
            name="Neha Verma",
            email="neha@skillsphere.com",
            password="123456",
            role="trainer",
            bio="SQL and database mentor."
        )

        trainer3 = User(
            name="Rohan Singh",
            email="rohan@skillsphere.com",
            password="123456",
            role="trainer",
            bio="Cloud and AWS fundamentals mentor."
        )

        admin = User(
            name="Admin",
            email="admin@skillsphere.com",
            password="123456",
            role="admin"
        )

        db.add_all([
            trainee,
            trainer1,
            trainer2,
            trainer3,
            admin
        ])

        db.commit()

        # ---------------------------------------------------------
        # COURSES
        # ---------------------------------------------------------

        courses = [
            Course(
                title="Python Fundamentals",
                description="Core Python concepts for beginners"
            ),
            Course(
                title="SQL Fundamentals",
                description="Queries, joins and database basics"
            ),
            Course(
                title="Cloud Computing Basics",
                description="Cloud and AWS fundamentals"
            )
        ]

        db.add_all(courses)
        db.commit()

        # ---------------------------------------------------------
        # TOPICS
        # ---------------------------------------------------------

        topic_map = {}

        course_topics = [
            (
                courses[0],
                [
                    "Variables & Data Types",
                    "Control Flow",
                    "Functions"
                ]
            ),
            (
                courses[1],
                [
                    "SELECT & Filtering",
                    "Joins",
                    "Aggregation"
                ]
            ),
            (
                courses[2],
                [
                    "Cloud Basics",
                    "AWS Services",
                    "Security Basics"
                ]
            )
        ]

        for course, topic_names in course_topics:
            for topic_name in topic_names:

                topic = Topic(
                    course_id=course.id,
                    name=topic_name
                )

                db.add(topic)
                db.flush()

                topic_map[topic_name] = topic.id

        # ---------------------------------------------------------
        # QUESTIONS
        # 15 QUESTIONS PER COURSE
        # 5 QUESTIONS PER TOPIC
        # ---------------------------------------------------------

        qsets = [

            # =====================================================
            # PYTHON
            # =====================================================

            (
                courses[0],
                [

                    (
                        "Variables & Data Types",
                        [
                            (
                                "Which is immutable?",
                                "List",
                                "Dictionary",
                                "Tuple",
                                "Set",
                                "C"
                            ),
                            (
                                "What is the type of 10?",
                                "str",
                                "int",
                                "float",
                                "bool",
                                "B"
                            ),
                            (
                                "Which stores key-value pairs?",
                                "List",
                                "Tuple",
                                "Dictionary",
                                "Set",
                                "C"
                            ),
                            (
                                "What does len('hello') return?",
                                "4",
                                "5",
                                "6",
                                "0",
                                "B"
                            ),
                            (
                                "Which converts text to integer?",
                                "str()",
                                "float()",
                                "int()",
                                "list()",
                                "C"
                            )
                        ]
                    ),

                    (
                        "Control Flow",
                        [
                            (
                                "Which keyword starts a condition?",
                                "for",
                                "if",
                                "def",
                                "try",
                                "B"
                            ),
                            (
                                "Which repeats over items?",
                                "if",
                                "for",
                                "class",
                                "import",
                                "B"
                            ),
                            (
                                "What does break do?",
                                "Skips one item",
                                "Ends loop",
                                "Starts loop",
                                "Defines function",
                                "B"
                            ),
                            (
                                "Which is a comparison operator?",
                                "=",
                                "==",
                                "+",
                                "//",
                                "B"
                            ),
                            (
                                "What is elif used for?",
                                "Another condition",
                                "Loop",
                                "Function",
                                "Import",
                                "A"
                            )
                        ]
                    ),

                    (
                        "Functions",
                        [
                            (
                                "Which keyword defines a function?",
                                "func",
                                "function",
                                "def",
                                "lambda",
                                "C"
                            ),
                            (
                                "How do you return a value?",
                                "give",
                                "return",
                                "send",
                                "output",
                                "B"
                            ),
                            (
                                "Arguments are passed inside?",
                                "[]",
                                "{}",
                                "()",
                                "<>",
                                "C"
                            ),
                            (
                                "A function can return?",
                                "Only numbers",
                                "Only text",
                                "Multiple values",
                                "Nothing ever",
                                "C"
                            ),
                            (
                                "Anonymous function is commonly called?",
                                "lambda",
                                "inline",
                                "anon",
                                "quick",
                                "A"
                            )
                        ]
                    )
                ]
            ),

            # =====================================================
            # SQL
            # =====================================================

            (
                courses[1],
                [

                    (
                        "SELECT & Filtering",
                        [
                            (
                                "Which retrieves rows?",
                                "SELECT",
                                "GET",
                                "FETCHROW",
                                "READ",
                                "A"
                            ),
                            (
                                "Which filters rows?",
                                "WHERE",
                                "WHEN",
                                "FILTER",
                                "HAVINGONLY",
                                "A"
                            ),
                            (
                                "Sort results with?",
                                "ORDER BY",
                                "SORT",
                                "GROUP",
                                "ARRANGE",
                                "A"
                            ),
                            (
                                "Remove duplicate rows with?",
                                "UNIQUE",
                                "DISTINCT",
                                "ONLY",
                                "DEDUP",
                                "B"
                            ),
                            (
                                "Wildcard for any characters?",
                                "_",
                                "%",
                                "*",
                                "?",
                                "B"
                            )
                        ]
                    ),

                    (
                        "Joins",
                        [
                            (
                                "Matches rows in both tables?",
                                "INNER JOIN",
                                "LEFT JOIN",
                                "CROSS JOIN",
                                "SELF JOIN",
                                "A"
                            ),
                            (
                                "Keeps all left rows?",
                                "RIGHT JOIN",
                                "LEFT JOIN",
                                "INNER JOIN",
                                "CROSS JOIN",
                                "B"
                            ),
                            (
                                "Cartesian product is?",
                                "INNER",
                                "LEFT",
                                "CROSS",
                                "RIGHT",
                                "C"
                            ),
                            (
                                "Join condition commonly uses?",
                                "ON",
                                "AT",
                                "WITH",
                                "BY",
                                "A"
                            ),
                            (
                                "A table can be joined to itself using?",
                                "SELF JOIN",
                                "DOUBLE JOIN",
                                "LOOP JOIN",
                                "REPEAT",
                                "A"
                            )
                        ]
                    ),

                    (
                        "Aggregation",
                        [
                            (
                                "Counts rows with?",
                                "SUM",
                                "COUNT",
                                "TOTAL",
                                "ROWS",
                                "B"
                            ),
                            (
                                "Average uses?",
                                "AVG",
                                "MEAN",
                                "AVERAGE",
                                "MID",
                                "A"
                            ),
                            (
                                "Groups rows with?",
                                "GROUP BY",
                                "ORDER BY",
                                "COLLECT",
                                "PACK",
                                "A"
                            ),
                            (
                                "Filters groups with?",
                                "WHERE",
                                "HAVING",
                                "GROUPFILTER",
                                "AFTER",
                                "B"
                            ),
                            (
                                "Largest value with?",
                                "MAX",
                                "TOP",
                                "HIGH",
                                "LARGE",
                                "A"
                            )
                        ]
                    )
                ]
            ),

            # =====================================================
            # CLOUD COMPUTING
            # =====================================================

            (
                courses[2],
                [

                    (
                        "Cloud Basics",
                        [
                            (
                                "Cloud provides computing over?",
                                "Internet",
                                "USB",
                                "Printer",
                                "Bluetooth",
                                "A"
                            ),
                            (
                                "Pay-as-you-go means?",
                                "Fixed yearly only",
                                "Pay for usage",
                                "Free forever",
                                "One-time payment",
                                "B"
                            ),
                            (
                                "IaaS provides?",
                                "Infrastructure",
                                "Only software",
                                "Only data",
                                "Emails",
                                "A"
                            ),
                            (
                                "Scalability means?",
                                "Adjust capacity",
                                "Delete data",
                                "Encrypt password",
                                "Write code",
                                "A"
                            ),
                            (
                                "Public cloud is?",
                                "Shared provider infrastructure",
                                "Your laptop",
                                "Offline server",
                                "USB drive",
                                "A"
                            )
                        ]
                    ),

                    (
                        "AWS Services",
                        [
                            (
                                "EC2 is for?",
                                "Virtual servers",
                                "Object storage",
                                "DNS only",
                                "Database only",
                                "A"
                            ),
                            (
                                "S3 is?",
                                "Object storage",
                                "Compute",
                                "Queue",
                                "Firewall",
                                "A"
                            ),
                            (
                                "RDS provides?",
                                "Managed databases",
                                "DNS",
                                "Files only",
                                "Containers only",
                                "A"
                            ),
                            (
                                "Lambda is?",
                                "Serverless compute",
                                "Storage",
                                "Networking",
                                "Monitoring",
                                "A"
                            ),
                            (
                                "CloudFront is?",
                                "CDN",
                                "Database",
                                "VM",
                                "IAM user",
                                "A"
                            )
                        ]
                    ),

                    (
                        "Security Basics",
                        [
                            (
                                "IAM controls?",
                                "Identity and access",
                                "Images",
                                "Servers only",
                                "DNS",
                                "A"
                            ),
                            (
                                "Least privilege means?",
                                "Minimum required access",
                                "Admin for all",
                                "No passwords",
                                "Public access",
                                "A"
                            ),
                            (
                                "MFA adds?",
                                "Extra authentication factor",
                                "More storage",
                                "Faster CPU",
                                "Backup",
                                "A"
                            ),
                            (
                                "Encryption protects?",
                                "Data",
                                "Only CPU",
                                "Network speed",
                                "Billing",
                                "A"
                            ),
                            (
                                "Security groups act as?",
                                "Virtual firewall",
                                "Database",
                                "Storage",
                                "DNS",
                                "A"
                            )
                        ]
                    )
                ]
            )
        ]

        # ---------------------------------------------------------
        # INSERT QUESTIONS
        # ---------------------------------------------------------

        for course, topics in qsets:

            for topic_name, questions in topics:

                topic_id = topic_map[topic_name]

                for (
                    text,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer
                ) in questions:

                    question = Question(
                        course_id=course.id,
                        topic_id=topic_id,
                        text=text,
                        option_a=option_a,
                        option_b=option_b,
                        option_c=option_c,
                        option_d=option_d,
                        correct_answer=correct_answer
                    )

                    db.add(question)

        db.commit()

        # ---------------------------------------------------------
        # TRAINER EXPERTISE
        # ---------------------------------------------------------

        trainer_expertise = [
            (
                trainer1,
                [
                    "Variables & Data Types",
                    "Control Flow",
                    "Functions"
                ]
            ),
            (
                trainer2,
                [
                    "SELECT & Filtering",
                    "Joins",
                    "Aggregation"
                ]
            ),
            (
                trainer3,
                [
                    "Cloud Basics",
                    "AWS Services",
                    "Security Basics"
                ]
            )
        ]

        for trainer, topic_names in trainer_expertise:

            for topic_name in topic_names:

                trainer_topic = TrainerTopic(
                    trainer_id=trainer.id,
                    topic_id=topic_map[topic_name]
                )

                db.add(trainer_topic)

        # ---------------------------------------------------------
        # TRAINER AVAILABLE SLOTS
        # ---------------------------------------------------------

        trainer_slots = [
            ("10:00", "11:00"),
            ("14:00", "15:00"),
            ("17:00", "18:00")
        ]

        for trainer in [trainer1, trainer2, trainer3]:

            for start_time, end_time in trainer_slots:

                slot = TrainerSlot(
                    trainer_id=trainer.id,
                    start_time=start_time,
                    end_time=end_time
                )

                db.add(slot)

        db.commit()

        print("SkillSphere database seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
