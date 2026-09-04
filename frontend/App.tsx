import { useEffect, useMemo, useState } from "react";

const API =
  "https://skillsphere-backend-dcg2.onrender.com";

type User = {
  id: number;
  name: string;
  email: string;
  role: "trainee" | "trainer" | "admin";
  bio?: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  topic_count: number;
  question_count: number;
};

type Topic = {
  id: number;
  name: string;
  course_id: number;
};

type Question = {
  id: number;
  course_id: number;
  topic_id: number;
  text: string;
  options: string[];
};

type Trainer = {
  id: number;
  name: string;
  email: string;
  bio: string;
  expertise?: Topic[];
  available_slots?: number;
};

type Slot = {
  id: number;
  start_time: string;
  end_time: string;
  available: boolean;
};

type Booking = {
  booking_id: number;
  status: string;
  trainer: string;
  trainer_id: number;
  topic: string;
  topic_id: number;
  start_time: string;
  end_time: string;
  lecture_id: number | null;
  lecture_status: string | null;
};

type AttemptResult = {
  attempt_id: number;
  course_id: number;
  test_type: string;
  score: number;
  questions: {
    question_id: number;
    question: string;
    options: string[];
    topic_id: number;
    topic: string;
    your_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }[];
  topic_analysis: {
    topic_id: number;
    topic: string;
    percentage: number;
    weak: boolean;
  }[];
  weak_topics: {
    topic_id: number;
    topic: string;
    percentage: number;
    weak: boolean;
  }[];
};

type Page =
  | "dashboard"
  | "courses"
  | "test"
  | "result"
  | "teachers"
  | "teacher"
  | "booking"
  | "bookings"
  | "profile"
  | "settings"
  | "trainer-dashboard"
  | "student-progress"
  | "admin";


// ============================================================
// API HELPER
// ============================================================

async function api(
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();

  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        `Request failed: ${response.status}`
    );
  }

  return data;
}


// ============================================================
// SMALL UI COMPONENTS
// ============================================================

function Button({
  children,
  onClick,
  secondary = false,
  danger = false,
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  let cls =
    "px-4 py-2.5 rounded-xl font-semibold transition ";

  if (danger) {
    cls +=
      "bg-red-600 text-white hover:bg-red-700 ";
  } else if (secondary) {
    cls +=
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 ";
  } else {
    cls +=
      "bg-indigo-600 text-white hover:bg-indigo-700 ";
  }

  if (disabled) {
    cls += "opacity-50 cursor-not-allowed ";
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cls}
    >
      {children}
    </button>
  );
}


function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}


function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
    </div>
  );
}


function InitialAvatar({
  name,
  size = "normal",
}: {
  name?: string;
  size?: "normal" | "large";
}) {
  const safeName =
    typeof name === "string" && name.trim()
      ? name.trim()
      : "User";

  const firstLetter =
    safeName.length > 0
      ? safeName.charAt(0).toUpperCase()
      : "U";

  return (
    <div
      className={`rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold ${
        size === "large"
          ? "w-20 h-20 text-3xl"
          : "w-10 h-10 text-lg"
      }`}
    >
      {firstLetter}
    </div>
  );
}


// ============================================================
// HEADER
// ============================================================

function Header({
  user,
  onNavigate,
  onLogout,
}: {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  const safeName = user?.name || "User";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        <button
          onClick={() => onNavigate("dashboard")}
          className="text-2xl font-bold text-indigo-600"
        >
          SkillSphere
        </button>

        <div className="flex items-center gap-3">

          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-800">
              {safeName}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.role || "user"}
            </p>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="focus:outline-none"
          >
            <InitialAvatar name={safeName} />
          </button>

          {open && (
            <div className="absolute right-4 top-14 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-2">

              <button
                onClick={() => {
                  setOpen(false);
                  onNavigate("profile");
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                👤 Profile
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onNavigate("settings");
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                ⚙️ Settings
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
              >
                🚪 Logout
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}


// ============================================================
// AUTH PAGE
// ============================================================

function AuthPage({
  onLogin,
}: {
  onLogin: (user: User) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">(
    "login"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<
    "trainee" | "trainer" | "admin"
  >("trainee");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Name is required.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const data = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });

        onLogin(data.user);
      } else {
        const data = await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            bio,
          }),
        });

        onLogin(data.user);
      }
    } catch (err: any) {
      setError(
        err?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center p-5">

      <div className="w-full max-w-md">

        <div className="text-center mb-7">
          <div className="text-4xl font-black text-indigo-600">
            SkillSphere
          </div>

          <p className="mt-2 text-slate-500">
            Learn • Assess • Detect Gaps • Improve
          </p>
        </div>

        <Card className="p-7">

          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                mode === "login"
                  ? "bg-white shadow text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                mode === "register"
                  ? "bg-white shadow text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              Register
            </button>
          </div>

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            {mode === "register" && (
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Full name"
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Email"
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
            />

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
            />

            {mode === "register" && (
              <>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value as
                        | "trainee"
                        | "trainer"
                        | "admin"
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                >
                  <option value="trainee">
                    Trainee
                  </option>
                  <option value="trainer">
                    Trainer
                  </option>
                  <option value="admin">
                    Admin
                  </option>
                </select>

                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  placeholder="Short bio (optional)"
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                />
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </Button>

          </form>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-5">
          SkillSphere Competency-Based Learning Platform
        </p>

      </div>
    </div>
  );
}


// ============================================================
// TRAINEE DASHBOARD
// ============================================================

function TraineeDashboard({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate: (page: Page) => void;
}) {
  const [progress, setProgress] =
    useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/progress/${user.id}`)
      .then(setProgress)
      .catch(() => setProgress([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  const latest =
    progress.length > 0
      ? progress[0]
      : null;

  return (
    <div>

      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl text-white p-7 md:p-10">
        <p className="text-indigo-100">
          Welcome back
        </p>

        <h1 className="text-3xl md:text-4xl font-bold mt-1">
          {user?.name || "Trainee"} 👋
        </h1>

        <p className="mt-3 text-indigo-100 max-w-2xl">
          Continue your learning journey, identify
          weak skills and connect with the right trainer.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">

        <Card
          className="p-6 cursor-pointer hover:shadow-lg"
        >
          <button
            className="text-left w-full"
            onClick={() => onNavigate("courses")}
          >
            <div className="text-3xl">📚</div>
            <h2 className="text-xl font-bold mt-3">
              Courses
            </h2>
            <p className="text-slate-500 mt-1">
              Take a diagnostic test and discover
              your weak topics.
            </p>
            <span className="inline-block mt-4 text-indigo-600 font-semibold">
              Explore Courses →
            </span>
          </button>
        </Card>

        <Card className="p-6">
          <button
            className="text-left w-full"
            onClick={() => onNavigate("teachers")}
          >
            <div className="text-3xl">👨‍🏫</div>
            <h2 className="text-xl font-bold mt-3">
              Teachers
            </h2>
            <p className="text-slate-500 mt-1">
              Directly choose a trainer, topic and
              available lecture slot.
            </p>
            <span className="inline-block mt-4 text-indigo-600 font-semibold">
              Find Teachers →
            </span>
          </button>
        </Card>

      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-6">

        <Card className="p-5">
          <p className="text-sm text-slate-500">
            Tests Taken
          </p>
          <p className="text-3xl font-bold mt-1">
            {loading ? "..." : progress.length}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">
            Latest Score
          </p>
          <p className="text-3xl font-bold mt-1 text-indigo-600">
            {loading
              ? "..."
              : latest
              ? `${latest.score}%`
              : "—"}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">
            Latest Course
          </p>
          <p className="text-lg font-bold mt-2">
            {latest?.course || "No test yet"}
          </p>
        </Card>

      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-bold">
          Your Learning Journey
        </h2>

        <div className="grid md:grid-cols-4 gap-3 mt-5">

          {[
            ["1", "Choose Course"],
            ["2", "Take Test"],
            ["3", "Find Skill Gap"],
            ["4", "Learn With Trainer"],
          ].map(([num, text]) => (
            <div
              key={num}
              className="bg-slate-50 rounded-xl p-4"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {num}
              </div>

              <p className="font-semibold mt-3">
                {text}
              </p>
            </div>
          ))}

        </div>
      </Card>

    </div>
  );
}


// ============================================================
// COURSES
// ============================================================

function CoursesPage({
  onSelect,
  onBack,
}: {
  onSelect: (course: Course) => void;
  onBack: () => void;
}) {
  const [courses, setCourses] =
    useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/courses")
      .then(setCourses)
      .catch((err) =>
        setError(err.message)
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>

      <Button
        secondary
        onClick={onBack}
      >
        ← Dashboard
      </Button>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">
          Courses
        </h1>

        <p className="text-slate-500 mt-1">
          Select a course and take a diagnostic test.
        </p>
      </div>

      {loading && <Spinner />}

      {error && (
        <div className="mt-5 bg-red-50 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5 mt-6">

        {courses.map((course) => (
          <Card
            key={course.id}
            className="p-6 hover:shadow-lg"
          >

            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
              📘
            </div>

            <h2 className="text-xl font-bold mt-4">
              {course.title}
            </h2>

            <p className="text-slate-500 mt-2 min-h-12">
              {course.description ||
                "Build your skills through assessment and guided learning."}
            </p>

            <div className="flex gap-2 mt-4">
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                {course.topic_count} Topics
              </span>

              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                {course.question_count} MCQs
              </span>
            </div>

            <button
              onClick={() => onSelect(course)}
              className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              Start Diagnostic Test →
            </button>

          </Card>
        ))}

      </div>

      {!loading && courses.length === 0 && (
        <Card className="p-8 mt-6 text-center">
          No courses found.
        </Card>
      )}

    </div>
  );
}


// ============================================================
// TEST PAGE
// ============================================================

function TestPage({
  user,
  course,
  onFinished,
  onBack,
}: {
  user: User;
  course: Course;
  onFinished: (
    attemptId: number
  ) => void;
  onBack: () => void;
}) {
  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [index, setIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    api(`/courses/${course.id}/questions`)
      .then((data) => {
        setQuestions(
          Array.isArray(data) ? data : []
        );
      })
      .catch((err) =>
        setError(err.message)
      )
      .finally(() =>
        setLoading(false)
      );
  }, [course.id]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div>
        <Button
          secondary
          onClick={onBack}
        >
          ← Back
        </Button>

        <div className="bg-red-50 text-red-700 p-4 rounded-xl mt-5">
          {error}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-bold">
          No questions found
        </h2>

        <Button
          secondary
          onClick={onBack}
        >
          Go Back
        </Button>
      </Card>
    );
  }

  const current =
    questions[index];

  const selected =
    answers[current.id];

  const answeredCount =
    Object.keys(answers).length;

  async function submitTest() {
    if (answeredCount < questions.length) {
      const confirmSubmit =
        window.confirm(
          `You answered ${answeredCount} of ${questions.length} questions. Submit anyway?`
        );

      if (!confirmSubmit) {
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = questions.map(
        (q) => ({
          question_id: q.id,
          answer: answers[q.id] || "",
        })
      );

      const data = await api(
        "/tests/submit",
        {
          method: "POST",
          body: JSON.stringify({
            trainee_id: user.id,
            course_id: course.id,
            test_type: "pretest",
            answers: payload,
          }),
        }
      );

      onFinished(data.attempt_id);
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to submit test."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      <Button
        secondary
        onClick={onBack}
      >
        ← Exit Test
      </Button>

      <Card className="p-6 mt-5">

        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Diagnostic Test
            </p>

            <h1 className="text-2xl font-bold">
              {course.title}
            </h1>
          </div>

          <div className="text-right">
            <p className="font-bold text-indigo-600">
              {index + 1} / {questions.length}
            </p>

            <p className="text-xs text-slate-500">
              {answeredCount} answered
            </p>
          </div>
        </div>

        <div className="h-2 bg-slate-100 rounded-full mt-5 overflow-hidden">
          <div
            className="h-full bg-indigo-600"
            style={{
              width: `${
                ((index + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />
        </div>

        <div className="mt-8">

          <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
            Question {index + 1}
          </span>

          <h2 className="text-xl font-semibold mt-4">
            {current.text}
          </h2>

          <div className="space-y-3 mt-6">

            {current.options.map(
              (option, optionIndex) => {
                const letter =
                  String.fromCharCode(
                    65 + optionIndex
                  );

                const isSelected =
                  selected === option;

                return (
                  <button
                    key={optionIndex}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [current.id]:
                          option,
                      })
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <span className="inline-flex w-8 h-8 rounded-full bg-slate-100 items-center justify-center font-bold mr-3">
                      {letter}
                    </span>

                    {option}
                  </button>
                );
              }
            )}

          </div>

        </div>

        {error && (
          <div className="mt-5 bg-red-50 text-red-700 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-between mt-8">

          <Button
            secondary
            disabled={index === 0}
            onClick={() =>
              setIndex(
                Math.max(0, index - 1)
              )
            }
          >
            ← Previous
          </Button>

          {index <
          questions.length - 1 ? (
            <Button
              onClick={() =>
                setIndex(index + 1)
              }
            >
              Next →
            </Button>
          ) : (
            <Button
              disabled={submitting}
              onClick={submitTest}
            >
              {submitting
                ? "Submitting..."
                : "Submit Test ✓"}
            </Button>
          )}

        </div>

      </Card>
    </div>
  );
}


// ============================================================
// TEST RESULT
// ============================================================

function ResultPage({
  result,
  onTeachers,
  onDashboard,
}: {
  result: AttemptResult;
  onTeachers: () => void;
  onDashboard: () => void;
}) {
  const wrongQuestions =
    result.questions.filter(
      (q) => !q.is_correct
    );

  return (
    <div>

      <Card className="p-7 bg-gradient-to-r from-indigo-50 to-blue-50">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>
            <p className="text-sm text-slate-500">
              Diagnostic Test Completed
            </p>

            <h1 className="text-3xl font-bold mt-1">
              Your Skill Analysis
            </h1>
          </div>

          <div className="text-center">
            <div className="text-5xl font-black text-indigo-600">
              {result.score}%
            </div>

            <p className="text-slate-500">
              Overall Score
            </p>
          </div>

        </div>
      </Card>


      {/* TOPIC ANALYSIS */}

      <Card className="p-6 mt-6">

        <h2 className="text-xl font-bold">
          Topic-wise Performance
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mt-5">

          {result.topic_analysis.map(
            (topic) => (
              <div
                key={topic.topic_id}
                className="border border-slate-200 rounded-xl p-4"
              >

                <div className="flex justify-between">
                  <span className="font-semibold">
                    {topic.topic}
                  </span>

                  <span
                    className={
                      topic.weak
                        ? "text-red-600 font-bold"
                        : "text-green-600 font-bold"
                    }
                  >
                    {topic.percentage}%
                  </span>
                </div>

                <div className="h-2 bg-slate-100 rounded-full mt-3">
                  <div
                    className={`h-full rounded-full ${
                      topic.weak
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          topic.percentage
                        )
                      )}%`,
                    }}
                  />
                </div>

                {topic.weak && (
                  <p className="text-red-600 text-sm mt-2">
                    Needs improvement
                  </p>
                )}

              </div>
            )
          )}

        </div>

      </Card>


      {/* WRONG QUESTIONS */}

      <Card className="p-6 mt-6">

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              Wrong MCQs
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Review your mistakes and learn from them.
            </p>
          </div>

          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
            {wrongQuestions.length} wrong
          </span>
        </div>

        <div className="space-y-5 mt-6">

          {wrongQuestions.map(
            (q, i) => (
              <div
                key={q.question_id}
                className="border border-red-200 rounded-xl p-5 bg-red-50/40"
              >

                <p className="font-semibold">
                  {i + 1}. {q.question}
                </p>

                <p className="text-sm text-slate-500 mt-2">
                  Topic: {q.topic}
                </p>

                <div className="grid md:grid-cols-2 gap-3 mt-4">

                  <div className="bg-red-100 text-red-800 p-3 rounded-lg">
                    <p className="text-xs font-semibold">
                      YOUR ANSWER
                    </p>

                    <p className="mt-1">
                      {q.your_answer ||
                        "Not answered"}
                    </p>
                  </div>

                  <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                    <p className="text-xs font-semibold">
                      CORRECT ANSWER
                    </p>

                    <p className="mt-1">
                      {q.correct_answer}
                    </p>
                  </div>

                </div>

              </div>
            )
          )}

        </div>

        {wrongQuestions.length === 0 && (
          <div className="bg-green-50 text-green-700 p-5 rounded-xl mt-5">
            🎉 Excellent! You answered every submitted question correctly.
          </div>
        )}

      </Card>


      {/* TRAINER */}

      <Card className="p-6 mt-6">

        <h2 className="text-xl font-bold">
          🎯 Recommended Learning
        </h2>

        {result.weak_topics.length > 0 ? (
          <>
            <p className="text-slate-500 mt-1">
              We detected weak topics. Find a trainer
              who specializes in these topics.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {result.weak_topics.map(
                (topic) => (
                  <span
                    key={topic.topic_id}
                    className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold"
                  >
                    {topic.topic} •{" "}
                    {topic.percentage}%
                  </span>
                )
              )}
            </div>

            <Button
              onClick={onTeachers}
            >
              Find Recommended Trainers →
            </Button>
          </>
        ) : (
          <>
            <p className="text-green-700 mt-2">
              🎉 No major skill gap detected.
            </p>

            <p className="text-slate-500 mt-2">
              You can still book a trainer for advanced
              practice.
            </p>

            <Button
              onClick={onTeachers}
            >
              Browse Teachers →
            </Button>
          </>
        )}

      </Card>

      <div className="mt-6">
        <Button
          secondary
          onClick={onDashboard}
        >
          ← Back to Dashboard
        </Button>
      </div>

    </div>
  );
}


// ============================================================
// TEACHERS
// ============================================================

function TeachersPage({
  onSelect,
  onBack,
}: {
  onSelect: (trainer: Trainer) => void;
  onBack: () => void;
}) {
  const [trainers, setTrainers] =
    useState<Trainer[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api("/trainers")
      .then((data) =>
        setTrainers(
          Array.isArray(data)
            ? data
            : []
        )
      )
      .catch(() =>
        setTrainers([])
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  return (
    <div>

      <Button
        secondary
        onClick={onBack}
      >
        ← Dashboard
      </Button>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">
          👨‍🏫 Teachers
        </h1>

        <p className="text-slate-500 mt-1">
          Choose a teacher directly. Test is not required.
        </p>
      </div>

      {loading && <Spinner />}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">

        {trainers.map(
          (trainer) => (
            <Card
              key={trainer.id}
              className="p-6"
            >

              <InitialAvatar
                name={trainer.name}
                size="large"
              />

              <h2 className="text-xl font-bold mt-4">
                {trainer.name}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {trainer.email}
              </p>

              <p className="text-slate-600 mt-3 line-clamp-3">
                {trainer.bio ||
                  "Experienced SkillSphere trainer."}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">

                {(trainer.expertise || []).map(
                  (topic) => (
                    <span
                      key={topic.id}
                      className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full"
                    >
                      {topic.name}
                    </span>
                  )
                )}

              </div>

              <div className="flex justify-between items-center mt-5">

                <span className="text-sm text-slate-500">
                  {trainer.available_slots || 0} slots
                </span>

                <Button
                  onClick={() =>
                    onSelect(trainer)
                  }
                >
                  View Teacher
                </Button>

              </div>

            </Card>
          )
        )}

      </div>

    </div>
  );
}


// ============================================================
// TEACHER DETAIL
// ============================================================

function TeacherPage({
  trainer,
  onBook,
  onBack,
}: {
  trainer: Trainer;
  onBook: (
    trainer: Trainer,
    topic: Topic
  ) => void;
  onBack: () => void;
}) {
  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api(`/trainers/${trainer.id}/topics`)
      .then((data) =>
        setTopics(
          Array.isArray(data)
            ? data
            : []
        )
      )
      .catch(() =>
        setTopics([])
      )
      .finally(() =>
        setLoading(false)
      );
  }, [trainer.id]);

  return (
    <div>

      <Button
        secondary
        onClick={onBack}
      >
        ← Teachers
      </Button>

      <Card className="p-7 mt-5">

        <div className="flex flex-col md:flex-row gap-6">

          <InitialAvatar
            name={trainer.name}
            size="large"
          />

          <div className="flex-1">

            <h1 className="text-3xl font-bold">
              {trainer.name}
            </h1>

            <p className="text-slate-500 mt-1">
              {trainer.email}
            </p>

            <p className="text-slate-600 mt-4">
              {trainer.bio ||
                "SkillSphere trainer"}
            </p>

          </div>

        </div>

      </Card>

      <Card className="p-6 mt-5">

        <h2 className="text-xl font-bold">
          Select Topic
        </h2>

        <p className="text-slate-500 mt-1">
          Choose what you want to learn with this trainer.
        </p>

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-5">

            {topics.map(
              (topic) => (
                <button
                  key={topic.id}
                  onClick={() =>
                    onBook(
                      trainer,
                      topic
                    )
                  }
                  className="text-left border border-slate-200 rounded-xl p-5 hover:border-indigo-500 hover:bg-indigo-50 transition"
                >
                  <p className="font-bold">
                    {topic.name}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Book a lecture →
                  </p>
                </button>
              )
            )}

          </div>
        )}

        {!loading &&
          topics.length === 0 && (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl mt-5">
              This trainer currently has no topics assigned.
            </div>
          )}

      </Card>

    </div>
  );
}


// ============================================================
// BOOKING
// ============================================================

function BookingPage({
  user,
  trainer,
  topic,
  onDone,
  onBack,
}: {
  user: User;
  trainer: Trainer;
  topic: Topic;
  onDone: () => void;
  onBack: () => void;
}) {
  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [booking, setBooking] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadSlots() {
    setLoading(true);

    try {
      const data = await api(
        `/trainers/${trainer.id}/slots`
      );

      setSlots(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
  }, [trainer.id]);

  async function book(slot: Slot) {
    setBooking(true);
    setError("");

    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: trainer.id,
          slot_id: slot.id,
          topic_id: topic.id,
        }),
      });

      alert(
        "Lecture booked successfully!"
      );

      onDone();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to book slot."
      );
    } finally {
      setBooking(false);
    }
  }

  return (
    <div>

      <Button
        secondary
        onClick={onBack}
      >
        ← Back
      </Button>

      <Card className="p-6 mt-5">

        <p className="text-sm text-slate-500">
          Booking Lecture
        </p>

        <h1 className="text-3xl font-bold mt-1">
          {trainer.name}
        </h1>

        <p className="text-indigo-600 font-semibold mt-2">
          Topic: {topic.name}
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl mt-5">
            {error}
          </div>
        )}

        <h2 className="text-xl font-bold mt-7">
          Available Slots
        </h2>

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-5">

            {slots
              .filter(
                (slot) =>
                  slot.available
              )
              .map((slot) => (
                <div
                  key={slot.id}
                  className="border border-slate-200 rounded-xl p-5 flex items-center justify-between gap-4"
                >

                  <div>
                    <p className="font-bold">
                      {slot.start_time}
                    </p>

                    <p className="text-sm text-slate-500">
                      to {slot.end_time}
                    </p>
                  </div>

                  <Button
                    disabled={booking}
                    onClick={() =>
                      book(slot)
                    }
                  >
                    Book
                  </Button>

                </div>
              ))}

          </div>
        )}

        {!loading &&
          slots.filter(
            (s) => s.available
          ).length === 0 && (
            <div className="bg-yellow-50 text-yellow-700 p-5 rounded-xl mt-5">
              No available slots currently.
            </div>
          )}

      </Card>

    </div>
  );
}


// ============================================================
// BOOKINGS
// ============================================================

function BookingsPage({
  user,
  onBack,
}: {
  user: User;
  onBack: () => void;
}) {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function load() {
    try {
      const data = await api(
        `/bookings/trainee/${user.id}`
      );

      setBookings(
        Array.isArray(data)
          ? data
          : []
      );
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.id]);

  async function completeLecture(
    lectureId: number
  ) {
    try {
      await api(
        `/lectures/${lectureId}/complete`,
        {
          method: "POST",
        }
      );

      await load();

      alert(
        "Lecture marked as completed."
      );
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div>

      <Button
        secondary
        onClick={onBack}
      >
        ← Dashboard
      </Button>

      <h1 className="text-3xl font-bold mt-6">
        My Bookings
      </h1>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4 mt-6">

          {bookings.map(
            (booking) => (
              <Card
                key={booking.booking_id}
                className="p-5"
              >

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  <div>
                    <h2 className="text-lg font-bold">
                      {booking.topic}
                    </h2>

                    <p className="text-slate-500">
                      Trainer:{" "}
                      {booking.trainer ||
                        "Trainer"}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                      {booking.start_time} —{" "}
                      {booking.end_time}
                    </p>
                  </div>

                  <div className="text-right">

                    <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                      {booking.lecture_status ||
                        booking.status}
                    </span>

                    {booking.lecture_id &&
                      booking.lecture_status !==
                        "completed" && (
                        <div className="mt-3">
                          <Button
                            onClick={() =>
                              completeLecture(
                                booking.lecture_id!
                              )
                            }
                          >
                            Mark Lecture Complete
                          </Button>
                        </div>
                      )}

                  </div>

                </div>

              </Card>
            )
          )}

          {bookings.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-slate-500">
                You haven't booked any lectures yet.
              </p>
            </Card>
          )}

        </div>
      )}

    </div>
  );
}


// ============================================================
// PROFILE
// ============================================================

function ProfilePage({
  user,
  onUpdated,
  onBack,
}: {
  user: User;
  onUpdated: (user: User) => void;
  onBack: () => void;
}) {
  const [name, setName] =
    useState(user.name || "");

  const [bio, setBio] =
    useState(user.bio || "");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function save() {
    setSaving(true);
    setError("");

    try {
      const data = await api(
        `/users/${user.id}/profile`,
        {
          method: "PUT",
          body: JSON.stringify({
            name,
            bio,
          }),
        }
      );

      onUpdated(data.user);

      alert("Profile updated.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">

      <Button
        secondary
        onClick={onBack}
      >
        ← Back
      </Button>

      <Card className="p-7 mt-5">

        <div className="flex items-center gap-4 mb-7">
          <InitialAvatar
            name={name}
            size="large"
          />

          <div>
            <h1 className="text-2xl font-bold">
              My Profile
            </h1>

            <p className="text-slate-500">
              {user.email}
            </p>
          </div>
        </div>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-semibold mb-1">
              Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Email
            </label>

            <input
              value={user.email}
              disabled
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              rows={5}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl">
              {error}
            </div>
          )}

          <Button
            disabled={saving}
            onClick={save}
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </Button>

        </div>

      </Card>

    </div>
  );
}


// ============================================================
// SETTINGS
// ============================================================

function SettingsPage({
  user,
  onBack,
}: {
  user: User;
  onBack: () => void;
}) {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function changePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await api(
        `/users/${user.id}/password`,
        {
          method: "PUT",
          body: JSON.stringify({
            current_password:
              currentPassword,
            new_password:
              newPassword,
          }),
        }
      );

      alert(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">

      <Button
        secondary
        onClick={onBack}
      >
        ← Back
      </Button>

      <Card className="p-7 mt-5">

        <h1 className="text-2xl font-bold">
          Settings
        </h1>

        <p className="text-slate-500 mt-1">
          Manage your account security.
        </p>

        <form
          onSubmit={changePassword}
          className="space-y-4 mt-6"
        >

          <div>
            <label className="block text-sm font-semibold mb-1">
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Changing..."
              : "Change Password"}
          </Button>

        </form>

      </Card>

    </div>
  );
}


// ============================================================
// TRAINER DASHBOARD
// ============================================================

function TrainerDashboard({
  user,
  onStudent,
  onProfile,
}: {
  user: User;
  onStudent: (
    studentId: number
  ) => void;
  onProfile: () => void;
}) {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function load() {
    try {
      const result = await api(
        `/trainers/${user.id}/dashboard`
      );

      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.id]);

  async function addSlot() {
    if (!startTime || !endTime) {
      alert(
        "Enter start and end time."
      );
      return;
    }

    setSaving(true);

    try {
      await api(
        `/trainers/${user.id}/slots`,
        {
          method: "POST",
          body: JSON.stringify({
            start_time: startTime,
            end_time: endTime,
          }),
        }
      );

      setStartTime("");
      setEndTime("");

      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot(
    slotId: number
  ) {
    try {
      await api(
        `/trainers/${user.id}/slots/${slotId}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  if (!data) {
    return (
      <Card className="p-8">
        Unable to load trainer dashboard.
      </Card>
    );
  }

  const stats =
    data.stats || {};

  return (
    <div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Trainer Dashboard
          </h1>

          <p className="text-slate-500">
            Welcome,{" "}
            {data.profile?.name ||
              user.name ||
              "Trainer"}
          </p>
        </div>

        <Button
          secondary
          onClick={onProfile}
        >
          Edit Profile
        </Button>

      </div>


      {/* STATS */}

      <div className="grid md:grid-cols-5 gap-4 mt-6">

        {[
          [
            "Total Slots",
            stats.total_slots,
          ],
          [
            "Available",
            stats.available_slots,
          ],
          [
            "Bookings",
            stats.total_bookings,
          ],
          [
            "Completed",
            stats.completed_lectures,
          ],
          [
            "Students",
            stats.total_students,
          ],
        ].map(([label, value]) => (
          <Card
            key={String(label)}
            className="p-5"
          >
            <p className="text-sm text-slate-500">
              {label}
            </p>

            <p className="text-3xl font-bold mt-1">
              {value ?? 0}
            </p>
          </Card>
        ))}

      </div>


      {/* EXPERTISE */}

      <Card className="p-6 mt-6">

        <h2 className="text-xl font-bold">
          My Expertise
        </h2>

        <div className="flex flex-wrap gap-2 mt-4">

          {(data.expertise || []).map(
            (topic: Topic) => (
              <span
                key={topic.id}
                className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm"
              >
                {topic.name}
              </span>
            )
          )}

        </div>

      </Card>


      {/* ADD SLOTS */}

      <Card className="p-6 mt-6">

        <h2 className="text-xl font-bold">
          Add Lecture Slot
        </h2>

        <div className="grid md:grid-cols-3 gap-3 mt-4">

          <input
            value={startTime}
            onChange={(e) =>
              setStartTime(
                e.target.value
              )
            }
            placeholder="e.g. 10:00 AM"
            className="border border-slate-300 rounded-xl px-4 py-3"
          />

          <input
            value={endTime}
            onChange={(e) =>
              setEndTime(
                e.target.value
              )
            }
            placeholder="e.g. 11:00 AM"
            className="border border-slate-300 rounded-xl px-4 py-3"
          />

          <Button
            disabled={saving}
            onClick={addSlot}
          >
            + Add Slot
          </Button>

        </div>

      </Card>


      {/* STUDENTS */}

      <Card className="p-6 mt-6">

        <h2 className="text-xl font-bold">
          My Students
        </h2>

        <div className="overflow-x-auto mt-4">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="p-3">
                  Student
                </th>

                <th className="p-3">
                  Tests
                </th>

                <th className="p-3">
                  Latest Score
                </th>

                <th className="p-3">
                  Lectures
                </th>

                <th className="p-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {(data.students || []).map(
                (student: any) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100"
                  >

                    <td className="p-3">
                      <p className="font-semibold">
                        {student.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {student.email}
                      </p>
                    </td>

                    <td className="p-3">
                      {student.total_tests}
                    </td>

                    <td className="p-3">
                      {student.latest_score !==
                      null
                        ? `${student.latest_score}%`
                        : "—"}
                    </td>

                    <td className="p-3">
                      {student.completed_lectures}
                    </td>

                    <td className="p-3">
                      <Button
                        secondary
                        onClick={() =>
                          onStudent(
                            student.id
                          )
                        }
                      >
                        View
                      </Button>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {(data.students || []).length ===
          0 && (
          <p className="text-slate-500 mt-4">
            No students assigned yet.
          </p>
        )}

      </Card>


      {/* BOOKINGS */}

      <Card className="p-6 mt-6">

        <h2 className="text-xl font-bold">
          Lecture Bookings
        </h2>

        <div className="space-y-3 mt-4">

          {(data.bookings || []).map(
            (booking: any) => (
              <div
                key={booking.booking_id}
                className="border border-slate-200 rounded-xl p-4"
              >

                <div className="flex flex-col md:flex-row justify-between gap-3">

                  <div>
                    <p className="font-semibold">
                      {booking.trainee_name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {booking.topic}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-semibold">
                      {booking.start_time} —{" "}
                      {booking.end_time}
                    </p>

                    <span className="text-xs text-indigo-600">
                      {booking.lecture_status}
                    </span>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </Card>


      {/* SLOT LIST */}

      <Card className="p-6 mt-6">

        <h2 className="text-xl font-bold">
          My Slots
        </h2>

        <div className="grid md:grid-cols-2 gap-3 mt-4">

          {(data.bookings || []).length ===
          0 &&
          (data.stats?.total_slots || 0) ===
            0 ? (
            <p className="text-slate-500">
              No slots yet.
            </p>
          ) : (
            <p className="text-slate-500">
              Manage your slots using the booking data above.
            </p>
          )}

        </div>

      </Card>

    </div>
  );
}


// ============================================================
// STUDENT PROGRESS FOR TRAINER
// ============================================================

function StudentProgressPage({
  trainerId,
  studentId,
  onBack,
}: {
  trainerId: number;
  studentId: number;
  onBack: () => void;
}) {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api(
      `/trainers/${trainerId}/students/${studentId}/progress`
    )
      .then(setData)
      .catch(() => setData(null))
      .finally(() =>
        setLoading(false)
      );
  }, [trainerId, studentId]);

  if (loading) {
    return <Spinner />;
  }

  if (!data) {
    return (
      <Card className="p-7">
        Unable to load student progress.
      </Card>
    );
  }

  return (
    <div>

      <Button
        secondary
        onClick={onBack}
      >
        ← Trainer Dashboard
      </Button>

      <Card className="p-6 mt-5">

        <h1 className="text-3xl font-bold">
          {data.student?.name}
        </h1>

        <p className="text-slate-500">
          {data.student?.email}
        </p>

        <p className="text-slate-600 mt-3">
          {data.student?.bio ||
            "No bio available."}
        </p>

      </Card>


      <Card className="p-6 mt-5">

        <h2 className="text-xl font-bold">
          Test History
        </h2>

        <div className="space-y-4 mt-4">

          {(data.tests || []).map(
            (test: any) => (
              <div
                key={test.attempt_id}
                className="border border-slate-200 rounded-xl p-5"
              >

                <div className="flex justify-between">

                  <div>
                    <p className="font-bold">
                      {test.course}
                    </p>

                    <p className="text-sm text-slate-500">
                      {test.test_type}
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-indigo-600">
                    {test.score}%
                  </p>

                </div>

                <div className="flex flex-wrap gap-2 mt-4">

                  {(test.topics || []).map(
                    (topic: any) => (
                      <span
                        key={topic.topic_id}
                        className={`px-3 py-1 rounded-full text-sm ${
                          topic.percentage <
                          60
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {topic.topic}:{" "}
                        {topic.percentage}%
                      </span>
                    )
                  )}

                </div>

              </div>
            )
          )}

        </div>

        {(data.tests || []).length ===
          0 && (
          <p className="text-slate-500 mt-4">
            No test attempts yet.
          </p>
        )}

      </Card>


      <Card className="p-6 mt-5">

        <h2 className="text-xl font-bold">
          Lecture History
        </h2>

        <div className="space-y-3 mt-4">

          {(data.lectures || []).map(
            (lecture: any) => (
              <div
                key={lecture.booking_id}
                className="border border-slate-200 rounded-xl p-4 flex justify-between"
              >

                <div>
                  <p className="font-semibold">
                    {lecture.topic}
                  </p>

                  <p className="text-sm text-slate-500">
                    {lecture.start_time} —{" "}
                    {lecture.end_time}
                  </p>
                </div>

                <span className="text-sm font-semibold text-indigo-600">
                  {lecture.status}
                </span>

              </div>
            )
          )}

        </div>

      </Card>

    </div>
  );
}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

function AdminDashboard({
  onBack,
}: {
  onBack: () => void;
}) {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api("/admin/dashboard")
      .then(setData)
      .catch(() => setData(null))
      .finally(() =>
        setLoading(false)
      );
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!data) {
    return (
      <Card className="p-7">
        Unable to load admin dashboard.
      </Card>
    );
  }

  return (
    <div>

      <Button
        secondary
        onClick={onBack}
      >
        ← Dashboard
      </Button>

      <h1 className="text-3xl font-bold mt-6">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-5 mt-6">

        <Card className="p-6">
          <p className="text-slate-500">
            Trainees
          </p>
          <p className="text-4xl font-bold mt-1">
            {data.users?.trainees || 0}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-slate-500">
            Trainers
          </p>
          <p className="text-4xl font-bold mt-1">
            {data.users?.trainers || 0}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-slate-500">
            Courses
          </p>
          <p className="text-4xl font-bold mt-1">
            {data.courses || 0}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-slate-500">
            Bookings
          </p>
          <p className="text-4xl font-bold mt-1">
            {data.bookings || 0}
          </p>
        </Card>

      </div>

      <Card className="p-7 mt-6">

        <h2 className="text-xl font-bold">
          Platform Overview
        </h2>

        <div className="grid md:grid-cols-3 gap-4 mt-5">

          <div className="bg-slate-50 rounded-xl p-5">
            <p className="text-sm text-slate-500">
              Admin Accounts
            </p>
            <p className="text-2xl font-bold mt-1">
              {data.users?.admins || 0}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5">
            <p className="text-sm text-slate-500">
              MCQ Questions
            </p>
            <p className="text-2xl font-bold mt-1">
              {data.questions || 0}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5">
            <p className="text-sm text-slate-500">
              Total Users
            </p>
            <p className="text-2xl font-bold mt-1">
              {(data.users?.trainees ||
                0) +
                (data.users?.trainers ||
                  0) +
                (data.users?.admins ||
                  0)}
            </p>
          </div>

        </div>

      </Card>

    </div>
  );
}


// ============================================================
// MAIN APP
// ============================================================

export default function App() {

  const [user, setUser] =
    useState<User | null>(() => {
      try {
        const saved =
          localStorage.getItem(
            "skillsphere_user"
          );

        return saved
          ? JSON.parse(saved)
          : null;
      } catch {
        return null;
      }
    });

  const [page, setPage] =
    useState<Page>("dashboard");

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const [attemptResult, setAttemptResult] =
    useState<AttemptResult | null>(null);

  const [selectedTrainer, setSelectedTrainer] =
    useState<Trainer | null>(null);

  const [selectedTopic, setSelectedTopic] =
    useState<Topic | null>(null);

  const [selectedStudentId, setSelectedStudentId] =
    useState<number | null>(null);


  function login(userData: User) {
    setUser(userData);

    localStorage.setItem(
      "skillsphere_user",
      JSON.stringify(userData)
    );

    if (userData.role === "trainer") {
      setPage("trainer-dashboard");
    } else if (
      userData.role === "admin"
    ) {
      setPage("admin");
    } else {
      setPage("dashboard");
    }
  }


  function logout() {
    localStorage.removeItem(
      "skillsphere_user"
    );

    setUser(null);
    setPage("dashboard");

    setSelectedCourse(null);
    setAttemptResult(null);
    setSelectedTrainer(null);
    setSelectedTopic(null);
  }


  function updateUser(
    updated: User
  ) {
    setUser(updated);

    localStorage.setItem(
      "skillsphere_user",
      JSON.stringify(updated)
    );
  }


  function selectCourse(
    course: Course
  ) {
    setSelectedCourse(course);
    setPage("test");
  }


  async function testFinished(
    attemptId: number
  ) {
    try {
      const result =
        await api(
          `/attempts/${attemptId}/result`
        );

      setAttemptResult(result);
      setPage("result");
    } catch (err: any) {
      alert(
        err?.message ||
          "Unable to load result."
      );
    }
  }


  function selectTrainer(
    trainer: Trainer
  ) {
    setSelectedTrainer(trainer);
    setPage("teacher");
  }


  function selectTopic(
    trainer: Trainer,
    topic: Topic
  ) {
    setSelectedTrainer(trainer);
    setSelectedTopic(topic);
    setPage("booking");
  }


  if (!user) {
    return (
      <AuthPage
        onLogin={login}
      />
    );
  }


  // ==========================================================
  // PAGE CONTENT
  // ==========================================================

  let content: React.ReactNode = null;

  if (
    page === "dashboard" &&
    user.role === "trainee"
  ) {
    content = (
      <TraineeDashboard
        user={user}
        onNavigate={setPage}
      />
    );
  }

  else if (
    page === "courses" &&
    user.role === "trainee"
  ) {
    content = (
      <CoursesPage
        onSelect={selectCourse}
        onBack={() =>
          setPage("dashboard")
        }
      />
    );
  }

  else if (
    page === "test" &&
    selectedCourse &&
    user.role === "trainee"
  ) {
    content = (
      <TestPage
        user={user}
        course={selectedCourse}
        onFinished={testFinished}
        onBack={() =>
          setPage("courses")
        }
      />
    );
  }

  else if (
    page === "result" &&
    attemptResult &&
    user.role === "trainee"
  ) {
    content = (
      <ResultPage
        result={attemptResult}
        onTeachers={() =>
          setPage("teachers")
        }
        onDashboard={() =>
          setPage("dashboard")
        }
      />
    );
  }

  else if (
    page === "teachers" &&
    user.role === "trainee"
  ) {
    content = (
      <TeachersPage
        onSelect={selectTrainer}
        onBack={() =>
          setPage("dashboard")
        }
      />
    );
  }

  else if (
    page === "teacher" &&
    selectedTrainer &&
    user.role === "trainee"
  ) {
    content = (
      <TeacherPage
        trainer={selectedTrainer}
        onBook={selectTopic}
        onBack={() =>
          setPage("teachers")
        }
      />
    );
  }

  else if (
    page === "booking" &&
    selectedTrainer &&
    selectedTopic &&
    user.role === "trainee"
  ) {
    content = (
      <BookingPage
        user={user}
        trainer={selectedTrainer}
        topic={selectedTopic}
        onDone={() =>
          setPage("bookings")
        }
        onBack={() =>
          setPage("teacher")
        }
      />
    );
  }

  else if (
    page === "bookings" &&
    user.role === "trainee"
  ) {
    content = (
      <BookingsPage
        user={user}
        onBack={() =>
          setPage("dashboard")
        }
      />
    );
  }

  else if (page === "profile") {
    content = (
      <ProfilePage
        user={user}
        onUpdated={updateUser}
        onBack={() =>
          setPage(
            user.role === "trainer"
              ? "trainer-dashboard"
              : user.role === "admin"
              ? "admin"
              : "dashboard"
          )
        }
      />
    );
  }

  else if (page === "settings") {
    content = (
      <SettingsPage
        user={user}
        onBack={() =>
          setPage(
            user.role === "trainer"
              ? "trainer-dashboard"
              : user.role === "admin"
              ? "admin"
              : "dashboard"
          )
        }
      />
    );
  }

  else if (
    page === "trainer-dashboard" &&
    user.role === "trainer"
  ) {
    content = (
      <TrainerDashboard
        user={user}
        onStudent={(studentId) => {
          setSelectedStudentId(
            studentId
          );

          setPage(
            "student-progress"
          );
        }}
        onProfile={() =>
          setPage("profile")
        }
      />
    );
  }

  else if (
    page === "student-progress" &&
    user.role === "trainer" &&
    selectedStudentId
  ) {
    content = (
      <StudentProgressPage
        trainerId={user.id}
        studentId={selectedStudentId}
        onBack={() =>
          setPage(
            "trainer-dashboard"
          )
        }
      />
    );
  }

  else if (
    page === "admin" &&
    user.role === "admin"
  ) {
    content = (
      <AdminDashboard
        onBack={() =>
          setPage("admin")
        }
      />
    );
  }

  else {
    content = (
      <TraineeDashboard
        user={user}
        onNavigate={setPage}
      />
    );
  }


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navButtons = useMemo(() => {

    if (user.role === "trainer") {
      return [
        {
          label: "Dashboard",
          page: "trainer-dashboard" as Page,
        },
        {
          label: "Profile",
          page: "profile" as Page,
        },
        {
          label: "Settings",
          page: "settings" as Page,
        },
      ];
    }

    if (user.role === "admin") {
      return [
        {
          label: "Admin Dashboard",
          page: "admin" as Page,
        },
        {
          label: "Profile",
          page: "profile" as Page,
        },
        {
          label: "Settings",
          page: "settings" as Page,
        },
      ];
    }

    return [
      {
        label: "Dashboard",
        page: "dashboard" as Page,
      },
      {
        label: "Courses",
        page: "courses" as Page,
      },
      {
        label: "Teachers",
        page: "teachers" as Page,
      },
      {
        label: "My Bookings",
        page: "bookings" as Page,
      },
    ];
  }, [user.role]);


  return (
    <div className="min-h-screen bg-slate-50">

      <Header
        user={user}
        onNavigate={setPage}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* NAV */}

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">

          {navButtons.map(
            (item) => (
              <button
                key={item.page}
                onClick={() =>
                  setPage(item.page)
                }
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold ${
                  page === item.page
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            )
          )}

        </div>

        {content}

      </div>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-center text-sm text-slate-400">
          © 2026 SkillSphere • Competency-Based Learning Platform
        </div>
      </footer>

    </div>
  );
}
