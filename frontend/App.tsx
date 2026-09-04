import {
  useEffect,
  useState,
  type ReactNode
} from "react";

const API_URL =
  "https://skillsphere-backend-dcg2.onrender.com";

type Role =
  | "trainee"
  | "trainer"
  | "admin";

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
  topic_id: number;
  text: string;
  options: string[];
};

type Topic = {
  id: number;
  name: string;
};

type Trainer = {
  id: number;
  name: string;
  email: string;
  bio: string;
  expertise: {
    topic_id: number;
    topic_name: string;
  }[];
};

type Slot = {
  id: number;
  start_time: string;
  end_time: string;
};

type Stage =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "courses"
  | "test"
  | "result"
  | "teachers"
  | "teacherBooking"
  | "lecture"
  | "profile"
  | "settings"
  | "trainerDashboard"
  | "adminDashboard";


async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Something went wrong"
    );
  }

  return data;
}


function Button({
  children,
  onClick,
  secondary = false,
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        `px-5 py-2.5 rounded-lg font-semibold
        transition
        ${
          secondary
            ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`
      }
    >
      {children}
    </button>
  );
}


function Card({
  children
}: {
  children: ReactNode;
}) {

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      {children}
    </div>
  );
}


function Header({
  user,
  onDashboard,
  onProfile,
  onSettings,
  onLogout
}: {
  user: User;
  onDashboard: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">

      <button
        onClick={onDashboard}
        className="text-2xl font-bold text-blue-700"
      >
        SkillSphere
      </button>

      <div className="flex items-center gap-4">

        <span className="text-sm text-gray-600">
          {user.name}
        </span>

        <button
          onClick={onProfile}
          className="text-sm font-medium hover:text-blue-600"
        >
          Profile
        </button>

        <button
          onClick={onSettings}
          className="text-sm font-medium hover:text-blue-600"
        >
          Settings
        </button>

        <button
          onClick={onLogout}
          className="text-sm text-red-600 font-medium"
        >
          Logout
        </button>

      </div>
    </header>
  );
}


function Landing({
  onLogin,
  onRegister
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">

      <header className="h-16 bg-white border-b flex items-center justify-between px-8">

        <div className="text-2xl font-bold text-blue-700">
          SkillSphere
        </div>

        <div className="flex gap-3">
          <Button
            secondary
            onClick={onLogin}
          >
            Login
          </Button>

          <Button
            onClick={onRegister}
          >
            Register
          </Button>
        </div>

      </header>

      <main className="max-w-6xl mx-auto px-6 py-24">

        <div className="max-w-3xl">

          <p className="text-blue-600 font-semibold mb-4">
            COMPETENCY BASED LEARNING
          </p>

          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Learn what you need.
            <br />
            Improve where you are weak.
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            SkillSphere connects assessments, weak-topic
            analysis and expert trainers into one learning
            platform.
          </p>

          <div className="flex gap-4 mt-8">

            <Button onClick={onRegister}>
              Create Account
            </Button>

            <Button
              secondary
              onClick={onLogin}
            >
              Login
            </Button>

          </div>

        </div>

      </main>
    </div>
  );
}


function AuthPage({
  register,
  onSuccess,
  onSwitch
}: {
  register: boolean;
  onSuccess: (user: User) => void;
  onSwitch: () => void;
}) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Role>("trainee");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    if (register && !name) {
      setError("Please enter your name.");
      return;
    }

    if (
      register &&
      password !== confirm
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {

      setLoading(true);

      const user = register
        ? await api<User>(
            "/auth/register",
            {
              method: "POST",
              body: JSON.stringify({
                name,
                email,
                password,
                role,
                bio
              })
            }
          )
        : await api<User>(
            "/auth/login",
            {
              method: "POST",
              body: JSON.stringify({
                email,
                password
              })
            }
          );

      onSuccess(user);

    } catch (err: any) {

      setError(
        err.message || "Request failed"
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <Card>

        <div className="w-[420px] max-w-full">

          <h1 className="text-3xl font-bold text-gray-900">
            {register
              ? "Create your account"
              : "Welcome back"}
          </h1>

          <p className="text-gray-500 mt-2">
            {register
              ? "Join SkillSphere and start learning."
              : "Login to continue to SkillSphere."}
          </p>

          {register && (
            <div className="mt-6">

              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                value={name}
                onChange={e =>
                  setName(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
                placeholder="Your name"
              />

            </div>
          )}

          <div className="mt-4">

            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={e =>
                setEmail(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3"
              placeholder="you@example.com"
            />

          </div>

          <div className="mt-4">

            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={e =>
                setPassword(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3"
              placeholder="••••••••"
            />

          </div>

          {register && (
            <>
              <div className="mt-4">

                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirm}
                  onChange={e =>
                    setConfirm(e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Repeat password"
                />

              </div>

              <div className="mt-4">

                <label className="block text-sm font-medium mb-2">
                  Account Type
                </label>

                <select
                  value={role}
                  onChange={e =>
                    setRole(e.target.value as Role)
                  }
                  className="w-full border rounded-lg px-4 py-3"
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

              <div className="mt-4">

                <label className="block text-sm font-medium mb-2">
                  Bio
                </label>

                <textarea
                  value={bio}
                  onChange={e =>
                    setBio(e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Tell us about yourself"
                />

              </div>
            </>
          )}

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">

            <Button
              onClick={submit}
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : register
                ? "Create Account"
                : "Login"}
            </Button>

          </div>

          <button
            onClick={onSwitch}
            className="mt-5 text-blue-600 text-sm"
          >
            {register
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>

        </div>

      </Card>

    </div>
  );
}


function Dashboard({
  user,
  onCourses,
  onTeachers
}: {
  user: User;
  onCourses: () => void;
  onTeachers: () => void;
}) {

  if (user.role === "trainer") {
    return null;
  }

  if (user.role === "admin") {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold">
        Welcome, {user.name} 👋
      </h1>

      <p className="text-gray-500 mt-2">
        Choose how you want to continue learning.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-10">

        <Card>

          <div className="text-5xl">
            📚
          </div>

          <h2 className="text-2xl font-bold mt-5">
            Courses
          </h2>

          <p className="text-gray-600 mt-2">
            Take a diagnostic test, identify weak topics
            and get a personalised trainer recommendation.
          </p>

          <div className="mt-6">
            <Button onClick={onCourses}>
              Explore Courses
            </Button>
          </div>

        </Card>


        <Card>

          <div className="text-5xl">
            👨‍🏫
          </div>

          <h2 className="text-2xl font-bold mt-5">
            Teachers
          </h2>

          <p className="text-gray-600 mt-2">
            Directly choose a teacher, select a topic and
            book an available lecture slot.
          </p>

          <p className="text-green-600 font-medium mt-3">
            ✓ Test is not required
          </p>

          <div className="mt-6">
            <Button onClick={onTeachers}>
              Find Teachers
            </Button>
          </div>

        </Card>

      </div>

    </div>
  );
}


function CoursesPage({
  courses,
  onSelect
}: {
  courses: Course[];
  onSelect: (course: Course) => void;
}) {

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold">
        Courses
      </h1>

      <p className="text-gray-500 mt-2">
        Select a course to begin your diagnostic assessment.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">

        {courses.map(course => (

          <Card key={course.id}>

            <h2 className="text-xl font-bold">
              {course.title}
            </h2>

            <p className="text-gray-600 mt-3">
              {course.description}
            </p>

            <div className="mt-6">
              <Button
                onClick={() =>
                  onSelect(course)
                }
              >
                Start Assessment
              </Button>
            </div>

          </Card>

        ))}

      </div>

    </div>
  );
}


function TestPage({
  course,
  questions,
  onSubmit
}: {
  course: Course;
  questions: Question[];
  onSubmit: (
    answers: Record<number, string>
  ) => void;
}) {

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const question = questions[current];

  function choose(answer: string) {

    setAnswers({
      ...answers,
      [question.id]: answer
    });
  }

  if (!question) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      <div className="flex justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            {course.title}
          </h1>

          <p className="text-gray-500">
            Diagnostic Test
          </p>
        </div>

        <span className="text-gray-500">
          {current + 1} / {questions.length}
        </span>

      </div>

      <Card>

        <h2 className="text-xl font-semibold">
          {question.text}
        </h2>

        <div className="mt-6 space-y-3">

          {question.options.map(
            (option, index) => {

              const letter =
                String.fromCharCode(
                  65 + index
                );

              return (
                <button
                  key={option}
                  onClick={() =>
                    choose(letter)
                  }
                  className={
                    `w-full text-left border rounded-lg p-4
                    ${
                      answers[question.id] === letter
                        ? "border-blue-600 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`
                  }
                >
                  <b>{letter}.</b>{" "}
                  {option}
                </button>
              );
            }
          )}

        </div>

        <div className="flex justify-between mt-8">

          <Button
            secondary
            disabled={current === 0}
            onClick={() =>
              setCurrent(
                Math.max(0, current - 1)
              )
            }
          >
            Previous
          </Button>

          {current === questions.length - 1 ? (

            <Button
              onClick={() =>
                onSubmit(answers)
              }
            >
              Submit Test
            </Button>

          ) : (

            <Button
              onClick={() =>
                setCurrent(current + 1)
              }
            >
              Next
            </Button>

          )}

        </div>

      </Card>

    </div>
  );
}


function TeachersPage({
  trainers,
  onSelect
}: {
  trainers: Trainer[];
  onSelect: (trainer: Trainer) => void;
}) {

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold">
        Find a Teacher
      </h1>

      <p className="text-gray-500 mt-2">
        Book a lecture directly. You don't need to
        take a test first.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">

        {trainers.map(trainer => (

          <Card key={trainer.id}>

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
              👨‍🏫
            </div>

            <h2 className="text-xl font-bold mt-4">
              {trainer.name}
            </h2>

            <p className="text-gray-600 mt-2">
              {trainer.bio}
            </p>

            <div className="mt-4">

              <p className="font-semibold text-sm">
                Expertise
              </p>

              <div className="flex flex-wrap gap-2 mt-2">

                {trainer.expertise.map(topic => (

                  <span
                    key={topic.topic_id}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    {topic.topic_name}
                  </span>

                ))}

              </div>

            </div>

            <div className="mt-6">
              <Button
                onClick={() =>
                  onSelect(trainer)
                }
              >
                View Slots
              </Button>
            </div>

          </Card>

        ))}

      </div>

    </div>
  );
}


function TeacherBookingPage({
  trainer,
  topics,
  slots,
  user,
  onBooked
}: {
  trainer: Trainer;
  topics: Topic[];
  slots: Slot[];
  user: User;
  onBooked: (
    lectureId: number
  ) => void;
}) {

  const [topicId, setTopicId] =
    useState<number | "">("");

  const [booking, setBooking] =
    useState(false);

  const [error, setError] =
    useState("");

  const availableTopics =
    topics.filter(topic =>
      trainer.expertise.some(
        e => e.topic_id === topic.id
      )
    );

  async function bookSlot(
    slot: Slot
  ) {

    if (!topicId) {
      setError(
        "Please select a topic first."
      );
      return;
    }

    try {

      setBooking(true);
      setError("");

      const result =
        await api<{
          lecture_id: number;
        }>("/bookings", {
          method: "POST",
          body: JSON.stringify({
            trainee_id: user.id,
            trainer_id: trainer.id,
            slot_id: slot.id,
            topic_id: topicId
          })
        });

      onBooked(result.lecture_id);

    } catch (err: any) {

      setError(
        err.message || "Booking failed"
      );

    } finally {

      setBooking(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold">
        Book Lecture
      </h1>

      <p className="text-gray-500 mt-2">
        Teacher: {trainer.name}
      </p>

      <Card>

        <h2 className="font-bold text-lg">
          Select Topic
        </h2>

        <select
          value={topicId}
          onChange={e =>
            setTopicId(
              e.target.value
                ? Number(e.target.value)
                : ""
            )
          }
          className="w-full border rounded-lg px-4 py-3 mt-3"
        >

          <option value="">
            Select topic
          </option>

          {availableTopics.map(topic => (

            <option
              key={topic.id}
              value={topic.id}
            >
              {topic.name}
            </option>

          ))}

        </select>

        <h2 className="font-bold text-lg mt-8">
          Available Slots
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mt-4">

          {slots.map(slot => (

            <div
              key={slot.id}
              className="border rounded-xl p-4 flex items-center justify-between"
            >

              <div>

                <p className="font-semibold">
                  {slot.start_time}
                  {" - "}
                  {slot.end_time}
                </p>

                <p className="text-sm text-green-600">
                  Available
                </p>

              </div>

              <Button
                disabled={booking}
                onClick={() =>
                  bookSlot(slot)
                }
              >
                Book
              </Button>

            </div>

          ))}

        </div>

        {error && (
          <p className="text-red-600 mt-5">
            {error}
          </p>
        )}

      </Card>

    </div>
  );
}


function ResultPage({
  score,
  onTeachers
}: {
  score: number;
  onTeachers: () => void;
}) {

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      <Card>

        <h1 className="text-3xl font-bold">
          Assessment Result
        </h1>

        <div className="text-6xl font-bold text-blue-600 mt-8">
          {score}%
        </div>

        <p className="text-gray-600 mt-3">
          Your weak topics have been identified.
        </p>

        <div className="mt-8">
          <Button onClick={onTeachers}>
            Find a Teacher
          </Button>
        </div>

      </Card>

    </div>
  );
}


function LecturePage({
  lectureId,
  onComplete
}: {
  lectureId: number;
  onComplete: () => void;
}) {

  const [loading, setLoading] =
    useState(false);

  async function complete() {

    try {

      setLoading(true);

      await api(
        `/lectures/${lectureId}/complete`,
        {
          method: "POST"
        }
      );

      onComplete();

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      <Card>

        <div className="text-5xl">
          🎓
        </div>

        <h1 className="text-3xl font-bold mt-5">
          Lecture Scheduled
        </h1>

        <p className="text-gray-600 mt-3">
          Your trainer lecture has been booked successfully.
        </p>

        <p className="text-sm text-gray-500 mt-2">
          Lecture ID: {lectureId}
        </p>

        <div className="mt-8">

          <Button
            disabled={loading}
            onClick={complete}
          >
            {loading
              ? "Updating..."
              : "Mark Lecture Complete"}
          </Button>

        </div>

      </Card>

    </div>
  );
}


function ProfilePage({
  user,
  onUpdated
}: {
  user: User;
  onUpdated: (user: User) => void;
}) {

  const [name, setName] =
    useState(user.name);

  const [bio, setBio] =
    useState(user.bio || "");

  const [message, setMessage] =
    useState("");

  async function save() {

    try {

      const updated =
        await api<User>(
          `/users/${user.id}/profile`,
          {
            method: "PUT",
            body: JSON.stringify({
              name,
              bio
            })
          }
        );

      onUpdated(updated);

      setMessage(
        "Profile updated successfully."
      );

    } catch (err: any) {

      setMessage(
        err.message
      );
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      <Card>

        <h1 className="text-3xl font-bold">
          My Profile
        </h1>

        <div className="mt-6">

          <label className="font-medium">
            Name
          </label>

          <input
            value={name}
            onChange={e =>
              setName(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3 mt-2"
          />

        </div>

        <div className="mt-5">

          <label className="font-medium">
            Email
          </label>

          <input
            value={user.email}
            disabled
            className="w-full border rounded-lg px-4 py-3 mt-2 bg-gray-100"
          />

        </div>

        <div className="mt-5">

          <label className="font-medium">
            Role
          </label>

          <input
            value={user.role}
            disabled
            className="w-full border rounded-lg px-4 py-3 mt-2 bg-gray-100 capitalize"
          />

        </div>

        <div className="mt-5">

          <label className="font-medium">
            Bio
          </label>

          <textarea
            value={bio}
            onChange={e =>
              setBio(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3 mt-2"
          />

        </div>

        <div className="mt-6">
          <Button onClick={save}>
            Save Profile
          </Button>
        </div>

        {message && (
          <p className="mt-4 text-green-600">
            {message}
          </p>
        )}

      </Card>

    </div>
  );
}


function SettingsPage() {

  const [notifications, setNotifications] =
    useState(true);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      <Card>

        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <div className="flex items-center justify-between mt-8">

          <div>
            <p className="font-semibold">
              Notifications
            </p>

            <p className="text-sm text-gray-500">
              Receive updates about lectures and bookings.
            </p>
          </div>

          <input
            type="checkbox"
            checked={notifications}
            onChange={e =>
              setNotifications(
                e.target.checked
              )
            }
            className="w-5 h-5"
          />

        </div>

      </Card>

    </div>
  );
}


function TrainerDashboard({
  user
}: {
  user: User;
}) {

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

      const data =
        await api<Slot[]>(
          `/trainers/${user.id}/slots`
        );

      setSlots(data);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addSlot() {

    if (!start || !end) {
      return;
    }

    await api(
      `/trainers/${user.id}/slots`,
      {
        method: "POST",
        body: JSON.stringify({
          start_time: start,
          end_time: end
        })
      }
    );

    setStart("");
    setEnd("");

    load();
  }

  async function removeSlot(
    id: number
  ) {

    await api(
      `/trainers/${user.id}/slots/${id}`,
      {
        method: "DELETE"
      }
    );

    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold">
        Trainer Dashboard
      </h1>

      <p className="text-gray-500 mt-2">
        Manage your teaching availability.
      </p>

      <Card>

        <h2 className="text-xl font-bold">
          Add Available Slot
        </h2>

        <div className="flex gap-3 mt-5">

          <input
            type="time"
            value={start}
            onChange={e =>
              setStart(e.target.value)
            }
            className="border rounded-lg px-4 py-3"
          />

          <input
            type="time"
            value={end}
            onChange={e =>
              setEnd(e.target.value)
            }
            className="border rounded-lg px-4 py-3"
          />

          <Button onClick={addSlot}>
            Add Slot
          </Button>

        </div>

      </Card>

      <div className="mt-6">

        <Card>

          <h2 className="text-xl font-bold">
            My Slots
          </h2>

          {loading ? (

            <p className="mt-4">
              Loading...
            </p>

          ) : slots.length === 0 ? (

            <p className="text-gray-500 mt-4">
              No slots available.
            </p>

          ) : (

            <div className="space-y-3 mt-4">

              {slots.map(slot => (

                <div
                  key={slot.id}
                  className="border rounded-lg p-4 flex justify-between"
                >

                  <span>
                    {slot.start_time}
                    {" - "}
                    {slot.end_time}
                  </span>

                  <button
                    onClick={() =>
                      removeSlot(slot.id)
                    }
                    className="text-red-600"
                  >
                    Delete
                  </button>

                </div>

              ))}

            </div>

          )}

        </Card>

      </div>

    </div>
  );
}


function AdminDashboard() {

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <p className="text-gray-500 mt-2">
        Manage the SkillSphere platform.
      </p>

      <div className="grid md:grid-cols-4 gap-5 mt-8">

        <Card>
          <div className="text-3xl">
            👥
          </div>
          <h2 className="font-bold mt-3">
            Users
          </h2>
        </Card>

        <Card>
          <div className="text-3xl">
            👨‍🏫
          </div>
          <h2 className="font-bold mt-3">
            Trainers
          </h2>
        </Card>

        <Card>
          <div className="text-3xl">
            📚
          </div>
          <h2 className="font-bold mt-3">
            Courses
          </h2>
        </Card>

        <Card>
          <div className="text-3xl">
            📊
          </div>
          <h2 className="font-bold mt-3">
            Analytics
          </h2>
        </Card>

      </div>

    </div>
  );
}


export default function App() {

  const [stage, setStage] =
    useState<Stage>("landing");

  const [user, setUser] =
    useState<User | null>(null);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const [trainers, setTrainers] =
    useState<Trainer[]>([]);

  const [selectedTrainer, setSelectedTrainer] =
    useState<Trainer | null>(null);

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [score, setScore] =
    useState(0);

  const [lectureId, setLectureId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");


  async function loadCourses() {

    try {

      setError("");

      const data =
        await api<Course[]>(
          "/courses"
        );

      setCourses(data);
      setStage("courses");

    } catch (err: any) {

      setError(
        err.message
      );
    }
  }


  async function loadTeachers() {

    try {

      setError("");

      const data =
        await api<Trainer[]>(
          "/trainers"
        );

      setTrainers(data);
      setStage("teachers");

    } catch (err: any) {

      setError(
        err.message
      );
    }
  }


  async function selectCourse(
    course: Course
  ) {

    try {

      const data =
        await api<Question[]>(
          `/courses/${course.id}/questions`
        );

      setSelectedCourse(course);
      setQuestions(data);
      setStage("test");

    } catch (err: any) {

      setError(
        err.message
      );
    }
  }


  async function submitTest(
    answers: Record<number, string>
  ) {

    if (!user || !selectedCourse) {
      return;
    }

    try {

      const answerList =
        questions.map(q => ({
          question_id: q.id,
          answer: answers[q.id] || ""
        }));

      const result =
        await api<{
          score: number;
        }>("/tests/submit", {
          method: "POST",
          body: JSON.stringify({
            trainee_id: user.id,
            course_id: selectedCourse.id,
            test_type: "pretest",
            answers: answerList
          })
        });

      setScore(result.score);
      setStage("result");

    } catch (err: any) {

      setError(
        err.message
      );
    }
  }


  async function selectTeacher(
    trainer: Trainer
  ) {

    try {

      setError("");

      const [slotData, topicData] =
        await Promise.all([
          api<Slot[]>(
            `/trainers/${trainer.id}/slots`
          ),
          api<Topic[]>(
            `/courses/${selectedCourse?.id || 1}/topics`
          )
        ]);

      setSelectedTrainer(trainer);
      setSlots(slotData);
      setTopics(topicData);

      setStage("teacherBooking");

    } catch (err: any) {

      setError(
        err.message
      );
    }
  }


  function logout() {

    setUser(null);
    setStage("landing");
    setSelectedCourse(null);
    setSelectedTrainer(null);
  }


  function afterLogin(
    loggedUser: User
  ) {

    setUser(loggedUser);

    if (loggedUser.role === "trainer") {

      setStage("trainerDashboard");

    } else if (
      loggedUser.role === "admin"
    ) {

      setStage("adminDashboard");

    } else {

      setStage("dashboard");
    }
  }


  function layoutContent() {

    if (!user) {

      if (stage === "login") {

        return (
          <AuthPage
            register={false}
            onSuccess={afterLogin}
            onSwitch={() =>
              setStage("register")
            }
          />
        );
      }

      if (stage === "register") {

        return (
          <AuthPage
            register={true}
            onSuccess={afterLogin}
            onSwitch={() =>
              setStage("login")
            }
          />
        );
      }

      return (
        <Landing
          onLogin={() =>
            setStage("login")
          }
          onRegister={() =>
            setStage("register")
          }
        />
      );
    }


    if (
      stage === "trainerDashboard"
    ) {

      return (
        <TrainerDashboard
          user={user}
        />
      );
    }


    if (
      stage === "adminDashboard"
    ) {

      return (
        <AdminDashboard />
      );
    }


    return (
      <>

        <Header
          user={user}
          onDashboard={() => {

            if (
              user.role === "trainer"
            ) {

              setStage(
                "trainerDashboard"
              );

            } else if (
              user.role === "admin"
            ) {

              setStage(
                "adminDashboard"
              );

            } else {

              setStage(
                "dashboard"
              );
            }
          }}
          onProfile={() =>
            setStage("profile")
          }
          onSettings={() =>
            setStage("settings")
          }
          onLogout={logout}
        />

        {error && (
          <div className="max-w-6xl mx-auto px-6 pt-5">

            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>

          </div>
        )}

        {stage === "dashboard" && (

          <Dashboard
            user={user}
            onCourses={loadCourses}
            onTeachers={loadTeachers}
          />

        )}

        {stage === "courses" && (

          <CoursesPage
            courses={courses}
            onSelect={selectCourse}
          />

        )}

        {stage === "test" &&
          selectedCourse && (

            <TestPage
              course={selectedCourse}
              questions={questions}
              onSubmit={submitTest}
            />

          )}

        {stage === "result" && (

          <ResultPage
            score={score}
            onTeachers={loadTeachers}
          />

        )}

        {stage === "teachers" && (

          <TeachersPage
            trainers={trainers}
            onSelect={selectTeacher}
          />

        )}

        {stage === "teacherBooking" &&
          selectedTrainer && (

            <TeacherBookingPage
              trainer={selectedTrainer}
              topics={topics}
              slots={slots}
              user={user}
              onBooked={(id) => {

                setLectureId(id);
                setStage("lecture");

              }}
            />

          )}

        {stage === "lecture" &&
          lectureId && (

            <LecturePage
              lectureId={lectureId}
              onComplete={() =>
                setStage("dashboard")
              }
            />

          )}

        {stage === "profile" && (

          <ProfilePage
            user={user}
            onUpdated={setUser}
          />

        )}

        {stage === "settings" && (

          <SettingsPage />

        )}

      </>
    );
  }


  return layoutContent();
}
