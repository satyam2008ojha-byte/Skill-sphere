from .database import SessionLocal, engine, Base
from .models import (
    User,
    Course,
    Topic,
    Question,
    TrainerTopic,
    TrainerSlot,
)


# ============================================================
# DATABASE SETUP
# ============================================================

Base.metadata.create_all(bind=engine)

db = SessionLocal()


# ============================================================
# HELPER
# ============================================================

def add_question(
    course_id,
    topic_id,
    text,
    a,
    b,
    c,
    d,
    correct
):
    question = Question(
        course_id=course_id,
        topic_id=topic_id,
        text=text,
        option_a=a,
        option_b=b,
        option_c=c,
        option_d=d,
        correct_answer=correct,
    )

    db.add(question)


# ============================================================
# CLEAR OLD SEED DATA
# ============================================================

demo_emails = [
    "python.trainer@skillsphere.com",
    "sql.trainer@skillsphere.com",
    "cloud.trainer@skillsphere.com",
]

for email in demo_emails:

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user:
        db.delete(user)

db.commit()


# ============================================================
# COURSES
# ============================================================

courses_data = [
    {
        "title": "Python Programming",
        "description": "Learn Python programming from basics to functions and problem solving."
    },
    {
        "title": "SQL & Database",
        "description": "Learn SQL queries, database concepts and relational database fundamentals."
    },
    {
        "title": "Cloud Computing",
        "description": "Learn cloud fundamentals, AWS concepts and cloud architecture."
    },
]


courses = {}

for course_data in courses_data:

    course = db.query(Course).filter(
        Course.title == course_data["title"]
    ).first()

    if not course:

        course = Course(
            title=course_data["title"],
            description=course_data["description"],
        )

        db.add(course)
        db.commit()
        db.refresh(course)

    courses[course.title] = course


# ============================================================
# TOPICS
# ============================================================

topics_data = {

    "Python Programming": [
        "Python Basics",
        "Loops & Control Flow",
        "Functions & OOP",
    ],

    "SQL & Database": [
        "SQL Basics",
        "Queries & Joins",
        "Database Design",
    ],

    "Cloud Computing": [
        "Cloud Fundamentals",
        "AWS Services",
        "Cloud Security",
    ],
}


topics = {}


for course_name, topic_names in topics_data.items():

    course = courses[course_name]

    for topic_name in topic_names:

        topic = db.query(Topic).filter(
            Topic.course_id == course.id,
            Topic.name == topic_name
        ).first()

        if not topic:

            topic = Topic(
                course_id=course.id,
                name=topic_name,
            )

            db.add(topic)
            db.commit()
            db.refresh(topic)

        topics[topic_name] = topic


# ============================================================
# PYTHON - 15 QUESTIONS
# ============================================================

python_course = courses["Python Programming"]

python_topics = [
    topics["Python Basics"],
    topics["Loops & Control Flow"],
    topics["Functions & OOP"],
]


python_questions = [

    # -------------------------
    # PYTHON BASICS
    # -------------------------

    (
        python_topics[0],
        "Which symbol is used to create a list in Python?",
        "[]",
        "()",
        "{}",
        "<>",
        "[]"
    ),

    (
        python_topics[0],
        "Which keyword is used to define a function in Python?",
        "function",
        "def",
        "fun",
        "define",
        "def"
    ),

    (
        python_topics[0],
        "Which of the following is a Python boolean value?",
        "TRUE",
        "Yes",
        "True",
        "1",
        "True"
    ),

    (
        python_topics[0],
        "Which function is used to display output in Python?",
        "display()",
        "show()",
        "print()",
        "output()",
        "print()"
    ),

    (
        python_topics[0],
        "Which data type stores key-value pairs?",
        "List",
        "Tuple",
        "Dictionary",
        "Set",
        "Dictionary"
    ),

    # -------------------------
    # LOOPS
    # -------------------------

    (
        python_topics[1],
        "Which loop is commonly used to iterate over a sequence?",
        "for",
        "switch",
        "goto",
        "case",
        "for"
    ),

    (
        python_topics[1],
        "Which keyword stops a loop immediately?",
        "stop",
        "break",
        "exitloop",
        "end",
        "break"
    ),

    (
        python_topics[1],
        "Which keyword skips the current iteration?",
        "skip",
        "continue",
        "passloop",
        "next",
        "continue"
    ),

    (
        python_topics[1],
        "What does range(5) generate?",
        "1 to 5",
        "0 to 4",
        "0 to 5",
        "5 to 10",
        "0 to 4"
    ),

    (
        python_topics[1],
        "Which statement is used for conditional execution?",
        "loop",
        "if",
        "define",
        "import",
        "if"
    ),

    # -------------------------
    # FUNCTIONS / OOP
    # -------------------------

    (
        python_topics[2],
        "Which keyword is used to return a value from a function?",
        "send",
        "return",
        "output",
        "value",
        "return"
    ),

    (
        python_topics[2],
        "What is a class in Python?",
        "A loop",
        "A blueprint for objects",
        "A variable",
        "A package",
        "A blueprint for objects"
    ),

    (
        python_topics[2],
        "Which method is commonly used as a constructor in Python classes?",
        "__init__",
        "__start__",
        "constructor",
        "__main__",
        "__init__"
    ),

    (
        python_topics[2],
        "What does OOP stand for?",
        "Object Oriented Programming",
        "Object Output Program",
        "Online Object Processing",
        "Open Object Programming",
        "Object Oriented Programming"
    ),

    (
        python_topics[2],
        "Which concept allows a class to acquire properties of another class?",
        "Encapsulation",
        "Inheritance",
        "Compilation",
        "Iteration",
        "Inheritance"
    ),
]


for item in python_questions:

    topic, text, a, b, c, d, correct = item

    existing = db.query(Question).filter(
        Question.course_id == python_course.id,
        Question.text == text
    ).first()

    if not existing:

        add_question(
            python_course.id,
            topic.id,
            text,
            a,
            b,
            c,
            d,
            correct
        )


# ============================================================
# SQL - 15 QUESTIONS
# ============================================================

sql_course = courses["SQL & Database"]

sql_topics = [
    topics["SQL Basics"],
    topics["Queries & Joins"],
    topics["Database Design"],
]


sql_questions = [

    # -------------------------
    # SQL BASICS
    # -------------------------

    (
        sql_topics[0],
        "What does SQL stand for?",
        "Structured Query Language",
        "Simple Query Language",
        "System Query Language",
        "Sequential Query Language",
        "Structured Query Language"
    ),

    (
        sql_topics[0],
        "Which command is used to retrieve data?",
        "GET",
        "SELECT",
        "FETCH",
        "READ",
        "SELECT"
    ),

    (
        sql_topics[0],
        "Which command is used to add new records?",
        "ADD",
        "INSERT",
        "CREATE",
        "PUT",
        "INSERT"
    ),

    (
        sql_topics[0],
        "Which command removes a table completely?",
        "REMOVE",
        "DELETE",
        "DROP",
        "CLEAR",
        "DROP"
    ),

    (
        sql_topics[0],
        "Which clause filters records?",
        "FILTER",
        "WHERE",
        "CHECK",
        "SEARCH",
        "WHERE"
    ),

    # -------------------------
    # QUERIES / JOINS
    # -------------------------

    (
        sql_topics[1],
        "Which JOIN returns matching rows from both tables?",
        "INNER JOIN",
        "LEFT JOIN",
        "RIGHT JOIN",
        "FULL JOIN",
        "INNER JOIN"
    ),

    (
        sql_topics[1],
        "Which keyword removes duplicate results?",
        "UNIQUE",
        "DISTINCT",
        "REMOVE",
        "DIFFERENT",
        "DISTINCT"
    ),

    (
        sql_topics[1],
        "Which clause is used to sort results?",
        "SORT BY",
        "ORDER BY",
        "GROUP BY",
        "ARRANGE",
        "ORDER BY"
    ),

    (
        sql_topics[1],
        "Which clause groups rows with the same values?",
        "GROUP BY",
        "ORDER BY",
        "COMBINE",
        "MERGE",
        "GROUP BY"
    ),

    (
        sql_topics[1],
        "Which function counts rows?",
        "SUM()",
        "COUNT()",
        "TOTAL()",
        "NUMBER()",
        "COUNT()"
    ),

    # -------------------------
    # DATABASE DESIGN
    # -------------------------

    (
        sql_topics[2],
        "What uniquely identifies a row?",
        "Foreign Key",
        "Primary Key",
        "Index",
        "Column",
        "Primary Key"
    ),

    (
        sql_topics[2],
        "A foreign key usually references what?",
        "Another table's primary key",
        "A database",
        "A query",
        "A view",
        "Another table's primary key"
    ),

    (
        sql_topics[2],
        "Which normal form removes repeating groups?",
        "1NF",
        "2NF",
        "3NF",
        "BCNF",
        "1NF"
    ),

    (
        sql_topics[2],
        "What is a database table made up of?",
        "Only rows",
        "Only columns",
        "Rows and columns",
        "Queries",
        "Rows and columns"
    ),

    (
        sql_topics[2],
        "What is an index mainly used for?",
        "Improving query performance",
        "Deleting records",
        "Creating users",
        "Backing up database",
        "Improving query performance"
    ),
]


for item in sql_questions:

    topic, text, a, b, c, d, correct = item

    existing = db.query(Question).filter(
        Question.course_id == sql_course.id,
        Question.text == text
    ).first()

    if not existing:

        add_question(
            sql_course.id,
            topic.id,
            text,
            a,
            b,
            c,
            d,
            correct
        )


# ============================================================
# CLOUD - 15 QUESTIONS
# ============================================================

cloud_course = courses["Cloud Computing"]

cloud_topics = [
    topics["Cloud Fundamentals"],
    topics["AWS Services"],
    topics["Cloud Security"],
]


cloud_questions = [

    # -------------------------
    # CLOUD FUNDAMENTALS
    # -------------------------

    (
        cloud_topics[0],
        "What is cloud computing?",
        "Using only local computers",
        "Delivering computing resources over the internet",
        "Using a private USB",
        "Offline computing",
        "Delivering computing resources over the internet"
    ),

    (
        cloud_topics[0],
        "Which model provides virtual machines?",
        "IaaS",
        "SaaS",
        "PaaS",
        "DBaaS",
        "IaaS"
    ),

    (
        cloud_topics[0],
        "Which model provides a platform for developers?",
        "IaaS",
        "PaaS",
        "SaaS",
        "LAN",
        "PaaS"
    ),

    (
        cloud_topics[0],
        "Which model provides ready-to-use software?",
        "IaaS",
        "PaaS",
        "SaaS",
        "FaaS",
        "SaaS"
    ),

    (
        cloud_topics[0],
        "What does scalability mean?",
        "Ability to increase or decrease resources",
        "Deleting servers",
        "Changing passwords",
        "Creating databases",
        "Ability to increase or decrease resources"
    ),

    # -------------------------
    # AWS
    # -------------------------

    (
        cloud_topics[1],
        "What is Amazon EC2 used for?",
        "Virtual servers",
        "Email only",
        "DNS only",
        "Video editing",
        "Virtual servers"
    ),

    (
        cloud_topics[1],
        "What is Amazon S3 mainly used for?",
        "Object storage",
        "Database queries",
        "Virtual machines",
        "Authentication only",
        "Object storage"
    ),

    (
        cloud_topics[1],
        "What is AWS Lambda?",
        "Serverless compute service",
        "Database",
        "Storage device",
        "Networking cable",
        "Serverless compute service"
    ),

    (
        cloud_topics[1],
        "Which AWS service is commonly used for DNS?",
        "Route 53",
        "EC2",
        "S3",
        "Lambda",
        "Route 53"
    ),

    (
        cloud_topics[1],
        "What does RDS provide?",
        "Managed relational databases",
        "Object storage",
        "DNS",
        "Serverless functions",
        "Managed relational databases"
    ),

    # -------------------------
    # SECURITY
    # -------------------------

    (
        cloud_topics[2],
        "What does IAM stand for in AWS?",
        "Identity and Access Management",
        "Internet Access Manager",
        "Internal Account Management",
        "Identity Application Module",
        "Identity and Access Management"
    ),

    (
        cloud_topics[2],
        "What should be used to protect sensitive data?",
        "Encryption",
        "Public sharing",
        "Plain text",
        "No password",
        "Encryption"
    ),

    (
        cloud_topics[2],
        "Which principle gives users only required permissions?",
        "Maximum access",
        "Least privilege",
        "Public access",
        "Open access",
        "Least privilege"
    ),

    (
        cloud_topics[2],
        "What is MFA?",
        "Multi-Factor Authentication",
        "Multiple File Access",
        "Managed File Authentication",
        "Multi Firewall Access",
        "Multi-Factor Authentication"
    ),

    (
        cloud_topics[2],
        "Why are backups important?",
        "To recover data after loss",
        "To slow down servers",
        "To delete data",
        "To expose passwords",
        "To recover data after loss"
    ),
]


for item in cloud_questions:

    topic, text, a, b, c, d, correct = item

    existing = db.query(Question).filter(
        Question.course_id == cloud_course.id,
        Question.text == text
    ).first()

    if not existing:

        add_question(
            cloud_course.id,
            topic.id,
            text,
            a,
            b,
            c,
            d,
            correct
        )


db.commit()


# ============================================================
# TRAINERS
# ============================================================

trainer_data = [

    {
        "name": "Aarav Sharma",
        "email": "python.trainer@skillsphere.com",
        "password": "trainer123",
        "bio": (
            "Python trainer specializing in programming fundamentals, "
            "loops, functions and object-oriented programming."
        ),
        "topics": [
            "Python Basics",
            "Loops & Control Flow",
            "Functions & OOP",
        ],
        "slots": [
            ("10:00 AM", "11:00 AM"),
            ("04:00 PM", "05:00 PM"),
            ("07:00 PM", "08:00 PM"),
        ],
    },

    {
        "name": "Neha Verma",
        "email": "sql.trainer@skillsphere.com",
        "password": "trainer123",
        "bio": (
            "SQL and database trainer specializing in queries, joins, "
            "database design and relational database concepts."
        ),
        "topics": [
            "SQL Basics",
            "Queries & Joins",
            "Database Design",
        ],
        "slots": [
            ("11:00 AM", "12:00 PM"),
            ("03:00 PM", "04:00 PM"),
            ("06:00 PM", "07:00 PM"),
        ],
    },

    {
        "name": "Rohan Mehta",
        "email": "cloud.trainer@skillsphere.com",
        "password": "trainer123",
        "bio": (
            "Cloud computing trainer specializing in AWS, cloud "
            "architecture, cloud fundamentals and security."
        ),
        "topics": [
            "Cloud Fundamentals",
            "AWS Services",
            "Cloud Security",
        ],
        "slots": [
            ("09:00 AM", "10:00 AM"),
            ("02:00 PM", "03:00 PM"),
            ("08:00 PM", "09:00 PM"),
        ],
    },
]


for data in trainer_data:

    trainer = db.query(User).filter(
        User.email == data["email"]
    ).first()

    if not trainer:

        trainer = User(
            name=data["name"],
            email=data["email"],
            password=data["password"],
            role="trainer",
            bio=data["bio"],
        )

        db.add(trainer)
        db.commit()
        db.refresh(trainer)

    else:

        trainer.name = data["name"]
        trainer.password = data["password"]
        trainer.bio = data["bio"]
        trainer.role = "trainer"

        db.commit()


    # --------------------------------------------------------
    # TRAINER TOPICS
    # --------------------------------------------------------

    for topic_name in data["topics"]:

        topic = topics.get(topic_name)

        if not topic:
            continue

        existing_topic = db.query(
            TrainerTopic
        ).filter(
            TrainerTopic.trainer_id == trainer.id,
            TrainerTopic.topic_id == topic.id
        ).first()

        if not existing_topic:

            trainer_topic = TrainerTopic(
                trainer_id=trainer.id,
                topic_id=topic.id,
            )

            db.add(trainer_topic)


    db.commit()


    # --------------------------------------------------------
    # TRAINER SLOTS
    # --------------------------------------------------------

    existing_slots = db.query(
        TrainerSlot
    ).filter(
        TrainerSlot.trainer_id == trainer.id
    ).count()

    if existing_slots == 0:

        for start, end in data["slots"]:

            slot = TrainerSlot(
                trainer_id=trainer.id,
                start_time=start,
                end_time=end,
                available=True,
            )

            db.add(slot)

        db.commit()


# ============================================================
# FINISH
# ============================================================

db.close()

print("========================================")
print("SkillSphere database seeded successfully")
print("========================================")
print("")
print("Courses:")
print("1. Python Programming - 15 MCQs")
print("2. SQL & Database - 15 MCQs")
print("3. Cloud Computing - 15 MCQs")
print("")
print("Trainer accounts:")
print("")
print("Python Trainer")
print("Email: python.trainer@skillsphere.com")
print("Password: trainer123")
print("")
print("SQL Trainer")
print("Email: sql.trainer@skillsphere.com")
print("Password: trainer123")
print("")
print("Cloud Trainer")
print("Email: cloud.trainer@skillsphere.com")
print("Password: trainer123")
print("")
print("========================================")
