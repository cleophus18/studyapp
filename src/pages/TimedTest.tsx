import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Question } from "../types";

export function TimedTest({ questions }: { questions: Question[] }) {
  const navigate = useNavigate();
  const [testChoice, setTestChoice] = useState("Java");
  const [testLength, setTestLength] = useState("Medium");
  const testOptions = ["Java", "Physics", "Mathematics"];
  const lengthOptions = ["Short", "Medium", "Long"];
  const questionLimit =
    testLength === "Short" ? 5 : testLength === "Medium" ? 10 : 20;
  const difficultyOrder =
    testLength === "Short"
      ? ["Hard", "Medium", "Easy"]
      : testLength === "Medium"
        ? ["Medium", "Easy", "Hard"]
        : ["Easy", "Medium", "Hard"];
  const subjectQuestions = questions
    .filter((question) => {
      if (testChoice === "Mathematics")
        return question.id.startsWith("calculus-");
      if (testChoice === "Java")
        return (
          !question.id.startsWith("physics-") &&
          !question.id.startsWith("calculus-")
        );
      return question.id.startsWith(testChoice.toLowerCase());
    })
    .filter((question) => question.options.length > 0);
  const visibleQuestions = difficultyOrder
    .flatMap((difficulty) =>
      subjectQuestions.filter((question) => question.difficulty === difficulty),
    )
    .slice(0, questionLimit);
  const testSeconds = Math.max(15, visibleQuestions.length * 15);
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(testSeconds);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // A test is intentionally a fresh attempt every time the page is opened.
    setStarted(false);
    setRemaining(testSeconds);
    setAnswers({});
    setFinished(false);
    setCurrentIndex(0);
    const resetOnExit = () => {
      sessionStorage.removeItem("study-active-test");
    };
    window.addEventListener("beforeunload", resetOnExit);
    return () => window.removeEventListener("beforeunload", resetOnExit);
  }, [testSeconds]);

  const finish = () => {
    if (!started || finished) return;
    setFinished(true);
    sessionStorage.removeItem("study-active-test");
    const correct = visibleQuestions.filter(
      (question) => answers[question.id] === question.answer,
    ).length;
    const score = Math.round((correct / visibleQuestions.length) * 100);
    const history = JSON.parse(
      localStorage.getItem("study-test-scores") || "[]",
    );
    localStorage.setItem(
      "study-test-scores",
      JSON.stringify([...history, score]),
    );
    navigate("/results", {
      state: { score, total: visibleQuestions.length, kind: "timed-test" },
    });
  };

  useEffect(() => {
    if (!started || finished) return;
    if (remaining <= 0) {
      finish();
      return;
    }
    const timer = window.setInterval(
      () => setRemaining((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [remaining, started, finished]);

  const start = () => {
    setStarted(true);
    sessionStorage.setItem("study-active-test", "true");
  };
  const currentQuestion = visibleQuestions[currentIndex];
  const goToQuestion = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, visibleQuestions.length - 1)));
  };
  const goNext = () => {
    if (currentIndex < visibleQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };
  const goBack = () => {
    if (currentIndex > 0) goToQuestion(currentIndex - 1);
  };
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  return (
    <div className="timed-test">
      <div className="title-row">
        <div>
          <div className="eyebrow">SCORED CHECKPOINT · NOT ON LEADERBOARD</div>
          <h1>
            {Math.floor(testSeconds / 60)}:
            {String(testSeconds % 60).padStart(2, "0")} test.
          </h1>
          <p>
            Choose a subject and test length. Short tests are harder; long tests
            include more accessible questions.
          </p>
          <div className="test-selectors">
            <label className="test-choice-label">
              TEST SUBJECT
              <select
                value={testChoice}
                onChange={(event) => setTestChoice(event.target.value)}
                disabled={started}
              >
                {testOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="test-choice-label">
              TEST LENGTH
              <select
                value={testLength}
                onChange={(event) => setTestLength(event.target.value)}
                disabled={started}
              >
                {lengthOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {started && (
          <div
            className={remaining < 300 ? "test-timer warning" : "test-timer"}
          >
            <span>TIME LEFT</span>
            <b>
              {minutes}:{seconds}
            </b>
          </div>
        )}
      </div>
      {!started ? (
        <section className="panel test-start-card">
          <span className="eyebrow">READY WHEN YOU ARE</span>
          <h2>Start the timer to reveal the test.</h2>
          <p>
            This is a {testLength.toLowerCase()} test: {visibleQuestions.length}{" "}
            questions × 15 seconds = {testSeconds} seconds. Short tests
            prioritise the hardest available questions; long tests give you more
            easier questions. Leaving the website resets this attempt so the
            next visit starts clean.
          </p>
          <button className="button" onClick={start}>
            Start test and timer <span>→</span>
          </button>
        </section>
      ) : (
        <>
          <div className="test-notice panel">
            <span>◷</span>
            <p>
              This is a scored {testLength.toLowerCase()} practice test. Submit
              when you are finished or let the timer expire. Questions appear
              one at a time so you can focus, and skipped questions can be
              revisited from the question navigator.
            </p>
          </div>
          <div className="test-question-nav" aria-label="Test question navigation">
            {visibleQuestions.map((question, index) => (
              <button
                className={[
                  index === currentIndex ? "active" : "",
                  answers[question.id] !== undefined ? "answered" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => goToQuestion(index)}
                disabled={finished}
                key={question.id}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {currentQuestion && (
            <section className="panel test-question" key={currentQuestion.id}>
              <div className="question-meta">
                <span>Question {currentIndex + 1} of {visibleQuestions.length}</span>
                <span>{currentQuestion.topic}</span>
              </div>
              <h2>{currentQuestion.prompt}</h2>
              <div className="answers">
                {currentQuestion.options.map((option, optionIndex) => (
                  <button
                    className={answers[currentQuestion.id] === optionIndex ? "answer selected" : "answer"}
                    disabled={finished}
                    onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: optionIndex }))}
                    key={option}
                  >
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    {option}
                  </button>
                ))}
              </div>
              <div className="test-question-actions">
                <button className="button secondary" onClick={goBack} disabled={finished || currentIndex === 0}>
                  ← Back
                </button>
                <button className="button secondary" onClick={goNext} disabled={finished || currentIndex === visibleQuestions.length - 1}>
                  Skip / next →
                </button>
              </div>
            </section>
          )}
          <button className="button submit" onClick={finish} disabled={finished || !visibleQuestions.length}>
            Submit scored test <span>→</span>
          </button>
        </>
      )}
    </div>
  );
}
