const { useEffect, useMemo, useState } = React;

const ALLOWED_CODE = "QZ-7HK";
const FALLBACK_ROUND = {
  id: "easy",
  title: "🟢 EASY",
  points: 1,
  timeLimitSeconds: 15,
  questions: [
    {
      id: "easy-1",
      prompt: "What does CPU stand for?",
      options: [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Utility",
        "Core Processing User",
      ],
      answer: "A",
    },
    {
      id: "easy-2",
      prompt: "Which of the following is an input device?",
      options: ["Monitor", "Printer", "Keyboard", "Speaker"],
      answer: "C",
    },
  ],
};

const App = () => {
  const [screen, setScreen] = useState("welcome");
  const [teamName, setTeamName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [helperText, setHelperText] = useState("");
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState("welcome");
  const [room, setRoom] = useState("");
  const [round, setRound] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [revealAnswer, setRevealAnswer] = useState(false);

  useEffect(() => {
    if (screen === "welcome") {
      setPhase("welcome");
    }
  }, [screen]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/questions?difficulty=easy");
        if (!response.ok) {
          setRound(FALLBACK_ROUND);
          setTimeRemaining(FALLBACK_ROUND.timeLimitSeconds);
          return;
        }
        const data = await response.json();
        setRound(data);
        setTimeRemaining(data.timeLimitSeconds || 15);
      } catch (error) {
        console.error("Failed to load questions", error);
        setRound(FALLBACK_ROUND);
        setTimeRemaining(FALLBACK_ROUND.timeLimitSeconds);
      }
    };
    loadQuestions();
  }, []);

  const currentQuestion = useMemo(() => {
    if (!round?.questions?.length) {
      return null;
    }
    return round.questions[questionIndex];
  }, [questionIndex, round]);

  useEffect(() => {
    if (phase !== "question") {
      return undefined;
    }
    if (!round) {
      return undefined;
    }
    if (timeRemaining <= 0) {
      setRevealAnswer(true);
      setPhase("reveal");
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [phase, round, timeRemaining]);

  useEffect(() => {
    if (phase !== "reveal") {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      const nextIndex = questionIndex + 1;
      if (round?.questions?.[nextIndex]) {
        setQuestionIndex(nextIndex);
        setTimeRemaining(round.timeLimitSeconds || 15);
        setSelectedAnswer("");
        setRevealAnswer(false);
        setPhase("question");
      } else {
        setPhase("complete");
      }
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [phase, questionIndex, round]);

  const handleJoin = (event) => {
    event.preventDefault();
    const normalizedCode = roomCode.trim().toUpperCase();
    if (normalizedCode !== ALLOWED_CODE) {
      setHelperText("Invalid code. Please use QZ-7HK.");
      return;
    }
    setHelperText("Code accepted. Welcome to Quiz Bowl!");
    setRoom(normalizedCode);
    setScreen("lobby");
    setPhase("lobby");
  };

  const handleReadyToggle = () => {
    const nextReady = !ready;
    setReady(nextReady);
    if (nextReady) {
      setPhase("intro");
      setTimeout(() => {
        setTimeRemaining(round?.timeLimitSeconds || 15);
        setSelectedAnswer("");
        setRevealAnswer(false);
        setPhase("question");
      }, 1500);
    } else {
      setPhase("lobby");
    }
  };

  const handleSelectAnswer = (optionIndex) => {
    if (phase !== "question") {
      return;
    }
    setSelectedAnswer(String.fromCharCode(65 + optionIndex));
  };

  const formatTime = (seconds) => `00:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="page">
      <header className="top-bar">
        <div className="logo">LOGO</div>
        <div className="title">QUIZ BOWL</div>
      </header>

      <main className="content">
        {phase === "welcome" ? (
          <section className="welcome-card" data-screen="welcome">
            <h1>WELCOME</h1>
            <form className="join-form" aria-label="Join quiz bowl" onSubmit={handleJoin}>
              <label className="field">
                <span>ENTER NAME</span>
                <input
                  type="text"
                  name="teamName"
                  placeholder="Your team"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>ENTER CODE</span>
                <input
                  type="text"
                  name="roomCode"
                  placeholder="QZ-7HK"
                  maxLength={6}
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value)}
                  required
                />
              </label>
              <button type="submit">JOIN</button>
              <p className="helper" aria-live="polite">
                {helperText}
              </p>
            </form>
          </section>
        ) : phase === "lobby" ? (
          <section className="lobby-card" data-screen="lobby">
            <div className="lobby-header">
              <h1>WAITING FOR HOST TO START...</h1>
              <h2>PARTICIPANTS</h2>
            </div>
            <div className="participants">
              <div className="participants-row participants-head">
                <span>TEAM</span>
                <span>STATUS</span>
              </div>
              <div className="participants-row" id="participant-self">
                <span id="team-name">{teamName.trim() || "YOUR TEAM"}</span>
                <span id="team-status">{ready ? "READY" : "UNREADY"}</span>
              </div>
            </div>
            <button className="ready-toggle" type="button" onClick={handleReadyToggle}>
              {ready ? "READY" : "UNREADY"}
            </button>
          </section>
        ) : phase === "intro" ? (
          <section className="round-intro">
            <p className="round-label">DIFFICULTY EASY</p>
            <div className="round-card">
              <h1>EASY ROUND</h1>
              <p>
                10 QUESTIONS, 1 POINT EACH. YOU WILL BE GIVEN 15 SECONDS TO
                ANSWER
              </p>
            </div>
          </section>
        ) : phase === "question" ? (
          <section className="question-board">
            <div className="question-top-bar">
              <div className="logo">LOGO</div>
              <div className="room-code">ROOM {room || ALLOWED_CODE}</div>
            </div>
            <div className="question-meta">
              <span>QUIZ BOWL</span>
              <span>TIME REMAINING {formatTime(timeRemaining)}</span>
            </div>
            <div className="question-body">
              <div className="question-panel">
                <h3>QUESTION</h3>
                <p>{currentQuestion?.prompt || "Loading question..."}</p>
              </div>
              <div className="answer-panel">
                <h3>SELECT ANSWER</h3>
                <div className="answers">
                  {(currentQuestion?.options || []).map((option, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const isSelected = selectedAnswer === letter;
                    return (
                      <button
                        key={letter}
                        className={`answer-option${isSelected ? " is-selected" : ""}`}
                        type="button"
                        onClick={() => handleSelectAnswer(index)}
                      >
                        {letter}. {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="question-footer">
              <span>[MODE] MULTIPLAYER</span>
              <span>[LEVEL] EASY</span>
              <span>[QUESTION] {String(questionIndex + 1).padStart(2, "0")}/10</span>
            </div>
          </section>
        ) : phase === "reveal" ? (
          <section className="answer-reveal">
            <p className="round-label">CORRECT ANSWER</p>
            <div className="round-card">
              <h1>CORRECT ANSWER</h1>
              <p>{currentQuestion?.answer ? `${currentQuestion.answer}. ${currentQuestion.options?.[currentQuestion.answer.charCodeAt(0) - 65] || ""}` : ""}</p>
            </div>
          </section>
        ) : (
          <section className="round-intro">
            <p className="round-label">ROUND COMPLETE</p>
            <div className="round-card">
              <h1>EASY ROUND COMPLETE</h1>
              <p>WAITING FOR THE NEXT ROUND...</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
