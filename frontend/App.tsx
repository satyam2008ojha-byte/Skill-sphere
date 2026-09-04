import { useEffect, useMemo, useState } from "react";

const API_URL = "https://skillsphere-backend-dcg2.onrender.com";

type Role = "trainee" | "trainer" | "admin";

type Stage =
  | "landing"
  | "login"
  | "courses"
  | "pretest"
  | "result"
  | "booking"
  | "lecture"
  | "posttest"
  | "final"
  | "trainer"
  | "admin";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
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

type TopicResult = {
  topic_id: number;
  topic: string;
  percentage: number;
};

type WeakTopic = {
  topic_id: number;
  percentage: number;
};

type Trainer = {
  id: number;
  name: string;
  bio: string;
  title?: string;
};

type Slot = {
  id: number;
  start_time: string;
  end_time: string;
};

type TestResult = {
  attempt_id: number;
  score: number;
  weak_topics: WeakTopic[];
};

type DetailedResult = {
  attempt_id: number;
  test_type: string;
  score: number;
  topics: TopicResult[];
};

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API Error ${response.status}`);
  }

  return response.json();
}

function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg font-medium transition ${
        secondary
          ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          : "bg-[#1F5F95] text-white hover:bg-[#174b77]"
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
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function Header({
  onHome,
}: {
  onHome: () => void;
}) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <button
        onClick={onHome}
        className="text-xl font-bold text-[#1F5F95]"
      >
        SkillSphere
      </button>

      <span className="text-sm text-gray-500">
        Skill-based Learning & Assessment
      </span>
    </header>
  );
}

export default function App() {
  const [stage, setStage] =
    useState<Stage>("landing");

  const [user, setUser] =
    useState<User | null>(null);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loginError, setLoginError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [course, setCourse] =
    useState<Course | null>(null);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [postAnswers, setPostAnswers] =
    useState<Record<number, string>>({});

  const [index, setIndex] =
    useState(0);

  const [preScore, setPreScore] =
    useState(0);

  const [postScore, setPostScore] =
    useState(0);

  const [weakTopics, setWeakTopics] =
    useState<WeakTopic[]>([]);

  const [preTopicResults, setPreTopicResults] =
    useState<TopicResult[]>([]);

  const [postTopicResults, setPostTopicResults] =
    useState<TopicResult[]>([]);

  const [selectedTrainer, setSelectedTrainer] =
    useState<Trainer | null>(null);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [selectedSlot, setSelectedSlot] =
    useState<Slot | null>(null);

  const [lectureId, setLectureId] =
    useState<number | null>(null);

  const [bookingId, setBookingId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  const [currentWeakTopic, setCurrentWeakTopic] =
    useState<WeakTopic | null>(null);

  // ------------------------------------------------------------
  // LOAD COURSES
  // ------------------------------------------------------------

  const loadCourses = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/courses");

      setCourses(data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------------

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError(
        "Please enter email and password."
      );
      return;
    }

    try {
      setLoading(true);
      setLoginError("");

      const data = await apiRequest(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      setUser(data);

      if (data.role === "trainee") {
        await loadCourses();
        setStage("courses");
      } else if (data.role === "trainer") {
        setStage("trainer");
      } else {
        setStage("admin");
      }
    } catch (error) {
      console.error(error);
      setLoginError(
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // START COURSE
  // ------------------------------------------------------------

  const startCourse = async (
    selectedCourse: Course
  ) => {
    try {
      setLoading(true);
      setMessage("");

      const data = await apiRequest(
        `/courses/${selectedCourse.id}/questions`
      );

      setCourse(selectedCourse);
      setQuestions(data);

      setAnswers({});
      setPostAnswers({});

      setIndex(0);

      setPreScore(0);
      setPostScore(0);

      setWeakTopics([]);
      setPreTopicResults([]);
      setPostTopicResults([]);

      setSelectedTrainer(null);
      setSelectedSlot(null);
      setSlots([]);

      setStage("pretest");
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to load test questions."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // SUBMIT TEST
  // ------------------------------------------------------------

  const submitTest = async (
    testType: "pre" | "post"
  ) => {
    if (!course || !user) return;

    const currentAnswers =
      testType === "pre"
        ? answers
        : postAnswers;

    if (
      Object.keys(currentAnswers).length !==
      questions.length
    ) {
      setMessage(
        "Please answer all questions before submitting."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formattedAnswers =
        questions.map((question) => ({
          question_id: question.id,
          answer: currentAnswers[question.id],
        }));

      const data: TestResult =
        await apiRequest("/tests/submit", {
          method: "POST",
          body: JSON.stringify({
            trainee_id: user.id,
            course_id: course.id,
            answers: formattedAnswers,
            test_type: testType,
          }),
        });

      if (testType === "pre") {
        setPreScore(data.score);
        setWeakTopics(data.weak_topics);

        const detailed: DetailedResult =
          await apiRequest(
            `/attempts/${data.attempt_id}/result`
          );

        setPreTopicResults(detailed.topics);

        setStage("result");
      } else {
        setPostScore(data.score);

        const detailed: DetailedResult =
          await apiRequest(
            `/attempts/${data.attempt_id}/result`
          );

        setPostTopicResults(detailed.topics);

        setStage("final");
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to submit test. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // GET RECOMMENDED TRAINER
  // ------------------------------------------------------------

  const findTrainer = async (
    topic: WeakTopic
  ) => {
    try {
      setLoading(true);
      setMessage("");

      const data =
        await apiRequest(
          `/trainers/recommended/${topic.topic_id}`
        );

      if (!data || data.length === 0) {
        setMessage(
          "No trainer found for this topic."
        );
        return;
      }

      const trainer: Trainer = data[0];

      setSelectedTrainer(trainer);
      setCurrentWeakTopic(topic);

      const trainerSlots =
        await apiRequest(
          `/trainers/${trainer.id}/slots`
        );

      setSlots(trainerSlots);

      setSelectedSlot(null);

      setStage("booking");
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to find a trainer."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // BOOK SLOT
  // ------------------------------------------------------------

  const bookLecture = async () => {
    if (
      !user ||
      !selectedTrainer ||
      !selectedSlot ||
      !currentWeakTopic
    ) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data =
        await apiRequest("/bookings", {
          method: "POST",
          body: JSON.stringify({
            trainee_id: user.id,
            trainer_id: selectedTrainer.id,
            slot_id: selectedSlot.id,
            topic_id: currentWeakTopic.topic_id,
          }),
        });

      setBookingId(data.booking_id);
      setLectureId(data.lecture_id);

      setStage("lecture");
    } catch (error) {
      console.error(error);

      setMessage(
        "This slot is no longer available."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // COMPLETE LECTURE
  // ------------------------------------------------------------

  const completeLecture = async () => {
    if (!lectureId) return;

    try {
      setLoading(true);
      setMessage("");

      await apiRequest(
        `/lectures/${lectureId}/complete`,
        {
          method: "POST",
        }
      );

      setPostAnswers({});
      setIndex(0);

      setStage("posttest");
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to complete lecture."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // TOPIC IMPROVEMENT
  // ------------------------------------------------------------

  const topicImprovement = useMemo(() => {
    const map: Record<
      string,
      {
        before: number;
        after: number;
      }
    > = {};

    preTopicResults.forEach((item) => {
      map[item.topic] = {
        before: item.percentage,
        after: 0,
      };
    });

    postTopicResults.forEach((item) => {
      if (!map[item.topic]) {
        map[item.topic] = {
          before: 0,
          after: item.percentage,
        };
      } else {
        map[item.topic].after =
          item.percentage;
      }
    });

    return Object.entries(map);
  }, [
    preTopicResults,
    postTopicResults,
  ]);

  // ------------------------------------------------------------
  // QUIZ UI
  // ------------------------------------------------------------

  const renderQuiz = (
    isPost: boolean
  ) => {
    if (!course || questions.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          Loading questions...
        </div>
      );
    }

    const currentQuestion =
      questions[index];

    const currentAnswers =
      isPost
        ? postAnswers
        : answers;

    const selectedAnswer =
      currentAnswers[currentQuestion.id];

    const setAnswer = (
      value: string
    ) => {
      if (isPost) {
        setPostAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]:
            value,
        }));
      } else {
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]:
            value,
        }));
      }
    };

    const isLast =
      index === questions.length - 1;

    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <main className="max-w-3xl mx-auto p-6">

          <div className="flex justify-between mb-5">
            <div>
              <p className="text-sm text-gray-500">
                {isPost
                  ? "Post-Test"
                  : "Pre-Test"}{" "}
                • {course.title}
              </p>

              <h2 className="text-2xl font-bold">
                Question {index + 1} of{" "}
                {questions.length}
              </h2>
            </div>

            <span className="px-3 py-2 bg-blue-50 text-[#1F5F95] rounded-lg text-sm font-medium">
              Topic ID:{" "}
              {currentQuestion.topic_id}
            </span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full mb-6">
            <div
              className="h-2 bg-[#1F5F95] rounded-full"
              style={{
                width: `${
                  ((index + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />
          </div>

          <Card className="p-7">

            <h3 className="text-xl font-semibold mb-6">
              {currentQuestion.text}
            </h3>

            <div className="space-y-3">

              {currentQuestion.options.map(
                (option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex gap-3 p-4 border rounded-lg cursor-pointer ${
                      selectedAnswer ===
                      String(
                        String.fromCharCode(
                          65 +
                            optionIndex
                        )
                      )
                        ? "border-[#1F5F95] bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >

                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={
                        selectedAnswer ===
                        String.fromCharCode(
                          65 +
                            optionIndex
                        )
                      }
                      onChange={() =>
                        setAnswer(
                          String.fromCharCode(
                            65 +
                              optionIndex
                          )
                        )
                      }
                    />

                    <span>
                      {String.fromCharCode(
                        65 +
                          optionIndex
                      )}
                      . {option}
                    </span>

                  </label>
                )
              )}

            </div>

          </Card>

          {message && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700">
              {message}
            </div>
          )}

          <div className="flex justify-between mt-5">

            <Button
              secondary
              disabled={index === 0}
              onClick={() =>
                setIndex(
                  index - 1
                )
              }
            >
              Previous
            </Button>

            {isLast ? (
              <Button
                disabled={
                  !selectedAnswer ||
                  loading
                }
                onClick={() =>
                  submitTest(
                    isPost
                      ? "post"
                      : "pre"
                  )
                }
              >
                {loading
                  ? "Submitting..."
                  : "Submit Test"}
              </Button>
            ) : (
              <Button
                disabled={
                  !selectedAnswer
                }
                onClick={() =>
                  setIndex(
                    index + 1
                  )
                }
              >
                Next
              </Button>
            )}

          </div>

        </main>
      </div>
    );
  };

  // ------------------------------------------------------------
  // LANDING
  // ------------------------------------------------------------

  if (stage === "landing") {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

          <div>

            <span className="text-sm font-semibold text-[#1F5F95]">
              PERSONALIZED TRAINING
            </span>

            <h1 className="text-5xl font-bold text-gray-900 mt-3 leading-tight">
              Learn what you need,
              <br />
              not what you already know.
            </h1>

            <p className="text-gray-600 text-lg mt-5">
              Select a course, take a
              topic-wise diagnostic test,
              find your skill gaps, get
              matched with a trainer,
              attend a focused lecture
              and measure your improvement.
            </p>

            <div className="mt-7">
              <Button
                onClick={() =>
                  setStage("login")
                }
              >
                Get Started →
              </Button>
            </div>

          </div>

          <Card className="p-7">

            <h3 className="text-xl font-bold">
              How SkillSphere works
            </h3>

            <div className="mt-6 space-y-5">

              {[
                [
                  "01",
                  "Choose Course",
                  "Select the course you want to learn.",
                ],
                [
                  "02",
                  "Pre-Test",
                  "Solve 15 MCQs mapped to specific topics.",
                ],
                [
                  "03",
                  "Find Your Gap",
                  "Wrong answers reveal weak topics.",
                ],
                [
                  "04",
                  "Learn from Trainer",
                  "Book an available trainer slot.",
                ],
                [
                  "05",
                  "Post-Test",
                  "Measure improvement after the lecture.",
                ],
              ].map((item) => (

                <div
                  className="flex gap-4"
                  key={item[0]}
                >

                  <span className="font-bold text-[#1F5F95]">
                    {item[0]}
                  </span>

                  <div>
                    <b>
                      {item[1]}
                    </b>

                    <p className="text-sm text-gray-500">
                      {item[2]}
                    </p>
                  </div>

                </div>

              ))}

            </div>

          </Card>

        </div>

      </div>
    );
  }

  // ------------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------------

  if (stage === "login") {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <div className="max-w-md mx-auto py-20">

          <Card className="p-8">

            <h1 className="text-2xl font-bold">
              Login to SkillSphere
            </h1>

            <p className="text-gray-500 mt-2">
              Login using your SkillSphere account.
            </p>

            <div className="mt-6 space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#1F5F95]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#1F5F95]"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {loginError}
                </div>
              )}

              <Button
                disabled={loading}
                onClick={handleLogin}
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </Button>

            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">

              <p className="font-semibold">
                Demo Trainee
              </p>

              <p>
                trainee@skillsphere.com
              </p>

              <p>
                Password: 123456
              </p>

            </div>

          </Card>

        </div>

      </div>
    );
  }

  // ------------------------------------------------------------
  // COURSES
  // ------------------------------------------------------------

  if (stage === "courses") {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <main className="max-w-6xl mx-auto p-6">

          <div className="mb-7">

            <p className="text-[#1F5F95] font-semibold text-sm">
              TRAINEE DASHBOARD
            </p>

            <h1 className="text-3xl font-bold">
              Welcome,{" "}
              {user?.name}
            </h1>

            <p className="text-gray-500 mt-1">
              Choose a course to begin your
              diagnostic assessment.
            </p>

          </div>

          {message && (
            <div className="mb-5 p-4 rounded-lg bg-red-50 text-red-700">
              {message}
            </div>
          )}

          {loading ? (
            <p>Loading courses...</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">

              {courses.map(
                (c) => (

                  <Card
                    key={c.id}
                    className="p-6 flex flex-col"
                  >

                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded w-fit">
                      Skill Assessment
                    </span>

                    <h2 className="text-xl font-bold mt-4">
                      {c.title}
                    </h2>

                    <p className="text-gray-500 text-sm mt-2 flex-1">
                      {c.description}
                    </p>

                    <div className="text-sm text-gray-500 mt-5 mb-4">
                      15 MCQs • Topic-wise analysis
                    </div>

                    <Button
                      onClick={() =>
                        startCourse(c)
                      }
                    >
                      Start Diagnostic Test
                    </Button>

                  </Card>

                )
              )}

            </div>
          )}

        </main>

      </div>
    );
  }

  // ------------------------------------------------------------
  // PRE TEST
  // ------------------------------------------------------------

  if (stage === "pretest") {
    return renderQuiz(false);
  }

  // ------------------------------------------------------------
  // RESULT
  // ------------------------------------------------------------

  if (stage === "result" && course) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <main className="max-w-5xl mx-auto p-6">

          <Card className="p-7">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Diagnostic Result
                </p>

                <h1 className="text-3xl font-bold">
                  Your Skill Gaps
                </h1>
              </div>

              <div className="text-center">

                <div className="text-4xl font-bold text-[#1F5F95]">
                  {preScore}%
                </div>

                <span className="text-sm text-gray-500">
                  Overall Score
                </span>

              </div>

            </div>

            <div className="mt-7">

              <h2 className="text-xl font-bold mb-4">
                Topic-wise Performance
              </h2>

              <div className="space-y-4">

                {preTopicResults.map(
                  (item) => (

                    <div
                      className="border rounded-lg p-4"
                      key={item.topic_id}
                    >

                      <div className="flex justify-between">

                        <b>
                          {item.topic}
                        </b>

                        <span
                          className={
                            item.percentage < 70
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {item.percentage}%
                        </span>

                      </div>

                      <div className="h-2 bg-gray-200 rounded mt-3">

                        <div
                          className={`h-2 rounded ${
                            item.percentage < 70
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />

                      </div>

                      {item.percentage <
                        70 && (
                        <p className="text-sm text-red-600 mt-2">
                          Needs improvement
                        </p>
                      )}

                    </div>

                  )
                )}

              </div>

            </div>

          </Card>

          <Card className="p-7 mt-5">

            <h2 className="text-xl font-bold">
              Weak Topics
            </h2>

            <p className="text-gray-500 mt-1">
              Select a weak topic to find a
              suitable trainer.
            </p>

            {weakTopics.length === 0 ? (

              <div className="mt-5 p-4 bg-green-50 text-green-700 rounded-lg">
                Excellent! No major topic gap
                was detected.
              </div>

            ) : (

              <div className="mt-5 space-y-3">

                {weakTopics.map(
                  (topic) => (

                    <div
                      key={topic.topic_id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >

                      <div>

                        <b>
                          Topic ID:{" "}
                          {topic.topic_id}
                        </b>

                        <p className="text-red-600 text-sm">
                          Score:{" "}
                          {topic.percentage}%
                        </p>

                      </div>

                      <Button
                        disabled={loading}
                        onClick={() =>
                          findTrainer(topic)
                        }
                      >
                        Find Trainer →
                      </Button>

                    </div>

                  )
                )}

              </div>

            )}

          </Card>

        </main>

      </div>
    );
  }

  // ------------------------------------------------------------
  // BOOKING
  // ------------------------------------------------------------

  if (
    stage === "booking" &&
    selectedTrainer
  ) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <main className="max-w-3xl mx-auto p-6">

          <Button
            secondary
            onClick={() =>
              setStage("result")
            }
          >
            ← Back
          </Button>

          <Card className="p-7 mt-5">

            <p className="text-sm text-gray-500">
              Recommended Trainer
            </p>

            <h1 className="text-3xl font-bold mt-1">
              {selectedTrainer.name}
            </h1>

            <p className="text-[#1F5F95] font-medium mt-1">
              Trainer
            </p>

            <p className="text-gray-600 mt-3">
              {selectedTrainer.bio ||
                "SkillSphere trainer"}
            </p>

            {currentWeakTopic && (
              <div className="mt-5 p-4 bg-red-50 rounded-lg">

                <p className="text-sm text-red-600">
                  Weak Topic
                </p>

                <p className="font-semibold">
                  Topic ID:{" "}
                  {currentWeakTopic.topic_id}
                </p>

                <p className="text-red-600">
                  Current Score:{" "}
                  {currentWeakTopic.percentage}%
                </p>

              </div>
            )}

            <h2 className="text-xl font-bold mt-7">
              Available Lecture Slots
            </h2>

            {slots.length === 0 ? (

              <p className="text-gray-500 mt-4">
                No slots available.
              </p>

            ) : (

              <div className="space-y-3 mt-4">

                {slots.map(
                  (slot) => (

                    <button
                      key={slot.id}
                      onClick={() =>
                        setSelectedSlot(
                          slot
                        )
                      }
                      className={`w-full text-left p-4 border rounded-lg ${
                        selectedSlot?.id ===
                        slot.id
                          ? "border-[#1F5F95] bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >

                      <span className="font-medium">
                        {slot.start_time} -{" "}
                        {slot.end_time}
                      </span>

                      <span className="block text-sm text-green-600 mt-1">
                        Available
                      </span>

                    </button>

                  )
                )}

              </div>

            )}

            {message && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700">
                {message}
              </div>
            )}

            <div className="mt-6">

              <Button
                disabled={
                  !selectedSlot ||
                  loading
                }
                onClick={
                  bookLecture
                }
              >
                {loading
                  ? "Booking..."
                  : "Book Lecture"}
              </Button>

            </div>

          </Card>

        </main>

      </div>
    );
  }

  // ------------------------------------------------------------
  // LECTURE
  // ------------------------------------------------------------

  if (stage === "lecture" && course) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <main className="max-w-3xl mx-auto p-6">

          <Card className="p-8">

            <span className="text-sm text-[#1F5F95] font-semibold">
              LECTURE BOOKED
            </span>

            <h1 className="text-3xl font-bold mt-2">
              {course.title}
            </h1>

            <div className="mt-6 p-5 bg-blue-50 rounded-lg">

              <p className="font-semibold">
                Trainer
              </p>

              <p>
                {selectedTrainer?.name}
              </p>

              <p className="font-semibold mt-4">
                Time
              </p>

              <p>
                {selectedSlot?.start_time} -{" "}
                {selectedSlot?.end_time}
              </p>

              <p className="font-semibold mt-4">
                Booking ID
              </p>

              <p>
                {bookingId}
              </p>

            </div>

            <h2 className="text-xl font-bold mt-7">
              Lecture Checklist
            </h2>

            <div className="mt-4 space-y-3 text-gray-700">

              <p>
                ✓ Join the trainer session at
                the booked time.
              </p>

              <p>
                ✓ Ask questions about your
                weak topic.
              </p>

              <p>
                ✓ Complete the focused lecture.
              </p>

              <p>
                ✓ Take the post-test to measure
                improvement.
              </p>

            </div>

            {message && (
              <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-700">
                {message}
              </div>
            )}

            <div className="mt-7">

              <Button
                disabled={loading}
                onClick={
                  completeLecture
                }
              >
                {loading
                  ? "Completing..."
                  : "Lecture Completed — Take Post-Test"}
              </Button>

            </div>

          </Card>

        </main>

      </div>
    );
  }

  // ------------------------------------------------------------
  // POST TEST
  // ------------------------------------------------------------

  if (stage === "posttest") {
    return renderQuiz(true);
  }

  // ------------------------------------------------------------
  // FINAL RESULT
  // ------------------------------------------------------------

  if (stage === "final" && course) {
    const improvement =
      postScore - preScore;

    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <main className="max-w-5xl mx-auto p-6">

          <Card className="p-8">

            <div className="text-center">

              <div className="inline-flex px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                Learning cycle completed
              </div>

              <h1 className="text-3xl font-bold mt-4">
                Great work! 🎯
              </h1>

              <p className="text-gray-500 mt-2">
                You completed the lecture and
                post-test for{" "}
                {course.title}.
              </p>

            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">

              <div className="p-5 bg-gray-50 rounded-lg text-center">

                <p className="text-sm text-gray-500">
                  Before Lecture
                </p>

                <b className="text-3xl">
                  {preScore}%
                </b>

              </div>

              <div className="p-5 bg-blue-50 rounded-lg text-center">

                <p className="text-sm text-gray-500">
                  After Lecture
                </p>

                <b className="text-3xl text-[#1F5F95]">
                  {postScore}%
                </b>

              </div>

              <div className="p-5 bg-green-50 rounded-lg text-center">

                <p className="text-sm text-gray-500">
                  Improvement
                </p>

                <b
                  className={`text-3xl ${
                    improvement >= 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {improvement >= 0
                    ? "+"
                    : ""}
                  {improvement}%
                </b>

              </div>

            </div>

            <h2 className="text-xl font-bold mt-8">
              Topic-wise Improvement
            </h2>

            <div className="mt-4 space-y-3">

              {topicImprovement.map(
                ([topic, values]) => (

                  <div
                    key={topic}
                    className="border rounded-lg p-4 flex justify-between"
                  >

                    <span>
                      {topic}
                    </span>

                    <span>
                      <b>
                        {values.before}%
                      </b>

                      {" → "}

                      <b className="text-green-700">
                        {values.after}%
                      </b>
                    </span>

                  </div>

                )
              )}

            </div>

            <div className="mt-7 flex gap-3">

              <Button
                onClick={() => {
                  setCourse(null);
                  setQuestions([]);
                  setStage("courses");
                }}
              >
                Choose Another Course
              </Button>

              <Button
                secondary
                onClick={() =>
                  setStage("landing")
                }
              >
                Back to Home
              </Button>

            </div>

          </Card>

        </main>

      </div>
    );
  }

  // ------------------------------------------------------------
  // TRAINER DASHBOARD
  // ------------------------------------------------------------

  if (stage === "trainer") {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <main className="max-w-5xl mx-auto p-6">

          <h1 className="text-3xl font-bold">
            Trainer Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome, {user?.name}
          </p>

          <Card className="p-7 mt-6">

            <h2 className="text-xl font-bold">
              SkillSphere Trainer
            </h2>

            <p className="text-gray-600 mt-3">
              Your trainer account is active.
              Trainer expertise and available
              lecture slots are managed through
              the SkillSphere backend.
            </p>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">

              <p>
                <b>Name:</b>{" "}
                {user?.name}
              </p>

              <p>
                <b>Email:</b>{" "}
                {user?.email}
              </p>

                <p>
                  <b>Role:</b>{" "}
                  {user?.role}
                </p>

            </div>

          </Card>

        </main>

      </div>
    );
  }

  // ------------------------------------------------------------
  // ADMIN
  // ------------------------------------------------------------

  if (stage === "admin") {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">

        <Header
          onHome={() =>
            setStage("landing")
          }
        />

        <main className="max-w-5xl mx-auto p-6">

          <h1 className="text-3xl font-bold">
            Admin Dashboard
          </h1>

          <Card className="p-7 mt-6">

            <p className="text-gray-600">
              Welcome,{" "}
              <b>{user?.name}</b>.
            </p>

            <div className="mt-5 p-4 bg-blue-50 rounded-lg">

              <p>
                <b>Email:</b>{" "}
                {user?.email}
              </p>

              <p>
                <b>Role:</b>{" "}
                {user?.role}
              </p>

            </div>

          </Card>

        </main>

      </div>
    );
  }

  return null;
}
