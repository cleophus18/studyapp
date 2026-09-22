import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Question } from "../types";
import {
  javaQuestionBank,
  pickRandomJavaTest,
} from "../utils/javaQuestionBank";
import { findNote } from "../utils/javaNotes";
import { recordWeeklyActivity } from "../utils/streak";

// ---------------------------------------------------------------------------
// Java checkpoint test.
//
// Every attempt draws 20 random questions from the 100-question Java bank using
// a fixed difficulty mix: 40% Easy (8), 40% Medium (8), 20% Hard (4). The chosen
// set is stored in sessionStorage so an in-progress attempt survives a reload,
// while a fresh visit builds a brand-new random set.
//
// After submitting, the test shows a full review: your answer, the correct
// answer, and the explanation of why the correct answer is right (and, when you
// got it wrong, why the one you picked is wrong).
// ---------------------------------------------------------------------------

const TEST_SIZE = 20;
const ACTIVE_TEST_KEY = "study-active-test-set";
const TEST_SECONDS = TEST_SIZE * 30; // 30 seconds per question

export function TimedTest({ questions }: { questions: Question[] }) {
  const navigate = useNavigate();

  // Build (or restore) the randomised test set for this attempt.
  const testSet = useMemo<Question[]>(() => {
    const stored = sessionStorage.getItem(ACTIVE_TEST_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { ids: string[] };
        const byId = new Map(javaQuestionBank.map((q) => [q.id, q]));
        const restored = parsed.ids
          .map((id) => byId.get(id))
          .filter((q): q is Question => Boolean(q));
        if (restored.length === TEST_SIZE) return restored;
      } catch {
        // fall through to a fresh draw
      }
    }
    const fresh = pickRandomJavaTest(TEST_SIZE);
    sessionStorage.setItem(
      ACTIVE_TEST_KEY,
      JSON.stringify({ ids: fresh.map((q) => q.id) }),
    );
    return fresh;
  }, []);

  // The test is fully driven by the 100-question Java bank, so the prop is unused.
  void questions;

  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(TEST_SECONDS);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Leaving the site resets this attempt so the next visit starts clean.
    const resetOnExit = () => {
      sessionStorage.removeItem(ACTIVE_TEST_KEY);
    };
    window.addEventListener("beforeunload", resetOnExit);
    return () => window.removeEventListener("beforeunload", resetOnExit);
  }, []);

  const correctCount = useMemo(
    () =>
      testSet.filter((question) => answers[question.id] === question.answer)
        .length,
    [testSet, answers],
  );
  const score = testSet.length
    ? Math.round((correctCount / testSet.length) * 100)
    : 0;

  const finish = () => {
    if (!started || finished) return;
    setFinished(true);
    setReviewing(true);
    sessionStorage.removeItem(ACTIVE_TEST_KEY);
    const history = JSON.parse(
      localStorage.getItem("study-test-scores") || "[]",
    );
    localStorage.setItem(
      "study-test-scores",
      JSON.stringify([...history, score]),
    );
    // Completing a test also counts as weekly activity for the streak.
    recordWeeklyActivity();
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
  const currentQuestion = testSet[currentIndex];
  const goToQuestion = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, testSet.length - 1)));
  };
  const goNext = () => {
    if (currentIndex < testSet.length - 1) goToQuestion(currentIndex + 1);
  };
  const goBack = () => {
    if (currentIndex > 0) goToQuestion(currentIndex - 1);
  };
  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");

  // -------------------------------------------------------------------------
  // Review view — shown after submitting.
  // -------------------------------------------------------------------------
  if (reviewing) {
    const wrong = testSet.filter(
      (question) => answers[question.id] !== question.answer,
    );
    return (
      <div className="timed-test test-review">
        <div className="review-hero panel">
          <div className="eyebrow">TEST COMPLETE · REVIEW</div>
          <h1>{score >= 70 ? "Strong work." : "Let's fix the gaps."}</h1>
          <div className="review-score">
            <b>{score}%</b>
            <span>
              {correctCount} of {testSet.length} correct
            </span>
          </div>
          <p>
            {wrong.length === 0
              ? "You answered every question correctly. Take a fresh random test whenever you want another run."
              : `You missed ${wrong.length} question${wrong.length === 1 ? "" : "s"}. Every one is explained below so you can see exactly why the right answer is right.`}
          </p>
          <div className="review-actions">
            <button
              className="button"
              onClick={() => navigate("/test", { replace: true })}
            >
              Take a new random test <span>→</span>
            </button>
            <Link className="button secondary" to="/notes?category=Java">
              Review the notes
            </Link>
          </div>
        </div>

        <div className="review-list">
          {testSet.map((question, index) => {
            const chosen = answers[question.id];
            const isCorrect = chosen === question.answer;
            const note = findNote(question.topic);
            return (
              <section
                className={
                  isCorrect
                    ? "panel review-card correct"
                    : "panel review-card wrong"
                }
                key={question.id}
              >
                <div className="review-card-head">
                  <span className="review-index">Q{index + 1}</span>
                  <span
                    className={`difficulty ${question.difficulty.toLowerCase()}`}
                  >
                    {question.difficulty}
                  </span>
                  <span className="pill">{question.topic}</span>
                  <span
                    className={
                      isCorrect ? "review-badge ok" : "review-badge bad"
                    }
                  >
                    {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                  </span>
                </div>

                <h2>{question.prompt}</h2>
                {question.code && (
                  <pre className="question-code">{question.code}</pre>
                )}

                <div className="review-options">
                  {question.options.map((option, optionIndex) => {
                    const isAnswer = optionIndex === question.answer;
                    const isChosen = optionIndex === chosen;
                    const classes = ["review-option"];
                    if (isAnswer) classes.push("is-correct");
                    if (isChosen && !isAnswer) classes.push("is-wrong");
                    return (
                      <div className={classes.join(" ")} key={option}>
                        <span className="review-letter">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="review-option-text">{option}</span>
                        {isAnswer && <em>Correct answer</em>}
                        {isChosen && !isAnswer && <em>Your answer</em>}
                        {isChosen && isAnswer && <em>You chose this</em>}
                      </div>
                    );
                  })}
                </div>

                {chosen === undefined && (
                  <div className="review-note unanswered">
                    <b>You left this unanswered.</b>
                    <span>
                      The correct answer is{" "}
                      <b>{question.options[question.answer]}</b>.
                    </span>
                  </div>
                )}

                <div className="review-note">
                  <b>
                    {isCorrect
                      ? "Why this is correct"
                      : `Why "${question.options[chosen ?? question.answer]}" is not the answer`}
                  </b>
                  <span>{question.explanation}</span>
                </div>

                {note && (
                  <Link
                    className="text-link review-note-link"
                    to={`/notes?category=Java&module=${encodeURIComponent(note.subtopic)}`}
                  >
                    Re-read the {note.subtopic} notes →
                  </Link>
                )}
              </section>
            );
          })}
        </div>

        <button
          className="button submit"
          onClick={() => navigate("/test", { replace: true })}
        >
          Take a new random test <span>→</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Test-taking view.
  // -------------------------------------------------------------------------
  return (
    <div className="timed-test">
      <div className="title-row">
        <div>
          <div className="eyebrow">JAVA CHECKPOINT · 20 QUESTIONS</div>
          <h1>{TEST_SIZE}-question test.</h1>
          <p>
            Every attempt is drawn at random from a bank of 100 Java questions
            covering exactly the sub-topics in the notes. The difficulty mix is
            a surprise each time. After you submit, every question is reviewed
            and explained.
          </p>
        </div>
        {started && (
          <div
            className={remaining < 120 ? "test-timer warning" : "test-timer"}
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
          <h2>Your 20 questions are ready.</h2>
          <p>
            Your questions are chosen at random from a bank of 100, and the
            difficulty mix is a surprise. You get{" "}
            {Math.floor(TEST_SECONDS / 60)} minutes. Questions appear one at a
            time and you can revisit answered or skipped questions from the
            navigator. Leaving the website resets this attempt so the next visit
            starts clean with a brand-new set.
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
              This is a scored 20-question checkpoint. <b>{answeredCount}</b>/
              {TEST_SIZE} answered. Submit when you are finished or let the
              timer expire. Questions appear one at a time and skipped questions
              can be revisited from the navigator.
            </p>
          </div>
          <div
            className="test-question-nav"
            aria-label="Test question navigation"
          >
            {testSet.map((question, index) => (
              <button
                className={[
                  index === currentIndex ? "active" : "",
                  answers[question.id] !== undefined ? "answered" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
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
                <span>
                  Question {currentIndex + 1} of {testSet.length}
                </span>
                <span
                  className={`difficulty ${currentQuestion.difficulty.toLowerCase()}`}
                >
                  {currentQuestion.difficulty}
                </span>
                <span>{currentQuestion.topic}</span>
              </div>
              <h2>{currentQuestion.prompt}</h2>
              {currentQuestion.code && (
                <pre className="question-code">{currentQuestion.code}</pre>
              )}
              <div className="answers">
                {currentQuestion.options.map((option, optionIndex) => (
                  <button
                    className={
                      answers[currentQuestion.id] === optionIndex
                        ? "answer selected"
                        : "answer"
                    }
                    disabled={finished}
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [currentQuestion.id]: optionIndex,
                      }))
                    }
                    key={option}
                  >
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    {option}
                  </button>
                ))}
              </div>
              <div className="test-question-actions">
                <button
                  className="button secondary"
                  onClick={goBack}
                  disabled={finished || currentIndex === 0}
                >
                  ← Back
                </button>
                <button
                  className="button secondary"
                  onClick={goNext}
                  disabled={finished || currentIndex === testSet.length - 1}
                >
                  Skip / next →
                </button>
              </div>
            </section>
          )}
          <button
            className="button submit"
            onClick={finish}
            disabled={finished || !testSet.length}
          >
            Submit scored test <span>→</span>
          </button>
        </>
      )}
    </div>
  );
}
