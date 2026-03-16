import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RotateCcw, Check, X } from "lucide-react";
import "./Learn.css";

const ALPHABET = [
  { letter: "A", emoji: "✊", desc: "Closed fist, thumb on side", fingers: "👊" },
  { letter: "B", emoji: "🖐", desc: "Four fingers up, thumb folded", fingers: "🖐" },
  { letter: "C", emoji: "🤏", desc: "Curved hand like letter C", fingers: "🫳" },
  { letter: "D", emoji: "☝️", desc: "Index up, others curl to thumb", fingers: "☝️" },
  { letter: "E", emoji: "🤜", desc: "All fingers bent down", fingers: "🤜" },
  { letter: "F", emoji: "👌", desc: "Index & thumb touch, others up", fingers: "👌" },
  { letter: "G", emoji: "👉", desc: "Index & thumb point sideways", fingers: "👉" },
  { letter: "H", emoji: "🤞", desc: "Index & middle point sideways", fingers: "🤞" },
  { letter: "I", emoji: "🤙", desc: "Pinky up, others curled", fingers: "🤙" },
  { letter: "J", emoji: "🤙", desc: "Pinky up + draw J in air", fingers: "🤙" },
  { letter: "K", emoji: "✌️", desc: "Index & middle up, thumb between", fingers: "✌️" },
  { letter: "L", emoji: "🤙", desc: "Index up, thumb out — L shape", fingers: "👆" },
  { letter: "M", emoji: "✊", desc: "Three fingers over thumb", fingers: "✊" },
  { letter: "N", emoji: "✊", desc: "Two fingers over thumb", fingers: "✊" },
  { letter: "O", emoji: "👌", desc: "All fingers curve to make O", fingers: "👌" },
  { letter: "P", emoji: "👇", desc: "Like K but pointing down", fingers: "👇" },
  { letter: "Q", emoji: "👇", desc: "Like G but pointing down", fingers: "👇" },
  { letter: "R", emoji: "🤞", desc: "Index & middle fingers crossed", fingers: "🤞" },
  { letter: "S", emoji: "✊", desc: "Fist with thumb over fingers", fingers: "✊" },
  { letter: "T", emoji: "✊", desc: "Thumb between index & middle", fingers: "✊" },
  { letter: "U", emoji: "✌️", desc: "Index & middle up together", fingers: "✌️" },
  { letter: "V", emoji: "✌️", desc: "Index & middle up, spread apart", fingers: "✌️" },
  { letter: "W", emoji: "🖖", desc: "Index, middle & ring up spread", fingers: "🖖" },
  { letter: "X", emoji: "☝️", desc: "Index finger hooked/bent", fingers: "☝️" },
  { letter: "Y", emoji: "🤙", desc: "Thumb & pinky out", fingers: "🤙" },
  { letter: "Z", emoji: "☝️", desc: "Index draws Z in air", fingers: "☝️" },
];

const NUMBERS = [
  { num: "0", emoji: "👌", desc: "All fingers curve to make O" },
  { num: "1", emoji: "☝️", desc: "Index finger pointing up" },
  { num: "2", emoji: "✌️", desc: "Index and middle up" },
  { num: "3", emoji: "🤟", desc: "Thumb, index, middle up" },
  { num: "4", emoji: "🖐", desc: "Four fingers up, thumb folded" },
  { num: "5", emoji: "🖐", desc: "All five fingers spread open" },
  { num: "6", emoji: "🤙", desc: "Thumb and pinky touching" },
  { num: "7", emoji: "🤞", desc: "Middle and thumb touching" },
  { num: "8", emoji: "🤌", desc: "Index and thumb touching" },
  { num: "9", emoji: "👌", desc: "Index hooks to thumb" },
];

const PHRASES = [
  { phrase: "Hello", emoji: "👋", desc: "Open palm, wave hand side to side", category: "greetings" },
  { phrase: "Thank you", emoji: "🤲", desc: "Flat hand from chin moving forward", category: "greetings" },
  { phrase: "Please", emoji: "🙏", desc: "Flat hand circles on chest", category: "greetings" },
  { phrase: "Sorry", emoji: "✊", desc: "Fist circles on chest", category: "greetings" },
  { phrase: "Yes", emoji: "👍", desc: "Fist nods up and down", category: "basics" },
  { phrase: "No", emoji: "☝️", desc: "Index and middle snap to thumb", category: "basics" },
  { phrase: "I love you", emoji: "🤟", desc: "Thumb, index, pinky extended", category: "emotions" },
  { phrase: "Help", emoji: "✊", desc: "Fist on flat palm, both move up", category: "emergency" },
  { phrase: "I need help", emoji: "🆘", desc: "Both hands — fist on palm raised", category: "emergency" },
  { phrase: "Where is washroom?", emoji: "🚻", desc: "W handshape + question expression", category: "daily" },
  { phrase: "Good morning", emoji: "🌅", desc: "Open hand rises from elbow up", category: "greetings" },
  { phrase: "Good night", emoji: "🌙", desc: "Hand arcs down like setting sun", category: "greetings" },
];

const EMERGENCY = [
  { sign: "Help", emoji: "🆘", desc: "Fist placed on flat palm, both move upward quickly", color: "#ff6b6b" },
  { sign: "Stop", emoji: "🛑", desc: "Flat hand slaps into palm sharply", color: "#ff9f43" },
  { sign: "Pain/Hurt", emoji: "😣", desc: "Both index fingers point and twist toward each other", color: "#ee5a24" },
  { sign: "Call police", emoji: "🚔", desc: "C handshape at ear like phone + P sign", color: "#ff6b6b" },
  { sign: "Fire", emoji: "🔥", desc: "Fingers flutter upward like flames", color: "#e55039" },
  { sign: "Doctor", emoji: "🏥", desc: "D handshape taps wrist pulse point", color: "#00b894" },
  { sign: "Danger", emoji: "⚠️", desc: "Both A fists — one moves up over the other", color: "#f39c12" },
  { sign: "SOS", emoji: "📣", desc: "Wave both hands open above head", color: "#ff6b6b" },
];

const QUIZ_QUESTIONS = [
  { question: "Which sign represents 'Yes'?", options: ["✌️ Two fingers up", "👍 Fist nods up and down", "🤟 Thumb and pinky out", "👌 Fingers form O"], answer: 1 },
  { question: "How do you sign 'Thank you'?", options: ["Wave hand side to side", "Fist circles on chest", "Flat hand from chin moves forward", "Index finger points up"], answer: 2 },
  { question: "Which handshape is used for 'I Love You'?", options: ["✌️", "👍", "🤟", "✊"], answer: 2 },
  { question: "How do you sign the number 5?", options: ["Four fingers up", "All five fingers spread open", "Thumb and pinky out", "Index finger up"], answer: 1 },
  { question: "What is the emergency sign for 'Help'?", options: ["Wave both hands", "Fist on flat palm raised upward", "Fingers flutter upward", "C handshape at ear"], answer: 1 },
  { question: "Which sign represents the letter 'L'?", options: ["Fist with thumb over fingers", "Index up + thumb out (L shape)", "Two fingers crossed", "All fingers bent down"], answer: 1 },
  { question: "How do you sign 'Sorry'?", options: ["Flat hand from chin moves forward", "Open palm waves side to side", "Fist circles on chest", "Flat hand circles on chest"], answer: 2 },
  { question: "What does waving both hands above head mean?", options: ["Hello", "Help", "SOS", "Stop"], answer: 2 },
];

const TABS = ["Alphabet", "Numbers", "Phrases", "Emergency", "Quiz"];
const COLORS = ["#00b894", "#4c6ef5", "#FFB347", "#fd79a8", "#a29bfe"];

export default function Learn() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [flipped, setFlipped] = useState({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [filter, setFilter] = useState("all");

  const toggleFlip = (id) => setFlipped(f => ({ ...f, [id]: !f[id] }));

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === QUIZ_QUESTIONS[quizIndex].answer) setQuizScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (quizIndex + 1 >= QUIZ_QUESTIONS.length) {
      setQuizDone(true);
    } else {
      setQuizIndex(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizDone(false);
    setSelected(null);
    setAnswered(false);
  };

  const categories = ["all", ...new Set(PHRASES.map(p => p.category))];
  const filteredPhrases = filter === "all" ? PHRASES : PHRASES.filter(p => p.category === filter);

  return (
    <div className="learn-page">
      {/* Navbar */}
      <nav className="learn-nav">
        <button className="learn-back" onClick={() => navigate("/app")}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="learn-title">🤟 Learn Sign Language</div>
        <div className="learn-nav-right">
          <button className="learn-chat-btn" onClick={() => navigate("/chat")}>💬 Chat</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="learn-hero">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Learn Sign Language</h1>
          <p>Master ASL alphabets, numbers, phrases and emergency signs. Click any card to flip!</p>
        </motion.div>
        <div className="learn-hero-stats">
          <div className="lh-stat"><span>26</span><small>Alphabets</small></div>
          <div className="lh-stat"><span>10</span><small>Numbers</small></div>
          <div className="lh-stat"><span>12</span><small>Phrases</small></div>
          <div className="lh-stat"><span>8</span><small>Emergency</small></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="learn-tabs">
        {TABS.map((tab, i) => (
          <button key={tab}
            className={`learn-tab ${activeTab === i ? "active" : ""}`}
            style={activeTab === i ? { borderColor: COLORS[i], color: COLORS[i] } : {}}
            onClick={() => setActiveTab(i)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="learn-content">
        <AnimatePresence mode="wait">

          {/* Alphabet */}
          {activeTab === 0 && (
            <motion.div key="alpha"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="cards-grid">
              {ALPHABET.map((item) => (
                <motion.div key={item.letter}
                  className={`flip-card ${flipped[item.letter] ? "flipped" : ""}`}
                  onClick={() => toggleFlip(item.letter)}
                  whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <div className="flip-inner">
                    <div className="flip-front">
                      <div className="card-letter">{item.letter}</div>
                      <div className="card-emoji">{item.emoji}</div>
                      <div className="card-hint">Tap to learn</div>
                    </div>
                    <div className="flip-back">
                      <div className="card-letter small">{item.letter}</div>
                      <div className="card-desc">{item.desc}</div>
                      <div className="card-fingers">{item.fingers}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Numbers */}
          {activeTab === 1 && (
            <motion.div key="nums"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="cards-grid small">
              {NUMBERS.map((item) => (
                <motion.div key={item.num}
                  className={`flip-card num-card ${flipped["n" + item.num] ? "flipped" : ""}`}
                  onClick={() => toggleFlip("n" + item.num)}
                  whileHover={{ y: -4 }}>
                  <div className="flip-inner">
                    <div className="flip-front blue">
                      <div className="card-letter">{item.num}</div>
                      <div className="card-emoji">{item.emoji}</div>
                      <div className="card-hint">Tap to learn</div>
                    </div>
                    <div className="flip-back blue">
                      <div className="card-letter small">{item.num}</div>
                      <div className="card-desc">{item.desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Phrases */}
          {activeTab === 2 && (
            <motion.div key="phrases"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}>
              <div className="filter-row">
                {categories.map(cat => (
                  <button key={cat}
                    className={`filter-btn ${filter === cat ? "active" : ""}`}
                    onClick={() => setFilter(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="phrases-grid">
                {filteredPhrases.map((item) => (
                  <motion.div key={item.phrase}
                    className={`phrase-card ${flipped[item.phrase] ? "flipped" : ""}`}
                    onClick={() => toggleFlip(item.phrase)}
                    whileHover={{ y: -4 }} layout>
                    <div className="flip-inner">
                      <div className="flip-front amber">
                        <div className="card-emoji big">{item.emoji}</div>
                        <div className="phrase-name">{item.phrase}</div>
                        <div className="card-hint">Tap to learn</div>
                      </div>
                      <div className="flip-back amber">
                        <div className="card-emoji">{item.emoji}</div>
                        <div className="phrase-name small">{item.phrase}</div>
                        <div className="card-desc">{item.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Emergency */}
          {activeTab === 3 && (
            <motion.div key="emergency"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}>
              <div className="emergency-banner">
                ⚠️ Learn these signs — they could save a life in an emergency!
              </div>
              <div className="emergency-grid">
                {EMERGENCY.map((item) => (
                  <motion.div key={item.sign}
                    className={`emergency-card ${flipped["e" + item.sign] ? "flipped" : ""}`}
                    onClick={() => toggleFlip("e" + item.sign)}
                    whileHover={{ y: -4 }}
                    style={{ "--accent": item.color }}>
                    <div className="flip-inner">
                      <div className="flip-front emergency">
                        <div className="card-emoji big">{item.emoji}</div>
                        <div className="emergency-name">{item.sign}</div>
                        <div className="card-hint">Tap to learn</div>
                      </div>
                      <div className="flip-back emergency">
                        <div className="card-emoji">{item.emoji}</div>
                        <div className="emergency-name small">{item.sign}</div>
                        <div className="card-desc">{item.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quiz */}
          {activeTab === 4 && (
            <motion.div key="quiz"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} className="quiz-wrapper">
              {quizDone ? (
                <motion.div className="quiz-result"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}>
                  <div className="result-icon">
                    {quizScore >= 6 ? "🏆" : quizScore >= 4 ? "🎉" : "📚"}
                  </div>
                  <h2>Quiz Complete!</h2>
                  <div className="result-score">{quizScore} / {QUIZ_QUESTIONS.length}</div>
                  <p className="result-msg">
                    {quizScore >= 6 ? "Excellent! You're a sign language pro! 🌟"
                      : quizScore >= 4 ? "Good job! Keep practising! 💪"
                      : "Keep learning — you'll get there! 📖"}
                  </p>
                  <div className="result-badges">
                    {quizScore >= 3 && <span className="badge">🥉 Learner</span>}
                    {quizScore >= 5 && <span className="badge">🥈 Practitioner</span>}
                    {quizScore >= 7 && <span className="badge">🥇 Expert</span>}
                  </div>
                  <button className="quiz-reset-btn" onClick={resetQuiz}>
                    <RotateCcw size={16} /> Try Again
                  </button>
                </motion.div>
              ) : (
                <div className="quiz-card">
                  <div className="quiz-progress-bar">
                    <div className="quiz-progress-fill"
                      style={{ width: `${((quizIndex) / QUIZ_QUESTIONS.length) * 100}%` }} />
                  </div>
                  <div className="quiz-meta">
                    <span>Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                    <span className="quiz-score-live">Score: {quizScore}</span>
                  </div>
                  <h2 className="quiz-question">{QUIZ_QUESTIONS[quizIndex].question}</h2>
                  <div className="quiz-options">
                    {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => {
                      let cls = "quiz-option";
                      if (answered) {
                        if (i === QUIZ_QUESTIONS[quizIndex].answer) cls += " correct";
                        else if (i === selected) cls += " wrong";
                        else cls += " dimmed";
                      }
                      return (
                        <motion.button key={i} className={cls}
                          onClick={() => handleAnswer(i)}
                          whileHover={!answered ? { scale: 1.02 } : {}}
                          whileTap={!answered ? { scale: 0.98 } : {}}>
                          <span className="option-letter">
                            {["A", "B", "C", "D"][i]}
                          </span>
                          {opt}
                          {answered && i === QUIZ_QUESTIONS[quizIndex].answer &&
                            <Check size={16} className="option-icon correct-icon" />}
                          {answered && i === selected && i !== QUIZ_QUESTIONS[quizIndex].answer &&
                            <X size={16} className="option-icon wrong-icon" />}
                        </motion.button>
                      );
                    })}
                  </div>
                  {answered && (
                    <motion.button className="quiz-next-btn"
                      onClick={nextQuestion}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}>
                      {quizIndex + 1 >= QUIZ_QUESTIONS.length ? "See Results 🏆" : "Next Question →"}
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}