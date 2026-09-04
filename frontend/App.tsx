import React, { useEffect, useState } from "react";

const API_BASE =
  "https://skillsphere-backend-dcg2.onrender.com";

type Page =
  | "dashboard"
  | "courses"
  | "teachers"
  | "bookings"
  | "progress"
  | "profile"
  | "settings"
  | "trainer"
  | "admin"
  | "login";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  bio?: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  topic_count?: number;
  question_count?: number;
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
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
};

type Trainer = {
  id: number;
  name: string;
  email: string;
  bio?: string;
  available_slots?: number;
  recommended?: boolean;
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
  lecture_id?: number;
  lecture_status?: string;
};

type WeakTopic = {
  topic_id: number;
  topic: string;
  percentage: number;
};

type TestResult = {
  attempt_id: number;
  course_id: number;
  test_type: string;
  score: number;
  correct?: number;
  total?: number;
  questions: {
    question_id: number;
    question: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
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
  }[];
  weak_topics: WeakTopic[];
};

function text(value: unknown, fallback = "") {
  return value === undefined || value === null
    ? fallback
    : String(value);
}

function initials(value: unknown) {
  const name = text(value, "User").trim();

  if (!name) return "U";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x.charAt(0).toUpperCase())
    .join("");
}

async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "Something went wrong"
    );
  }

  return data as T;
}

/* =========================================================
   COMMON COMPONENTS
========================================================= */

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const classes = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary:
      "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-semibold transition ${
        classes[variant]
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : ""
      }`}
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
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5">
      {message}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(
      "skillsphere_user"
    );

    return saved ? JSON.parse(saved) : null;
  });

  const [page, setPage] =
    useState<Page>("dashboard");

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const [testResult, setTestResult] =
    useState<TestResult | null>(null);

  const [loading, setLoading] = useState(false);

  function loginUser(data: User) {
    setUser(data);
    localStorage.setItem(
      "skillsphere_user",
      JSON.stringify(data)
    );
    setPage("dashboard");
  }

  function logout() {
    localStorage.removeItem("skillsphere_user");
    setUser(null);
    setPage("login");
  }

  if (!user) {
    return <AuthScreen onLogin={loginUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        user={user}
        page={page}
        setPage={setPage}
        logout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {page === "dashboard" && (
          <Dashboard
            user={user}
            setPage={setPage}
            setSelectedCourse={setSelectedCourse}
          />
        )}

        {page === "courses" && (
          <CoursesPage
            user={user}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            setTestResult={setTestResult}
            setPage={setPage}
          />
        )}

        {page === "teachers" && (
          <TeachersPage user={user} />
        )}

        {page === "bookings" && (
          <BookingsPage user={user} />
        )}

        {page === "progress" && (
          <ProgressPage user={user} />
        )}

        {page === "profile" && (
          <ProfilePage
            user={user}
            setUser={setUser}
          />
        )}

        {page === "settings" && (
          <SettingsPage user={user} />
        )}

        {page === "trainer" &&
          user.role === "trainer" && (
            <TrainerDashboard user={user} />
          )}

        {page === "admin" &&
          user.role === "admin" && (
            <AdminDashboard />
          )}

        {page === "login" && (
          <Dashboard
            user={user}
            setPage={setPage}
            setSelectedCourse={setSelectedCourse}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function AuthScreen({
  onLogin,
}: {
  onLogin: (user: User) => void;
}) {
  const [mode, setMode] =
    useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [role, setRole] =
    useState("trainee");
  const [bio, setBio] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await api<User>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        onLogin(data);
      } else {
        const data = await api<User>(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify({
              name,
              email,
              password,
              role,
              bio,
            }),
          }
        );

        onLogin(data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-8">
          <div className="text-5xl mb-3">
            🎓
          </div>

          <h1 className="text-4xl font-black">
            SkillSphere
          </h1>

          <p className="text-indigo-100 mt-2">
            Competency Based Learning Platform
          </p>
        </div>

        <Card className="p-7">
          <div className="flex mb-6 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() =>
                setMode("login")
              }
              className={`flex-1 py-2 rounded-lg font-semibold ${
                mode === "login"
                  ? "bg-white shadow text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              Login
            </button>

            <button
              onClick={() =>
                setMode("register")
              }
              className={`flex-1 py-2 rounded-lg font-semibold ${
                mode === "register"
                  ? "bg-white shadow text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              Register
            </button>
          </div>

          {error && <ErrorBox message={error} />}

          <form
            onSubmit={submit}
            className="space-y-4"
          >
            {mode === "register" && (
              <>
                <Input
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="Enter your name"
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300"
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
                </div>

                <Input
                  label="Bio"
                  value={bio}
                  onChange={setBio}
                  placeholder="Short bio"
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

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
      </div>
    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  user,
  page,
  setPage,
  logout,
}: {
  user: User;
  page: Page;
  setPage: (page: Page) => void;
  logout: () => void;
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <button
            onClick={() => setPage("dashboard")}
            className="flex items-center gap-2"
          >
            <span className="text-3xl">
              🎓
            </span>

            <span className="text-xl font-black text-indigo-600">
              SkillSphere
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-1">
            <NavButton
              icon="🏠"
              label="Dashboard"
              active={page === "dashboard"}
              onClick={() =>
                setPage("dashboard")
              }
            />

            <NavButton
              icon="📚"
              label="Courses"
              active={page === "courses"}
              onClick={() =>
                setPage("courses")
              }
            />

            <NavButton
              icon="👨‍🏫"
              label="Teachers"
              active={page === "teachers"}
              onClick={() =>
                setPage("teachers")
              }
            />

            <NavButton
              icon="📅"
              label="Bookings"
              active={page === "bookings"}
              onClick={() =>
                setPage("bookings")
              }
            />

            <NavButton
              icon="📈"
              label="Progress"
              active={page === "progress"}
              onClick={() =>
                setPage("progress")
              }
            />

            {user.role === "trainer" && (
              <NavButton
                icon="👨‍🏫"
                label="Trainer"
                active={page === "trainer"}
                onClick={() =>
                  setPage("trainer")
                }
              />
            )}

            {user.role === "admin" && (
              <NavButton
                icon="⚙️"
                label="Admin"
                active={page === "admin"}
                onClick={() =>
                  setPage("admin")
                }
              />
            )}
          </div>

          <div className="relative group">
            <button className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                {initials(user.name)}
              </div>

              <div className="hidden md:block text-left">
                <div className="font-semibold text-sm">
                  {user.name}
                </div>

                <div className="text-xs text-slate-500 capitalize">
                  {user.role}
                </div>
              </div>

              <span>⌄</span>
            </button>

            <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
              <div className="bg-white border border-slate-200 shadow-xl rounded-xl w-48 p-2">
                <button
                  onClick={() =>
                    setPage("profile")
                  }
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
                >
                  👤 Profile
                </button>

                <button
                  onClick={() =>
                    setPage("settings")
                  }
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
                >
                  ⚙️ Settings
                </button>

                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden flex gap-2 overflow-x-auto pb-3">
          <NavButton
            icon="🏠"
            label="Home"
            active={page === "dashboard"}
            onClick={() =>
              setPage("dashboard")
            }
          />

          <NavButton
            icon="📚"
            label="Courses"
            active={page === "courses"}
            onClick={() =>
              setPage("courses")
            }
          />

          <NavButton
            icon="👨‍🏫"
            label="Teachers"
            active={page === "teachers"}
            onClick={() =>
              setPage("teachers")
            }
          />

          <NavButton
            icon="📅"
            label="Bookings"
            active={page === "bookings"}
            onClick={() =>
              setPage("bookings")
            }
          />
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  user,
  setPage,
  setSelectedCourse,
}: {
  user: User;
  setPage: (page: Page) => void;
  setSelectedCourse: (course: Course) => void;
}) {
  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api<Course[]>("/courses")
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-10 text-white">
        <div className="max-w-3xl">
          <p className="text-indigo-100 mb-2">
            Welcome back 👋
          </p>

          <h1 className="text-4xl md:text-5xl font-black">
            Hi, {user.name}
          </h1>

          <p className="mt-4 text-indigo-100 text-lg">
            Build your skills, identify your weak
            topics and learn from the right trainer.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              onClick={() =>
                setPage("courses")
              }
            >
              📚 Explore Courses
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                setPage("teachers")
              }
            >
              👨‍🏫 Find a Teacher
            </Button>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-5">
        <Stat
          icon="📚"
          title="Courses"
          value={courses.length}
        />

        <Stat
          icon="🎯"
          title="Learning Mode"
          value="Adaptive"
        />

        <Stat
          icon="👨‍🏫"
          title="Trainers"
          value="Available"
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Popular Courses
            </h2>

            <p className="text-slate-500">
              Start with a diagnostic test
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() =>
              setPage("courses")
            }
          >
            View all →
          </Button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="p-6 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">
                  {course.title
                    .toLowerCase()
                    .includes("python")
                    ? "🐍"
                    : course.title
                        .toLowerCase()
                        .includes("cyber")
                    ? "🔐"
                    : course.title
                        .toLowerCase()
                        .includes("database")
                    ? "🗄️"
                    : "📚"}
                </div>

                <h3 className="text-xl font-black">
                  {course.title}
                </h3>

                <p className="text-slate-500 mt-2 min-h-12">
                  {course.description}
                </p>

                <div className="flex gap-2 mt-5 text-sm text-slate-500">
                  <span>
                    📖 {course.topic_count || 0} Topics
                  </span>

                  <span>
                    📝 {course.question_count || 0} MCQs
                  </span>
                </div>

                <div className="mt-5">
                  <Button
                    onClick={() => {
                      setSelectedCourse(course);
                      setPage("courses");
                    }}
                  >
                    Open Course →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="text-3xl">
        {icon}
      </div>

      <div>
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <p className="text-2xl font-black">
          {value}
        </p>
      </div>
    </Card>
  );
}

/* =========================================================
   COURSES
========================================================= */

function CoursesPage({
  user,
  selectedCourse,
  setSelectedCourse,
  setTestResult,
  setPage,
}: {
  user: User;
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  setTestResult: (result: TestResult) => void;
  setPage: (page: Page) => void;
}) {
  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    api<Course[]>("/courses")
      .then(setCourses)
      .catch((err) =>
        setError(err.message)
      )
      .finally(() => setLoading(false));
  }, []);

  if (selectedCourse) {
    return (
      <CourseTest
        user={user}
        course={selectedCourse}
        onBack={() =>
          setSelectedCourse(null)
        }
        onResult={(result) => {
          setTestResult(result);
        }}
        setPage={setPage}
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">
          📚 Courses
        </h1>

        <p className="text-slate-500 mt-2">
          Select a course and take your diagnostic
          test.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="p-6 hover:shadow-xl transition"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-4xl mb-5">
                {course.title
                  .toLowerCase()
                  .includes("python")
                  ? "🐍"
                  : course.title
                      .toLowerCase()
                      .includes("cyber")
                  ? "🔐"
                  : course.title
                      .toLowerCase()
                      .includes("database")
                  ? "🗄️"
                  : "📚"}
              </div>

              <h2 className="text-2xl font-black">
                {course.title}
              </h2>

              <p className="text-slate-500 mt-2">
                {course.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xl">
                    📖
                  </div>
                  <div className="text-sm text-slate-500">
                    Topics
                  </div>
                  <div className="font-bold">
                    {course.topic_count || 0}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xl">
                    📝
                  </div>
                  <div className="text-sm text-slate-500">
                    MCQs
                  </div>
                  <div className="font-bold">
                    {course.question_count || 0}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() =>
                    setSelectedCourse(course)
                  }
                >
                  Start Diagnostic Test →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COURSE TEST
========================================================= */

function CourseTest({
  user,
  course,
  onBack,
  onResult,
  setPage,
}: {
  user: User;
  course: Course;
  onBack: () => void;
  onResult: (result: TestResult) => void;
  setPage: (page: Page) => void;
}) {
  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] =
    useState<TestResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data =
          await api<Question[]>(
            `/courses/${course.id}/questions`
          );

        // Exactly maximum 15 questions
        setQuestions(data.slice(0, 15));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load questions"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [course.id]);

  async function submitTest() {
    if (questions.length === 0) {
      return;
    }

    if (
      Object.keys(answers).length !==
      questions.length
    ) {
      setError(
        "Please answer all questions before submitting."
      );
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response =
        await api<{
          attempt_id: number;
          score: number;
          correct: number;
          total: number;
          test_type: string;
          weak_topics: WeakTopic[];
        }>("/tests/submit", {
          method: "POST",
          body: JSON.stringify({
            trainee_id: user.id,
            course_id: course.id,
            test_type: "pretest",
            answers: questions.map((q) => ({
              question_id: q.id,
              answer: answers[q.id],
            })),
          }),
        });

      const fullResult =
        await api<TestResult>(
          `/attempts/${response.attempt_id}/result`
        );

      setResult(fullResult);
      onResult(fullResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Test submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <TestResultPage
        user={user}
        result={result}
        course={course}
        setPage={setPage}
        onBack={onBack}
      />
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-indigo-600 font-semibold mb-5"
      >
        ← Back to Courses
      </button>

      <div className="mb-7">
        <span className="text-sm font-semibold text-indigo-600">
          Diagnostic Test
        </span>

        <h1 className="text-3xl font-black mt-1">
          {course.title}
        </h1>

        <p className="text-slate-500 mt-2">
          Answer all questions honestly. Your weak
          topics will be identified automatically.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="space-y-5">
        {questions.map((q, index) => (
          <Card
            key={q.id}
            className="p-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                {index + 1}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {q.text}
                </h3>

                <div className="grid md:grid-cols-2 gap-3 mt-5">
                  {(
                    Object.entries(
                      q.options
                    ) as [
                      string,
                      string
                    ][]
                  ).map(
                    ([key, value]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setAnswers(
                            (prev) => ({
                              ...prev,
                              [q.id]: key,
                            })
                          )
                        }
                        className={`text-left p-4 rounded-xl border-2 transition ${
                          answers[q.id] === key
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        <span className="font-bold mr-2">
                          {key}.
                        </span>

                        {value}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-7 flex justify-end">
        <Button
          onClick={submitTest}
          disabled={submitting}
        >
          {submitting
            ? "Analyzing..."
            : "Submit Test & Analyze →"}
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   TEST RESULT
========================================================= */

function TestResultPage({
  user,
  result,
  course,
  setPage,
  onBack,
}: {
  user: User;
  result: TestResult;
  course: Course;
  setPage: (page: Page) => void;
  onBack: () => void;
}) {
  const percentage =
    Number(result.score || 0);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-indigo-600 font-semibold mb-2"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-black">
            Test Result
          </h1>

          <p className="text-slate-500">
            {course.title}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() =>
            setPage("teachers")
          }
        >
          👨‍🏫 Book Teacher Directly
        </Button>
      </div>

      <Card className="p-8 text-center">
        <div className="text-6xl font-black text-indigo-600">
          {percentage.toFixed(1)}%
        </div>

        <p className="text-slate-500 mt-2">
          Your diagnostic score
        </p>

        <div className="mt-5 text-lg">
          {percentage >= 80
            ? "🎉 Excellent performance!"
            : percentage >= 60
            ? "👍 Good performance, but some topics need work."
            : "🎯 Let's improve your weak topics!"}
        </div>
      </Card>

      {/* TOPIC ANALYSIS */}

      <section>
        <h2 className="text-2xl font-black mb-4">
          📊 Topic-wise Analysis
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {result.topic_analysis?.map(
            (topic) => {
              const weak =
                topic.percentage < 60;

              return (
                <Card
                  key={topic.topic_id}
                  className="p-5"
                >
                  <div className="flex justify-between">
                    <div className="font-bold">
                      {topic.topic}
                    </div>

                    <div
                      className={`font-black ${
                        weak
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {topic.percentage.toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>

                  <div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        weak
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          topic.percentage
                        )}%`,
                      }}
                    />
                  </div>

                  {weak && (
                    <div className="mt-3 text-sm text-red-600 font-semibold">
                      ⚠️ Weak Topic
                    </div>
                  )}
                </Card>
              );
            }
          )}
        </div>
      </section>

      {/* WEAK TOPICS */}

      {result.weak_topics?.length > 0 && (
        <section>
          <h2 className="text-2xl font-black mb-4">
            🎯 Your Weak Topics
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {result.weak_topics.map(
              (topic) => (
                <Card
                  key={topic.topic_id}
                  className="p-5 border-red-200 bg-red-50"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-black text-red-800">
                        {topic.topic}
                      </div>

                      <div className="text-sm text-red-600 mt-1">
                        You scored{" "}
                        {topic.percentage.toFixed(
                          1
                        )}
                        %
                      </div>
                    </div>

                    <span className="text-2xl">
                      ⚠️
                    </span>
                  </div>
                </Card>
              )
            )}
          </div>
        </section>
      )}

      {/* TRAINERS */}

      {result.weak_topics?.length > 0 ? (
        <section>
          <h2 className="text-2xl font-black mb-2">
            👨‍🏫 Recommended Trainers
          </h2>

          <p className="text-slate-500 mb-5">
            Trainers are automatically recommended
            based on your weak MCQ topics.
          </p>

          <div className="space-y-6">
            {result.weak_topics.map(
              (topic) => (
                <RecommendedTrainers
                  key={topic.topic_id}
                  user={user}
                  topic={topic}
                />
              )
            )}
          </div>
        </section>
      ) : (
        <Card className="p-7 bg-green-50 border-green-200">
          <div className="text-3xl">
            🎉
          </div>

          <h3 className="text-xl font-black text-green-800 mt-2">
            No weak topics detected!
          </h3>

          <p className="text-green-700 mt-1">
            You can still book a teacher directly
            whenever you need help.
          </p>

          <div className="mt-4">
            <Button
              onClick={() =>
                setPage("teachers")
              }
            >
              Find a Teacher
            </Button>
          </div>
        </Card>
      )}

      {/* WRONG QUESTIONS */}

      <section>
        <h2 className="text-2xl font-black mb-4">
          ❌ Question Review
        </h2>

        <div className="space-y-4">
          {result.questions
            ?.filter(
              (q) => !q.is_correct
            )
            .map((q, index) => (
              <Card
                key={q.question_id}
                className="p-6 border-red-200"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <div className="font-bold text-lg">
                      {q.question}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="p-3 rounded-lg bg-red-50 text-red-700">
                        <b>Your answer:</b>{" "}
                        {q.your_answer || "Not answered"}
                      </div>

                      <div className="p-3 rounded-lg bg-green-50 text-green-700">
                        <b>Correct answer:</b>{" "}
                        {q.correct_answer}
                      </div>

                      <div className="text-slate-500">
                        Topic:{" "}
                        <b>{q.topic}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   RECOMMENDED TRAINERS
========================================================= */

function RecommendedTrainers({
  user,
  topic,
}: {
  user: User;
  topic: WeakTopic;
}) {
  const [trainers, setTrainers] =
    useState<Trainer[]>([]);

  const [selectedTrainer, setSelectedTrainer] =
    useState<Trainer | null>(null);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    api<Trainer[]>(
      `/trainers/recommended/${topic.topic_id}`
    )
      .then(setTrainers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [topic.topic_id]);

  async function loadSlots(
    trainer: Trainer
  ) {
    setSelectedTrainer(trainer);
    setMessage("");

    try {
      const data = await api<Slot[]>(
        `/trainers/${trainer.id}/slots`
      );

      setSlots(
        data.filter((slot) => slot.available)
      );
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Could not load slots"
      );
    }
  }

  async function bookSlot(slot: Slot) {
    if (!selectedTrainer) return;

    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: selectedTrainer.id,
          slot_id: slot.id,
          topic_id: topic.topic_id,
        }),
      });

      setMessage(
        "✅ Lecture booked successfully!"
      );

      setSlots((prev) =>
        prev.filter(
          (item) => item.id !== slot.id
        )
      );
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Booking failed"
      );
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-sm font-semibold text-red-600">
            Weak Topic
          </div>

          <h3 className="text-xl font-black">
            {topic.topic}
          </h3>

          <p className="text-sm text-slate-500">
            Score:{" "}
            {topic.percentage.toFixed(1)}%
          </p>
        </div>

        <span className="text-3xl">
          🎯
        </span>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-3 mb-4">
          {message}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : trainers.length === 0 ? (
        <div className="text-slate-500">
          No trainer currently available for this
          topic.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="border border-slate-200 rounded-xl p-5"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {initials(trainer.name)}
                </div>

                <div>
                  <h4 className="font-black">
                    {trainer.name}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {trainer.bio}
                  </p>

                  <p className="text-sm text-green-600 mt-2">
                    🟢{" "}
                    {trainer.available_slots ||
                      0} slots available
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  onClick={() =>
                    loadSlots(trainer)
                  }
                >
                  View Slots
                </Button>
              </div>

              {selectedTrainer?.id ===
                trainer.id && (
                <div className="mt-4 space-y-2">
                  {slots.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No available slots.
                    </p>
                  ) : (
                    slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                      >
                        <div className="text-sm">
                          🕐{" "}
                          {slot.start_time} -{" "}
                          {slot.end_time}
                        </div>

                        <button
                          onClick={() =>
                            bookSlot(slot)
                          }
                          className="text-sm font-bold text-indigo-600"
                        >
                          Book
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* =========================================================
   TEACHERS
========================================================= */

function TeachersPage({
  user,
}: {
  user: User;
}) {
  const [trainers, setTrainers] =
    useState<Trainer[]>([]);

  const [selectedTrainer, setSelectedTrainer] =
    useState<Trainer | null>(null);

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [selectedTopic, setSelectedTopic] =
    useState<Topic | null>(null);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    api<Trainer[]>("/trainers")
      .then(setTrainers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function selectTrainer(
    trainer: Trainer
  ) {
    setSelectedTrainer(trainer);
    setSelectedTopic(null);
    setSlots([]);
    setMessage("");

    try {
      const data = await api<Topic[]>(
        `/trainers/${trainer.id}/topics`
      );

      setTopics(data);
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to load topics"
      );
    }
  }

  async function selectTopic(
    topic: Topic
  ) {
    setSelectedTopic(topic);
    setMessage("");

    if (!selectedTrainer) return;

    try {
      const data = await api<Slot[]>(
        `/trainers/${selectedTrainer.id}/slots`
      );

      setSlots(
        data.filter((slot) => slot.available)
      );
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to load slots"
      );
    }
  }

  async function book(slot: Slot) {
    if (
      !selectedTrainer ||
      !selectedTopic
    ) {
      return;
    }

    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: selectedTrainer.id,
          slot_id: slot.id,
          topic_id: selectedTopic.id,
        }),
      });

      setMessage(
        "✅ Lecture booked successfully!"
      );

      setSlots((prev) =>
        prev.filter(
          (item) => item.id !== slot.id
        )
      );
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Booking failed"
      );
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">
          👨‍🏫 Teachers
        </h1>

        <p className="text-slate-500 mt-2">
          You can book a lecture directly without
          taking any test.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 mb-5">
          {message}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* TRAINERS */}

          <div className="space-y-4">
            <h2 className="font-black text-xl">
              1. Select Teacher
            </h2>

            {trainers.map((trainer) => (
              <Card
                key={trainer.id}
                className={`p-5 cursor-pointer transition ${
                  selectedTrainer?.id ===
                  trainer.id
                    ? "border-indigo-600 ring-2 ring-indigo-100"
                    : "hover:shadow-md"
                }`}
                onClick={() =>
                  selectTrainer(trainer)
                }
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    {initials(trainer.name)}
                  </div>

                  <div>
                    <h3 className="font-black">
                      {trainer.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {trainer.bio}
                    </p>

                    <p className="text-xs text-green-600 mt-1">
                      🟢{" "}
                      {trainer.available_slots ||
                        0} slots
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* TOPICS */}

          <div>
            <h2 className="font-black text-xl mb-4">
              2. Select Topic
            </h2>

            {!selectedTrainer ? (
              <Card className="p-6 text-slate-500">
                Select a teacher first.
              </Card>
            ) : topics.length === 0 ? (
              <Card className="p-6 text-slate-500">
                No topics found.
              </Card>
            ) : (
              <div className="space-y-3">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() =>
                      selectTopic(topic)
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 ${
                      selectedTopic?.id ===
                      topic.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    📖 {topic.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SLOTS */}

          <div>
            <h2 className="font-black text-xl mb-4">
              3. Book Slot
            </h2>

            {!selectedTopic ? (
              <Card className="p-6 text-slate-500">
                Select a topic first.
              </Card>
            ) : slots.length === 0 ? (
              <Card className="p-6 text-slate-500">
                No available slots.
              </Card>
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => (
                  <Card
                    key={slot.id}
                    className="p-4"
                  >
                    <div className="font-bold">
                      🕐 {slot.start_time}
                    </div>

                    <div className="text-sm text-slate-500">
                      to {slot.end_time}
                    </div>

                    <div className="mt-3">
                      <Button
                        onClick={() =>
                          book(slot)
                        }
                      >
                        Book Lecture
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   BOOKINGS
========================================================= */

function BookingsPage({
  user,
}: {
  user: User;
}) {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function load() {
    try {
      const data =
        await api<Booking[]>(
          `/bookings/trainee/${user.id}`
        );

      setBookings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bookings"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.id]);

  async function completeLecture(
    lectureId?: number
  ) {
    if (!lectureId) return;

    try {
      await api(
        `/lectures/${lectureId}/complete`,
        {
          method: "POST",
        }
      );

      load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete lecture"
      );
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">
          📅 My Bookings
        </h1>

        <p className="text-slate-500 mt-2">
          Your scheduled trainer lectures.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : bookings.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-5xl">
            📅
          </div>

          <h3 className="font-black text-xl mt-3">
            No bookings yet
          </h3>

          <p className="text-slate-500">
            Book a trainer lecture to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card
              key={booking.booking_id}
              className="p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-indigo-600 font-semibold">
                    {booking.topic}
                  </div>

                  <h3 className="text-xl font-black">
                    {booking.trainer}
                  </h3>

                  <p className="text-slate-500 mt-1">
                    🕐 {booking.start_time} -{" "}
                    {booking.end_time}
                  </p>
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    {booking.status}
                  </span>

                  {booking.lecture_id &&
                    booking.lecture_status !==
                      "completed" && (
                      <div className="mt-3">
                        <Button
                          onClick={() =>
                            completeLecture(
                              booking.lecture_id
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
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressPage({
  user,
}: {
  user: User;
}) {
  const [data, setData] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api<any[]>(
      `/progress/${user.id}`
    )
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">
          📈 My Progress
        </h1>

        <p className="text-slate-500 mt-2">
          Track your tests and topic performance.
        </p>
      </div>

      {data.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-5xl">
            📊
          </div>

          <h3 className="text-xl font-black mt-3">
            No progress yet
          </h3>

          <p className="text-slate-500">
            Take a course test to start tracking
            your progress.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {data.map((item) => (
            <Card
              key={item.attempt_id}
              className="p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black">
                    {item.course}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {item.test_type}
                  </p>
                </div>

                <div className="text-3xl font-black text-indigo-600">
                  {Number(
                    item.score || 0
                  ).toFixed(1)}
                  %
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-5">
                {item.topics?.map(
                  (topic: any) => (
                    <div
                      key={topic.topic}
                      className="bg-slate-50 p-4 rounded-xl"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          {topic.topic}
                        </span>

                        <span className="font-bold">
                          {Number(
                            topic.percentage
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfilePage({
  user,
  setUser,
}: {
  user: User;
  setUser: (user: User) => void;
}) {
  const [name, setName] =
    useState(user.name);

  const [bio, setBio] =
    useState(user.bio || "");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function save() {
    setMessage("");
    setError("");

    try {
      const updated =
        await api<User>(
          `/users/${user.id}/profile`,
          {
            method: "PUT",
            body: JSON.stringify({
              name,
              bio,
            }),
          }
        );

      setUser(updated);

      localStorage.setItem(
        "skillsphere_user",
        JSON.stringify(updated)
      );

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Update failed"
      );
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-7">
        👤 Profile
      </h1>

      {message && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 mb-5">
          {message}
        </div>
      )}

      {error && <ErrorBox message={error} />}

      <Card className="p-7 space-y-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-black">
            {initials(user.name)}
          </div>

          <div>
            <h2 className="font-black text-xl">
              {user.name}
            </h2>

            <p className="text-slate-500">
              {user.email}
            </p>

            <p className="text-sm text-indigo-600 capitalize">
              {user.role}
            </p>
          </div>
        </div>

        <Input
          label="Name"
          value={name}
          onChange={setName}
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-300 min-h-32"
          />
        </div>

        <Button onClick={save}>
          Save Profile
        </Button>
      </Card>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  user,
}: {
  user: User;
}) {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function changePassword() {
    setMessage("");
    setError("");

    try {
      await api(
        `/users/${user.id}/password`,
        {
          method: "PUT",
          body: JSON.stringify({
            current_password:
              currentPassword,
            new_password: newPassword,
          }),
        }
      );

      setCurrentPassword("");
      setNewPassword("");

      setMessage(
        "Password changed successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Password change failed"
      );
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-7">
        ⚙️ Settings
      </h1>

      {message && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 mb-5">
          {message}
        </div>
      )}

      {error && <ErrorBox message={error} />}

      <Card className="p-7">
        <h2 className="text-xl font-black mb-5">
          Change Password
        </h2>

        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
          />

          <Button
            onClick={changePassword}
          >
            Update Password
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   TRAINER DASHBOARD
========================================================= */

function TrainerDashboard({
  user,
}: {
  user: User;
}) {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function load() {
    try {
      const response =
        await api<any>(
          `/trainers/${user.id}/dashboard`
        );

      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.id]);

  async function addSlot() {
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

      setMessage(
        "Slot added successfully."
      );

      load();
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to add slot"
      );
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">
          👨‍🏫 Trainer Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Manage your students and lecture slots.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 rounded-xl p-4 mb-5">
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5 mb-7">
        <Stat
          icon="👨‍🎓"
          title="Students"
          value={
            data?.stats?.students || 0
          }
        />

        <Stat
          icon="📅"
          title="Bookings"
          value={
            data?.stats?.bookings || 0
          }
        />

        <Stat
          icon="📖"
          title="Lectures"
          value={
            data?.stats?.lectures || 0
          }
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-black mb-5">
            ➕ Add Available Slot
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              value={startTime}
              onChange={setStartTime}
              placeholder="10:00 AM"
            />

            <Input
              label="End Time"
              value={endTime}
              onChange={setEndTime}
              placeholder="11:00 AM"
            />
          </div>

          <div className="mt-5">
            <Button onClick={addSlot}>
              Add Slot
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-black mb-5">
            📚 My Expertise
          </h2>

          <div className="flex flex-wrap gap-2">
            {data?.expertise?.map(
              (topic: any) => (
                <span
                  key={topic.id}
                  className="px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold"
                >
                  {topic.name}
                </span>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN
========================================================= */

function AdminDashboard() {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api<any>("/admin/dashboard")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">
          ⚙️ Admin Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          SkillSphere platform overview.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-5">
        <AdminStat
          icon="👥"
          title="Users"
          value={data?.users || 0}
        />

        <AdminStat
          icon="📚"
          title="Courses"
          value={data?.courses || 0}
        />

        <AdminStat
          icon="📝"
          title="Questions"
          value={data?.questions || 0}
        />

        <AdminStat
          icon="📅"
          title="Bookings"
          value={data?.bookings || 0}
        />
      </div>

      <Card className="p-7 mt-7">
        <h2 className="text-xl font-black mb-4">
          Platform
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-xl p-5">
            <div className="text-3xl">
              🎯
            </div>

            <h3 className="font-black mt-2">
              Competency Based Learning
            </h3>

            <p className="text-sm text-slate-600 mt-1">
              Students are matched with trainers
              based on weak topics.
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-5">
            <div className="text-3xl">
              👨‍🏫
            </div>

            <h3 className="font-black mt-2">
              Trainer Booking
            </h3>

            <p className="text-sm text-slate-600 mt-1">
              Students can book trainers directly or
              through diagnostic recommendations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AdminStat({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <Card className="p-6">
      <div className="text-3xl">
        {icon}
      </div>

      <p className="text-sm text-slate-500 mt-3">
        {title}
      </p>

      <p className="text-3xl font-black">
        {value}
      </p>
    </Card>
  );
}
