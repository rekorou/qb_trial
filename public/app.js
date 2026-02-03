const { useState } = React;

const ALLOWED_CODE = "QZ-7HK";

const App = () => {
  const [screen, setScreen] = useState("welcome");
  const [teamName, setTeamName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [helperText, setHelperText] = useState("");
  const [ready, setReady] = useState(false);

  const handleJoin = (event) => {
    event.preventDefault();
    const normalizedCode = roomCode.trim().toUpperCase();
    if (normalizedCode !== ALLOWED_CODE) {
      setHelperText("Invalid code. Please use QZ-7HK.");
      return;
    }
    setHelperText("Code accepted. Welcome to Quiz Bowl!");
    setScreen("lobby");
  };

  return (
    <div className="page">
      <header className="top-bar">
        <div className="logo">LOGO</div>
        <div className="title">QUIZ BOWL</div>
      </header>

      <main className="content">
        {screen === "welcome" ? (
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
        ) : (
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
            <button className="ready-toggle" type="button" onClick={() => setReady(!ready)}>
              {ready ? "READY" : "UNREADY"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
