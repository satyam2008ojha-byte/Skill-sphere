import React, { useEffect, useMemo, useState } from "react";

const API = "https://skillsphere-backend-dcg2.onrender.com";

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
};

type Topic = {
  id: number;
  name: string;
};

type Question = {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  topic_id: number;
  topic?: string;
};

type Trainer = {
  id: number;
  name: string;
  email: string;
  bio?: string;
  topics?: Topic[];
  expertise?: Topic[];
};

type Slot = {
  id: number;
  start_time: string;
  end_time: string;
  available: boolean;
};

type Booking = {
  booking_id: number;
  trainee_id: number;
  trainee_name: string;
  trainee_email: string;
  topic_id: number;
  topic: string;
  start_time: string;
  end_time: string;
  booking_status: string;
  lecture_status: string;
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
  }[];
  weak_topics: {
    topic_id: number;
    topic: string;
    percentage: number;
  }[];
};

type TrainerDashboard = {
  profile: User;
  expertise: Topic[];
  stats: {
    total_slots: number;
    available_slots: number;
    total_bookings: number;
    completed_lectures: number;
    total_students: number;
  };
  students: {
    id: number;
    name: string;
    email: string;
    bio?: string;
    latest_score: number;
    total_tests: number;
    completed_lectures: number;
  }[];
  bookings: Booking[];
};

type StudentProgress = {
  student: User;
  attempts: {
    id: number;
    course_id: number;
    course: string;
    test_type: string;
    score: number;
    topic_results: {
      topic_id: number;
      topic: string;
      percentage: number;
    }[];
  }[];
  lectures: {
    booking_id: number;
    topic: string;
    start_time: string;
    end_time: string;
    status: string;
  }[];
};

async function api<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Something went wrong");
  }

  return data;
}

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("skillsphere_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const loginUser = (u: User) => {
    localStorage.setItem("skillsphere_user", JSON.stringify(u));
    setUser(u);
    setPage("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("skillsphere_user");
    setUser(null);
    setPage("dashboard");
  };

  if (!user) {
    return <AuthPage onLogin={loginUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        user={user}
        page={page}
        setPage={setPage}
        logout={logout}
      />

      {toast && (
        <div className="fixed right-5 top-20 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8">
        {user.role === "trainer" && page === "dashboard" && (
          <TrainerDashboard
            user={user}
            setPage={setPage}
            showToast={showToast}
          />
        )}

        {user.role === "trainee" && page === "dashboard" && (
          <TraineeDashboard
            user={user}
            setPage={setPage}
          />
        )}

        {page === "courses" && (
          <CoursesPage
            user={user}
            setPage={setPage}
          />
        )}

        {page === "teachers" && (
          <TeachersPage
            user={user}
            showToast={showToast}
          />
        )}

        {page === "profile" && (
          <ProfilePage
            user={user}
            updateUser={loginUser}
            showToast={showToast}
          />
        )}

        {page === "settings" && (
          <SettingsPage
            user={user}
            showToast={showToast}
            logout={logout}
          />
        )}

        {page === "bookings" && (
          <BookingsPage
            user={user}
            showToast={showToast}
          />
        )}
      </main>
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
  setPage: (p: string) => void;
  logout: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <button
          onClick={() => setPage("dashboard")}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white shadow-lg shadow-indigo-200">
            S
          </div>

          <div className="text-left">
            <h1 className="text-xl font-black tracking-tight">
              Skill<span className="text-indigo-600">Sphere</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              Learn • Improve • Grow
            </p>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          <NavButton
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </NavButton>

          {user.role === "trainee" && (
            <>
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
                📅 My Bookings
              </NavButton>
            </>
          )}

          {user.role === "trainer" && (
            <NavButton
              active={page === "bookings"}
              onClick={() => setPage("bookings")}
            >
              📅 Sessions
            </NavButton>
          )}
        </nav>

        <div className="group relative">
          <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs capitalize text-slate-500">
                {user.role}
              </p>
            </div>

            <span className="text-slate-400">⌄</span>
          </button>

          <div className="invisible absolute right-0 top-full mt-2 w-52 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={() => setPage("profile")}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100"
            >
              👤 Profile
            </button>

            <button
              onClick={() => setPage("settings")}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100"
            >
              ⚙️ Settings
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              onClick={logout}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   AUTH
========================================================= */

function AuthPage({ onLogin }: { onLogin: (u: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "trainee",
    bio: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await api("/auth/register", {
          method: "POST",
          body: JSON.stringify(form),
        });

        const login = await api<User>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        onLogin(login);
      } else {
        const login = await api<User>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        onLogin(login);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden bg-indigo-600 p-10 text-white md:block">
          <div className="mb-20">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-indigo-600">
              S
            </div>

            <h1 className="text-4xl font-black leading-tight">
              Build skills.
              <br />
              Find the right
              <br />
              mentor.
            </h1>

            <p className="mt-5 max-w-sm text-indigo-100">
              SkillSphere connects learners with the right trainers based on
              their actual skill gaps.
            </p>
          </div>

          <div className="space-y-4">
            <Feature text="Topic-wise skill assessment" />
            <Feature text="Automatic trainer recommendation" />
            <Feature text="Book trainer sessions directly" />
            <Feature text="Track your improvement" />
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-black">
              {mode === "login" ? "Welcome back 👋" : "Create account"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {mode === "login"
                ? "Login to continue your learning journey."
                : "Join SkillSphere and start learning smarter."}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Enter your name"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Account Type
                  </label>

                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                  >
                    <option value="trainee">Trainee / Student</option>
                    <option value="trainer">Trainer / Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="••••••••"
            />

            {mode === "register" && (
              <Input
                label="Short Bio"
                value={form.bio}
                onChange={(v) => setForm({ ...form, bio: v })}
                placeholder="Tell something about yourself"
              />
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="font-bold text-indigo-600"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
        ✓
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

/* =========================================================
   TRAINEE DASHBOARD
========================================================= */

function TraineeDashboard({
  user,
  setPage,
}: {
  user: User;
  setPage: (p: string) => void;
}) {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/progress/${user.id}`)
      .then(setProgress)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-100 sm:p-10">
        <div className="max-w-3xl">
          <p className="mb-2 text-sm font-semibold text-indigo-100">
            LEARNING DASHBOARD
          </p>

          <h2 className="text-3xl font-black sm:text-4xl">
            Welcome, {user.name.split(" ")[0]} 👋
          </h2>

          <p className="mt-3 max-w-2xl text-indigo-100">
            Identify your weak areas, connect with the right trainer and
            improve your skills step by step.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setPage("courses")}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow"
            >
              📚 Start Assessment
            </button>

            <button
              onClick={() => setPage("teachers")}
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30"
            >
              👨‍🏫 Find Trainer Directly
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="📝"
              title="Tests Taken"
              value={progress?.total_tests ?? 0}
            />
            <StatCard
              icon="🎯"
              title="Average Score"
              value={`${Math.round(progress?.average_score ?? 0)}%`}
            />
            <StatCard
              icon="📚"
              title="Lectures"
              value={progress?.completed_lectures ?? 0}
            />
            <StatCard
              icon="📈"
              title="Latest Score"
              value={`${Math.round(progress?.latest_score ?? 0)}%`}
            />
          </div>

          {progress?.attempts?.length > 0 && (
            <Section title="Recent Assessments">
              <div className="grid gap-4 md:grid-cols-2">
                {progress.attempts.slice(0, 4).map((a: any) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{a.course}</h3>
                        <p className="mt-1 text-xs capitalize text-slate-500">
                          {a.test_type}
                        </p>
                      </div>

                      <ScoreBadge score={a.score} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {progress?.topic_performance?.length > 0 && (
            <Section title="Topic Performance">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {progress.topic_performance.map((topic: any) => (
                  <TopicProgress
                    key={topic.topic_id}
                    topic={topic.topic}
                    percentage={topic.percentage}
                  />
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

/* =========================================================
   COURSES
========================================================= */

function CoursesPage({
  user,
  setPage,
}: {
  user: User;
  setPage: (p: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);

  useEffect(() => {
    api<Course[]>("/courses").then(setCourses).catch(() => {});
  }, []);

  if (selected) {
    return (
      <CourseTest
        user={user}
        course={selected}
        onBack={() => setSelected(null)}
        setPage={setPage}
      />
    );
  }

  return (
    <div className="space-y-7">
      <PageHeading
        title="Choose a Course"
        subtitle="Take a short diagnostic test to discover your strongest and weakest topics."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              📚
            </div>

            <h3 className="text-xl font-black">{course.title}</h3>

            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
              {course.description}
            </p>

            <button
              onClick={() => setSelected(course)}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              Start Diagnostic Test →
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-800">
          💡 Test ke baad SkillSphere aapke wrong answers ko topic-wise analyze
          karega aur weak topic ke according trainer recommend karega.
        </p>
      </div>
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
  setPage,
}: {
  user: User;
  course: Course;
  onBack: () => void;
  setPage: (p: string) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    api<Question[]>(`/courses/${course.id}/questions`)
      .then(setQuestions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [course.id]);

  const submitTest = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api<{ attempt_id: number }>(
        "/tests/submit",
        {
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
        }
      );

      const fullResult = await api<AttemptResult>(
        `/attempts/${response.attempt_id}/result`
      );

      setResult(fullResult);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  if (result) {
    return (
      <TestResult
        user={user}
        result={result}
        setPage={setPage}
      />
    );
  }

  const q = questions[current];
  const progress =
    questions.length > 0
      ? ((current + 1) / questions.length) * 100
      : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={onBack}
        className="text-sm font-bold text-slate-500 hover:text-indigo-600"
      >
        ← Back to Courses
      </button>

      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Diagnostic Test
            </p>

            <h2 className="mt-1 text-2xl font-black">
              {course.title}
            </h2>
          </div>

          <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
            {current + 1}/{questions.length}
          </div>
        </div>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {q && (
          <>
            <div className="mb-7">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {q.topic}
              </span>

              <h3 className="mt-5 text-xl font-bold leading-8">
                {q.text}
              </h3>
            </div>

            <div className="space-y-3">
              {[
                ["A", q.option_a],
                ["B", q.option_b],
                ["C", q.option_c],
                ["D", q.option_d],
              ].map(([letter, option]) => {
                const selected = answers[q.id] === letter;

                return (
                  <button
                    key={letter}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [q.id]: letter,
                      })
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-black ${
                        selected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {letter}
                    </span>

                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                disabled={current === 0}
                onClick={() => setCurrent(current - 1)}
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold disabled:opacity-40"
              >
                ← Previous
              </button>

              {current < questions.length - 1 ? (
                <button
                  onClick={() => setCurrent(current + 1)}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white"
                >
                  Next →
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={submitTest}
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Test ✓"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TEST RESULT
========================================================= */

function TestResult({
  user,
  result,
  setPage,
}: {
  user: User;
  result: AttemptResult;
  setPage: (p: string) => void;
}) {
  const [recommendations, setRecommendations] = useState<
    Record<number, Trainer[]>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!result.weak_topics.length) return;

    setLoading(true);

    Promise.all(
      result.weak_topics.map(async (weak) => {
        try {
          const trainers = await api<Trainer[]>(
            `/trainers/recommended/${weak.topic_id}`
          );

          return [weak.topic_id, trainers] as const;
        } catch {
          return [weak.topic_id, []] as const;
        }
      })
    )
      .then((items) => {
        setRecommendations(Object.fromEntries(items));
      })
      .finally(() => setLoading(false));
  }, [result.weak_topics]);

  const wrongQuestions = result.questions.filter(
    (q) => !q.is_correct
  );

  return (
    <div className="space-y-8">
      <PageHeading
        title="Assessment Result 🎯"
        subtitle="Here is your complete topic-wise performance analysis."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl bg-indigo-600 p-7 text-white shadow-lg">
          <p className="text-sm text-indigo-100">Overall Score</p>
          <p className="mt-2 text-5xl font-black">
            {Math.round(result.score)}%
          </p>
          <p className="mt-2 text-sm text-indigo-100">
            {result.test_type}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7">
          <p className="text-sm text-slate-500">Correct Answers</p>
          <p className="mt-2 text-4xl font-black text-emerald-600">
            {result.questions.filter((q) => q.is_correct).length}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7">
          <p className="text-sm text-slate-500">Wrong Answers</p>
          <p className="mt-2 text-4xl font-black text-red-500">
            {wrongQuestions.length}
          </p>
        </div>
      </div>

      <Section title="Topic-wise Analysis">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.topic_analysis.map((topic) => (
            <TopicProgress
              key={topic.topic_id}
              topic={topic.topic}
              percentage={topic.percentage}
            />
          ))}
        </div>
      </Section>

      {wrongQuestions.length > 0 && (
        <Section
          title="❌ Wrong MCQs — Review Your Mistakes"
          subtitle="Har wrong question ke saath aapka answer aur correct answer diya gaya hai."
        >
          <div className="space-y-5">
            {wrongQuestions.map((q, index) => (
              <div
                key={q.question_id}
                className="rounded-2xl border border-red-100 bg-white p-5"
              >
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-600">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {q.topic}
                      </span>
                    </div>

                    <h4 className="font-bold leading-7">
                      {q.question}
                    </h4>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {q.options.map((option, i) => {
                        const letter = ["A", "B", "C", "D"][i];

                        return (
                          <div
                            key={letter}
                            className={`rounded-xl border p-3 text-sm ${
                              letter === q.your_answer
                                ? "border-red-200 bg-red-50"
                                : letter === q.correct_answer
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-slate-100 bg-slate-50"
                            }`}
                          >
                            <span className="font-black">{letter}. </span>
                            {option}

                            {letter === q.your_answer && (
                              <span className="ml-2 text-xs font-bold text-red-600">
                                Your Answer
                              </span>
                            )}

                            {letter === q.correct_answer && (
                              <span className="ml-2 text-xs font-bold text-emerald-600">
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm">
                      <b>Your answer:</b>{" "}
                      {q.your_answer || "Not answered"}
                      <br />
                      <b>Correct answer:</b> {q.correct_answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {result.weak_topics.length > 0 ? (
        <Section
          title="🧑‍🏫 Recommended Trainers"
          subtitle="Based on your weakest topics, these trainers can help you improve."
        >
          <div className="space-y-5">
            {result.weak_topics.map((weak) => {
              const trainers = recommendations[weak.topic_id] || [];

              return (
                <div
                  key={weak.topic_id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">{weak.topic}</h3>
                      <p className="text-sm text-red-500">
                        Weak area: {Math.round(weak.percentage)}%
                      </p>
                    </div>

                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                      Needs Improvement
                    </span>
                  </div>

                  {loading ? (
                    <LoadingSmall />
                  ) : trainers.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No trainer available for this topic right now.
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {trainers.map((trainer) => (
                        <TrainerCard
                          key={trainer.id}
                          trainer={trainer}
                          topicId={weak.topic_id}
                          user={user}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      ) : (
        <div className="rounded-3xl bg-emerald-50 p-7 text-center">
          <div className="text-4xl">🎉</div>
          <h3 className="mt-3 text-xl font-black text-emerald-800">
            Excellent Performance!
          </h3>
          <p className="mt-2 text-sm text-emerald-700">
            You don't currently have any weak topic below the threshold.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setPage("teachers")}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
        >
          Browse All Teachers
        </button>

        <button
          onClick={() => setPage("courses")}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold"
        >
          Take Another Test
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   TEACHERS
========================================================= */

function TeachersPage({
  user,
  showToast,
}: {
  user: User;
  showToast: (msg: string) => void;
}) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selected, setSelected] = useState<Trainer | null>(null);

  useEffect(() => {
    api<Trainer[]>("/trainers").then(setTrainers).catch(() => {});
  }, []);

  if (selected) {
    return (
      <TeacherDetail
        user={user}
        trainer={selected}
        back={() => setSelected(null)}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="space-y-7">
      <PageHeading
        title="Find a Trainer 👨‍🏫"
        subtitle="You can directly choose a teacher and book a lecture — diagnostic test is not compulsory."
      />

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-800">
          ℹ️ If you already know which trainer you want, you can book a slot
          directly without taking any test.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <TrainerAvatar name={trainer.name} />

            <h3 className="mt-4 text-xl font-black">
              {trainer.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {trainer.email}
            </p>

            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
              {trainer.bio || "Experienced SkillSphere trainer."}
            </p>

            <button
              onClick={() => setSelected(trainer)}
              className="mt-5 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white"
            >
              View Profile & Slots →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherDetail({
  user,
  trainer,
  back,
  showToast,
}: {
  user: User;
  trainer: Trainer;
  back: () => void;
  showToast: (msg: string) => void;
}) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const [topicData, slotData] = await Promise.all([
        api<Topic[]>(`/trainers/${trainer.id}/topics`),
        api<Slot[]>(`/trainers/${trainer.id}/slots`),
      ]);

      setTopics(topicData);
      setSlots(slotData);

      if (!topicId && topicData.length) {
        setTopicId(topicData[0].id);
      }
    } catch {
      showToast("Unable to load trainer data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [trainer.id]);

  const book = async (slot: Slot) => {
    if (!topicId) {
      showToast("Please select a topic first.");
      return;
    }

    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: trainer.id,
          slot_id: slot.id,
          topic_id: topicId,
        }),
      });

      showToast("Lecture booked successfully 🎉");
      load();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  return (
    <div className="space-y-7">
      <button
        onClick={back}
        className="text-sm font-bold text-slate-500 hover:text-indigo-600"
      >
        ← Back to Teachers
      </button>

      <div className="rounded-3xl bg-white p-7 shadow-sm sm:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <TrainerAvatar name={trainer.name} large />

          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-600">
              SKILLSPHERE TRAINER
            </p>

            <h2 className="mt-1 text-3xl font-black">
              {trainer.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {trainer.email}
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              {trainer.bio || "Professional trainer available on SkillSphere."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
        <Section title="Choose Topic">
          <div className="space-y-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setTopicId(topic.id)}
                className={`w-full rounded-xl border p-4 text-left font-bold transition ${
                  topicId === topic.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </Section>

        <Section
          title="Available Lecture Slots"
          subtitle="Select a topic and book any available slot."
        >
          {loading ? (
            <LoadingSmall />
          ) : slots.filter((s) => s.available).length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No available slots right now.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {slots
                .filter((s) => s.available)
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                        🕐
                      </div>

                      <div>
                        <p className="font-black">
                          {slot.start_time}
                        </p>
                        <p className="text-xs text-slate-500">
                          to {slot.end_time}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => book(slot)}
                      disabled={!topicId}
                      className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Book Lecture
                    </button>
                  </div>
                ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

/* =========================================================
   TRAINER CARD
========================================================= */

function TrainerCard({
  trainer,
  topicId,
  user,
}: {
  trainer: Trainer;
  topicId: number;
  user: User;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [showSlots, setShowSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const loadSlots = async () => {
    setLoading(true);

    try {
      const data = await api<Slot[]>(
        `/trainers/${trainer.id}/slots`
      );
      setSlots(data.filter((s) => s.available));
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!showSlots) loadSlots();
    setShowSlots(!showSlots);
  };

  const book = async (slot: Slot) => {
    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: trainer.id,
          slot_id: slot.id,
          topic_id: topicId,
        }),
      });

      setBooked(true);
      setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-4">
        <TrainerAvatar name={trainer.name} />

        <div className="min-w-0 flex-1">
          <h4 className="font-black">{trainer.name}</h4>
          <p className="truncate text-xs text-slate-500">
            {trainer.email}
          </p>
        </div>
      </div>

      {booked ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-700">
          ✓ Lecture booked
        </div>
      ) : (
        <>
          <button
            onClick={toggle}
            className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white"
          >
            {showSlots ? "Hide Slots" : "View Available Slots"}
          </button>

          {showSlots && (
            <div className="mt-3 space-y-2">
              {loading ? (
                <LoadingSmall />
              ) : slots.length === 0 ? (
                <p className="text-center text-xs text-slate-500">
                  No slots available.
                </p>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => book(slot)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-sm hover:border-indigo-400"
                  >
                    <span className="font-semibold">
                      {slot.start_time} - {slot.end_time}
                    </span>
                    <span className="font-bold text-indigo-600">
                      Book
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* =========================================================
   TRAINER DASHBOARD
========================================================= */

function TrainerDashboard({
  user,
  setPage,
  showToast,
}: {
  user: User;
  setPage: (p: string) => void;
  showToast: (msg: string) => void;
}) {
  const [dashboard, setDashboard] = useState<TrainerDashboard | null>(
    null
  );
  const [selectedStudent, setSelectedStudent] =
    useState<number | null>(null);

  const [slotForm, setSlotForm] = useState({
    start_time: "",
    end_time: "",
  });

  const [showSlotForm, setShowSlotForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const data = await api<TrainerDashboard>(
        `/trainers/${user.id}/dashboard`
      );
      setDashboard(data);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user.id]);

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slotForm.start_time || !slotForm.end_time) {
      showToast("Please enter start and end time.");
      return;
    }

    try {
      await api(`/trainers/${user.id}/slots`, {
        method: "POST",
        body: JSON.stringify(slotForm),
      });

      setSlotForm({
        start_time: "",
        end_time: "",
      });

      setShowSlotForm(false);
      showToast("New time slot added ✓");
      load();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const deleteSlot = async (slotId: number) => {
    try {
      await api(`/trainers/${user.id}/slots/${slotId}`, {
        method: "DELETE",
      });

      showToast("Slot deleted");
      load();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  if (loading) return <Loading />;

  if (!dashboard) return null;

  if (selectedStudent) {
    return (
      <TrainerStudentProgress
        trainerId={user.id}
        studentId={selectedStudent}
        back={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-900 p-7 text-white shadow-xl sm:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <TrainerAvatar name={dashboard.profile.name} large />

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Trainer Dashboard
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Welcome, {dashboard.profile.name}
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                {dashboard.profile.bio ||
                  "Manage your students, sessions and availability."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPage("profile")}
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900"
          >
            👤 Edit Profile
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon="👨‍🎓"
          title="Students"
          value={dashboard.stats.total_students}
        />

        <StatCard
          icon="📅"
          title="Bookings"
          value={dashboard.stats.total_bookings}
        />

        <StatCard
          icon="🕐"
          title="Total Slots"
          value={dashboard.stats.total_slots}
        />

        <StatCard
          icon="🟢"
          title="Available"
          value={dashboard.stats.available_slots}
        />

        <StatCard
          icon="✅"
          title="Completed"
          value={dashboard.stats.completed_lectures}
        />
      </div>

      <Section
        title="Your Expertise"
        subtitle="Topics students can book sessions for."
      >
        <div className="flex flex-wrap gap-3">
          {dashboard.expertise.length === 0 ? (
            <p className="text-sm text-slate-500">
              No expertise topics added yet.
            </p>
          ) : (
            dashboard.expertise.map((topic) => (
              <span
                key={topic.id}
                className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700"
              >
                {topic.name}
              </span>
            ))
          )}
        </div>
      </Section>

      <Section
        title="Manage Time Slots"
        subtitle="Students will only see available slots."
      >
        <div className="mb-5">
          <button
            onClick={() => setShowSlotForm(!showSlotForm)}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
          >
            {showSlotForm ? "Cancel" : "+ Add Time Slot"}
          </button>
        </div>

        {showSlotForm && (
          <form
            onSubmit={addSlot}
            className="mb-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3"
          >
            <div>
              <label className="mb-2 block text-sm font-bold">
                Start Time
              </label>
              <input
                type="time"
                value={slotForm.start_time}
                onChange={(e) =>
                  setSlotForm({
                    ...slotForm,
                    start_time: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                End Time
              </label>
              <input
                type="time"
                value={slotForm.end_time}
                onChange={(e) =>
                  setSlotForm({
                    ...slotForm,
                    end_time: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <button className="self-end rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">
              Add Slot ✓
            </button>
          </form>
        )}

        <TrainerSlotManager
          trainerId={user.id}
          onDelete={deleteSlot}
        />
      </Section>

      <Section
        title="Students Progress 👨‍🎓"
        subtitle="Open a student's profile to view tests, topic performance and lecture history."
      >
        {dashboard.students.length === 0 ? (
          <EmptyState
            icon="👨‍🎓"
            title="No students yet"
            text="Students who book your sessions will appear here."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {dashboard.students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student.id)}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700">
                    {student.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-black">{student.name}</h3>
                    <p className="truncate text-xs text-slate-500">
                      {student.email}
                    </p>
                  </div>

                  <span className="text-slate-400">→</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <MiniStat
                    label="Latest Score"
                    value={`${Math.round(student.latest_score)}%`}
                  />
                  <MiniStat
                    label="Tests"
                    value={student.total_tests}
                  />
                  <MiniStat
                    label="Lectures"
                    value={student.completed_lectures}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Upcoming / Recent Bookings"
        subtitle="Manage your student sessions."
      >
        {dashboard.bookings.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No bookings"
            text="Your booked sessions will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Lecture</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.bookings.map((booking) => (
                  <tr
                    key={booking.booking_id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-4 py-4">
                      <p className="font-bold">
                        {booking.trainee_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.trainee_email}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {booking.topic}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {booking.start_time} - {booking.end_time}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        value={booking.booking_status}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        value={booking.lecture_status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

/* =========================================================
   TRAINER SLOT MANAGER
========================================================= */

function TrainerSlotManager({
  trainerId,
  onDelete,
}: {
  trainerId: number;
  onDelete: (id: number) => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    api<Slot[]>(`/trainers/${trainerId}/slots`)
      .then(setSlots)
      .catch(() => {});
  }, [trainerId]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {slots.length === 0 ? (
        <p className="text-sm text-slate-500">
          No slots created yet.
        </p>
      ) : (
        slots.map((slot) => (
          <div
            key={slot.id}
            className={`rounded-2xl border p-4 ${
              slot.available
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black">
                  {slot.start_time} - {slot.end_time}
                </p>

                <p
                  className={`mt-1 text-xs font-bold ${
                    slot.available
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }`}
                >
                  {slot.available ? "Available" : "Booked"}
                </p>
              </div>

              {slot.available && (
                <button
                  onClick={() => onDelete(slot.id)}
                  className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* =========================================================
   TRAINER STUDENT PROGRESS
========================================================= */

function TrainerStudentProgress({
  trainerId,
  studentId,
  back,
}: {
  trainerId: number;
  studentId: number;
  back: () => void;
}) {
  const [data, setData] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<StudentProgress>(
      `/trainers/${trainerId}/students/${studentId}/progress`
    )
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trainerId, studentId]);

  if (loading) return <Loading />;

  if (!data) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load student"
        text="Please try again later."
      />
    );
  }

  const latest = data.attempts[0];

  return (
    <div className="space-y-7">
      <button
        onClick={back}
        className="text-sm font-bold text-slate-500 hover:text-indigo-600"
      >
        ← Back to Trainer Dashboard
      </button>

      <div className="rounded-3xl bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-black text-indigo-700">
            {data.student.name.charAt(0)}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Student Profile
            </p>

            <h2 className="mt-1 text-3xl font-black">
              {data.student.name}
            </h2>

            <p className="text-sm text-slate-500">
              {data.student.email}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              {data.student.bio || "No bio added."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon="📝"
          title="Tests"
          value={data.attempts.length}
        />

        <StatCard
          icon="🎯"
          title="Latest Score"
          value={`${Math.round(latest?.score ?? 0)}%`}
        />

        <StatCard
          icon="📚"
          title="Lectures"
          value={data.lectures.length}
        />
      </div>

      {latest?.topic_results && (
        <Section title="Latest Topic Performance">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {latest.topic_results.map((topic) => (
              <TopicProgress
                key={topic.topic_id}
                topic={topic.topic}
                percentage={topic.percentage}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Test History">
        {data.attempts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No tests yet"
            text="This student has not taken any assessment."
          />
        ) : (
          <div className="space-y-3">
            {data.attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-black">{attempt.course}</h3>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {attempt.test_type}
                  </p>
                </div>

                <ScoreBadge score={attempt.score} />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Lecture History">
        {data.lectures.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No lecture history"
            text="Completed and scheduled sessions will appear here."
          />
        ) : (
          <div className="space-y-3">
            {data.lectures.map((lecture, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-black">{lecture.topic}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {lecture.start_time} - {lecture.end_time}
                    </p>
                  </div>

                  <StatusBadge value={lecture.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* =========================================================
   BOOKINGS
========================================================= */

function BookingsPage({
  user,
  showToast,
}: {
  user: User;
  showToast: (msg: string) => void;
}) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);

    const endpoint =
      user.role === "trainee"
        ? `/bookings/trainee/${user.id}`
        : `/trainers/${user.id}/dashboard`;

    api<any>(endpoint)
      .then((data) => {
        if (user.role === "trainee") {
          setBookings(data);
        } else {
          setBookings(data.bookings || []);
        }
      })
      .catch((err) => showToast(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user.id]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-7">
      <PageHeading
        title={user.role === "trainee" ? "My Bookings" : "Sessions"}
        subtitle={
          user.role === "trainee"
            ? "Your booked trainer lectures."
            : "Student sessions booked with you."
        }
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No bookings found"
          text="Your booking list is currently empty."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking, index) => (
            <div
              key={booking.booking_id || booking.id || index}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black">
                    {booking.topic || "Training Session"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {user.role === "trainee"
                      ? `Trainer: ${booking.trainer_name || "Trainer"}`
                      : `Student: ${booking.trainee_name}`}
                  </p>
                </div>

                <StatusBadge
                  value={
                    booking.booking_status ||
                    booking.status ||
                    "booked"
                  }
                />
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold">
                  🕐 {booking.start_time} - {booking.end_time}
                </p>
              </div>
            </div>
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
  updateUser,
  showToast,
}: {
  user: User;
  updateUser: (u: User) => void;
  showToast: (msg: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await api<User>(`/users/${user.id}/profile`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          bio,
        }),
      });

      updateUser(updated);
      showToast("Profile updated successfully ✓");
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeading
        title="My Profile"
        subtitle="Manage your SkillSphere profile information."
      />

      <form
        onSubmit={save}
        className="rounded-3xl bg-white p-7 shadow-sm sm:p-9"
      >
        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-black text-indigo-700">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="text-xl font-black">{name}</h3>
            <p className="text-sm capitalize text-slate-500">
              {user.role}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <Input
            label="Full Name"
            value={name}
            onChange={setName}
          />

          <div>
            <label className="mb-2 block text-sm font-bold">
              Email
            </label>

            <input
              value={user.email}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Tell something about yourself..."
            />
          </div>

          <button
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  user,
  showToast,
  logout,
}: {
  user: User;
  showToast: (msg: string) => void;
  logout: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [loading, setLoading] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!current || !next) {
      showToast("Enter both passwords.");
      return;
    }

    setLoading(true);

    try {
      await api(`/users/${user.id}/password`, {
        method: "PUT",
        body: JSON.stringify({
          current_password: current,
          new_password: next,
        }),
      });

      setCurrent("");
      setNext("");
      showToast("Password changed successfully ✓");
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeading
        title="Settings ⚙️"
        subtitle="Manage your account security."
      />

      <form
        onSubmit={changePassword}
        className="rounded-3xl bg-white p-7 shadow-sm"
      >
        <h3 className="text-xl font-black">Change Password</h3>

        <div className="mt-6 space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={current}
            onChange={setCurrent}
          />

          <Input
            label="New Password"
            type="password"
            value={next}
            onChange={setNext}
          />

          <button
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <h3 className="font-black text-red-800">Logout</h3>

        <p className="mt-1 text-sm text-red-700">
          Logout from this SkillSphere account.
        </p>

        <button
          onClick={logout}
          className="mt-4 rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-black">{title}</h2>

        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>

        <span className="text-2xl font-black text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {title}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const good = score >= 75;
  const medium = score >= 50;

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-black ${
        good
          ? "bg-emerald-50 text-emerald-700"
          : medium
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {Math.round(score)}%
    </span>
  );
}

function StatusBadge({ value }: { value: string }) {
  const text = value || "unknown";

  const lower = text.toLowerCase();

  let classes = "bg-slate-100 text-slate-600";

  if (
    lower.includes("complete") ||
    lower.includes("booked") ||
    lower.includes("scheduled")
  ) {
    classes = "bg-emerald-50 text-emerald-700";
  }

  if (
    lower.includes("cancel") ||
    lower.includes("fail")
  ) {
    classes = "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${classes}`}
    >
      {text}
    </span>
  );
}

function TopicProgress({
  topic,
  percentage,
}: {
  topic: string;
  percentage: number;
}) {
  const score = Math.round(percentage);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold">{topic}</h3>
        <span className="text-sm font-black">{score}%</span>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            score < 60
              ? "bg-red-500"
              : score < 75
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{
            width: `${Math.min(100, Math.max(0, score))}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-500">
        {score < 60
          ? "Needs improvement"
          : score < 75
          ? "Average"
          : "Good performance"}
      </p>
    </div>
  );
}

function TrainerAvatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-black text-white ${
        large ? "h-24 w-24 text-3xl" : "h-14 w-14 text-xl"
      }`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Loading SkillSphere...
        </p>
      </div>
    </div>
  );
}

function LoadingSmall() {
  return (
    <div className="flex items-center justify-center py-5">
      <div className="h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-indigo-600" />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="text-4xl">{icon}</div>

      <h3 className="mt-3 font-black">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export default App;
