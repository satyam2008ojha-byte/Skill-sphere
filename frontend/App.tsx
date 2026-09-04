import { useEffect, useMemo, useState, type ReactNode } from "react";

const API_URL = "https://skillsphere-backend-dcg2.onrender.com";

type Role = "trainee" | "trainer" | "admin";

type Stage =
  | "landing"
  | "login"
  | "register"
  | "courses"
  | "pretest"
  | "result"
  | "booking"
  | "lecture"
  | "posttest"
  | "final"
  | "trainer"
  | "admin"
  | "profile"
  | "settings";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  bio?: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
};

type Question = {
  id: number;
  course_id: number;
  topic_id: number;
  topic_name?: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type TopicResult = {
  topic_id: number;
  topic_name: string;
  percentage: number;
};

type TestResult = {
  attempt_id: number;
  score: number;
  total: number;
  topic_results: TopicResult[];
};

type Trainer = {
  id: number;
  name: string;
  email: string;
  bio?: string;
};

type Slot = {
  id: number;
  trainer_id: number;
  start_time: string;
  end_time: string;
  available: boolean;
};

type TrainerBooking = {
  id: number;
  trainee_id: number;
  trainee_name: string;
  trainee_email: string;
  topic_id: number;
  status: string;
};

type TrainerDashboardData = {
  trainer: Trainer;
  topics: {
    id: number;
    name: string;
  }[];
  slots: Slot[];
  bookings: TrainerBooking[];
};

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}

function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  secondary = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "11px 18px",
        borderRadius: 10,
        border: secondary ? "1px solid #d1d5db" : "none",
        background: disabled
          ? "#9ca3af"
          : secondary
          ? "#ffffff"
          : "#2563eb",
        color: secondary ? "#111827" : "#ffffff",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {children}
    </button>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 22,
        boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required = true,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{
        width: "100%",
        padding: "12px 14px",
        border: "1px solid #d1d5db",
        borderRadius: 10,
        marginTop: 7,
        marginBottom: 14,
        fontSize: 14,
        boxSizing: "border-box",
      }}
    />
  );
}

function Header({
  user,
  onDashboard,
  onProfile,
  onSettings,
  onLogout,
}: {
  user: User;
  onDashboard: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        onClick={onDashboard}
        style={{
          fontWeight: 800,
          fontSize: 21,
          color: "#2563eb",
          cursor: "pointer",
        }}
      >
        SkillSphere
      </div>

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            border: "1px solid #d1d5db",
            background: "#ffffff",
            borderRadius: 10,
            padding: "9px 13px",
            cursor: "pointer",
          }}
        >
          {user.name} ▾
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 48,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              minWidth: 180,
              boxShadow: "0 10px 30px rgba(0,0,0,.12)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onDashboard();
              }}
              style={menuButtonStyle}
            >
              🏠 Dashboard
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onProfile();
              }}
              style={menuButtonStyle}
            >
              👤 My Profile
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onSettings();
              }}
              style={menuButtonStyle}
            >
              ⚙️ Settings
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              style={{
                ...menuButtonStyle,
                color: "#dc2626",
                borderTop: "1px solid #eee",
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const menuButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px 15px",
  textAlign: "left",
  background: "#ffffff",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
};

function Layout({
  user,
  children,
  onDashboard,
  onProfile,
  onSettings,
  onLogout,
}: {
  user: User;
  children: ReactNode;
  onDashboard: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
      }}
    >
      <Header
        user={user}
        onDashboard={onDashboard}
        onProfile={onProfile}
        onSettings={onSettings}
        onLogout={onLogout}
      />

      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Button secondary onClick={onClick}>
        ← Back
      </Button>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState<Stage>("landing");

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("skillsphere_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [preResult, setPreResult] = useState<TestResult | null>(null);
  const [postResult, setPostResult] = useState<TestResult | null>(null);

  const [selectedTopic, setSelectedTopic] = useState<TopicResult | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [trainerDashboard, setTrainerDashboard] =
    useState<TrainerDashboardData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");

  useEffect(() => {
    if (user) {
      localStorage.setItem("skillsphere_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("skillsphere_user");
    }
  }, [user]);

  const weakTopics = useMemo(() => {
    if (!preResult) return [];

    return preResult.topic_results.filter(
      (topic) => topic.percentage < 70
    );
  }, [preResult]);

  function resetError() {
    setError("");
  }

  function logout() {
    setUser(null);
    setStage("landing");
    setSelectedCourse(null);
    setQuestions([]);
    setAnswers({});
    setPreResult(null);
    setPostResult(null);
    setTrainer(null);
    setSlots([]);
    setSelectedSlot(null);
    setTrainerDashboard(null);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    resetError();
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      setUser(data);

      if (data.role === "trainee") {
        await loadCourses();
        setStage("courses");
      } else if (data.role === "trainer") {
        setStage("trainer");
      } else {
        setStage("admin");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    resetError();

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      setLoginEmail(regEmail);
      setLoginPassword(regPassword);

      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");

      alert("Registration successful. Please login.");
      setStage("login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses() {
    try {
      const data = await apiRequest("/courses");
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function startCourse(course: Course) {
    resetError();
    setLoading(true);

    try {
      const data = await apiRequest(`/courses/${course.id}/questions`);

      setSelectedCourse(course);
      setQuestions(data);
      setAnswers({});
      setPreResult(null);
      setPostResult(null);

      setStage("pretest");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitTest(testType: "pre" | "post") {
    if (!user || !selectedCourse) return;

    resetError();

    if (Object.keys(answers).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setLoading(true);

    try {
      const answerArray = questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id],
      }));

      const data = await apiRequest("/tests/submit", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          course_id: selectedCourse.id,
          answers: answerArray,
          test_type: testType,
        }),
      });

      const result = await apiRequest(
        `/attempts/${data.attempt_id}/result`
      );

      if (testType === "pre") {
        setPreResult(result);
        setStage("result");
      } else {
        setPostResult(result);
        setStage("final");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function findTrainer(topic: TopicResult) {
    resetError();
    setLoading(true);

    try {
      const data = await apiRequest(
        `/trainers/recommended/${topic.topic_id}`
      );

      setSelectedTopic(topic);
      setTrainer(data);

      const trainerSlots = await apiRequest(
        `/trainers/${data.id}/slots`
      );

      setSlots(trainerSlots);

      setStage("booking");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function bookSlot(slot: Slot) {
    if (!user || !trainer || !selectedTopic) return;

    setLoading(true);
    resetError();

    try {
      const data = await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify({
          trainee_id: user.id,
          trainer_id: trainer.id,
          slot_id: slot.id,
          topic_id: selectedTopic.topic_id,
        }),
      });

      setSelectedSlot(slot);

      alert("Lecture slot booked successfully.");

      localStorage.setItem(
        "skillsphere_lecture",
        JSON.stringify(data)
      );

      setStage("lecture");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function completeLecture() {
    const saved = localStorage.getItem("skillsphere_lecture");

    if (!saved) {
      setError("Lecture information not found.");
      return;
    }

    try {
      const lecture = JSON.parse(saved);

      await apiRequest(`/lectures/${lecture.lecture_id}/complete`, {
        method: "POST",
      });

      alert("Lecture completed.");

      if (selectedCourse) {
        const data = await apiRequest(
          `/courses/${selectedCourse.id}/questions`
        );

        setQuestions(data);
        setAnswers({});
      }

      setStage("posttest");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function loadTrainerDashboard() {
    if (!user) return;

    setLoading(true);
    resetError();

    try {
      const data = await apiRequest(
        `/trainers/${user.id}/dashboard`
      );

      setTrainerDashboard(data);
      setStage("trainer");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addTrainerSlot(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

    if (!slotStart || !slotEnd) {
      setError("Please enter start and end time.");
      return;
    }

    setLoading(true);
    resetError();

    try {
      await apiRequest(`/trainers/${user.id}/slots`, {
        method: "POST",
        body: JSON.stringify({
          start_time: slotStart,
          end_time: slotEnd,
        }),
      });

      setSlotStart("");
      setSlotEnd("");

      await loadTrainerDashboard();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTrainerSlot(slotId: number) {
    if (!user) return;

    if (!confirm("Delete this available slot?")) return;

    try {
      await apiRequest(
        `/trainers/${user.id}/slots/${slotId}`,
        {
          method: "DELETE",
        }
      );

      await loadTrainerDashboard();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function goDashboard() {
    resetError();

    if (!user) {
      setStage("landing");
      return;
    }

    if (user.role === "trainee") {
      loadCourses();
      setStage("courses");
    } else if (user.role === "trainer") {
      loadTrainerDashboard();
    } else {
      setStage("admin");
    }
  }

  function goProfile() {
    resetError();
    setStage("profile");
  }

  function goSettings() {
    resetError();
    setStage("settings");
  }

  function goBack() {
    if (stage === "login" || stage === "register") {
      setStage("landing");
      return;
    }

    if (stage === "pretest") {
      setStage("courses");
      return;
    }

    if (stage === "result") {
      setStage("courses");
      return;
    }

    if (stage === "booking") {
      setStage("result");
      return;
    }

    if (stage === "lecture") {
      setStage("booking");
      return;
    }

    if (stage === "posttest") {
      setStage("lecture");
      return;
    }

    if (stage === "final") {
      setStage("courses");
      return;
    }

    if (stage === "profile" || stage === "settings") {
      goDashboard();
      return;
    }

    goDashboard();
  }

  const loggedInLayout = (content: ReactNode) => {
    if (!user) return content;

    return (
      <Layout
        user={user}
        onDashboard={goDashboard}
        onProfile={goProfile}
        onSettings={goSettings}
        onLogout={logout}
      >
        {content}
      </Layout>
    );
  };

  if (stage === "landing") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#eff6ff,#f8fafc)",
          padding: 20,
        }}
      >
        <Card>
          <div style={{ maxWidth: 600, textAlign: "center" }}>
            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                color: "#2563eb",
                marginBottom: 10,
              }}
            >
              SkillSphere
            </div>

            <h1 style={{ fontSize: 34, marginBottom: 10 }}>
              Personalized Learning Platform
            </h1>

            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Take a diagnostic test, identify your weak topics,
              connect with trainers, attend lectures and measure your
              improvement.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 25,
              }}
            >
              <Button onClick={() => setStage("login")}>
                Login
              </Button>

              <Button
                secondary
                onClick={() => setStage("register")}
              >
                Create Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (stage === "login") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f8fafc",
          padding: 20,
        }}
      >
        <Card>
          <BackButton onClick={() => setStage("landing")} />

          <h1>Login</h1>

          <p style={{ color: "#6b7280" }}>
            Login to continue to SkillSphere.
          </p>

          {error && <ErrorBox message={error} />}

          <form onSubmit={login}>
            <label>Email</label>

            <Input
              value={loginEmail}
              onChange={setLoginEmail}
              placeholder="Enter your email"
              type="email"
            />

            <label>Password</label>

            <Input
              value={loginPassword}
              onChange={setLoginPassword}
              placeholder="Enter password"
              type="password"
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p style={{ marginTop: 20 }}>
            Don't have an account?{" "}
            <button
              onClick={() => setStage("register")}
              style={linkStyle}
            >
              Register
            </button>
          </p>
        </Card>
      </div>
    );
  }

  if (stage === "register") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f8fafc",
          padding: 20,
        }}
      >
        <Card>
          <BackButton onClick={() => setStage("landing")} />

          <h1>Create Account</h1>

          <p style={{ color: "#6b7280" }}>
            Create your trainee account.
          </p>

          {error && <ErrorBox message={error} />}

          <form onSubmit={register}>
            <label>Name</label>

            <Input
              value={regName}
              onChange={setRegName}
              placeholder="Enter your full name"
            />

            <label>Email</label>

            <Input
              value={regEmail}
              onChange={setRegEmail}
              placeholder="Enter email"
              type="email"
            />

            <label>Password</label>

            <Input
              value={regPassword}
              onChange={setRegPassword}
              placeholder="Minimum 6 characters"
              type="password"
            />

            <label>Confirm Password</label>

            <Input
              value={regConfirmPassword}
              onChange={setRegConfirmPassword}
              placeholder="Confirm password"
              type="password"
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p style={{ marginTop: 20 }}>
            Already registered?{" "}
            <button
              onClick={() => setStage("login")}
              style={linkStyle}
            >
              Login
            </button>
          </p>
        </Card>
      </div>
    );
  }

  if (stage === "profile" && user) {
    return loggedInLayout(
      <>
        <BackButton onClick={goDashboard} />

        <h1>My Profile</h1>

        <Card>
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              marginBottom: 25,
            }}
          >
            <div
              style={{
                width: 75,
                height: 75,
                borderRadius: "50%",
                background: "#dbeafe",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 style={{ margin: 0 }}>{user.name}</h2>
              <p style={{ color: "#6b7280" }}>{user.email}</p>
            </div>
          </div>

          <InfoRow label="Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow
            label="Role"
            value={user.role.toUpperCase()}
          />

          {user.bio && (
            <InfoRow label="Bio" value={user.bio} />
          )}
        </Card>

        {user.role === "trainee" && (
          <Card className="profile-card">
            <h2>Learning Profile</h2>

            <p style={{ color: "#6b7280" }}>
              Your diagnostic tests, weak topics, trainer
              sessions and improvement are tracked inside your
              learning journey.
            </p>

            <Button onClick={goDashboard}>
              Continue Learning
            </Button>
          </Card>
        )}
      </>
    );
  }

  if (stage === "settings" && user) {
    return loggedInLayout(
      <>
        <BackButton onClick={goDashboard} />

        <h1>Settings</h1>

        <Card>
          <h2>Account Settings</h2>

          <label>Name</label>
          <input
            value={user.name}
            disabled
            style={disabledInput}
          />

          <label>Email</label>
          <input
            value={user.email}
            disabled
            style={disabledInput}
          />

          <label>Role</label>
          <input
            value={user.role}
            disabled
            style={disabledInput}
          />
        </Card>

        <Card className="profile-card">
          <h2>Notifications</h2>

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input type="checkbox" defaultChecked />
            Lecture reminders
          </label>

          <br />

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input type="checkbox" defaultChecked />
            Learning progress updates
          </label>
        </Card>

        <Card className="profile-card">
          <h2>Security</h2>

          <p style={{ color: "#6b7280" }}>
            Password change functionality can be connected to
            the backend later.
          </p>
        </Card>

        <Card className="profile-card">
          <h2>Logout</h2>

          <Button onClick={logout}>
            Logout from SkillSphere
          </Button>
        </Card>
      </>
    );
  }

  if (stage === "courses" && user) {
    return loggedInLayout(
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <div>
            <h1>Welcome, {user.name} 👋</h1>
            <p style={{ color: "#6b7280" }}>
              Choose a course to start your learning journey.
            </p>
          </div>

          <Button secondary onClick={goProfile}>
            👤 My Profile
          </Button>
        </div>

        {error && <ErrorBox message={error} />}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(260px,1fr))",
            gap: 20,
          }}
        >
          {courses.map((course) => (
            <Card key={course.id}>
              <h2>{course.title}</h2>

              <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
                {course.description}
              </p>

              <Button
                onClick={() => startCourse(course)}
                disabled={loading}
              >
                Start Diagnostic Test
              </Button>
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (
    (stage === "pretest" || stage === "posttest") &&
    user &&
    selectedCourse
  ) {
    const isPost = stage === "posttest";

    return loggedInLayout(
      <>
        <BackButton onClick={goBack} />

        <h1>
          {isPost ? "Post-Test" : "Diagnostic Pre-Test"}
        </h1>

        <p style={{ color: "#6b7280" }}>
          Course: <strong>{selectedCourse.title}</strong>
        </p>

        {error && <ErrorBox message={error} />}

        <div style={{ display: "grid", gap: 18 }}>
          {questions.map((q, index) => (
            <Card key={q.id}>
              <h3>
                Q{index + 1}. {q.text}
              </h3>

              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["A", q.option_a],
                  ["B", q.option_b],
                  ["C", q.option_c],
                  ["D", q.option_d],
                ].map(([key, value]) => (
                  <label
                    key={key}
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: 12,
                      borderRadius: 10,
                      cursor: "pointer",
                      background:
                        answers[q.id] === key
                          ? "#eff6ff"
                          : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={key}
                      checked={answers[q.id] === key}
                      onChange={() =>
                        setAnswers({
                          ...answers,
                          [q.id]: key,
                        })
                      }
                      style={{ marginRight: 10 }}
                    />

                    <strong>{key}.</strong> {value}
                  </label>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div
          style={{
            marginTop: 25,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={() =>
              submitTest(isPost ? "post" : "pre")
            }
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : isPost
              ? "Submit Post-Test"
              : "Submit Diagnostic Test"}
          </Button>
        </div>
      </>
    );
  }

  if (stage === "result" && user && preResult) {
    return loggedInLayout(
      <>
        <BackButton onClick={() => setStage("courses")} />

        <h1>Diagnostic Result</h1>

        <Card>
          <h2>
            Overall Score: {Math.round(preResult.score)}%
          </h2>

          <p style={{ color: "#6b7280" }}>
            We analyzed your performance topic-wise.
          </p>
        </Card>

        <h2 style={{ marginTop: 30 }}>Topic Analysis</h2>

        <div style={{ display: "grid", gap: 15 }}>
          {preResult.topic_results.map((topic) => {
            const weak = topic.percentage < 70;

            return (
              <Card key={topic.topic_id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {topic.topic_name}
                    </h3>

                    <p
                      style={{
                        color: weak ? "#dc2626" : "#16a34a",
                        fontWeight: 700,
                      }}
                    >
                      {Math.round(topic.percentage)}%
                    </p>
                  </div>

                  {weak ? (
                    <Button
                      onClick={() => findTrainer(topic)}
                    >
                      Find Trainer
                    </Button>
                  ) : (
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: 700,
                      }}
                    >
                      ✓ Good
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  if (stage === "booking" && user && trainer) {
    return loggedInLayout(
      <>
        <BackButton onClick={goBack} />

        <h1>Book Trainer Session</h1>

        {selectedTopic && (
          <Card>
            <h2>Weak Topic</h2>
            <p>
              {selectedTopic.topic_name} —{" "}
              {Math.round(selectedTopic.percentage)}%
            </p>
          </Card>
        )}

        <Card className="profile-card">
          <h2>Recommended Trainer</h2>

          <h3>{trainer.name}</h3>

          <p>{trainer.email}</p>

          <p style={{ color: "#6b7280" }}>
            {trainer.bio || "SkillSphere Trainer"}
          </p>
        </Card>

        <h2>Available Slots</h2>

        {error && <ErrorBox message={error} />}

        {slots.filter((s) => s.available).length === 0 ? (
          <Card>
            <p>No available slots currently.</p>
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(230px,1fr))",
              gap: 15,
            }}
          >
            {slots
              .filter((s) => s.available)
              .map((slot) => (
                <Card key={slot.id}>
                  <h3>
                    {slot.start_time} - {slot.end_time}
                  </h3>

                  <p style={{ color: "#16a34a" }}>
                    Available
                  </p>

                  <Button
                    onClick={() => bookSlot(slot)}
                    disabled={loading}
                  >
                    Book This Slot
                  </Button>
                </Card>
              ))}
          </div>
        )}
      </>
    );
  }

  if (stage === "lecture" && user) {
    return loggedInLayout(
      <>
        <BackButton onClick={goBack} />

        <h1>Lecture Session</h1>

        <Card>
          <h2>Trainer Session</h2>

          {trainer && (
            <p>
              Trainer: <strong>{trainer.name}</strong>
            </p>
          )}

          {selectedSlot && (
            <p>
              Time:{" "}
              <strong>
                {selectedSlot.start_time} -{" "}
                {selectedSlot.end_time}
              </strong>
            </p>
          )}

          <div
            style={{
              background: "#eff6ff",
              padding: 20,
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <h3>Lecture Instructions</h3>

            <p>
              Attend your trainer session and complete the
              lecture before starting the post-test.
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <Button onClick={completeLecture}>
              ✓ Mark Lecture Completed
            </Button>
          </div>
        </Card>
      </>
    );
  }

  if (stage === "final" && user) {
    const pre = preResult?.score ?? 0;
    const post = postResult?.score ?? 0;
    const improvement = post - pre;

    return loggedInLayout(
      <>
        <h1>Learning Journey Completed 🎉</h1>

        <Card>
          <h2>Before vs After</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",
              gap: 15,
              marginTop: 20,
            }}
          >
            <ScoreBox
              title="Pre-Test"
              score={pre}
            />

            <ScoreBox
              title="Post-Test"
              score={post}
            />

            <ScoreBox
              title="Improvement"
              score={improvement}
              suffix="%"
            />
          </div>
        </Card>

        {postResult && (
          <>
            <h2 style={{ marginTop: 30 }}>
              Final Topic Performance
            </h2>

            <div style={{ display: "grid", gap: 15 }}>
              {postResult.topic_results.map((topic) => (
                <Card key={topic.topic_id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <strong>{topic.topic_name}</strong>

                    <strong>
                      {Math.round(topic.percentage)}%
                    </strong>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 25 }}>
          <Button onClick={goDashboard}>
            Back to Dashboard
          </Button>
        </div>
      </>
    );
  }

  if (stage === "trainer" && user) {
    if (!trainerDashboard) {
      return loggedInLayout(
        <>
          <h1>Trainer Dashboard</h1>

          {error && <ErrorBox message={error} />}

          <Card>
            <p>Loading trainer dashboard...</p>
          </Card>
        </>
      );
    }

    return loggedInLayout(
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <div>
            <h1>Trainer Dashboard</h1>
            <p style={{ color: "#6b7280" }}>
              Manage your expertise, available slots and
              trainee sessions.
            </p>
          </div>

          <Button secondary onClick={goProfile}>
            👤 Profile
          </Button>
        </div>

        {error && <ErrorBox message={error} />}

        <Card>
          <h2>Trainer Profile</h2>

          <InfoRow
            label="Name"
            value={trainerDashboard.trainer.name}
          />

          <InfoRow
            label="Email"
            value={trainerDashboard.trainer.email}
          />

          <InfoRow
            label="Bio"
            value={
              trainerDashboard.trainer.bio ||
              "SkillSphere Trainer"
            }
          />
        </Card>

        <Card className="profile-card">
          <h2>My Expertise</h2>

          {trainerDashboard.topics.length === 0 ? (
            <p>No expertise topics assigned.</p>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {trainerDashboard.topics.map((topic) => (
                <span
                  key={topic.id}
                  style={{
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    padding: "8px 12px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {topic.name}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card className="profile-card">
          <h2>Add Available Slot</h2>

          <form onSubmit={addTrainerSlot}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: 15,
              }}
            >
              <div>
                <label>Start Time</label>
                <Input
                  value={slotStart}
                  onChange={setSlotStart}
                  placeholder="e.g. 10:00 AM"
                />
              </div>

              <div>
                <label>End Time</label>
                <Input
                  value={slotEnd}
                  onChange={setSlotEnd}
                  placeholder="e.g. 11:00 AM"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              + Add Slot
            </Button>
          </form>
        </Card>

        <Card className="profile-card">
          <h2>My Available Slots</h2>

          {trainerDashboard.slots.length === 0 ? (
            <p>No slots added yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {trainerDashboard.slots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #e5e7eb",
                    padding: 14,
                    borderRadius: 10,
                  }}
                >
                  <div>
                    <strong>
                      {slot.start_time} - {slot.end_time}
                    </strong>

                    <div
                      style={{
                        color: slot.available
                          ? "#16a34a"
                          : "#dc2626",
                        fontSize: 13,
                        marginTop: 5,
                      }}
                    >
                      {slot.available
                        ? "Available"
                        : "Booked"}
                    </div>
                  </div>

                  {slot.available && (
                    <Button
                      secondary
                      onClick={() =>
                        deleteTrainerSlot(slot.id)
                      }
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="profile-card">
          <h2>Booked Sessions</h2>

          {trainerDashboard.bookings.length === 0 ? (
            <p>No trainee bookings yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {trainerDashboard.bookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 15,
                  }}
                >
                  <strong>{booking.trainee_name}</strong>

                  <p style={{ margin: "6px 0" }}>
                    {booking.trainee_email}
                  </p>

                  <span
                    style={{
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    Status: {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </>
    );
  }

  if (stage === "admin" && user) {
    return loggedInLayout(
      <>
        <h1>Admin Dashboard</h1>

        <Card>
          <h2>Welcome, {user.name}</h2>

          <p>
            Admin dashboard is ready for future management
            features such as users, courses, trainers and
            analytics.
          </p>
        </Card>
      </>
    );
  }

  return null;
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
        padding: 12,
        borderRadius: 10,
        marginBottom: 18,
      }}
    >
      {message}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        padding: "13px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <strong>{label}</strong>
      <span style={{ color: "#6b7280" }}>{value}</span>
    </div>
  );
}

function ScoreBox({
  title,
  score,
  suffix = "%",
}: {
  title: string;
  score: number;
  suffix?: string;
}) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ color: "#6b7280" }}>{title}</div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          marginTop: 8,
        }}
      >
        {Math.round(score)}
        {suffix}
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 700,
};

const disabledInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  marginTop: 7,
  marginBottom: 14,
  boxSizing: "border-box",
  background: "#f3f4f6",
};
