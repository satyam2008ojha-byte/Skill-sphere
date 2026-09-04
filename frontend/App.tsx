import React, { useEffect, useState } from "react";

const API_BASE = "https://skillsphere-backend-dcg2.onrender.com";

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
  description?: string;
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
  options: string[];
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

type TestResult = {
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
    topic: string;
    percentage: number;
  }[];
  weak_topics: {
    topic_id: number;
    topic: string;
    percentage: number;
  }[];
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
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const body = await response.text();

  let data: any = null;

  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        `Request failed: ${response.status}`
    );
  }

  return data as T;
}

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
  const style = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100",
    secondary:
      "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    danger:
      "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2.5 font-semibold transition ${style[variant]}`}
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
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        <p className="mt-3 text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
      />
    </div>
  );
}

function NavButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("skillsphere_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [error, setError] = useState("");

  function loginUser(newUser: User) {
    setUser(newUser);
    localStorage.setItem(
      "skillsphere_user",
      JSON.stringify(newUser)
    );
    setPage("dashboard");
  }

  function logout() {
    localStorage.removeItem("skillsphere_user");
    setUser(null);
    setPage("dashboard");
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <ErrorBox
            message={error}
          />
        )}

        {page === "dashboard" && (
          <Dashboard
            user={user}
            setPage={setPage}
            setError={setError}
          />
        )}

        {page === "courses" && (
          <CoursesPage
            user={user}
            setPage={setPage}
            setError={setError}
          />
        )}

        {page === "teachers" && (
          <TeachersPage
            user={user}
            setError={setError}
          />
        )}

        {page === "bookings" && (
          <BookingsPage
            user={user}
            setError={setError}
          />
        )}

        {page === "progress" && (
          <ProgressPage
            user={user}
            setError={setError}
          />
        )}

        {page === "profile" && (
          <ProfilePage
            user={user}
            setUser={setUser}
            setError={setError}
          />
        )}

        {page === "settings" && (
          <SettingsPage
            user={user}
            setError={setError}
          />
        )}

        {page === "trainer-dashboard" &&
          user.role === "trainer" && (
            <TrainerDashboard
              user={user}
              setError={setError}
            />
          )}

        {page === "admin-dashboard" &&
          user.role === "admin" && (
            <AdminDashboard
              setError={setError}
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
  const [mode, setMode] = useState<"login" | "register">(
    "login"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("trainee");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const result = await api<User>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        onLogin(result);
      } else {
        const result = await api<User>(
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

        onLogin(result);
      }
    } catch (err: any) {
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white">
            S
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            SkillSphere
          </h1>

          <p className="mt-2 text-slate-500">
            Competency Based Learning Platform
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`rounded-lg py-2.5 font-bold ${
                mode === "login"
                  ? "bg-white text-indigo-600 shadow"
                  : "text-slate-500"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`rounded-lg py-2.5 font-bold ${
                mode === "register"
                  ? "bg-white text-indigo-600 shadow"
                  : "text-slate-500"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <ErrorBox message={error} />
          )}

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
                  required
                />

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
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

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Bio
                  </label>

                  <textarea
                    value={bio}
                    onChange={(e) =>
                      setBio(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    placeholder="Short bio"
                  />
                </div>
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
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
  page: string;
  setPage: (page: string) => void;
  logout: () => void;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button
          onClick={() => setPage("dashboard")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-black text-white">
            S
          </div>

          <div className="text-left">
            <div className="font-black text-slate-900">
              SkillSphere
            </div>

            <div className="text-xs text-slate-400">
              Learning Platform
            </div>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          <NavButton
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          >
            Home
          </NavButton>

          <NavButton
            active={page === "courses"}
            onClick={() => setPage("courses")}
          >
            📚 Courses
          </NavButton>

          <NavButton
            active={page === "teachers"}
            onClick={() => setPage("teachers")}
          >
            👨‍🏫 Teachers
          </NavButton>

          <NavButton
            active={page === "bookings"}
            onClick={() => setPage("bookings")}
          >
            📅 Bookings
          </NavButton>

          <NavButton
            active={page === "progress"}
            onClick={() => setPage("progress")}
          >
            📊 Progress
          </NavButton>

          {user.role === "trainer" && (
            <NavButton
              active={
                page === "trainer-dashboard"
              }
              onClick={() =>
                setPage("trainer-dashboard")
              }
            >
              Trainer
            </NavButton>
          )}

          {user.role === "admin" && (
            <NavButton
              active={
                page === "admin-dashboard"
              }
              onClick={() =>
                setPage("admin-dashboard")
              }
            >
              Admin
            </NavButton>
          )}
        </nav>

        <div className="relative">
          <button
            onClick={() => setMenu(!menu)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {initials(user.name)}
            </div>

            <div className="hidden text-left sm:block">
              <div className="max-w-32 truncate text-sm font-bold">
                {text(user.name, "User")}
              </div>

              <div className="text-xs capitalize text-slate-400">
                {text(user.role, "trainee")}
              </div>
            </div>

            <span>⌄</span>
          </button>

          {menu && (
            <div className="absolute right-0 top-14 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <button
                onClick={() => {
                  setPage("profile");
                  setMenu(false);
                }}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-slate-50"
              >
                👤 Profile
              </button>

              <button
                onClick={() => {
                  setPage("settings");
                  setMenu(false);
                }}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-slate-50"
              >
                ⚙️ Settings
              </button>

              <div className="my-1 border-t" />

              <button
                onClick={logout}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-t px-3 py-2 md:hidden">
        <NavButton
          active={page === "dashboard"}
          onClick={() => setPage("dashboard")}
        >
          Home
        </NavButton>

        <NavButton
          active={page === "courses"}
          onClick={() => setPage("courses")}
        >
          📚 Courses
        </NavButton>

        <NavButton
          active={page === "teachers"}
          onClick={() => setPage("teachers")}
        >
          👨‍🏫 Teachers
        </NavButton>

        <NavButton
          active={page === "bookings"}
          onClick={() => setPage("bookings")}
        >
          📅 Bookings
        </NavButton>

        <NavButton
          active={page === "progress"}
          onClick={() => setPage("progress")}
        >
          📊 Progress
        </NavButton>
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
  setError,
}: {
  user: User;
  setPage: (page: string) => void;
  setError: (error: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<Course[]>("/courses"),
      api<Booking[]>(
        `/bookings/trainee/${user.id}`
      ),
    ])
      .then(([courseData, bookingData]) => {
        setCourses(courseData);
        setBookings(bookingData);
      })
      .catch((err) =>
        setError(err.message)
      )
      .finally(() => setLoading(false));
  }, [user.id, setError]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-xl sm:p-10">
        <div className="max-w-3xl">
          <div className="text-sm font-bold uppercase tracking-wider text-indigo-200">
            Welcome Back
          </div>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Hello, {text(user.name, "Learner")} 👋
          </h1>

          <p className="mt-3 text-indigo-100">
            Identify your weak topics, connect with the
            right trainer and improve your skills.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => setPage("courses")}
            >
              📚 Explore Courses
            </Button>

            <button
              onClick={() => setPage("teachers")}
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 font-semibold text-white"
            >
              👨‍🏫 Find a Teacher
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon="📚"
          title="Courses"
          value={courses.length}
          onClick={() => setPage("courses")}
        />

        <Stat
          icon="👨‍🏫"
          title="Teachers"
          value="Explore"
          onClick={() => setPage("teachers")}
        />

        <Stat
          icon="📅"
          title="Bookings"
          value={bookings.length}
          onClick={() => setPage("bookings")}
        />

        <Stat
          icon="📊"
          title="Progress"
          value="View"
          onClick={() => setPage("progress")}
        />
      </div>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-black">
            Start Learning
          </h2>

          <p className="text-sm text-slate-500">
            Choose a course and take the MCQ diagnostic
            test.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {courses.slice(0, 3).map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden"
            >
              <div className="h-2 bg-indigo-600" />

              <div className="p-5">
                <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                  COURSE
                </span>

                <h3 className="mt-4 text-xl font-black">
                  {text(course.title, "Course")}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {text(
                    course.description,
                    "Assess your current competency."
                  )}
                </p>

                <button
                  onClick={() =>
                    setPage(
                      `course-${course.id}`
                    )
                  }
                  className="mt-5 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white"
                >
                  Open Course →
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  title,
  value,
  onClick,
}: {
  icon: string;
  title: string;
  value: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left"
    >
      <Card className="p-5 hover:shadow-md">
        <div className="text-2xl">
          {icon}
        </div>

        <div className="mt-4 text-2xl font-black">
          {value}
        </div>

        <div className="mt-1 text-sm text-slate-500">
          {title}
        </div>
      </Card>
    </button>
  );
}

/* =========================================================
   COURSES + COURSE LIST
========================================================= */

function CoursesPage({
  user,
  setPage,
  setError,
}: {
  user: User;
  setPage: (page: string) => void;
  setError: (error: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api<Course[]>("/courses")
      .then(setCourses)
      .catch((err) =>
        setError(err.message)
      )
      .finally(() => setLoading(false));
  }, [setError]);

  if (selectedCourse !== null) {
    return (
      <CourseTest
        courseId={selectedCourse}
        user={user}
        setPage={setPage}
        setError={setError}
        onBack={() =>
          setSelectedCourse(null)
        }
      />
    );
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-7">
      <div>
        <div className="text-sm font-bold uppercase tracking-wider text-indigo-600">
          Learning Library
        </div>

        <h1 className="mt-2 text-3xl font-black">
          📚 Courses
        </h1>

        <p className="mt-2 text-slate-500">
          Select a course to start your 15-question
          diagnostic MCQ test.
        </p>
      </div>

      {courses.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-5xl">
            📚
          </div>

          <h2 className="mt-4 text-xl font-black">
            No Courses Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Courses are not available in the
            database yet.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <Card
              key={course.id}
              className="overflow-hidden"
            >
              <div className="h-36 bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white">
                <div className="flex h-full flex-col justify-between">
                  <span className="text-4xl">
                    {index === 0
                      ? "🐍"
                      : index === 1
                      ? "🗄️"
                      : "☁️"}
                  </span>

                  <span className="text-sm font-bold uppercase">
                    Course {index + 1}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-black">
                  {text(
                    course.title,
                    "Course"
                  )}
                </h2>

                <p className="mt-2 min-h-12 text-sm text-slate-500">
                  {text(
                    course.description,
                    "Test your knowledge and identify weak topics."
                  )}
                </p>

                <div className="mt-5 flex gap-2">
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold">
                    {course.topic_count || 0}{" "}
                    Topics
                  </span>

                  <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                    {course.question_count || 15}{" "}
                    MCQs
                  </span>
                </div>

                <button
                  onClick={() =>
                    setSelectedCourse(
                      course.id
                    )
                  }
                  className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700"
                >
                  📝 Start MCQ Test →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MCQ TEST
========================================================= */

function CourseTest({
  courseId,
  user,
  setPage,
  setError,
  onBack,
}: {
  courseId: number;
  user: User;
  setPage: (page: string) => void;
  setError: (error: string) => void;
  onBack: () => void;
}) {
  const [course, setCourse] =
    useState<Course | null>(null);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [current, setCurrent] =
    useState(0);

  const [result, setResult] =
    useState<TestResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    Promise.all([
      api<Course[]>("/courses"),
      api<Question[]>(
        `/courses/${courseId}/questions`
      ),
      api<Topic[]>(
        `/courses/${courseId}/topics`
      ),
    ])
      .then(([courseData, questionData, topicData]) => {
        setCourse(
          courseData.find(
            (c) => c.id === courseId
          ) || null
        );

        setQuestions(
          questionData.slice(0, 15)
        );

        setTopics(topicData);
      })
      .catch((err) =>
        setError(err.message)
      )
      .finally(() =>
        setLoading(false)
      );
  }, [courseId, setError]);

  async function submitTest() {
    const unanswered = questions.filter(
      (q) => !answers[q.id]
    );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions. ${unanswered.length} remaining.`
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api<{
        attempt_id: number;
      }>("/tests/submit", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          course_id: courseId,
          test_type: "pretest",
          answers: questions.map(
            (q) => ({
              question_id: q.id,
              answer: answers[q.id],
            })
          ),
        }),
      });

      const detailed =
        await api<TestResult>(
          `/attempts/${response.attempt_id}/result`
        );

      setResult(detailed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;

  if (result) {
    return (
      <TestResultPage
        result={result}
        user={user}
        setPage={setPage}
        setError={setError}
        onBack={onBack}
      />
    );
  }

  const question =
    questions[current];

  if (!question) {
    return (
      <Card className="p-10 text-center">
        <h2 className="text-xl font-black">
          No MCQs Available
        </h2>

        <Button
          onClick={onBack}
        >
          Back to Courses
        </Button>
      </Card>
    );
  }

  const topic =
    topics.find(
      (t) => t.id === question.topic_id
    )?.name || "Topic";

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="mb-5 text-sm font-bold text-indigo-600"
      >
        ← Back to Courses
      </button>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
          <div className="text-sm text-indigo-100">
            Diagnostic MCQ Test
          </div>

          <h1 className="mt-1 text-2xl font-black">
            {text(
              course?.title,
              "Course"
            )}
          </h1>

          <div className="mt-5 h-2 rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{
                width: `${
                  ((current + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="mt-2 text-sm">
            Question {current + 1} of{" "}
            {questions.length}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
            {topic}
          </span>

          <h2 className="mt-5 text-xl font-black leading-8 sm:text-2xl">
            {text(
              question.text,
              "Question"
            )}
          </h2>

          <div className="mt-7 space-y-3">
            {question.options.map(
              (option, index) => {
                const letter =
                  String.fromCharCode(
                    65 + index
                  );

                const selected =
                  answers[question.id] ===
                  letter;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      setAnswers(
                        (prev) => ({
                          ...prev,
                          [question.id]:
                            letter,
                        })
                      )
                    }
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left ${
                      selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg font-black ${
                        selected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100"
                      }`}
                    >
                      {letter}
                    </span>

                    <span className="font-medium">
                      {text(option)}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <div className="mt-8 flex justify-between gap-3">
            <Button
              variant="secondary"
              disabled={current === 0}
              onClick={() =>
                setCurrent(
                  Math.max(0, current - 1)
                )
              }
            >
              ← Previous
            </Button>

            {current <
            questions.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrent(
                    Math.min(
                      questions.length - 1,
                      current + 1
                    )
                  )
                }
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={submitTest}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Test ✓"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() =>
              setCurrent(i)
            }
            className={`h-9 w-9 rounded-lg text-sm font-bold ${
              i === current
                ? "bg-indigo-600 text-white"
                : answers[q.id]
                ? "bg-emerald-100 text-emerald-700"
                : "border bg-white text-slate-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   TEST RESULT
========================================================= */

function TestResultPage({
  result,
  user,
  setPage,
  setError,
  onBack,
}: {
  result: TestResult;
  user: User;
  setPage: (page: string) => void;
  setError: (error: string) => void;
  onBack: () => void;
}) {
  const [topicId, setTopicId] =
    useState<number | null>(
      result.weak_topics?.[0]
        ?.topic_id || null
    );

  const wrong =
    result.questions.filter(
      (q) => !q.is_correct
    );

  return (
    <div className="space-y-7">
      <button
        onClick={onBack}
        className="text-sm font-bold text-indigo-600"
      >
        ← Back to Courses
      </button>

      <div>
        <h1 className="text-3xl font-black">
          📊 Test Result
        </h1>

        <p className="mt-2 text-slate-500">
          Your competency analysis.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-6 text-center">
          <div className="text-sm font-bold uppercase text-slate-400">
            Score
          </div>

          <div className="mt-2 text-5xl font-black text-indigo-600">
            {Math.round(
              result.score
            )}
            %
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-sm font-bold uppercase text-slate-400">
            Questions
          </div>

          <div className="mt-2 text-4xl font-black">
            {result.questions.length}
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-sm font-bold uppercase text-slate-400">
            Weak Topics
          </div>

          <div className="mt-2 text-4xl font-black text-red-500">
            {result.weak_topics?.length ||
              0}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-black">
          Topic-wise Analysis
        </h2>

        <div className="mt-5 space-y-4">
          {(result.topic_analysis ||
            []).map((item) => (
              <div key={item.topic}>
                <div className="mb-2 flex justify-between">
                  <span className="font-bold">
                    {text(
                      item.topic,
                      "Topic"
                    )}
                  </span>

                  <span className="font-black">
                    {Math.round(
                      item.percentage
                    )}
                    %
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      item.percentage < 60
                        ? "bg-red-500"
                        : item.percentage <
                          80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          item.percentage
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-black">
          ❌ Wrong MCQs
        </h2>

        <div className="mt-5 space-y-5">
          {wrong.map((q, index) => (
            <div
              key={q.question_id}
              className="rounded-2xl border border-red-100 bg-red-50/50 p-5"
            >
              <div className="text-xs font-black uppercase text-red-500">
                Wrong Question #{index + 1}
              </div>

              <h3 className="mt-2 font-bold leading-6">
                {q.question}
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-red-100 p-4">
                  <div className="text-xs font-bold text-red-600">
                    Your Answer
                  </div>

                  <div className="mt-1 font-black text-red-800">
                    {q.your_answer ||
                      "Not answered"}
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-100 p-4">
                  <div className="text-xs font-bold text-emerald-600">
                    Correct Answer
                  </div>

                  <div className="mt-1 font-black text-emerald-800">
                    {q.correct_answer}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Topic:{" "}
                {text(
                  q.topic,
                  "Topic"
                )}
              </div>
            </div>
          ))}

          {wrong.length === 0 && (
            <div className="rounded-xl bg-emerald-50 p-5 text-center font-bold text-emerald-700">
              🎉 All answers are correct!
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-black">
          🎯 Recommended Trainers
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Trainers are automatically recommended
          according to your weak topics.
        </p>

        {result.weak_topics?.length ===
        0 ? (
          <div className="mt-5 rounded-xl bg-emerald-50 p-5 text-emerald-700">
            Great! You don't have any weak
            topic.
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap gap-2">
              {result.weak_topics.map(
                (topic) => (
                  <button
                    key={topic.topic_id}
                    onClick={() =>
                      setTopicId(
                        topic.topic_id
                      )
                    }
                    className={`rounded-xl px-4 py-2 text-sm font-bold ${
                      topicId ===
                      topic.topic_id
                        ? "bg-indigo-600 text-white"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {topic.topic}{" "}
                    {Math.round(
                      topic.percentage
                    )}
                    %
                  </button>
                )
              )}
            </div>

            {topicId && (
              <RecommendedTrainers
                topicId={topicId}
                user={user}
                setError={setError}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}

/* =========================================================
   RECOMMENDED TRAINERS
========================================================= */

function RecommendedTrainers({
  topicId,
  user,
  setError,
}: {
  topicId: number;
  user: User;
  setError: (error: string) => void;
}) {
  const [trainers, setTrainers] =
    useState<Trainer[]>([]);

  const [slots, setSlots] =
    useState<Record<number, Slot[]>>(
      {}
    );

  const [loading, setLoading] =
    useState(true);

  const [booking, setBooking] =
    useState<number | null>(null);

  useEffect(() => {
    setLoading(true);

    api<Trainer[]>(
      `/trainers/recommended/${topicId}`
    )
      .then(async (trainerData) => {
        setTrainers(trainerData);

        const allSlots =
          await Promise.all(
            trainerData.map(
              async (trainer) => {
                try {
                  const data =
                    await api<Slot[]>(
                      `/trainers/${trainer.id}/slots`
                    );

                  return [
                    trainer.id,
                    data,
                  ] as const;
                } catch {
                  return [
                    trainer.id,
                    [],
                  ] as const;
                }
              }
            )
          );

        setSlots(
          Object.fromEntries(
            allSlots
          )
        );
      })
      .catch((err) =>
        setError(err.message)
      )
      .finally(() =>
        setLoading(false)
      );
  }, [topicId, setError]);

  async function book(
    trainerId: number,
    slotId: number
  ) {
    setBooking(slotId);

    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: trainerId,
          slot_id: slotId,
          topic_id: topicId,
        }),
      });

      alert(
        "Lecture booked successfully!"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking(null);
    }
  }

  if (loading) return <Loading />;

  if (!trainers.length) {
    return (
      <div className="mt-5 rounded-xl bg-amber-50 p-5 text-amber-700">
        No trainer is currently available
        for this topic.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      {trainers.map((trainer) => {
        const availableSlots =
          (slots[trainer.id] ||
            []).filter(
              (slot) => slot.available
            );

        return (
          <Card
            key={trainer.id}
            className="p-5"
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700">
                {initials(
                  trainer.name
                )}
              </div>

              <div>
                <h3 className="font-black">
                  {text(
                    trainer.name,
                    "Trainer"
                  )}
                </h3>

                <p className="text-sm text-slate-500">
                  {text(
                    trainer.email
                  )}
                </p>

                {trainer.bio && (
                  <p className="mt-2 text-sm text-slate-500">
                    {trainer.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 font-black">
                Available Slots
              </div>

              {availableSlots.map(
                (slot) => (
                  <button
                    key={slot.id}
                    disabled={
                      booking === slot.id
                    }
                    onClick={() =>
                      book(
                        trainer.id,
                        slot.id
                      )
                    }
                    className="mb-2 flex w-full justify-between rounded-xl border border-slate-200 p-3 hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    <span className="font-semibold">
                      🕐{" "}
                      {slot.start_time}{" "}
                      -{" "}
                      {slot.end_time}
                    </span>

                    <span className="font-bold text-indigo-600">
                      {booking ===
                      slot.id
                        ? "Booking..."
                        : "Book →"}
                    </span>
                  </button>
                )
              )}

              {availableSlots.length ===
                0 && (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No available slots.
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* =========================================================
   TEACHERS
========================================================= */

function TeachersPage({
  user,
  setError,
}: {
  user: User;
  setError: (error: string) => void;
}) {
  const [trainers, setTrainers] =
    useState<Trainer[]>([]);

  const [selected, setSelected] =
    useState<Trainer | null>(null);

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [topicId, setTopicId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [booking, setBooking] =
    useState<number | null>(null);

  useEffect(() => {
    api<Trainer[]>("/trainers")
      .then(setTrainers)
      .catch((err) =>
        setError(err.message)
      )
      .finally(() =>
        setLoading(false)
      );
  }, [setError]);

  async function selectTeacher(
    trainer: Trainer
  ) {
    setSelected(trainer);

    try {
      const [topicData, slotData] =
        await Promise.all([
          api<Topic[]>(
            `/trainers/${trainer.id}/topics`
          ),
          api<Slot[]>(
            `/trainers/${trainer.id}/slots`
          ),
        ]);

      setTopics(topicData);
      setSlots(slotData);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function book(
    slotId: number
  ) {
    if (!selected || !topicId) {
      setError(
        "Please select a topic first."
      );
      return;
    }

    setBooking(slotId);

    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: selected.id,
          slot_id: slotId,
          topic_id: topicId,
        }),
      });

      alert(
        "Lecture booked successfully!"
      );

      setSlots(
        await api<Slot[]>(
          `/trainers/${selected.id}/slots`
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking(null);
    }
  }

  if (loading) return <Loading />;

  if (selected) {
    return (
      <div className="space-y-6">
        <button
          onClick={() =>
            setSelected(null)
          }
          className="text-sm font-bold text-indigo-600"
        >
          ← Back to Teachers
        </button>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-black text-indigo-700">
              {initials(
                selected.name
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black">
                {text(
                  selected.name,
                  "Teacher"
                )}
              </h1>

              <p className="text-sm text-slate-500">
                {text(
                  selected.email
                )}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-black">
              1. Select Topic
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              No test is required for direct
              teacher booking.
            </p>

            <div className="mt-5 space-y-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() =>
                    setTopicId(
                      topic.id
                    )
                  }
                  className={`w-full rounded-xl border p-4 text-left font-bold ${
                    topicId ===
                    topic.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200"
                  }`}
                >
                  📘 {topic.name}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-black">
              2. Available Slots
            </h2>

            <div className="mt-5 space-y-3">
              {slots
                .filter(
                  (slot) =>
                    slot.available
                )
                .map((slot) => (
                  <button
                    key={slot.id}
                    disabled={
                      booking ===
                      slot.id
                    }
                    onClick={() =>
                      book(slot.id)
                    }
                    className="flex w-full justify-between rounded-xl border border-slate-200 p-4 hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    <span className="font-bold">
                      🕐{" "}
                      {slot.start_time}{" "}
                      -{" "}
                      {slot.end_time}
                    </span>

                    <span className="font-bold text-indigo-600">
                      {booking ===
                      slot.id
                        ? "Booking..."
                        : "Book"}
                    </span>
                  </button>
                ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <div className="text-sm font-bold uppercase tracking-wider text-indigo-600">
          Direct Learning
        </div>

        <h1 className="mt-2 text-3xl font-black">
          👨‍🏫 Teachers
        </h1>

        <p className="mt-2 text-slate-500">
          Directly select a teacher, topic and
          lecture slot.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <Card
            key={trainer.id}
            className="p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700">
                {initials(
                  trainer.name
                )}
              </div>

              <div>
                <h2 className="font-black">
                  {text(
                    trainer.name,
                    "Teacher"
                  )}
                </h2>

                <p className="text-xs text-slate-500">
                  {text(
                    trainer.email
                  )}
                </p>
              </div>
            </div>

            {trainer.bio && (
              <p className="mt-4 text-sm text-slate-500">
                {trainer.bio}
              </p>
            )}

            <button
              onClick={() =>
                selectTeacher(
                  trainer
                )
              }
              className="mt-5 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white"
            >
              View Topics & Slots →
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   BOOKINGS
========================================================= */

function BookingsPage({
  user,
  setError,
}: {
  user: User;
  setError: (error: string) => void;
}) {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function load() {
    try {
      setBookings(
        await api<Booking[]>(
          `/bookings/trainee/${user.id}`
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.id]);

  async function complete(
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
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-black">
          📅 My Bookings
        </h1>

        <p className="mt-2 text-slate-500">
          Your trainer lectures.
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-5xl">
            📅
          </div>

          <h2 className="mt-3 text-xl font-black">
            No bookings yet
          </h2>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card
              key={booking.booking_id}
              className="p-5"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase text-indigo-600">
                    {text(
                      booking.topic,
                      "Topic"
                    )}
                  </div>

                  <h2 className="mt-1 text-lg font-black">
                    {text(
                      booking.trainer,
                      "Trainer"
                    )}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    🕐{" "}
                    {booking.start_time}{" "}
                    -{" "}
                    {booking.end_time}
                  </p>
                </div>

                <div>
                  <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                    {text(
                      booking.lecture_status,
                      booking.status
                    )}
                  </span>

                  {booking.lecture_id &&
                    booking.lecture_status !==
                      "completed" && (
                      <div className="mt-3">
                        <Button
                          onClick={() =>
                            complete(
                              booking.lecture_id!
                            )
                          }
                        >
                          Complete Lecture
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
  setError,
}: {
  user: User;
  setError: (error: string) => void;
}) {
  const [progress, setProgress] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api<any[]>(
      `/progress/${user.id}`
    )
      .then(setProgress)
      .catch((err) =>
        setError(err.message)
      )
      .finally(() =>
        setLoading(false)
      );
  }, [user.id, setError]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-black">
          📊 My Progress
        </h1>

        <p className="mt-2 text-slate-500">
          Track your test performance.
        </p>
      </div>

      {progress.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-5xl">
            📈
          </div>

          <h2 className="mt-3 text-xl font-black">
            No progress yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Take your first MCQ test.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {progress.map((attempt) => (
            <Card
              key={attempt.attempt_id}
              className="p-6"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-indigo-600">
                    {text(
                      attempt.test_type
                    )}
                  </div>

                  <h2 className="mt-1 text-xl font-black">
                    {text(
                      attempt.course,
                      "Course"
                    )}
                  </h2>
                </div>

                <div className="text-3xl font-black text-indigo-600">
                  {Math.round(
                    Number(
                      attempt.score || 0
                    )
                  )}
                  %
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(attempt.topics ||
                  []).map(
                  (topic: any) => (
                    <div
                      key={topic.topic}
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <div className="font-bold">
                        {text(
                          topic.topic,
                          "Topic"
                        )}
                      </div>

                      <div className="mt-1 text-xl font-black">
                        {Math.round(
                          Number(
                            topic.percentage ||
                              0
                          )
                        )}
                        %
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
  setError,
}: {
  user: User;
  setUser: (user: User) => void;
  setError: (error: string) => void;
}) {
  const [name, setName] =
    useState(text(user.name));

  const [bio, setBio] =
    useState(text(user.bio));

  const [saving, setSaving] =
    useState(false);

  async function save() {
    setSaving(true);

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

      alert(
        "Profile updated successfully!"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black">
        👤 Profile
      </h1>

      <Card className="mt-6 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-black text-indigo-700">
            {initials(user.name)}
          </div>

          <div>
            <h2 className="text-xl font-black">
              {text(
                user.name,
                "User"
              )}
            </h2>

            <p className="text-sm text-slate-500">
              {text(user.email)}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <Input
            label="Name"
            value={name}
            onChange={setName}
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          <Button
            onClick={save}
            disabled={saving}
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

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  user,
  setError,
}: {
  user: User;
  setError: (error: string) => void;
}) {
  const [current, setCurrent] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function changePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSaving(true);

    try {
      await api(
        `/users/${user.id}/password`,
        {
          method: "PUT",
          body: JSON.stringify({
            current_password: current,
            new_password: newPassword,
          }),
        }
      );

      setCurrent("");
      setNewPassword("");

      alert(
        "Password changed successfully!"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black">
        ⚙️ Settings
      </h1>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-black">
          Change Password
        </h2>

        <form
          onSubmit={changePassword}
          className="mt-6 space-y-5"
        >
          <Input
            label="Current Password"
            type="password"
            value={current}
            onChange={setCurrent}
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            required
          />

          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "Update Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

/* =========================================================
   TRAINER DASHBOARD
========================================================= */

function TrainerDashboard({
  user,
  setError,
}: {
  user: User;
  setError: (error: string) => void;
}) {
  const [data, setData] =
    useState<any>(null);

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [start, setStart] =
    useState("");

  const [end, setEnd] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function load() {
    try {
      const [
        dashboard,
        topicData,
        slotData,
      ] = await Promise.all([
        api<any>(
          `/trainers/${user.id}/dashboard`
        ),
        api<Topic[]>(
          `/trainers/${user.id}/topics`
        ),
        api<Slot[]>(
          `/trainers/${user.id}/slots`
        ),
      ]);

      setData(dashboard);
      setTopics(topicData);
      setSlots(slotData);
    } catch (err: any) {
      setError(err.message);
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
            start_time: start,
            end_time: end,
          }),
        }
      );

      setStart("");
      setEnd("");

      await load();
    } catch (err: any) {
      setError(err.message);
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
      setError(err.message);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-7">
      <div>
        <div className="text-sm font-bold uppercase text-indigo-600">
          Trainer Area
        </div>

        <h1 className="mt-1 text-3xl font-black">
          Trainer Dashboard
        </h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon="👥"
          title="Students"
          value={
            data?.stats?.students ||
            0
          }
          onClick={() => {}}
        />

        <Stat
          icon="📅"
          title="Bookings"
          value={
            data?.stats?.bookings ||
            0
          }
          onClick={() => {}}
        />

        <Stat
          icon="📚"
          title="Topics"
          value={topics.length}
          onClick={() => {}}
        />

        <Stat
          icon="🕐"
          title="Slots"
          value={
            slots.filter(
              (s) => s.available
            ).length
          }
          onClick={() => {}}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-black">
            My Expertise
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic.id}
                className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"
              >
                {topic.name}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-black">
            Add Lecture Slot
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              label="Start"
              value={start}
              onChange={setStart}
              placeholder="10:00 AM"
            />

            <Input
              label="End"
              value={end}
              onChange={setEnd}
              placeholder="11:00 AM"
            />
          </div>

          <div className="mt-4">
            <Button
              onClick={addSlot}
            >
              + Add Slot
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-black">
          My Slots
        </h2>

        <div className="mt-5 space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-wrap justify-between gap-3 rounded-xl border p-4"
            >
              <div className="font-bold">
                🕐{" "}
                {slot.start_time} -{" "}
                {slot.end_time}
              </div>

              <div className="flex gap-2">
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {slot.available
                    ? "Available"
                    : "Booked"}
                </span>

                <Button
                  variant="danger"
                  onClick={() =>
                    deleteSlot(
                      slot.id
                    )
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   ADMIN
========================================================= */

function AdminDashboard({
  setError,
}: {
  setError: (error: string) => void;
}) {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api<any>("/admin/dashboard")
      .then(setData)
      .catch((err) =>
        setError(err.message)
      )
      .finally(() =>
        setLoading(false)
      );
  }, [setError]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-7">
      <div>
        <div className="text-sm font-bold uppercase text-red-500">
          Administration
        </div>

        <h1 className="mt-1 text-3xl font-black">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat
          icon="👥"
          title="Users"
          value={
            data?.users ||
            data?.total_users ||
            0
          }
        />

        <AdminStat
          icon="📚"
          title="Courses"
          value={
            data?.courses ||
            data?.total_courses ||
            0
          }
        />

        <AdminStat
          icon="📝"
          title="Questions"
          value={
            data?.questions ||
            data?.total_questions ||
            0
          }
        />

        <AdminStat
          icon="📅"
          title="Bookings"
          value={
            data?.bookings ||
            data?.total_bookings ||
            0
          }
        />
      </div>
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
  value: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="text-2xl">
        {icon}
      </div>

      <div className="mt-4 text-3xl font-black">
        {value}
      </div>

      <div className="mt-1 text-sm text-slate-500">
        {title}
      </div>
    </Card>
  );
}
