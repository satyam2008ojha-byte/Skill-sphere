from .database import SessionLocal, engine, Base
from .models import (
    User,
    Course,
    Topic,
    Question,
    TrainerTopic,
    TrainerSlot,
)


def get_or_create_course(db, title, description):
    course = db.query(Course).filter(Course.title == title).first()

    if not course:
        course = Course(
            title=title,
            description=description,
        )
        db.add(course)
        db.commit()
        db.refresh(course)

    return course


def get_or_create_topic(db, course_id, name):
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
        db.commit()
        db.refresh(topic)

    return topic


def add_question(
    db,
    course_id,
    topic_id,
    text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
):
    existing = (
        db.query(Question)
        .filter(
            Question.course_id == course_id,
            Question.text == text,
        )
        .first()
    )

    if existing:
        return existing

    question = Question(
        course_id=course_id,
        topic_id=topic_id,
        text=text,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        correct_answer=correct_answer,
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question


def add_trainer_topic(db, trainer_id, topic_id):
    existing = (
        db.query(TrainerTopic)
        .filter(
            TrainerTopic.trainer_id == trainer_id,
            TrainerTopic.topic_id == topic_id,
        )
        .first()
    )

    if not existing:
        db.add(
            TrainerTopic(
                trainer_id=trainer_id,
                topic_id=topic_id,
            )
        )
        db.commit()


def add_slot(db, trainer_id, start_time, end_time):
    existing = (
        db.query(TrainerSlot)
        .filter(
            TrainerSlot.trainer_id == trainer_id,
            TrainerSlot.start_time == start_time,
            TrainerSlot.end_time == end_time,
        )
        .first()
    )

    if not existing:
        db.add(
            TrainerSlot(
                trainer_id=trainer_id,
                start_time=start_time,
                end_time=end_time,
                available=True,
            )
        )
        db.commit()


def seed_database():

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:

        # =========================================================
        # COURSES
        # =========================================================

        python_course = get_or_create_course(
            db,
            "Python",
            "Learn Python programming from basics to practical development.",
        )

        cyber_course = get_or_create_course(
            db,
            "Cyber Security",
            "Learn cybersecurity fundamentals, networking, authentication and web security.",
        )

        database_course = get_or_create_course(
            db,
            "Database",
            "Learn DBMS, SQL, keys, normalization, indexes and transactions.",
        )

        # =========================================================
        # PYTHON TOPICS
        # =========================================================

        python_basics = get_or_create_topic(
            db,
            python_course.id,
            "Python Basics",
        )

        python_datatypes = get_or_create_topic(
            db,
            python_course.id,
            "Data Types",
        )

        python_control = get_or_create_topic(
            db,
            python_course.id,
            "Control Flow",
        )

        python_functions = get_or_create_topic(
            db,
            python_course.id,
            "Functions & OOP",
        )

        python_files = get_or_create_topic(
            db,
            python_course.id,
            "Modules & File Handling",
        )

        # =========================================================
        # PYTHON MCQs - 15
        # =========================================================

        add_question(
            db,
            python_course.id,
            python_basics.id,
            "Which keyword is used to define a function in Python?",
            "function",
            "def",
            "fun",
            "define",
            "B",
        )

        add_question(
            db,
            python_course.id,
            python_basics.id,
            "Which symbol is used for a single-line comment in Python?",
            "//",
            "/*",
            "#",
            "--",
            "C",
        )

        add_question(
            db,
            python_course.id,
            python_basics.id,
            "Which of the following is used to display output in Python?",
            "display()",
            "echo()",
            "print()",
            "output()",
            "C",
        )

        add_question(
            db,
            python_course.id,
            python_datatypes.id,
            "Which data type stores True or False values?",
            "int",
            "bool",
            "str",
            "float",
            "B",
        )

        add_question(
            db,
            python_course.id,
            python_datatypes.id,
            "Which collection is ordered and mutable?",
            "Tuple",
            "Set",
            "List",
            "String",
            "C",
        )

        add_question(
            db,
            python_course.id,
            python_datatypes.id,
            "Which data type is immutable?",
            "List",
            "Dictionary",
            "Set",
            "Tuple",
            "D",
        )

        add_question(
            db,
            python_course.id,
            python_control.id,
            "Which keyword is used for a conditional statement?",
            "if",
            "when",
            "condition",
            "check",
            "A",
        )

        add_question(
            db,
            python_course.id,
            python_control.id,
            "Which loop is commonly used when the number of iterations is known?",
            "while",
            "for",
            "do-while",
            "repeat",
            "B",
        )

        add_question(
            db,
            python_course.id,
            python_control.id,
            "Which keyword immediately stops a loop?",
            "stop",
            "exit",
            "break",
            "return",
            "C",
        )

        add_question(
            db,
            python_course.id,
            python_functions.id,
            "Which keyword is used to create a class?",
            "object",
            "class",
            "struct",
            "create",
            "B",
        )

        add_question(
            db,
            python_course.id,
            python_functions.id,
            "Which method is automatically called when an object is created?",
            "__start__()",
            "__newobject__()",
            "__init__()",
            "constructor()",
            "C",
        )

        add_question(
            db,
            python_course.id,
            python_functions.id,
            "What does OOP stand for?",
            "Object Oriented Programming",
            "Object Ordered Program",
            "Open Object Programming",
            "Online Object Process",
            "A",
        )

        add_question(
            db,
            python_course.id,
            python_files.id,
            "Which keyword is used to import a module?",
            "include",
            "using",
            "import",
            "require",
            "C",
        )

        add_question(
            db,
            python_course.id,
            python_files.id,
            "Which function is used to open a file?",
            "file()",
            "open()",
            "read()",
            "load()",
            "B",
        )

        add_question(
            db,
            python_course.id,
            python_files.id,
            "Which mode is used to append data to a file?",
            "r",
            "w",
            "a",
            "x",
            "C",
        )

        # =========================================================
        # CYBER SECURITY TOPICS
        # =========================================================

        cyber_fundamentals = get_or_create_topic(
            db,
            cyber_course.id,
            "Security Fundamentals",
        )

        network_security = get_or_create_topic(
            db,
            cyber_course.id,
            "Network Security",
        )

        authentication = get_or_create_topic(
            db,
            cyber_course.id,
            "Authentication & Access",
        )

        web_security = get_or_create_topic(
            db,
            cyber_course.id,
            "Web Security",
        )

        threats = get_or_create_topic(
            db,
            cyber_course.id,
            "Threats & Protection",
        )

        # =========================================================
        # CYBER MCQs - 15
        # =========================================================

        add_question(
            db,
            cyber_course.id,
            cyber_fundamentals.id,
            "What does CIA stand for in cybersecurity?",
            "Confidentiality, Integrity, Availability",
            "Control, Internet, Access",
            "Cyber, Information, Authentication",
            "Confidentiality, Internet, Authorization",
            "A",
        )

        add_question(
            db,
            cyber_course.id,
            cyber_fundamentals.id,
            "What is the main goal of cybersecurity?",
            "Increase internet speed",
            "Protect systems and data",
            "Create websites",
            "Increase storage",
            "B",
        )

        add_question(
            db,
            cyber_course.id,
            cyber_fundamentals.id,
            "What is encryption?",
            "Deleting information",
            "Converting data into protected form",
            "Compressing files",
            "Copying data",
            "B",
        )

        add_question(
            db,
            cyber_course.id,
            network_security.id,
            "Which device commonly filters network traffic?",
            "Monitor",
            "Keyboard",
            "Firewall",
            "Printer",
            "C",
        )

        add_question(
            db,
            cyber_course.id,
            network_security.id,
            "What does VPN stand for?",
            "Virtual Private Network",
            "Verified Public Network",
            "Virtual Protected Node",
            "Verified Private Node",
            "A",
        )

        add_question(
            db,
            cyber_course.id,
            network_security.id,
            "Which protocol is commonly used for secure web communication?",
            "HTTP",
            "FTP",
            "HTTPS",
            "SMTP",
            "C",
        )

        add_question(
            db,
            cyber_course.id,
            authentication.id,
            "What is authentication?",
            "Checking user identity",
            "Deleting a user",
            "Creating a network",
            "Encrypting a hard disk",
            "A",
        )

        add_question(
            db,
            cyber_course.id,
            authentication.id,
            "Which is an example of multi-factor authentication?",
            "Only password",
            "Password + OTP",
            "Only username",
            "Only email",
            "B",
        )

        add_question(
            db,
            cyber_course.id,
            authentication.id,
            "What does authorization determine?",
            "Who the user is",
            "What the user is allowed to access",
            "User's password",
            "Internet speed",
            "B",
        )

        add_question(
            db,
            cyber_course.id,
            web_security.id,
            "Which attack injects malicious SQL into an application?",
            "DDoS",
            "SQL Injection",
            "Phishing",
            "Brute Force",
            "B",
        )

        add_question(
            db,
            cyber_course.id,
            web_security.id,
            "What does XSS stand for?",
            "Cross Site Scripting",
            "Extra Secure System",
            "XML Security Service",
            "Cross Server Security",
            "A",
        )

        add_question(
            db,
            cyber_course.id,
            web_security.id,
            "Which practice helps protect web applications?",
            "Input validation",
            "Using weak passwords",
            "Disabling authentication",
            "Sharing admin credentials",
            "A",
        )

        add_question(
            db,
            cyber_course.id,
            threats.id,
            "What is phishing?",
            "A type of hardware",
            "A social engineering attack",
            "A database",
            "A programming language",
            "B",
        )

        add_question(
            db,
            cyber_course.id,
            threats.id,
            "What is malware?",
            "Malicious software",
            "A secure network",
            "A backup system",
            "A firewall",
            "A",
        )

        add_question(
            db,
            cyber_course.id,
            threats.id,
            "Which is a good security practice?",
            "Use the same password everywhere",
            "Ignore software updates",
            "Use strong unique passwords",
            "Share OTPs",
            "C",
        )

        # =========================================================
        # DATABASE TOPICS
        # =========================================================

        dbms_basics = get_or_create_topic(
            db,
            database_course.id,
            "DBMS Basics",
        )

        sql_queries = get_or_create_topic(
            db,
            database_course.id,
            "SQL Queries",
        )

        keys_relationships = get_or_create_topic(
            db,
            database_course.id,
            "Keys & Relationships",
        )

        normalization = get_or_create_topic(
            db,
            database_course.id,
            "Normalization & Indexes",
        )

        transactions = get_or_create_topic(
            db,
            database_course.id,
            "Transactions",
        )

        # =========================================================
        # DATABASE MCQs - 15
        # =========================================================

        add_question(
            db,
            database_course.id,
            dbms_basics.id,
            "What does DBMS stand for?",
            "Database Management System",
            "Data Backup Management System",
            "Database Memory System",
            "Digital Base Management Service",
            "A",
        )

        add_question(
            db,
            database_course.id,
            dbms_basics.id,
            "Which is an example of a relational database?",
            "MySQL",
            "Photoshop",
            "Linux",
            "Chrome",
            "A",
        )

        add_question(
            db,
            database_course.id,
            dbms_basics.id,
            "What is a table used for?",
            "Store structured data",
            "Run an operating system",
            "Create hardware",
            "Send emails only",
            "A",
        )

        add_question(
            db,
            database_course.id,
            sql_queries.id,
            "Which SQL command is used to retrieve data?",
            "GET",
            "SELECT",
            "FETCHDATA",
            "READ",
            "B",
        )

        add_question(
            db,
            database_course.id,
            sql_queries.id,
            "Which SQL command is used to add a new row?",
            "INSERT",
            "ADDROW",
            "CREATE",
            "UPDATE",
            "A",
        )

        add_question(
            db,
            database_course.id,
            sql_queries.id,
            "Which SQL command modifies existing data?",
            "CHANGE",
            "MODIFY",
            "UPDATE",
            "ALTERDATA",
            "C",
        )

        add_question(
            db,
            database_course.id,
            keys_relationships.id,
            "What uniquely identifies a row in a table?",
            "Foreign Key",
            "Primary Key",
            "Index",
            "Column",
            "B",
        )

        add_question(
            db,
            database_course.id,
            keys_relationships.id,
            "A foreign key usually references which key?",
            "Primary Key",
            "Candidate Password",
            "Index Key",
            "Secondary Password",
            "A",
        )

        add_question(
            db,
            database_course.id,
            keys_relationships.id,
            "Which relationship connects one record to many records?",
            "One-to-One",
            "Many-to-Many",
            "One-to-Many",
            "None",
            "C",
        )

        add_question(
            db,
            database_course.id,
            normalization.id,
            "What is the main purpose of normalization?",
            "Increase data redundancy",
            "Reduce data redundancy",
            "Delete databases",
            "Increase file size",
            "B",
        )

        add_question(
            db,
            database_course.id,
            normalization.id,
            "Which normal form removes repeating groups?",
            "1NF",
            "2NF",
            "3NF",
            "BCNF",
            "A",
        )

        add_question(
            db,
            database_course.id,
            normalization.id,
            "What is an index mainly used for?",
            "Speed up data retrieval",
            "Delete rows",
            "Encrypt passwords",
            "Create backups",
            "A",
        )

        add_question(
            db,
            database_course.id,
            transactions.id,
            "What does ACID relate to?",
            "Database transactions",
            "Network cables",
            "Programming syntax",
            "Web design",
            "A",
        )

        add_question(
            db,
            database_course.id,
            transactions.id,
            "What does COMMIT do?",
            "Saves transaction changes",
            "Deletes database",
            "Creates a user",
            "Stops the server",
            "A",
        )

        add_question(
            db,
            database_course.id,
            transactions.id,
            "Which command cancels uncommitted changes?",
            "SAVE",
            "ROLLBACK",
            "UNDOALL",
            "CANCELDB",
            "B",
        )

        # =========================================================
        # DEMO TRAINERS
        # =========================================================

        trainers = [
            {
                "name": "Rahul Sharma",
                "email": "rahul.trainer@skillsphere.demo",
                "password": "123456",
                "bio": "Python Programming & Basics Trainer",
            },
            {
                "name": "Amit Verma",
                "email": "amit.trainer@skillsphere.demo",
                "password": "123456",
                "bio": "Python OOP & File Handling Trainer",
            },
            {
                "name": "Neha Gupta",
                "email": "neha.trainer@skillsphere.demo",
                "password": "123456",
                "bio": "Cyber Security & Web Security Trainer",
            },
            {
                "name": "Arjun Kumar",
                "email": "arjun.trainer@skillsphere.demo",
                "password": "123456",
                "bio": "Network Security & Authentication Trainer",
            },
            {
                "name": "Rohit Mehta",
                "email": "rohit.trainer@skillsphere.demo",
                "password": "123456",
                "bio": "Database, SQL & DBMS Trainer",
            },
        ]

        trainer_users = []

        for trainer_data in trainers:

            trainer = (
                db.query(User)
                .filter(User.email == trainer_data["email"])
                .first()
            )

            if not trainer:
                trainer = User(
                    name=trainer_data["name"],
                    email=trainer_data["email"],
                    password=trainer_data["password"],
                    role="trainer",
                    bio=trainer_data["bio"],
                )

                db.add(trainer)
                db.commit()
                db.refresh(trainer)

            trainer_users.append(trainer)

        # =========================================================
        # TRAINER → TOPIC MAPPING
        # =========================================================

        rahul = trainer_users[0]
        amit = trainer_users[1]
        neha = trainer_users[2]
        arjun = trainer_users[3]
        rohit = trainer_users[4]

        # Python
        for topic in [
            python_basics,
            python_datatypes,
            python_control,
        ]:
            add_trainer_topic(db, rahul.id, topic.id)

        for topic in [
            python_functions,
            python_files,
        ]:
            add_trainer_topic(db, amit.id, topic.id)

        # Cyber Security
        add_trainer_topic(
            db,
            neha.id,
            cyber_fundamentals.id,
        )

        add_trainer_topic(
            db,
            neha.id,
            web_security.id,
        )

        add_trainer_topic(
            db,
            neha.id,
            threats.id,
        )

        add_trainer_topic(
            db,
            arjun.id,
            network_security.id,
        )

        add_trainer_topic(
            db,
            arjun.id,
            authentication.id,
        )

        # Database
        add_trainer_topic(
            db,
            rohit.id,
            dbms_basics.id,
        )

        add_trainer_topic(
            db,
            rohit.id,
            sql_queries.id,
        )

        add_trainer_topic(
            db,
            rohit.id,
            keys_relationships.id,
        )

        add_trainer_topic(
            db,
            rohit.id,
            normalization.id,
        )

        add_trainer_topic(
            db,
            rohit.id,
            transactions.id,
        )

        # =========================================================
        # DEMO TRAINER SLOTS
        # =========================================================

        # Rahul
        add_slot(db, rahul.id, "10:00 AM", "11:00 AM")
        add_slot(db, rahul.id, "02:00 PM", "03:00 PM")
        add_slot(db, rahul.id, "05:00 PM", "06:00 PM")

        # Amit
        add_slot(db, amit.id, "11:00 AM", "12:00 PM")
        add_slot(db, amit.id, "03:00 PM", "04:00 PM")
        add_slot(db, amit.id, "06:00 PM", "07:00 PM")

        # Neha
        add_slot(db, neha.id, "09:00 AM", "10:00 AM")
        add_slot(db, neha.id, "01:00 PM", "02:00 PM")
        add_slot(db, neha.id, "04:00 PM", "05:00 PM")

        # Arjun
        add_slot(db, arjun.id, "10:00 AM", "11:00 AM")
        add_slot(db, arjun.id, "02:00 PM", "03:00 PM")
        add_slot(db, arjun.id, "05:00 PM", "06:00 PM")

        # Rohit
        add_slot(db, rohit.id, "11:00 AM", "12:00 PM")
        add_slot(db, rohit.id, "03:00 PM", "04:00 PM")
        add_slot(db, rohit.id, "06:00 PM", "07:00 PM")

        print("======================================")
        print("SkillSphere database seeded successfully")
        print("Courses : 3")
        print("MCQs    : 45")
        print("Trainers: 5")
        print("======================================")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
