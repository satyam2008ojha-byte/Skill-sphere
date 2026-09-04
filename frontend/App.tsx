import React, { useEffect, useState } from "react";

const API_BASE =
  "https://skillsphere-backend-dcg2.onrender.com";


// =========================
// TYPES
// =========================

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

type TestQuestionResult = {
  question_id: number;
  question: string;
  options: string[];
  topic_id: number;
  topic: string;
  your_answer: string;
  correct_answer: string;
  is_correct: boolean;
};

type TopicAnalysis = {
  topic_id: number;
  topic: string;
  percentage: number;
};

type TestResult = {
  attempt_id: number;
  course_id: number;
  test_type: string;
  score: number;
  questions: TestQuestionResult[];
  topic_analysis: TopicAnalysis[];
  weak_topics: {
    topic_id: number;
    topic: string;
    percentage: number;
  }[];
};


// =========================
// HELPERS
// =========================

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

  const contentType = response.headers.get("content-type");

  let data: any;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object"
        ? data.detail || "Something went wrong"
        : data || "Something went wrong"
    );
  }

  return data;
}


// =========================
// UI COMPONENTS
// =========================

function Button({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-semibold transition ${
        disabled
          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      } ${className}`}
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
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-5 ${className}`}
    >
      {children}
    </div>
  );
}


function Loading() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="text-center">
        <div className="text-4xl animate-spin">⏳</div>
        <p className="mt-3 text-slate-500">Loading...</p>
      </div>
    </div>
  );
}


function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
      {message}
    </div>
  );
}


function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}


function Stat({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string | number;
}) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>

        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}


// =========================
// APP
// =========================

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const [page, setPage] = useState("dashboard");

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const [selectedAttempt, setSelectedAttempt] =
    useState<number | null>(null);

  // IMPORTANT:
  // No localStorage login.
  // User will NOT be automatically logged in.

  if (!user) {
    return (
      <AuthScreen
        onLogin={(loggedUser) => {
          setUser(loggedUser);

          if (loggedUser.role === "trainer") {
            setPage("trainer-dashboard");
          } else if (loggedUser.role === "admin") {
            setPage("admin-dashboard");
          } else {
            setPage("dashboard");
          }
        }}
      />
    );
  }


  function logout() {
    setUser(null);
    setPage("dashboard");
    setSelectedCourse(null);
    setSelectedAttempt(null);
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
          />
        )}

        {page === "courses" && (
          <CoursesPage
            setPage={setPage}
            setSelectedCourse={setSelectedCourse}
          />
        )}

        {page.startsWith("course-test-") &&
          selectedCourse && (
            <CourseTest
              course={selectedCourse}
              user={user}
              setPage={setPage}
              setSelectedAttempt={setSelectedAttempt}
            />
          )}

        {page === "test-result" &&
          selectedAttempt && (
            <TestResultPage
              attemptId={selectedAttempt}
              user={user}
              setPage={setPage}
            />
          )}

        {page === "teachers" && (
          <TeachersPage
            user={user}
          />
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

        {page === "trainer-dashboard" &&
          user.role === "trainer" && (
            <TrainerDashboard user={user} />
          )}

        {page === "admin-dashboard" &&
          user.role === "admin" && (
            <AdminDashboard user={user} />
          )}

      </main>
    </div>
  );
}


// =========================
// AUTH
// =========================

function AuthScreen({
  onLogin,
}: {
  onLogin: (user: User) => void;
}) {
  const [mode, setMode] =
    useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("trainee");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const data: any = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });

        onLogin(data.user ?? data);

      } else {
        const data: any = await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            bio,
          }),
        });

        onLogin(data.user ?? data);
      }

    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">

      <Card className="w-full max-w-md">

        <div className="text-center mb-7">

          <div className="text-5xl mb-3">
            🎓
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            SkillSphere
          </h1>

          <p className="text-slate-500 mt-2">
            Competency Based Learning Platform
          </p>

        </div>


        <div className="flex mb-6 bg-slate-100 p-1 rounded-xl">

          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg font-semibold ${
              mode === "login"
                ? "bg-white shadow"
                : "text-slate-500"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg font-semibold ${
              mode === "register"
                ? "bg-white shadow"
                : "text-slate-500"
            }`}
          >
            Register
          </button>

        </div>


        {error && (
          <div className="mb-4">
            <ErrorBox message={error} />
          </div>
        )}


        <form
          onSubmit={submit}
          className="space-y-4"
        >

          {mode === "register" && (
            <Input
              value={name}
              onChange={setName}
              placeholder="Full Name"
              required
            />
          )}


          <Input
            value={email}
            onChange={setEmail}
            placeholder="Email"
            type="email"
            required
          />


          <Input
            value={password}
            onChange={setPassword}
            placeholder="Password"
            type="password"
            required
          />


          {mode === "register" && (
            <>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl"
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
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl"
              />
            </>
          )}


          <Button
            type="submit"
            className="w-full"
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
  );
}


// =========================
// HEADER
// =========================

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
    <header className="bg-white border-b sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4">

        <div className="h-16 flex items-center justify-between">

          <button
            onClick={() => setPage("dashboard")}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">
              🎓
            </span>

            <span className="font-bold text-xl">
              SkillSphere
            </span>
          </button>


          <nav className="hidden md:flex items-center gap-1">

            <NavButton
              active={page === "dashboard"}
              onClick={() => setPage("dashboard")}
            >
              🏠 Dashboard
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
              📈 Progress
            </NavButton>


            {user.role === "trainer" && (
              <NavButton
                active={page === "trainer-dashboard"}
                onClick={() =>
                  setPage("trainer-dashboard")
                }
              >
                👨‍🏫 Trainer
              </NavButton>
            )}


            {user.role === "admin" && (
              <NavButton
                active={page === "admin-dashboard"}
                onClick={() =>
                  setPage("admin-dashboard")
                }
              >
                🛠️ Admin
              </NavButton>
            )}

          </nav>


          <div className="relative">

            <button
              onClick={() => setMenu(!menu)}
              className="flex items-center gap-2"
            >

              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {initials(user.name)}
              </div>

              <div className="hidden sm:block text-left">

                <div className="font-semibold text-sm">
                  {user.name}
                </div>

                <div className="text-xs text-slate-500 capitalize">
                  {user.role}
                </div>

              </div>

            </button>


            {menu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-xl p-2">

                <button
                  onClick={() => {
                    setPage("profile");
                    setMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
                >
                  👤 Profile
                </button>

                <button
                  onClick={() => {
                    setPage("settings");
                    setMenu(false);
                  }}
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
            )}

          </div>

        </div>

      </div>

    </header>
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
      className={`px-3 py-2 rounded-lg text-sm font-semibold ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}


// =========================
// DASHBOARD
// =========================

function Dashboard({
  user,
  setPage,
}: {
  user: User;
  setPage: (page: string) => void;
}) {

  return (
    <div className="space-y-8">

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">

        <p className="opacity-80">
          Welcome back
        </p>

        <h1 className="text-4xl font-bold mt-1">
          {user.name} 👋
        </h1>

        <p className="mt-3 opacity-90 max-w-2xl">
          Improve your skills with competency-based
          testing and personalized trainer recommendations.
        </p>

        <Button
          className="mt-6 bg-white text-indigo-700 hover:bg-slate-100"
          onClick={() => setPage("courses")}
        >
          Explore Courses →
        </Button>

      </div>


      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <Stat
          icon="📚"
          title="Courses"
          value="3"
        />

        <Stat
          icon="📝"
          title="Diagnostic Tests"
          value="15 MCQs"
        />

        <Stat
          icon="👨‍🏫"
          title="Trainers"
          value="5"
        />

        <Stat
          icon="📅"
          title="Learning"
          value="Personalized"
        />

      </div>


      <div className="grid md:grid-cols-2 gap-6">

        <Card>

          <h2 className="text-xl font-bold">
            📚 Courses
          </h2>

          <p className="text-slate-500 mt-2">
            Take a diagnostic test to identify
            your weak topics.
          </p>

          <Button
            className="mt-5"
            onClick={() => setPage("courses")}
          >
            View Courses
          </Button>

        </Card>


        <Card>

          <h2 className="text-xl font-bold">
            👨‍🏫 Teachers
          </h2>

          <p className="text-slate-500 mt-2">
            You can directly book a teacher
            without taking any test.
          </p>

          <Button
            className="mt-5"
            onClick={() => setPage("teachers")}
          >
            Find Teacher
          </Button>

        </Card>

      </div>

    </div>
  );
}


// =========================
// COURSES
// =========================

function CoursesPage({
  setPage,
  setSelectedCourse,
}: {
  setPage: (page: string) => void;
  setSelectedCourse: (course: Course) => void;
}) {

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadCourses();
  }, []);


  async function loadCourses() {

    try {

      setLoading(true);
      setError("");

      const data =
        await api<Course[]>("/courses");

      console.log(
        "COURSES FROM BACKEND:",
        data
      );

      setCourses(
        Array.isArray(data) ? data : []
      );

    } catch (err: any) {

      console.error(err);

      setError(
        err.message ||
        "Courses load nahi ho pa rahe"
      );

    } finally {

      setLoading(false);

    }
  }


  if (loading) {
    return <Loading />;
  }


  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          📚 Courses
        </h1>

        <p className="text-slate-500 mt-1">
          Select a course and take your diagnostic test.
        </p>
      </div>


      {error && (
        <ErrorBox message={error} />
      )}


      {courses.length === 0 ? (

        <Card>

          <div className="text-center py-10">

            <div className="text-5xl">
              📚
            </div>

            <h2 className="text-xl font-bold mt-4">
              No courses available
            </h2>

            <p className="text-slate-500 mt-2">
              Backend database mein courses nahi mile.
            </p>

            <Button
              className="mt-5"
              onClick={loadCourses}
            >
              🔄 Reload Courses
            </Button>

          </div>

        </Card>

      ) : (

        <div className="grid md:grid-cols-3 gap-6">

          {courses.map((course) => (

            <Card key={course.id}>

              <div className="text-5xl mb-5">

                {course.title
                  .toLowerCase()
                  .includes("python")
                  ? "🐍"
                  : course.title
                      .toLowerCase()
                      .includes("cyber")
                  ? "🔐"
                  : "🗄️"}

              </div>


              <h2 className="text-xl font-bold">
                {course.title}
              </h2>


              <p className="text-slate-500 mt-2 min-h-[55px]">
                {course.description}
              </p>


              <div className="flex gap-3 mt-4 text-sm text-slate-500">

                <span>
                  📖 {course.topic_count ?? 0} Topics
                </span>

                <span>
                  📝 {course.question_count ?? 0} MCQs
                </span>

              </div>


              <Button
                className="w-full mt-5"
                onClick={() => {

                  setSelectedCourse(course);

                  setPage(
                    `course-test-${course.id}`
                  );

                }}
              >
                Start Test →
              </Button>

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}


// =========================
// COURSE TEST
// =========================

function CourseTest({
  course,
  user,
  setPage,
  setSelectedAttempt,
}: {
  course: Course;
  user: User;
  setPage: (page: string) => void;
  setSelectedAttempt: (id: number) => void;
}) {

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadQuestions();
  }, [course.id]);


  async function loadQuestions() {

    try {

      setLoading(true);

      const data =
        await api<Question[]>(
          `/courses/${course.id}/questions`
        );

      setQuestions(
        Array.isArray(data)
          ? data.slice(0, 15)
          : []
      );

    } catch (err: any) {

      setError(
        err.message ||
        "Questions load nahi ho pa rahe"
      );

    } finally {

      setLoading(false);

    }
  }


  function chooseAnswer(
    questionId: number,
    answer: string
  ) {
    setAnswers((old) => ({
      ...old,
      [questionId]: answer,
    }));
  }


  async function submitTest() {

    if (questions.length === 0) {
      setError("No questions available.");
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


    try {

      setSubmitting(true);
      setError("");

      const answerList =
        questions.map((q) => ({
          question_id: q.id,
          answer: answers[q.id],
        }));


      const result: any =
        await api("/tests/submit", {
          method: "POST",

          body: JSON.stringify({
            trainee_id: user.id,
            course_id: course.id,
            test_type: "pretest",
            answers: answerList,
          }),

        });


      setSelectedAttempt(
        result.attempt_id
      );

      setPage("test-result");

    } catch (err: any) {

      setError(
        err.message ||
        "Test submit failed"
      );

    } finally {

      setSubmitting(false);

    }
  }


  if (loading) {
    return <Loading />;
  }


  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div>

        <button
          onClick={() => setPage("courses")}
          className="text-indigo-600 font-semibold mb-3"
        >
          ← Back to Courses
        </button>

        <h1 className="text-3xl font-bold">
          {course.title} Test
        </h1>

        <p className="text-slate-500 mt-1">
          Answer all questions to identify your weak topics.
        </p>

      </div>


      {error && (
        <ErrorBox message={error} />
      )}


      {questions.map((question, index) => (

        <Card key={question.id}>

          <div className="font-semibold text-lg">
            {index + 1}. {question.text}
          </div>


          <div className="mt-5 space-y-3">

            {question.options.map(
              (option, optionIndex) => {

                const letter =
                  String.fromCharCode(
                    65 + optionIndex
                  );

                const selected =
                  answers[question.id] === letter;

                return (

                  <button
                    key={letter}
                    onClick={() =>
                      chooseAnswer(
                        question.id,
                        letter
                      )
                    }
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      selected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >

                    <span className="font-bold mr-3">
                      {letter}.
                    </span>

                    {option}

                  </button>

                );
              }
            )}

          </div>

        </Card>

      ))}


      <div className="flex justify-end">

        <Button
          onClick={submitTest}
          disabled={submitting}
          className="px-8"
        >
          {submitting
            ? "Submitting..."
            : "Submit Test"}
        </Button>

      </div>

    </div>
  );
}


// =========================
// TEST RESULT
// =========================

function TestResultPage({
  attemptId,
  user,
  setPage,
}: {
  attemptId: number;
  user: User;
  setPage: (page: string) => void;
}) {

  const [result, setResult] =
    useState<TestResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadResult();
  }, [attemptId]);


  async function loadResult() {

    try {

      const data =
        await api<TestResult>(
          `/attempts/${attemptId}/result`
        );

      setResult(data);

    } catch (err: any) {

      setError(
        err.message ||
        "Result load nahi ho raha"
      );

    } finally {

      setLoading(false);

    }
  }


  if (loading) {
    return <Loading />;
  }


  if (error) {
    return <ErrorBox message={error} />;
  }


  if (!result) {
    return null;
  }


  const wrongQuestions =
    result.questions.filter(
      (q) => !q.is_correct
    );


  return (
    <div className="space-y-7">

      <div>

        <button
          onClick={() => setPage("courses")}
          className="text-indigo-600 font-semibold mb-3"
        >
          ← Back to Courses
        </button>

        <h1 className="text-3xl font-bold">
          Test Result
        </h1>

      </div>


      <Card>

        <div className="text-center py-5">

          <div className="text-6xl">
            {result.score >= 80
              ? "🏆"
              : result.score >= 60
              ? "👍"
              : "📚"}
          </div>

          <h2 className="text-4xl font-bold mt-3">
            {result.score}%
          </h2>

          <p className="text-slate-500">
            Your Score
          </p>

        </div>

      </Card>


      <div>

        <h2 className="text-2xl font-bold mb-4">
          📊 Topic Analysis
        </h2>


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {result.topic_analysis.map(
            (topic) => (

              <Card key={topic.topic_id}>

                <div className="flex justify-between">

                  <span className="font-semibold">
                    {topic.topic}
                  </span>

                  <span
                    className={`font-bold ${
                      topic.percentage < 60
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {topic.percentage}%
                  </span>

                </div>


                <div className="mt-3 h-2 bg-slate-200 rounded-full">

                  <div
                    className={`h-2 rounded-full ${
                      topic.percentage < 60
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        topic.percentage,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </Card>

            )
          )}

        </div>

      </div>


      <div>

        <h2 className="text-2xl font-bold mb-4">
          ❌ Wrong MCQs
        </h2>


        {wrongQuestions.length === 0 ? (

          <Card>

            <div className="text-center py-5 text-green-600 font-semibold">
              🎉 Excellent! You answered all questions correctly.
            </div>

          </Card>

        ) : (

          <div className="space-y-4">

            {wrongQuestions.map(
              (question, index) => (

                <Card key={question.question_id}>

                  <div className="font-bold">
                    {index + 1}. {question.question}
                  </div>


                  <div className="mt-4 space-y-2">

                    <div className="p-3 rounded-lg bg-red-50 text-red-700">
                      <b>Your Answer:</b>{" "}
                      {question.your_answer}
                    </div>


                    <div className="p-3 rounded-lg bg-green-50 text-green-700">
                      <b>Correct Answer:</b>{" "}
                      {question.correct_answer}
                    </div>


                    <div className="text-sm text-slate-500">
                      Topic: {question.topic}
                    </div>

                  </div>

                </Card>

              )
            )}

          </div>

        )}

      </div>


      {result.weak_topics.length > 0 && (

        <RecommendedTrainers
          weakTopics={result.weak_topics}
          user={user}
        />

      )}


      <div className="flex gap-3">

        <Button
          onClick={() => setPage("teachers")}
        >
          👨‍🏫 Browse Teachers
        </Button>

        <Button
          onClick={() => setPage("progress")}
          className="bg-slate-800 hover:bg-slate-900"
        >
          📈 View Progress
        </Button>

      </div>

    </div>
  );
}


// =========================
// RECOMMENDED TRAINERS
// =========================

function RecommendedTrainers({
  weakTopics,
  user,
}: {
  weakTopics: {
    topic_id: number;
    topic: string;
    percentage: number;
  }[];
  user: User;
}) {

  const [trainersByTopic, setTrainersByTopic] =
    useState<
      Record<number, Trainer[]>
    >({});

  const [selectedTrainer, setSelectedTrainer] =
    useState<{
      trainer: Trainer;
      topicId: number;
    } | null>(null);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [booking, setBooking] =
    useState(false);

  const [message, setMessage] =
    useState("");


  useEffect(() => {

    weakTopics.forEach((topic) => {
      loadTrainers(topic.topic_id);
    });

  }, [weakTopics]);


  async function loadTrainers(topicId: number) {

    try {

      const data =
        await api<Trainer[]>(
          `/trainers/recommended/${topicId}`
        );

      setTrainersByTopic((old) => ({
        ...old,
        [topicId]: data,
      }));

    } catch (err) {

      console.error(err);

    }
  }


  async function selectTrainer(
    trainer: Trainer,
    topicId: number
  ) {

    try {

      setSelectedTrainer({
        trainer,
        topicId,
      });

      setLoadingSlots(true);

      const data =
        await api<Slot[]>(
          `/trainers/${trainer.id}/slots`
        );

      setSlots(
        data.filter((slot) => slot.available)
      );

    } catch (err: any) {

      setMessage(
        err.message ||
        "Slots load nahi ho rahe"
      );

    } finally {

      setLoadingSlots(false);

    }
  }


  async function bookSlot(slot: Slot) {

    if (!selectedTrainer) return;

    try {

      setBooking(true);
      setMessage("");

      await api("/bookings", {
        method: "POST",

        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id:
            selectedTrainer.trainer.id,
          slot_id: slot.id,
          topic_id:
            selectedTrainer.topicId,
        }),

      });

      setMessage(
        "✅ Lecture slot booked successfully!"
      );

    } catch (err: any) {

      setMessage(
        err.message ||
        "Booking failed"
      );

    } finally {

      setBooking(false);

    }
  }


  return (
    <div>

      <h2 className="text-2xl font-bold mb-4">
        👨‍🏫 Recommended Trainers
      </h2>

      <p className="text-slate-500 mb-5">
        Trainers are recommended automatically based
        on your weak topics.
      </p>


      {message && (
        <div className="mb-4">
          <div className="bg-green-50 text-green-700 p-4 rounded-xl">
            {message}
          </div>
        </div>
      )}


      <div className="space-y-6">

        {weakTopics.map((weakTopic) => {

          const trainers =
            trainersByTopic[
              weakTopic.topic_id
            ] || [];


          return (

            <Card key={weakTopic.topic_id}>

              <div className="flex flex-wrap justify-between gap-3 mb-4">

                <div>

                  <h3 className="text-xl font-bold">
                    {weakTopic.topic}
                  </h3>

                  <p className="text-red-600 text-sm">
                    Your score: {weakTopic.percentage}%
                  </p>

                </div>

                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 h-fit text-sm font-semibold">
                  Weak Topic
                </span>

              </div>


              {trainers.length === 0 ? (

                <div className="text-slate-500">
                  No trainer available for this topic yet.
                </div>

              ) : (

                <div className="grid md:grid-cols-2 gap-4">

                  {trainers.map((trainer) => (

                    <div
                      key={trainer.id}
                      className="border border-slate-200 rounded-xl p-4"
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {initials(trainer.name)}
                        </div>


                        <div>

                          <h4 className="font-bold text-lg">
                            {trainer.name}
                          </h4>

                          <p className="text-sm text-slate-500">
                            {trainer.email}
                          </p>

                        </div>

                      </div>


                      <p className="text-slate-600 mt-3">
                        {trainer.bio ||
                          "SkillSphere Trainer"}
                      </p>


                      <p className="text-sm text-green-600 mt-2">
                        🟢 {trainer.available_slots ?? 0} available slots
                      </p>


                      <Button
                        className="mt-4 w-full"
                        onClick={() =>
                          selectTrainer(
                            trainer,
                            weakTopic.topic_id
                          )
                        }
                      >
                        View Slots
                      </Button>

                    </div>

                  ))}

                </div>

              )}


              {selectedTrainer?.topicId ===
                weakTopic.topic_id && (

                <div className="mt-6 border-t pt-5">

                  <h4 className="font-bold text-lg mb-4">
                    Available Slots —{" "}
                    {selectedTrainer.trainer.name}
                  </h4>


                  {loadingSlots ? (

                    <p>Loading slots...</p>

                  ) : slots.length === 0 ? (

                    <p className="text-slate-500">
                      No available slots.
                    </p>

                  ) : (

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

                      {slots.map((slot) => (

                        <div
                          key={slot.id}
                          className="border rounded-xl p-4"
                        >

                          <div className="font-semibold">
                            🕐 {slot.start_time}
                          </div>

                          <div className="text-sm text-slate-500">
                            to {slot.end_time}
                          </div>


                          <Button
                            className="w-full mt-3"
                            disabled={booking}
                            onClick={() =>
                              bookSlot(slot)
                            }
                          >
                            {booking
                              ? "Booking..."
                              : "Book Lecture"}
                          </Button>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              )}

            </Card>

          );

        })}

      </div>

    </div>
  );
}


// =========================
// TEACHERS
// =========================

function TeachersPage({
  user,
}: {
  user: User;
}) {

  const [trainers, setTrainers] =
    useState<Trainer[]>([]);

  const [topicsByTrainer, setTopicsByTrainer] =
    useState<
      Record<number, Topic[]>
    >({});

  const [slotsByTrainer, setSlotsByTrainer] =
    useState<
      Record<number, Slot[]>
    >({});

  const [selectedTopic, setSelectedTopic] =
    useState<
      Record<number, number>
    >({});

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [booking, setBooking] =
    useState(false);


  useEffect(() => {
    loadTrainers();
  }, []);


  async function loadTrainers() {

    try {

      setLoading(true);

      const data =
        await api<Trainer[]>(
          "/trainers"
        );

      setTrainers(data || []);

      for (const trainer of data || []) {

        await loadTrainerDetails(
          trainer.id
        );

      }

    } catch (err: any) {

      setMessage(
        err.message ||
        "Trainers load nahi ho rahe"
      );

    } finally {

      setLoading(false);

    }
  }


  async function loadTrainerDetails(
    trainerId: number
  ) {

    try {

      const [topics, slots] =
        await Promise.all([

          api<Topic[]>(
            `/trainers/${trainerId}/topics`
          ),

          api<Slot[]>(
            `/trainers/${trainerId}/slots`
          ),

        ]);


      setTopicsByTrainer((old) => ({
        ...old,
        [trainerId]: topics,
      }));


      setSlotsByTrainer((old) => ({
        ...old,
        [trainerId]: slots.filter(
          (slot) => slot.available
        ),
      }));


      if (
        topics.length > 0
      ) {

        setSelectedTopic((old) => ({
          ...old,
          [trainerId]: topics[0].id,
        }));

      }

    } catch (err) {

      console.error(err);

    }
  }


  async function book(
    trainerId: number,
    slotId: number
  ) {

    const topicId =
      selectedTopic[trainerId];


    if (!topicId) {

      setMessage(
        "Please select a topic first."
      );

      return;
    }


    try {

      setBooking(true);
      setMessage("");

      await api("/bookings", {
        method: "POST",

        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: trainerId,
          slot_id: slotId,
          topic_id: topicId,
        }),

      });


      setMessage(
        "✅ Lecture booked successfully!"
      );


      await loadTrainerDetails(
        trainerId
      );

    } catch (err: any) {

      setMessage(
        err.message ||
        "Booking failed"
      );

    } finally {

      setBooking(false);

    }
  }


  if (loading) {
    return <Loading />;
  }


  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          👨‍🏫 Teachers
        </h1>

        <p className="text-slate-500 mt-1">
          You can directly choose a teacher and book
          a lecture. Test is not compulsory.
        </p>

      </div>


      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl">
          {message}
        </div>
      )}


      {trainers.length === 0 ? (

        <Card>

          <div className="text-center py-10">

            <div className="text-5xl">
              👨‍🏫
            </div>

            <h2 className="text-xl font-bold mt-4">
              No trainers found
            </h2>

            <p className="text-slate-500 mt-2">
              Backend database mein trainers nahi mile.
            </p>

          </div>

        </Card>

      ) : (

        <div className="grid md:grid-cols-2 gap-6">

          {trainers.map((trainer) => {

            const topics =
              topicsByTrainer[trainer.id] || [];

            const slots =
              slotsByTrainer[trainer.id] || [];


            return (

              <Card key={trainer.id}>

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                    {initials(trainer.name)}
                  </div>


                  <div>

                    <h2 className="text-xl font-bold">
                      {trainer.name}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {trainer.email}
                    </p>

                  </div>

                </div>


                <p className="text-slate-600 mt-4">
                  {trainer.bio ||
                    "SkillSphere Trainer"}
                </p>


                <div className="mt-5">

                  <label className="text-sm font-semibold">
                    Select Topic
                  </label>


                  <select
                    value={
                      selectedTopic[trainer.id] || ""
                    }
                    onChange={(e) =>
                      setSelectedTopic(
                        (old) => ({
                          ...old,
                          [trainer.id]:
                            Number(e.target.value),
                        })
                      )
                    }
                    className="w-full mt-2 px-4 py-3 border rounded-xl"
                  >

                    {topics.map((topic) => (

                      <option
                        key={topic.id}
                        value={topic.id}
                      >
                        {topic.name}
                      </option>

                    ))}

                  </select>

                </div>


                <div className="mt-5">

                  <h3 className="font-bold">
                    Available Slots
                  </h3>


                  {slots.length === 0 ? (

                    <p className="text-slate-500 mt-2">
                      No available slots.
                    </p>

                  ) : (

                    <div className="space-y-2 mt-3">

                      {slots.map((slot) => (

                        <div
                          key={slot.id}
                          className="flex items-center justify-between border rounded-xl p-3"
                        >

                          <div>

                            <div className="font-semibold">
                              🕐 {slot.start_time}
                            </div>

                            <div className="text-xs text-slate-500">
                              {slot.end_time}
                            </div>

                          </div>


                          <Button
                            disabled={booking}
                            onClick={() =>
                              book(
                                trainer.id,
                                slot.id
                              )
                            }
                          >
                            Book
                          </Button>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </Card>

            );

          })}

        </div>

      )}

    </div>
  );
}


// =========================
// BOOKINGS
// =========================

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


  useEffect(() => {
    loadBookings();
  }, []);


  async function loadBookings() {

    try {

      const data =
        await api<Booking[]>(
          `/bookings/trainee/${user.id}`
        );

      setBookings(data || []);

    } catch (err: any) {

      setError(
        err.message ||
        "Bookings load failed"
      );

    } finally {

      setLoading(false);

    }
  }


  if (loading) {
    return <Loading />;
  }


  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          📅 My Bookings
        </h1>

        <p className="text-slate-500 mt-1">
          Your booked trainer lectures.
        </p>

      </div>


      {error && (
        <ErrorBox message={error} />
      )}


      {bookings.length === 0 ? (

        <Card>

          <div className="text-center py-10">

            <div className="text-5xl">
              📅
            </div>

            <h2 className="text-xl font-bold mt-4">
              No bookings yet
            </h2>

          </div>

        </Card>

      ) : (

        <div className="grid md:grid-cols-2 gap-5">

          {bookings.map((booking) => (

            <Card key={booking.booking_id}>

              <div className="flex justify-between">

                <h2 className="text-xl font-bold">
                  {booking.trainer}
                </h2>

                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {booking.status}
                </span>

              </div>


              <div className="mt-4 space-y-2 text-slate-600">

                <p>
                  📚 Topic:{" "}
                  <b>{booking.topic}</b>
                </p>

                <p>
                  🕐 {booking.start_time} -{" "}
                  {booking.end_time}
                </p>

                <p>
                  🎓 Lecture:{" "}
                  {booking.lecture_status ||
                    "scheduled"}
                </p>

              </div>

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}


// =========================
// PROGRESS
// =========================

function ProgressPage({
  user,
}: {
  user: User;
}) {

  const [progress, setProgress] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadProgress();
  }, []);


  async function loadProgress() {

    try {

      const data =
        await api<any[]>(
          `/progress/${user.id}`
        );

      setProgress(data || []);

    } catch (err: any) {

      setError(
        err.message ||
        "Progress load failed"
      );

    } finally {

      setLoading(false);

    }
  }


  if (loading) {
    return <Loading />;
  }


  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          📈 My Progress
        </h1>

        <p className="text-slate-500">
          Track your learning performance.
        </p>

      </div>


      {error && (
        <ErrorBox message={error} />
      )}


      {progress.length === 0 ? (

        <Card>

          <div className="text-center py-10">

            <div className="text-5xl">
              📊
            </div>

            <h2 className="font-bold text-xl mt-4">
              No test attempts yet
            </h2>

            <p className="text-slate-500 mt-2">
              Take a course test to start tracking progress.
            </p>

          </div>

        </Card>

      ) : (

        <div className="space-y-5">

          {progress.map((item) => (

            <Card key={item.attempt_id}>

              <div className="flex flex-wrap justify-between gap-3">

                <div>

                  <h2 className="font-bold text-xl">
                    {item.course}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {item.test_type}
                  </p>

                </div>


                <div className="text-2xl font-bold">
                  {item.score}%
                </div>

              </div>


              {item.topics?.length > 0 && (

                <div className="mt-5 grid sm:grid-cols-2 gap-3">

                  {item.topics.map(
                    (topic: any, index: number) => (

                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-xl"
                      >

                        <div className="flex justify-between">

                          <span>
                            {topic.topic}
                          </span>

                          <b>
                            {topic.percentage}%
                          </b>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}


// =========================
// PROFILE
// =========================

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

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  async function save() {

    try {

      setLoading(true);
      setError("");
      setMessage("");

      const data: any =
        await api(
          `/users/${user.id}/profile`,
          {
            method: "PUT",

            body: JSON.stringify({
              name,
              bio,
            }),
          }
        );


      const updatedUser =
        data.user ?? data;

      setUser({
        ...user,
        ...updatedUser,
        name,
        bio,
      });


      setMessage(
        "Profile updated successfully!"
      );

    } catch (err: any) {

      setError(
        err.message ||
        "Profile update failed"
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold">
        👤 Profile
      </h1>


      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl">
          {message}
        </div>
      )}


      {error && (
        <ErrorBox message={error} />
      )}


      <Card>

        <div className="flex items-center gap-4 mb-6">

          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
            {initials(user.name)}
          </div>

          <div>

            <h2 className="text-xl font-bold">
              {user.name}
            </h2>

            <p className="text-slate-500">
              {user.email}
            </p>

          </div>

        </div>


        <div className="space-y-4">

          <Input
            value={name}
            onChange={setName}
            placeholder="Name"
          />


          <textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            placeholder="Bio"
            className="w-full px-4 py-3 border rounded-xl min-h-[120px]"
          />


          <Button
            onClick={save}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Profile"}
          </Button>

        </div>

      </Card>

    </div>
  );
}


// =========================
// SETTINGS
// =========================

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

  const [loading, setLoading] =
    useState(false);


  async function changePassword() {

    try {

      setLoading(true);
      setError("");
      setMessage("");

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


      setMessage(
        "Password changed successfully!"
      );

      setCurrentPassword("");
      setNewPassword("");

    } catch (err: any) {

      setError(
        err.message ||
        "Password update failed"
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold">
        ⚙️ Settings
      </h1>


      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl">
          {message}
        </div>
      )}


      {error && (
        <ErrorBox message={error} />
      )}


      <Card>

        <h2 className="text-xl font-bold mb-5">
          🔐 Change Password
        </h2>


        <div className="space-y-4">

          <Input
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Current Password"
            type="password"
          />


          <Input
            value={newPassword}
            onChange={setNewPassword}
            placeholder="New Password"
            type="password"
          />


          <Button
            onClick={changePassword}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Change Password"}
          </Button>

        </div>

      </Card>


      <Card>

        <h2 className="font-bold">
          Account Information
        </h2>

        <div className="mt-4 space-y-2 text-slate-600">

          <p>
            Email: <b>{user.email}</b>
          </p>

          <p>
            Role:{" "}
            <b className="capitalize">
              {user.role}
            </b>
          </p>

        </div>

      </Card>

    </div>
  );
}


// =========================
// TRAINER DASHBOARD
// =========================

function TrainerDashboard({
  user,
}: {
  user: User;
}) {

  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadDashboard();
  }, []);


  async function loadDashboard() {

    try {

      const result =
        await api(
          `/trainers/${user.id}/dashboard`
        );

      setData(result);

    } catch (err: any) {

      setError(
        err.message ||
        "Trainer dashboard load failed"
      );

    } finally {

      setLoading(false);

    }
  }


  if (loading) {
    return <Loading />;
  }


  if (error) {
    return <ErrorBox message={error} />;
  }


  return (
    <div className="space-y-7">

      <div>

        <h1 className="text-3xl font-bold">
          👨‍🏫 Trainer Dashboard
        </h1>

        <p className="text-slate-500">
          Welcome, {user.name}
        </p>

      </div>


      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <Stat
          icon="👨‍🎓"
          title="Students"
          value={
            data?.stats?.students ??
            data?.students?.length ??
            0
          }
        />

        <Stat
          icon="📅"
          title="Bookings"
          value={
            data?.stats?.bookings ??
            data?.bookings?.length ??
            0
          }
        />

        <Stat
          icon="📚"
          title="Topics"
          value={
            data?.expertise?.length ??
            0
          }
        />

        <Stat
          icon="🎓"
          title="Role"
          value="Trainer"
        />

      </div>


      <Card>

        <h2 className="text-xl font-bold">
          Expertise
        </h2>


        <div className="flex flex-wrap gap-2 mt-4">

          {(data?.expertise || []).map(
            (item: any, index: number) => (

              <span
                key={index}
                className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg"
              >
                {item.name || item}
              </span>

            )
          )}

        </div>

      </Card>


      <Card>

        <h2 className="text-xl font-bold mb-4">
          Recent Bookings
        </h2>


        <div className="space-y-3">

          {(data?.bookings || [])
            .slice(0, 10)
            .map(
              (booking: any, index: number) => (

                <div
                  key={index}
                  className="p-4 border rounded-xl"
                >

                  <div className="font-semibold">
                    {booking.trainee ||
                      booking.student ||
                      "Student"}
                  </div>

                  <div className="text-sm text-slate-500">
                    {booking.topic ||
                      "Topic"}
                  </div>

                  <div className="text-sm mt-1">
                    🕐{" "}
                    {booking.start_time ||
                      ""}
                  </div>

                </div>

              )
            )}

        </div>

      </Card>

    </div>
  );
}


// =========================
// ADMIN DASHBOARD
// =========================

function AdminDashboard({
  user,
}: {
  user: User;
}) {

  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadDashboard();
  }, []);


  async function loadDashboard() {

    try {

      const result =
        await api("/admin/dashboard");

      setData(result);

    } catch (err: any) {

      setError(
        err.message ||
        "Admin dashboard load failed"
      );

    } finally {

      setLoading(false);

    }
  }


  if (loading) {
    return <Loading />;
  }


  if (error) {
    return <ErrorBox message={error} />;
  }


  return (
    <div className="space-y-7">

      <div>

        <h1 className="text-3xl font-bold">
          🛠️ Admin Dashboard
        </h1>

        <p className="text-slate-500">
          System overview
        </p>

      </div>


      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <Stat
          icon="👥"
          title="Users"
          value={
            data?.users ??
            data?.total_users ??
            0
          }
        />

        <Stat
          icon="📚"
          title="Courses"
          value={
            data?.courses ??
            data?.total_courses ??
            0
          }
        />

        <Stat
          icon="📝"
          title="Questions"
          value={
            data?.questions ??
            data?.total_questions ??
            0
          }
        />

        <Stat
          icon="📅"
          title="Bookings"
          value={
            data?.bookings ??
            data?.total_bookings ??
            0
          }
        />

      </div>


      <Card>

        <h2 className="text-xl font-bold">
          SkillSphere Overview
        </h2>

        <p className="text-slate-500 mt-2">
          Manage and monitor the SkillSphere platform.
        </p>

      </Card>

    </div>
  );
}
