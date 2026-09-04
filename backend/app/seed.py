from .database import Base, engine, SessionLocal
from .models import (
    User,
    Course,
    Topic,
    Question,
    TrainerTopic,
    TrainerSlot,
)


def seed():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # =========================================================
        # 1. USERS
        # =========================================================

        users_data = [
            {
                "name": "Demo Trainee",
                "email": "trainee@skillsphere.com",
                "password": "123456",
                "role": "trainee",
                "bio": "",
            },
            {
                "name": "Aarav Sharma",
                "email": "aarav@skillsphere.com",
                "password": "123456",
                "role": "trainer",
                "bio": "Python and programming mentor.",
            },
            {
                "name": "Neha Verma",
                "email": "neha@skillsphere.com",
                "password": "123456",
                "role": "trainer",
                "bio": "SQL and database mentor.",
            },
            {
                "name": "Rohan Singh",
                "email": "rohan@skillsphere.com",
                "password": "123456",
                "role": "trainer",
                "bio": "Cloud and AWS fundamentals mentor.",
            },
            {
                "name": "Admin",
                "email": "admin@skillsphere.com",
                "password": "123456",
                "role": "admin",
                "bio": "",
            },
        ]

        created_users = {}

        for data in users_data:
            user = (
                db.query(User)
                .filter(User.email == data["email"])
                .first()
            )

            if user:
                # Existing user -> update credentials/details
                user.name = data["name"]
                user.password = data["password"]
                user.role = data["role"]
                user.bio = data["bio"]
            else:
                # New user
                user = User(
                    name=data["name"],
                    email=data["email"],
                    password=data["password"],
                    role=data["role"],
                    bio=data["bio"],
                )
                db.add(user)

            db.flush()
            created_users[data["email"]] = user

        db.commit()

        trainee = created_users["trainee@skillsphere.com"]
        trainer1 = created_users["aarav@skillsphere.com"]
        trainer2 = created_users["neha@skillsphere.com"]
        trainer3 = created_users["rohan@skillsphere.com"]

        # =========================================================
        # 2. COURSES
        # =========================================================

        course_data = [
            (
                "Python Fundamentals",
                "Core Python concepts for beginners",
            ),
            (
                "SQL Fundamentals",
                "Queries, joins and database basics",
            ),
            (
                "Cloud Computing Basics",
                "Cloud and AWS fundamentals",
            ),
        ]

        courses = []

        for title, description in course_data:
            course = (
                db.query(Course)
                .filter(Course.title == title)
                .first()
            )

            if not course:
                course = Course(
                    title=title,
                    description=description,
                )
                db.add(course)
                db.flush()

            courses.append(course)

        db.commit()

        # =========================================================
        # 3. TOPICS
        # =========================================================

        topic_names = {
            courses[0].id: [
                "Variables & Data Types",
                "Control Flow",
                "Functions",
            ],
            courses[1].id: [
                "SELECT & Filtering",
                "Joins",
                "Aggregation",
            ],
            courses[2].id: [
                "Cloud Basics",
                "AWS Services",
                "Security Basics",
            ],
        }

        topic_map = {}

        for course_id, names in topic_names.items():
            for name in names:
                topic = (
                    db.query(Topic)
                    .filter(
                        Topic.course_id == course_id,
                        Topic.name == name,
                    )
                    .first()
                )

                if not topic:
                    topic = Topic(
                        course_id=course_id,
                        name=name,
                    )
                    db.add(topic)
                    db.flush()

                topic_map[name] = topic.id

        db.commit()

        # =========================================================
        # 4. QUESTIONS
        # =========================================================

        qsets = [
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
                                "C",
                            ),
                            (
                                "What is the type of 10?",
                                "str",
                                "int",
                                "float",
                                "bool",
                                "B",
                            ),
                            (
                                "Which stores key-value pairs?",
                                "List",
                                "Tuple",
                                "Dictionary",
                                "Set",
                                "C",
                            ),
                            (
                                "What does len('hello') return?",
                                "4",
                                "5",
                                "6",
                                "0",
                                "B",
                            ),
                            (
                                "Which converts text to integer?",
                                "str()",
                                "float()",
                                "int()",
                                "list()",
                                "C",
                            ),
                        ],
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
                                "B",
                            ),
                            (
                                "Which repeats over items?",
                                "if",
                                "for",
                                "class",
                                "import",
                                "B",
                            ),
                            (
                                "What does break do?",
                                "Skips one item",
                                "Ends loop",
                                "Starts loop",
                                "Defines function",
                                "B",
                            ),
                            (
                                "Which is a comparison operator?",
                                "=",
                                "==",
                                "+",
                                "//",
                                "B",
                            ),
                            (
                                "What is elif used for?",
                                "Another condition",
                                "Loop",
                                "Function",
                                "Import",
                                "A",
                            ),
                        ],
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
                                "C",
                            ),
                            (
                                "How do you return a value?",
                                "give",
                                "return",
                                "send",
                                "output",
                                "B",
                            ),
                            (
                                "Arguments are passed inside?",
                                "[]",
                                "{}",
                                "()",
                                "<>",
                                "C",
                            ),
                            (
                                "A function can return?",
                                "Only numbers",
                                "Only text",
                                "Multiple values",
                                "Nothing ever",
                                "C",
                            ),
                            (
                                "Anonymous function is commonly called?",
                                "lambda",
                                "inline",
                                "anon",
                                "quick",
                                "A",
                            ),
                        ],
                    ),
                ],
            ),
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
                                "A",
                            ),
                            (
                                "Which filters rows?",
                                "WHERE",
                                "WHEN",
                                "FILTER",
                                "HAVINGONLY",
                                "A",
                            ),
                            (
                                "Sort results with?",
                                "ORDER BY",
                                "SORT",
                                "GROUP",
                                "ARRANGE",
                                "A",
                            ),
                            (
                                "Remove duplicate rows with?",
                                "UNIQUE",
                                "DISTINCT",
                                "ONLY",
                                "DEDUP",
                                "B",
                            ),
                            (
                                "Wildcard for any characters?",
                                "_",
                                "%",
                                "*",
                                "?",
                                "B",
                            ),
                        ],
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
                                "A",
                            ),
                            (
                                "Keeps all left rows?",
                                "RIGHT JOIN",
                                "LEFT JOIN",
                                "INNER JOIN",
                                "CROSS JOIN",
                                "B",
                            ),
                            (
                                "Cartesian product is?",
                                "INNER",
                                "LEFT",
                                "CROSS",
                                "RIGHT",
                                "C",
                            ),
                            (
                                "Join condition commonly uses?",
                                "ON",
                                "AT",
                                "WITH",
                                "BY",
                                "A",
                            ),
                            (
                                "A table can be joined to itself using?",
                                "SELF JOIN",
                                "DOUBLE JOIN",
                                "LOOP JOIN",
                                "REPEAT",
                                "A",
                            ),
                        ],
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
                                "B",
                            ),
                            (
                                "Average uses?",
                                "AVG",
                                "MEAN",
                                "AVERAGE",
                                "MID",
                                "A",
                            ),
                            (
                                "Groups rows with?",
                                "GROUP BY",
                                "ORDER BY",
                                "COLLECT",
                                "PACK",
                                "A",
                            ),
                            (
                                "Filters groups with?",
                                "WHERE",
                                "HAVING",
                                "GROUPFILTER",
                                "AFTER",
                                "B",
                            ),
                            (
                                "Largest value with?",
                                "MAX",
                                "TOP",
                                "HIGH",
                                "LARGE",
                                "A",
                            ),
                        ],
                    ),
                ],
            ),
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
                                "A",
                            ),
                            (
                                "Pay-as-you-go means?",
                                "Fixed yearly only",
                                "Pay for usage",
                                "Free forever",
                                "One-time payment",
                                "B",
                            ),
                            (
                                "IaaS provides?",
                                "Infrastructure",
                                "Only software",
                                "Only data",
                                "Emails",
                                "A",
                            ),
                            (
                                "Scalability means?",
                                "Adjust capacity",
                                "Delete data",
                                "Encrypt password",
                                "Write code",
                                "A",
                            ),
                            (
                                "Public cloud is?",
                                "Shared provider infrastructure",
                                "Your laptop",
                                "Offline server",
                                "USB drive",
                                "A",
                            ),
                        ],
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
                                "A",
                            ),
                            (
                                "S3 is?",
                                "Object storage",
                                "Compute",
                                "Queue",
                                "Firewall",
                                "A",
                            ),
                            (
                                "RDS provides?",
                                "Managed databases",
                                "DNS",
                                "Files only",
                                "Containers only",
                                "A",
                            ),
                            (
                                "Lambda is?",
                                "Serverless compute",
                                "Storage",
                                "Networking",
                                "Monitoring",
                                "A",
                            ),
                            (
                                "CloudFront is?",
                                "CDN",
                                "Database",
                                "VM",
                                "IAM user",
                                "A",
                            ),
                        ],
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
                                "A",
                            ),
                            (
                                "Least privilege means?",
                                "Minimum required access",
                                "Admin for all",
                                "No passwords",
                                "Public access",
                                "A",
                            ),
                            (
                                "MFA adds?",
                                "Extra authentication factor",
                                "More storage",
                                "Faster CPU",
                                "Backup",
                                "A",
                            ),
                            (
                                "Encryption protects?",
                                "Data",
                                "Only CPU",
                                "Network speed",
                                "Billing",
                                "A",
                            ),
                            (
                                "Security groups act as?",
                                "Virtual firewall",
                                "Database",
                                "Storage",
                                "DNS",
                                "A",
                            ),
                        ],
                    ),
                ],
            ),
        ]

        # Only add questions if the course doesn't already have them.
        # This prevents duplicate questions every Render restart.
        for course, topics in qsets:
            existing_count = (
                db.query(Question)
                .filter(Question.course_id == course.id)
                .count()
            )

            if existing_count == 0:
                for topic_name, questions in topics:
                    topic_id = topic_map[topic_name]

                    for (
                        text,
                        option_a,
                        option_b,
                        option_c,
                        option_d,
                        correct_answer,
                    ) in questions:
                        db.add(
                            Question(
                                course_id=course.id,
                                topic_id=topic_id,
                                text=text,
                                option_a=option_a,
                                option_b=option_b,
                                option_c=option_c,
                                option_d=option_d,
                                correct_answer=correct_answer,
                            )
                        )

        db.commit()

        # =========================================================
        # 5. TRAINER EXPERTISE
        # =========================================================

        trainer_topics = [
            (
                trainer1,
                [
                    "Variables & Data Types",
                    "Control Flow",
                    "Functions",
                ],
            ),
            (
                trainer2,
                [
                    "SELECT & Filtering",
                    "Joins",
                    "Aggregation",
                ],
            ),
            (
                trainer3,
                [
                    "Cloud Basics",
                    "AWS Services",
                    "Security Basics",
                ],
            ),
        ]

        for trainer, topic_list in trainer_topics:
            for topic_name in topic_list:
                topic_id = topic_map[topic_name]

                exists = (
                    db.query(TrainerTopic)
                    .filter(
                        TrainerTopic.trainer_id == trainer.id,
                        TrainerTopic.topic_id == topic_id,
                    )
                    .first()
                )

                if not exists:
                    db.add(
                        TrainerTopic(
                            trainer_id=trainer.id,
                            topic_id=topic_id,
                        )
                    )

        db.commit()

        # =========================================================
        # 6. TRAINER SLOTS
        # =========================================================

        slot_times = [
            ("10:00", "11:00"),
            ("14:00", "15:00"),
            ("17:00", "18:00"),
        ]

        for trainer in [trainer1, trainer2, trainer3]:
            for start_time, end_time in slot_times:
                exists = (
                    db.query(TrainerSlot)
                    .filter(
                        TrainerSlot.trainer_id == trainer.id,
                        TrainerSlot.start_time == start_time,
                        TrainerSlot.end_time == end_time,
                    )
                    .first()
                )

                if not exists:
                    db.add(
                        TrainerSlot(
                            trainer_id=trainer.id,
                            start_time=start_time,
                            end_time=end_time,
                            available=True,
                        )
                    )

        db.commit()

        print("==========================================")
        print("SkillSphere seed completed successfully")
        print("Demo Trainee: trainee@skillsphere.com / 123456")
        print("Aarav:        aarav@skillsphere.com / 123456")
        print("Neha:         neha@skillsphere.com / 123456")
        print("Rohan:        rohan@skillsphere.com / 123456")
        print("Admin:        admin@skillsphere.com / 123456")
        print("==========================================")

    except Exception as e:
        db.rollback()
        print("SEED ERROR:", e)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()
