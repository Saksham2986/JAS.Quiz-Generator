import { useState } from "react";
import "./index.css";

const API_URL = "http://127.0.0.1:5000";

export default function App() {
  const [topic, setTopic] = useState("Python");
  const [mode, setMode] = useState("topic");
  const [documentFile, setDocumentFile] = useState(null);
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function resetQuizState() {
    setResults(null);
    setQuiz(null);
    setAnswers({});
    setCurrent(0);
    setError("");
  }

  async function generateQuiz(event) {
    event?.preventDefault();

    if (!topic.trim()) {
      setError("Please enter a quiz topic.");
      return;
    }

    setLoading(true);
    resetQuizState();

    try {
      const response = await fetch(`${API_URL}/api/quizzes/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          count: Number(count),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not generate quiz.");
      }

      setQuiz(data);
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to the backend. Please make sure Flask is running on port 5000."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateDocumentQuiz(event) {
    event?.preventDefault();

    if (!documentFile) {
      setError("Please select a PDF or TXT file first.");
      return;
    }

    const extension = documentFile.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "txt"].includes(extension)) {
      setError("Only PDF and TXT files are supported.");
      return;
    }

    if (documentFile.size > 8 * 1024 * 1024) {
      setError("File is too large. Maximum upload size is 8 MB.");
      return;
    }

    setLoading(true);
    resetQuizState();

    try {
      const formData = new FormData();
      formData.append("file", documentFile);
      formData.append("difficulty", difficulty);
      formData.append("count", String(count));

      const response = await fetch(
        `${API_URL}/api/quizzes/generate-from-document`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not generate document quiz.");
      }

      setQuiz(data);
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to the backend. Please make sure Flask is running on port 5000."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseAnswer(option) {
    setAnswers((previous) => ({
      ...previous,
      [String(current + 1)]: option,
    }));
  }

  async function submitQuiz() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/quizzes/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quiz.quiz_id,
          answers,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not submit quiz.");
      }

      setResults(data);
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to the backend. Please make sure Flask is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setQuiz(null);
    setResults(null);
    setAnswers({});
    setCurrent(0);
    setError("");
  }

  const question = quiz?.questions[current];
  const progress = quiz
    ? ((current + 1) / quiz.total_questions) * 100
    : 0;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            startOver();
          }}
        >
          <span className="brand-icon">J</span>
          <span>
            JAS.<span className="brand-light">Quiz Gen</span>
          </span>
        </a>
        <div className="topbar-right">
          <span className="status-dot" />
          <span>AI learning studio</span>
        </div>
      </header>

      <main className="main-content">
        {!quiz && !results && (
          <section className="hero-section">
            <div className="eyebrow">
              <span>✦</span> YOUR PERSONAL QUIZ STUDIO
            </div>
            <h1>
              Turn what you know
              <br />
              into <span>what you master.</span>
            </h1>
            <p className="hero-copy">
              Create a quiz, challenge yourself, and discover how much
              you really know. Your next learning session starts here.
            </p>

            <div className="generator-card">
              <div className="card-heading">
                <div>
                  <div className="card-kicker">QUIZ BUILDER</div>
                  <h2>Create your quiz</h2>
                </div>
                <div className="sparkle-icon">✦</div>
              </div>

              <div className="form-grid mode-switch">
                <button
                  type="button"
                  className={
                    mode === "topic" ? "primary-button" : "secondary-button"
                  }
                  onClick={() => {
                    setMode("topic");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Topic Quiz
                </button>
                <button
                  type="button"
                  className={
                    mode === "document"
                      ? "primary-button"
                      : "secondary-button"
                  }
                  onClick={() => {
                    setMode("document");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Upload Document
                </button>
              </div>

              <form
                onSubmit={
                  mode === "topic" ? generateQuiz : generateDocumentQuiz
                }
              >
                {mode === "topic" ? (
                  <>
                    <label htmlFor="topic">What do you want to learn?</label>
                    <input
                      id="topic"
                      className="topic-input"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="e.g. Python, Computer Basics, Science"
                      required
                    />
                  </>
                ) : (
                  <>
                    <label htmlFor="document">
                      Upload your study material (PDF or TXT)
                    </label>
                    <input
                      id="document"
                      className="topic-input"
                      type="file"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      onChange={(event) => {
                        setDocumentFile(event.target.files?.[0] || null);
                        setError("");
                      }}
                      required
                    />
                    <p className="small-note">
                      {documentFile
                        ? `Selected: ${documentFile.name}`
                        : "Choose a text-based PDF or TXT file (maximum 8 MB)."}
                    </p>
                  </>
                )}

                <div className="form-grid">
                  <div>
                    <label htmlFor="difficulty">Difficulty</label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(event) => setDifficulty(event.target.value)}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="count">Questions</label>
                    <select
                      id="count"
                      value={count}
                      onChange={(event) => setCount(Number(event.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                        <option key={number} value={number}>
                          {number} questions
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating your quiz..."
                    : mode === "topic"
                      ? "Generate my quiz"
                      : "Generate quiz from document"}
                  {!loading && <span>→</span>}
                </button>
              </form>

              <p className="small-note">
                ✦{" "}
                {mode === "topic"
                  ? "Generate AI-powered quizzes on any topic."
                  : "AI will create questions using the content in your uploaded document."}
              </p>
            </div>

            <div className="feature-row">
              <div>
                <span className="feature-icon">◈</span>
                <span>Interactive quizzes</span>
              </div>
              <div>
                <span className="feature-icon">◷</span>
                <span>Instant results</span>
              </div>
              <div>
                <span className="feature-icon">✧</span>
                <span>Learn at your pace</span>
              </div>
            </div>
          </section>
        )}

        {quiz && !results && question && (
          <section className="quiz-section">
            <button className="back-button" onClick={startOver}>
              ← Exit quiz
            </button>

            <div className="quiz-meta">
              <span className="pill">{quiz.topic}</span>
              <span className="pill">{quiz.difficulty}</span>
              <span className="question-count">
                Question {current + 1} of {quiz.total_questions}
              </span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="question-card">
              <div className="card-kicker">
                QUESTION {String(current + 1).padStart(2, "0")}
              </div>
              <h2>{question.question}</h2>
              <p className="choose-hint">Choose the best answer below</p>

              <div className="options-list">
                {question.options.map((option, index) => {
                  const selected = answers[String(current + 1)] === option;
                  return (
                    <button
                      key={option}
                      className={`option-button ${selected ? "selected" : ""}`}
                      onClick={() => chooseAnswer(option)}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      <span className="option-check">
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="quiz-navigation">
                <button
                  className="secondary-button"
                  onClick={() => setCurrent((value) => value - 1)}
                  disabled={current === 0 || loading}
                >
                  ← Previous
                </button>

                {current < quiz.total_questions - 1 ? (
                  <button
                    className="primary-button next-button"
                    onClick={() => setCurrent((value) => value + 1)}
                    disabled={!answers[String(current + 1)] || loading}
                  >
                    Next question <span>→</span>
                  </button>
                ) : (
                  <button
                    className="primary-button next-button"
                    onClick={submitQuiz}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Finish quiz"}
                    {!loading && <span>✓</span>}
                  </button>
                )}
              </div>
            </div>

            <p className="small-note centered">
              {Object.keys(answers).length} of {quiz.total_questions} questions
              answered
            </p>
          </section>
        )}

        {results && (
          <section className="results-section">
            <div className="result-icon">✦</div>
            <div className="eyebrow">QUIZ COMPLETED</div>
            <h1>
              Your results are <span>in.</span>
            </h1>
            <p className="hero-copy">
              Here's how you performed in {quiz.topic}.
            </p>

            <div className="score-card">
              <div className="score-number">{results.percentage}%</div>
              <div className="score-label">YOUR SCORE</div>
              <div className="score-track">
                <div
                  className="score-fill"
                  style={{ width: `${results.percentage}%` }}
                />
              </div>
              <div className="score-stats">
                <div>
                  <strong>{results.score}</strong>
                  <span>Correct</span>
                </div>
                <div>
                  <strong>{results.total_questions - results.score}</strong>
                  <span>Incorrect</span>
                </div>
                <div>
                  <strong>{results.total_questions}</strong>
                  <span>Total</span>
                </div>
              </div>
            </div>

            <div className="review-heading">
              <h2>Answer review</h2>
              <span>{results.total_questions} questions</span>
            </div>

            <div className="review-list">
              {results.results.map((item, index) => (
                <div className="review-card" key={index}>
                  <div className="review-topline">
                    <span>
                      QUESTION {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={
                        item.is_correct ? "correct-label" : "wrong-label"
                      }
                    >
                      {item.is_correct ? "✓ Correct" : "✕ Incorrect"}
                    </span>
                  </div>
                  <h3>{item.question}</h3>
                  <p className="answer-line">
                    Your answer:{" "}
                    <strong>{item.your_answer || "Not answered"}</strong>
                  </p>
                  {!item.is_correct && (
                    <p className="answer-line">
                      Correct answer: <strong>{item.correct_answer}</strong>
                    </p>
                  )}
                  <p className="explanation">{item.explanation}</p>
                </div>
              ))}
            </div>

            <button
              className="primary-button restart-button"
              onClick={startOver}
            >
              Create another quiz <span>→</span>
            </button>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>JAS.Quiz Gen</span>
        <span>Your Knowledge, Your Quiz, Instantly. ✦</span>
      </footer>
    </div>
  );
}
