import { useEffect, useState } from "react";
import "./styles.css";

const API = "http://127.0.0.1:8000/api";

function App() {
  const [stage, setStage] = useState("login");
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizResult, setQuizResult] = useState(null);

  const [bookingSlots, setBookingSlots] = useState([
    {
      id: 1,
      trainer: "Trainer Demo",
      date: "Tomorrow",
      time: "10:00 AM - 11:00 AM",
      available: true,
    },
    {
      id: 2,
      trainer: "Trainer Demo",
      date: "Tomorrow",
      time: "02:00 PM - 03:00 PM",
      available: true,
    },
    {
      id: 3,
      trainer: "Trainer Demo",
      date: "Saturday",
      time: "11:00 AM - 12:00 PM",
      available: true,
    },
    {
      id: 4,
      trainer: "Trainer Demo",
      date: "Saturday",
      time: "04:00 PM - 05:00 PM",
      available: true,
    },
  ]);

  const [bookingMessage, setBookingMessage] = useState("");

  // =========================
  // LOAD COURSES
  // =========================
  useEffect(() => {
    if (stage === "courses" || stage === "home") {
      loadCourses();
    }
  }, [stage]);

  async function loadCourses() {
    try {
      const response = await fetch(`${API}/courses`);

      if (!response.ok) {
        throw new Error("Courses could not be loaded");
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error(error);

      // Fallback courses
      setCourses([
        {
          id: 1,
          title: "Python Fundamentals",
          description: "Learn Python basics.",
          skill_tag: "Python",
        },
        {
          id: 2,
          title: "SQL Fundamentals",
          description: "Queries, tables and joins.",
          skill_tag: "Database",
        },
        {
          id: 3,
          title: "AWS Basics",
          description: "Core cloud concepts and AWS services.",
          skill_tag: "Cloud",
        },
      ]);
    }
  }

  // =========================
  // LOGIN
  // =========================
  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      setUser(data);
      setStage("home");
    } catch (error) {
      alert(error.message);
    }
  }

  // =========================
  // LOGOUT
  // =========================
  function logout() {
    setUser(null);
    setEmail("");
    setPassword("");
    setSelectedCourse(null);
    setQuiz([]);
    setAnswers([]);
    setQuizResult(null);
    setStage("login");
  }

  // =========================
  // OPEN COURSE
  // =========================
  async function openCourse(course) {
    setSelectedCourse(course);
    setQuizResult(null);

    try {
      const response = await fetch(`${API}/quizzes/${course.id}`);

      if (!response.ok) {
        throw new Error("Quiz could not be loaded");
      }

      const data = await response.json();

      setQuiz(data);
      setAnswers(new Array(data.length).fill(""));
      setCurrentQuestion(0);
      setStage("course");
    } catch (error) {
      console.error(error);
      alert("Quiz load nahi ho paya.");
    }
  }

  // =========================
  // START QUIZ
  // =========================
  function startQuiz() {
    setCurrentQuestion(0);
    setQuizResult(null);
    setStage("quiz");
  }

  // =========================
  // SELECT ANSWER
  // =========================
  function selectAnswer(answer) {
    const updatedAnswers = [...answers];

    updatedAnswers[currentQuestion] = answer;

    setAnswers(updatedAnswers);
  }

  // =========================
  // NEXT QUESTION
  // =========================
  function nextQuestion() {
    if (!answers[currentQuestion]) {
      alert("Please select an answer first.");
      return;
    }

    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  // =========================
  // PREVIOUS QUESTION
  // =========================
  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  // =========================
  // SUBMIT QUIZ
  // =========================
  async function submitQuiz() {
    if (!answers[currentQuestion]) {
      alert("Please select an answer first.");
      return;
    }

    const unanswered = answers.some((answer) => !answer);

    if (unanswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      const response = await fetch(`${API}/quizzes/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          course_id: selectedCourse.id,
          answers: answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Quiz submission failed");
      }

      const result = await response.json();

      setQuizResult(result);
      setStage("result");
    } catch (error) {
      alert(error.message);
    }
  }

  // =========================
  // BOOK TEACHER SLOT
  // =========================
  function bookSlot(slotId) {
    const slot = bookingSlots.find((item) => item.id === slotId);

    if (!slot || !slot.available) {
      return;
    }

    setBookingSlots((previous) =>
      previous.map((item) =>
        item.id === slotId
          ? {
              ...item,
              available: false,
            }
          : item
      )
    );

    setBookingMessage(
      `Slot booked successfully with ${slot.trainer} on ${slot.date}, ${slot.time}.`
    );
  }

  // =========================
  // LOGIN PAGE
  // =========================
  if (stage === "login") {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-card">
            <div className="logo">S</div>

            <h1>SkillSphere</h1>

            <p className="subtitle">
              AI-Powered Training & Competency Platform
            </p>

            <form onSubmit={handleLogin}>
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button className="primary-btn" type="submit">
                Login
              </button>
            </form>

            <div className="demo-login">
              <p>Demo Login</p>
              <span>trainee@skillsphere.com</span>
              <span>Password: 123456</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // HOME PAGE
  // =========================
  if (stage === "home") {
    return (
      <div className="app">
        <header className="navbar">
          <div className="brand">
            <div className="brand-logo">S</div>
            <div>
              <h2>SkillSphere</h2>
              <small>Training Platform</small>
            </div>
          </div>

          <div className="nav-right">
            <button
              className="nav-btn"
              onClick={() => setStage("courses")}
            >
              📚 Courses
            </button>

            <button
              className="nav-btn"
              onClick={() => setStage("booking")}
            >
              📅 Teacher Slot
            </button>

            <button
              className="profile-btn"
              onClick={() => setStage("profile")}
            >
              👤 Profile
            </button>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard">
          <section className="welcome-section">
            <div>
              <p className="small-heading">WELCOME BACK</p>

              <h1>
                Hello, {user?.name || "Trainee"} 👋
              </h1>

              <p>
                Continue your learning journey or connect directly
                with a trainer.
              </p>
            </div>
          </section>

          {/* COURSE SECTION */}
          <section className="section">
            <div className="section-header">
              <div>
                <p className="small-heading">LEARNING</p>
                <h2>Available Courses</h2>
              </div>

              <button
                className="outline-btn"
                onClick={() => setStage("courses")}
              >
                View All
              </button>
            </div>

            <div className="course-grid">
              {courses.slice(0, 3).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => openCourse(course)}
                />
              ))}
            </div>
          </section>

          {/* TEACHER BOOKING SECTION */}
          <section className="teacher-banner">
            <div className="teacher-icon">👨‍🏫</div>

            <div className="teacher-content">
              <p className="small-heading">PERSONAL GUIDANCE</p>

              <h2>Don't want to take the test?</h2>

              <p>
                You can directly book a one-to-one session with
                our trainer and discuss your learning goals.
              </p>
            </div>

            <button
              className="primary-btn booking-btn"
              onClick={() => setStage("booking")}
            >
              📅 Book Teacher Slot
            </button>
          </section>
        </main>
      </div>
    );
  }

  // =========================
  // COURSES PAGE
  // =========================
  if (stage === "courses") {
    return (
      <div className="app">
        <Header
          user={user}
          setStage={setStage}
          logout={logout}
        />

        <main className="dashboard">
          <button
            className="back-btn"
            onClick={() => setStage("home")}
          >
            ← Back
          </button>

          <div className="page-heading">
            <p className="small-heading">LEARNING LIBRARY</p>
            <h1>Courses</h1>
            <p>Select a course to start learning and take its assessment.</p>
          </div>

          <div className="course-grid large">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => openCourse(course)}
              />
            ))}
          </div>

          <section className="teacher-banner">
            <div className="teacher-icon">👨‍🏫</div>

            <div className="teacher-content">
              <h2>Prefer learning with a trainer?</h2>

              <p>
                Skip the test and book a direct session with a
                trainer.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setStage("booking")}
            >
              Book Slot
            </button>
          </section>
        </main>
      </div>
    );
  }

  // =========================
  // COURSE DETAIL
  // =========================
  if (stage === "course") {
    return (
      <div className="app">
        <Header
          user={user}
          setStage={setStage}
          logout={logout}
        />

        <main className="dashboard">
          <button
            className="back-btn"
            onClick={() => setStage("courses")}
          >
            ← Back to Courses
          </button>

          <div className="course-detail">
            <div className="course-large-icon">
              {getCourseIcon(selectedCourse?.skill_tag)}
            </div>

            <p className="small-heading">
              {selectedCourse?.skill_tag}
            </p>

            <h1>{selectedCourse?.title}</h1>

            <p>
              {selectedCourse?.description}
            </p>

            <div className="course-actions">
              <button
                className="primary-btn"
                onClick={startQuiz}
              >
                📝 Start Quiz
              </button>

              <button
                className="secondary-btn"
                onClick={() => setStage("booking")}
              >
                👨‍🏫 Book Teacher Instead
              </button>
            </div>

            <div className="info-box">
              <strong>Assessment</strong>

              <p>
                This course contains {quiz.length || 15} MCQs.
                Your score will be used to identify skill gaps
                and recommend suitable courses.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // QUIZ PAGE
  // =========================
  if (stage === "quiz") {
    const question = quiz[currentQuestion];

    if (!question) {
      return (
        <div className="loading">
          Loading quiz...
        </div>
      );
    }

    const progress =
      ((currentQuestion + 1) / quiz.length) * 100;

    return (
      <div className="app">
        <main className="quiz-container">
          <div className="quiz-top">
            <button
              className="back-btn"
              onClick={() => setStage("course")}
            >
              ← Exit Quiz
            </button>

            <span>
              Question {currentQuestion + 1} / {quiz.length}
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="quiz-card">
            <p className="small-heading">
              {selectedCourse?.skill_tag} ASSESSMENT
            </p>

            <h1>{question.question}</h1>

            <div className="options">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${
                    answers[currentQuestion] === option
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => selectAnswer(option)}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span>{option}</span>
                </button>
              ))}
            </div>

            <div className="quiz-navigation">
              <button
                className="secondary-btn"
                disabled={currentQuestion === 0}
                onClick={previousQuestion}
              >
                ← Previous
              </button>

              {currentQuestion === quiz.length - 1 ? (
                <button
                  className="primary-btn"
                  onClick={submitQuiz}
                >
                  Submit Quiz ✓
                </button>
              ) : (
                <button
                  className="primary-btn"
                  onClick={nextQuestion}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // RESULT PAGE
  // =========================
  if (stage === "result") {
    return (
      <div className="app">
        <main className="result-container">
          <div className="result-card">
            <div className="result-icon">🎯</div>

            <p className="small-heading">
              ASSESSMENT COMPLETE
            </p>

            <h1>Your Result</h1>

            <div className="score">
              {quizResult?.score}%
            </div>

            <p className="result-course">
              {selectedCourse?.title}
            </p>

            <div className="skill-gap">
              <h3>Skill Gap Analysis</h3>

              <p>
                {quizResult?.weak_skill
                  ? `Focus area: ${quizResult.weak_skill}`
                  : "Great job! No major skill gap detected."}
              </p>
            </div>

            <div className="recommendation">
              <h3>💡 Recommended Learning</h3>

              {quizResult?.recommendations?.length > 0 ? (
                quizResult.recommendations.map(
                  (item, index) => (
                    <div
                      className="recommendation-item"
                      key={index}
                    >
                      {typeof item === "string"
                        ? item
                        : JSON.stringify(item)}
                    </div>
                  )
                )
              ) : (
                <p>
                  Keep learning and improving your skills.
                </p>
              )}
            </div>

            <div className="result-actions">
              <button
                className="primary-btn"
                onClick={() => setStage("courses")}
              >
                Back to Courses
              </button>

              <button
                className="secondary-btn"
                onClick={() => setStage("booking")}
              >
                👨‍🏫 Talk to Trainer
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // TEACHER BOOKING PAGE
  // =========================
  if (stage === "booking") {
    return (
      <div className="app">
        <Header
          user={user}
          setStage={setStage}
          logout={logout}
        />

        <main className="dashboard">
          <button
            className="back-btn"
            onClick={() => setStage("home")}
          >
            ← Back
          </button>

          <div className="page-heading">
            <p className="small-heading">
              TRAINER SUPPORT
            </p>

            <h1>Book a Teacher Slot</h1>

            <p>
              Choose an available time slot for one-to-one
              guidance.
            </p>
          </div>

          {bookingMessage && (
            <div className="success-message">
              ✓ {bookingMessage}
            </div>
          )}

          <div className="trainer-profile">
            <div className="trainer-avatar">👨‍🏫</div>

            <div>
              <h2>Trainer Demo</h2>

              <p>
                Python • SQL • AWS
              </p>

              <span className="trainer-status">
                ● Available
              </span>
            </div>
          </div>

          <h2 className="slot-heading">
            Available Slots
          </h2>

          <div className="slots-grid">
            {bookingSlots.map((slot) => (
              <div
                className={`slot-card ${
                  !slot.available ? "booked" : ""
                }`}
                key={slot.id}
              >
                <div className="slot-date">
                  📅 {slot.date}
                </div>

                <h3>{slot.time}</h3>

                <p>{slot.trainer}</p>

                {slot.available ? (
                  <button
                    className="primary-btn"
                    onClick={() => bookSlot(slot.id)}
                  >
                    Book Slot
                  </button>
                ) : (
                  <button
                    className="disabled-btn"
                    disabled
                  >
                    ✓ Booked
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="booking-note">
            <strong>💡 Note:</strong>

            <p>
              You don't need to take the assessment to book a
              trainer. You can directly discuss your learning
              requirements with the trainer.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // PROFILE PAGE
  // =========================
  if (stage === "profile") {
    return (
      <div className="app">
        <Header
          user={user}
          setStage={setStage}
          logout={logout}
        />

        <main className="dashboard">
          <button
            className="back-btn"
            onClick={() => setStage("home")}
          >
            ← Back
          </button>

          <div className="profile-card">
            <div className="profile-avatar">
              👤
            </div>

            <p className="small-heading">
              MY PROFILE
            </p>

            <h1>{user?.name || "Trainee"}</h1>

            <div className="profile-info">
              <div>
                <span>Email</span>
                <strong>
                  {user?.email || "trainee@skillsphere.com"}
                </strong>
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {user?.role || "trainee"}
                </strong>
              </div>
            </div>

            <button
              className="primary-btn"
              onClick={() => setStage("courses")}
            >
              📚 Explore Courses
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

// ======================================================
// HEADER COMPONENT
// ======================================================

function Header({ user, setStage, logout }) {
  return (
    <header className="navbar">
      <div
        className="brand clickable"
        onClick={() => setStage("home")}
      >
        <div className="brand-logo">S</div>

        <div>
          <h2>SkillSphere</h2>
          <small>Training Platform</small>
        </div>
      </div>

      <div className="nav-right">
        <button
          className="nav-btn"
          onClick={() => setStage("courses")}
        >
          📚 Courses
        </button>

        <button
          className="nav-btn"
          onClick={() => setStage("booking")}
        >
          📅 Teacher Slot
        </button>

        <button
          className="profile-btn"
          onClick={() => setStage("profile")}
        >
          👤 {user?.name || "Profile"}
        </button>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

// ======================================================
// COURSE CARD
// ======================================================

function CourseCard({ course, onClick }) {
  return (
    <div className="course-card">
      <div className="course-icon">
        {getCourseIcon(course.skill_tag)}
      </div>

      <div className="course-content">
        <span className="course-tag">
          {course.skill_tag}
        </span>

        <h3>{course.title}</h3>

        <p>
          {course.description}
        </p>

        <div className="course-bottom">
          <span>📝 15 MCQs</span>

          <button
            className="small-btn"
            onClick={onClick}
          >
            Start →
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// COURSE ICON
// ======================================================

function getCourseIcon(skill) {
  if (skill === "Python") return "🐍";
  if (skill === "Database") return "🗄️";
  if (skill === "Cloud") return "☁️";

  return "📚";
}

export default App;
