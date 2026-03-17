import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RotateCcw, Check, X, Search, Bookmark, BookmarkCheck, Star } from "lucide-react";
import "./Learn.css";

// ─── DATA ───────────────────────────────────────────────────────────────────

const ALPHABET = [
  { letter: "A", emoji: "✊", desc: "Closed fist, thumb on side", level: "beginner" },
  { letter: "B", emoji: "🖐", desc: "Four fingers up, thumb folded", level: "beginner" },
  { letter: "C", emoji: "🤏", desc: "Curved hand like letter C", level: "beginner" },
  { letter: "D", emoji: "☝️", desc: "Index up, others curl to thumb", level: "beginner" },
  { letter: "E", emoji: "🤜", desc: "All fingers bent down", level: "intermediate" },
  { letter: "F", emoji: "👌", desc: "Index & thumb touch, others up", level: "intermediate" },
  { letter: "G", emoji: "👉", desc: "Index & thumb point sideways", level: "beginner" },
  { letter: "H", emoji: "🤞", desc: "Index & middle point sideways", level: "beginner" },
  { letter: "I", emoji: "🤙", desc: "Pinky up, others curled", level: "beginner" },
  { letter: "J", emoji: "🤙", desc: "Pinky up + draw J in air", level: "intermediate" },
  { letter: "K", emoji: "✌️", desc: "Index & middle up, thumb between", level: "intermediate" },
  { letter: "L", emoji: "👆", desc: "Index up, thumb out — L shape", level: "beginner" },
  { letter: "M", emoji: "✊", desc: "Three fingers over thumb", level: "advanced" },
  { letter: "N", emoji: "✊", desc: "Two fingers over thumb", level: "advanced" },
  { letter: "O", emoji: "👌", desc: "All fingers curve to make O", level: "beginner" },
  { letter: "P", emoji: "👇", desc: "Like K but pointing down", level: "advanced" },
  { letter: "Q", emoji: "👇", desc: "Like G but pointing down", level: "advanced" },
  { letter: "R", emoji: "🤞", desc: "Index & middle fingers crossed", level: "intermediate" },
  { letter: "S", emoji: "✊", desc: "Fist with thumb over fingers", level: "intermediate" },
  { letter: "T", emoji: "✊", desc: "Thumb between index & middle", level: "advanced" },
  { letter: "U", emoji: "✌️", desc: "Index & middle up together", level: "beginner" },
  { letter: "V", emoji: "✌️", desc: "Index & middle up, spread apart", level: "beginner" },
  { letter: "W", emoji: "🖖", desc: "Index, middle & ring up spread", level: "intermediate" },
  { letter: "X", emoji: "☝️", desc: "Index finger hooked/bent", level: "intermediate" },
  { letter: "Y", emoji: "🤙", desc: "Thumb & pinky out", level: "beginner" },
  { letter: "Z", emoji: "☝️", desc: "Index draws Z in air", level: "intermediate" },
];

const NUMBERS = [
  { num: "0", emoji: "👌", desc: "All fingers curve to make O", level: "beginner" },
  { num: "1", emoji: "☝️", desc: "Index finger pointing up", level: "beginner" },
  { num: "2", emoji: "✌️", desc: "Index and middle up", level: "beginner" },
  { num: "3", emoji: "🤟", desc: "Thumb, index, middle up", level: "beginner" },
  { num: "4", emoji: "🖐", desc: "Four fingers up, thumb folded", level: "beginner" },
  { num: "5", emoji: "🖐", desc: "All five fingers spread open", level: "beginner" },
  { num: "6", emoji: "🤙", desc: "Thumb and pinky touching", level: "intermediate" },
  { num: "7", emoji: "🤞", desc: "Middle and thumb touching", level: "intermediate" },
  { num: "8", emoji: "🤌", desc: "Index and thumb touching", level: "intermediate" },
  { num: "9", emoji: "👌", desc: "Index hooks to thumb", level: "intermediate" },
];

const CATEGORIES = {
  phrases: [
    { sign: "Hello", emoji: "👋", desc: "Open palm, wave hand side to side", level: "beginner", video: "https://www.youtube.com/watch?v=0FcwzMq4iWg" },
    { sign: "Thank you", emoji: "🤲", desc: "Flat hand from chin moving forward", level: "beginner", video: "https://www.youtube.com/watch?v=0FcwzMq4iWg" },
    { sign: "Please", emoji: "🙏", desc: "Flat hand circles on chest", level: "beginner", video: "" },
    { sign: "Sorry", emoji: "✊", desc: "Fist circles on chest", level: "beginner", video: "" },
    { sign: "Yes", emoji: "👍", desc: "Fist nods up and down", level: "beginner", video: "" },
    { sign: "No", emoji: "☝️", desc: "Index and middle snap to thumb", level: "beginner", video: "" },
    { sign: "I love you", emoji: "🤟", desc: "Thumb, index, pinky extended", level: "beginner", video: "" },
    { sign: "Good morning", emoji: "🌅", desc: "Open hand rises from elbow up", level: "beginner", video: "" },
    { sign: "Good night", emoji: "🌙", desc: "Hand arcs down like setting sun", level: "beginner", video: "" },
    { sign: "How are you?", emoji: "🤔", desc: "Bent fingers brush chest twice", level: "intermediate", video: "" },
    { sign: "My name is", emoji: "🏷️", desc: "H hand taps twice on H hand", level: "intermediate", video: "" },
    { sign: "Nice to meet you", emoji: "🤝", desc: "Flat hands meet and clasp", level: "intermediate", video: "" },
  ],
  family: [
    { sign: "Mother", emoji: "👩", desc: "Open 5 hand, thumb taps chin twice", level: "beginner", video: "" },
    { sign: "Father", emoji: "👨", desc: "Open 5 hand, thumb taps forehead twice", level: "beginner", video: "" },
    { sign: "Sister", emoji: "👧", desc: "A hand at jaw, moves to land on other A", level: "intermediate", video: "" },
    { sign: "Brother", emoji: "👦", desc: "L hand at forehead, moves to land on other L", level: "intermediate", video: "" },
    { sign: "Baby", emoji: "👶", desc: "Arms cradle and rock side to side", level: "beginner", video: "" },
    { sign: "Family", emoji: "👨‍👩‍👧", desc: "F hands circle outward and meet", level: "intermediate", video: "" },
    { sign: "Grandmother", emoji: "👵", desc: "5 hand at chin, bounces forward twice", level: "intermediate", video: "" },
    { sign: "Grandfather", emoji: "👴", desc: "5 hand at forehead, bounces forward twice", level: "intermediate", video: "" },
    { sign: "Friend", emoji: "🤝", desc: "Index fingers hook and switch places", level: "beginner", video: "" },
    { sign: "Husband", emoji: "💍", desc: "G hand at forehead, clasps other hand", level: "advanced", video: "" },
    { sign: "Wife", emoji: "💒", desc: "G hand at chin, clasps other hand", level: "advanced", video: "" },
    { sign: "Child", emoji: "🧒", desc: "Hand pats downward twice", level: "beginner", video: "" },
  ],
  food: [
    { sign: "Water", emoji: "💧", desc: "W hand taps chin twice", level: "beginner", video: "" },
    { sign: "Food/Eat", emoji: "🍽️", desc: "Fingers pinched together tap mouth", level: "beginner", video: "" },
    { sign: "Milk", emoji: "🥛", desc: "Squeeze fist open and closed twice", level: "beginner", video: "" },
    { sign: "Bread", emoji: "🍞", desc: "Slice non-dominant hand with dominant", level: "beginner", video: "" },
    { sign: "Rice", emoji: "🍚", desc: "R hand brushes up palm twice", level: "intermediate", video: "" },
    { sign: "Fruit", emoji: "🍎", desc: "F hand twists at cheek", level: "beginner", video: "" },
    { sign: "Vegetable", emoji: "🥦", desc: "V hand twists at cheek", level: "beginner", video: "" },
    { sign: "Hungry", emoji: "😋", desc: "C hand slides down chest", level: "beginner", video: "" },
    { sign: "Thirsty", emoji: "🥤", desc: "Index finger traces down throat", level: "beginner", video: "" },
    { sign: "Coffee", emoji: "☕", desc: "S hand circles over other S hand", level: "intermediate", video: "" },
    { sign: "Tea", emoji: "🍵", desc: "F hand dips into O hand like tea bag", level: "intermediate", video: "" },
    { sign: "Sweet", emoji: "🍬", desc: "Fingers brush down chin twice", level: "beginner", video: "" },
  ],
  colors: [
    { sign: "Red", emoji: "🔴", desc: "Index finger brushes down lips twice", level: "beginner", video: "" },
    { sign: "Blue", emoji: "🔵", desc: "B hand shakes side to side", level: "beginner", video: "" },
    { sign: "Green", emoji: "🟢", desc: "G hand shakes side to side", level: "beginner", video: "" },
    { sign: "Yellow", emoji: "🟡", desc: "Y hand shakes side to side", level: "beginner", video: "" },
    { sign: "White", emoji: "⬜", desc: "Open hand pulls from chest to closed 5", level: "beginner", video: "" },
    { sign: "Black", emoji: "⬛", desc: "Index finger slides across forehead", level: "beginner", video: "" },
    { sign: "Orange", emoji: "🟠", desc: "Squeeze fist at chin like squeezing orange", level: "beginner", video: "" },
    { sign: "Purple", emoji: "🟣", desc: "P hand shakes side to side", level: "intermediate", video: "" },
    { sign: "Pink", emoji: "🩷", desc: "P hand brushes down chin twice", level: "intermediate", video: "" },
    { sign: "Brown", emoji: "🟤", desc: "B hand slides down cheek", level: "intermediate", video: "" },
    { sign: "Grey", emoji: "🩶", desc: "Open hands pass through each other", level: "intermediate", video: "" },
    { sign: "Gold", emoji: "🟨", desc: "G hand pulls from ear and shakes", level: "advanced", video: "" },
  ],
  time: [
    { sign: "Today", emoji: "📅", desc: "Both Y hands drop down simultaneously", level: "beginner", video: "" },
    { sign: "Tomorrow", emoji: "➡️", desc: "A hand thumb moves forward from cheek", level: "beginner", video: "" },
    { sign: "Yesterday", emoji: "⬅️", desc: "A hand thumb moves back along cheek", level: "beginner", video: "" },
    { sign: "Monday", emoji: "1️⃣", desc: "M hand circles in small circle", level: "beginner", video: "" },
    { sign: "Tuesday", emoji: "2️⃣", desc: "T hand circles in small circle", level: "beginner", video: "" },
    { sign: "Wednesday", emoji: "3️⃣", desc: "W hand circles in small circle", level: "beginner", video: "" },
    { sign: "Thursday", emoji: "4️⃣", desc: "H hand circles in small circle", level: "beginner", video: "" },
    { sign: "Friday", emoji: "5️⃣", desc: "F hand circles in small circle", level: "beginner", video: "" },
    { sign: "Saturday", emoji: "6️⃣", desc: "S hand circles in small circle", level: "beginner", video: "" },
    { sign: "Sunday", emoji: "7️⃣", desc: "Both open hands circle outward", level: "beginner", video: "" },
    { sign: "Morning", emoji: "🌅", desc: "Bent arm rises up like the sun", level: "beginner", video: "" },
    { sign: "Night", emoji: "🌙", desc: "Bent hand arcs down over other arm", level: "beginner", video: "" },
    { sign: "Week", emoji: "📆", desc: "1 hand slides across flat palm", level: "intermediate", video: "" },
    { sign: "Month", emoji: "🗓️", desc: "1 hand slides down other 1 hand", level: "intermediate", video: "" },
    { sign: "Year", emoji: "📅", desc: "S hands circle around each other", level: "intermediate", video: "" },
  ],
  school: [
    { sign: "School", emoji: "🏫", desc: "Clap flat hands twice", level: "beginner", video: "" },
    { sign: "Teacher", emoji: "👩‍🏫", desc: "Bent hands at temples, then person sign", level: "intermediate", video: "" },
    { sign: "Student", emoji: "👨‍🎓", desc: "Pick up from palm, then person sign", level: "intermediate", video: "" },
    { sign: "Book", emoji: "📖", desc: "Flat hands open like a book", level: "beginner", video: "" },
    { sign: "Write", emoji: "✏️", desc: "Pinched fingers write on flat palm", level: "beginner", video: "" },
    { sign: "Read", emoji: "📚", desc: "V hand moves down over flat palm", level: "beginner", video: "" },
    { sign: "Learn", emoji: "🧠", desc: "Pick up from palm and bring to forehead", level: "beginner", video: "" },
    { sign: "Class", emoji: "🏛️", desc: "C hands circle outward and meet", level: "intermediate", video: "" },
    { sign: "Test/Exam", emoji: "📝", desc: "Bent index fingers bounce down twice", level: "intermediate", video: "" },
    { sign: "Question", emoji: "❓", desc: "Index finger draws question mark in air", level: "beginner", video: "" },
    { sign: "Answer", emoji: "💬", desc: "Both 1 hands pivot forward from mouth", level: "intermediate", video: "" },
    { sign: "Computer", emoji: "💻", desc: "C hand circles on forearm", level: "intermediate", video: "" },
  ],
  medical: [
    { sign: "Doctor", emoji: "👨‍⚕️", desc: "D hand taps pulse point on wrist", level: "beginner", video: "" },
    { sign: "Hospital", emoji: "🏥", desc: "H hand draws cross on upper arm", level: "beginner", video: "" },
    { sign: "Medicine", emoji: "💊", desc: "Middle finger circles on palm", level: "beginner", video: "" },
    { sign: "Pain/Hurt", emoji: "😣", desc: "Index fingers point and twist toward each other", level: "beginner", video: "" },
    { sign: "Sick", emoji: "🤒", desc: "Middle finger touches forehead and stomach", level: "beginner", video: "" },
    { sign: "Help", emoji: "🆘", desc: "Fist placed on flat palm, both move upward", level: "beginner", video: "" },
    { sign: "Emergency", emoji: "🚨", desc: "E hand shakes side to side rapidly", level: "intermediate", video: "" },
    { sign: "Ambulance", emoji: "🚑", desc: "A hand circles, then drive sign", level: "intermediate", video: "" },
    { sign: "Fever", emoji: "🌡️", desc: "Index finger at mouth, then hot sign", level: "intermediate", video: "" },
    { sign: "Allergy", emoji: "🤧", desc: "Index pulls down nose, then A hand", level: "advanced", video: "" },
    { sign: "Deaf", emoji: "🦻", desc: "Index touches ear then mouth", level: "beginner", video: "" },
    { sign: "Hearing aid", emoji: "👂", desc: "Curve index at ear", level: "intermediate", video: "" },
  ],
  travel: [
    { sign: "Car/Drive", emoji: "🚗", desc: "Both S hands steer like a wheel", level: "beginner", video: "" },
    { sign: "Bus", emoji: "🚌", desc: "B hands pull apart like opening doors", level: "beginner", video: "" },
    { sign: "Train", emoji: "🚂", desc: "H hands rub back and forth", level: "beginner", video: "" },
    { sign: "Airplane", emoji: "✈️", desc: "ILY hand glides forward", level: "beginner", video: "" },
    { sign: "Hotel", emoji: "🏨", desc: "H hand taps shoulder twice", level: "intermediate", video: "" },
    { sign: "Where", emoji: "📍", desc: "Index finger shakes side to side", level: "beginner", video: "" },
    { sign: "Left", emoji: "⬅️", desc: "L hand points and moves left", level: "beginner", video: "" },
    { sign: "Right", emoji: "➡️", desc: "R hand points and moves right", level: "beginner", video: "" },
    { sign: "Straight", emoji: "⬆️", desc: "B hand moves straight forward", level: "beginner", video: "" },
    { sign: "Stop", emoji: "🛑", desc: "Flat hand slaps into palm sharply", level: "beginner", video: "" },
    { sign: "Ticket", emoji: "🎫", desc: "V hand pinches across fingers of other hand", level: "intermediate", video: "" },
    { sign: "Passport", emoji: "🛂", desc: "P hand on flat palm, then open like book", level: "advanced", video: "" },
  ],
  emergency: [
    { sign: "Help", emoji: "🆘", desc: "Fist placed on flat palm, both move upward quickly", level: "beginner", video: "" },
    { sign: "Stop", emoji: "🛑", desc: "Flat hand slaps into palm sharply", level: "beginner", video: "" },
    { sign: "Pain/Hurt", emoji: "😣", desc: "Both index fingers point and twist toward each other", level: "beginner", video: "" },
    { sign: "Call police", emoji: "🚔", desc: "C handshape at ear like phone + P sign", level: "intermediate", video: "" },
    { sign: "Fire", emoji: "🔥", desc: "Fingers flutter upward like flames", level: "beginner", video: "" },
    { sign: "Doctor", emoji: "🏥", desc: "D handshape taps wrist pulse point", level: "beginner", video: "" },
    { sign: "Danger", emoji: "⚠️", desc: "Both A fists — one moves up over the other", level: "intermediate", video: "" },
    { sign: "SOS", emoji: "📣", desc: "Wave both hands open above head", level: "beginner", video: "" },
  ],
};

const QUIZ_QUESTIONS = [
  { question: "Which sign represents 'Yes'?", options: ["✌️ Two fingers up", "👍 Fist nods up and down", "🤟 Thumb and pinky out", "👌 Fingers form O"], answer: 1 },
  { question: "How do you sign 'Thank you'?", options: ["Wave hand side to side", "Fist circles on chest", "Flat hand from chin moves forward", "Index finger points up"], answer: 2 },
  { question: "Which handshape is used for 'I Love You'?", options: ["✌️", "👍", "🤟", "✊"], answer: 2 },
  { question: "How do you sign the number 5?", options: ["Four fingers up", "All five fingers spread open", "Thumb and pinky out", "Index finger up"], answer: 1 },
  { question: "What is the emergency sign for 'Help'?", options: ["Wave both hands", "Fist on flat palm raised upward", "Fingers flutter upward", "C handshape at ear"], answer: 1 },
  { question: "Which sign represents the letter 'L'?", options: ["Fist with thumb over fingers", "Index up + thumb out (L shape)", "Two fingers crossed", "All fingers bent down"], answer: 1 },
  { question: "How do you sign 'Mother'?", options: ["Thumb taps forehead twice", "Thumb taps chin twice", "Hand circles chest", "Fingers brush cheek"], answer: 1 },
  { question: "How do you sign 'Water'?", options: ["W hand taps chin twice", "Open hand moves forward", "Fingers wiggle downward", "C hand at mouth"], answer: 0 },
  { question: "What color is signed by shaking a B hand?", options: ["Red", "Green", "Blue", "Yellow"], answer: 2 },
  { question: "How do you sign 'School'?", options: ["Clap flat hands twice", "Open book sign", "Draw S in air", "Tap forehead twice"], answer: 0 },
];

const TABS = ["Alphabet", "Numbers", "Phrases", "Family", "Food", "Colors", "Time", "School", "Medical", "Travel", "Emergency", "Quiz"];
const LEVEL_COLORS = { beginner: "#00b894", intermediate: "#FFB347", advanced: "#ff6b6b" };

export default function Learn() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [flipped, setFlipped] = useState({});
  const [learned, setLearned] = useState(() => JSON.parse(localStorage.getItem("palmelo_learned") || "{}"));
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem("palmelo_bookmarks") || "{}"));
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showVideo, setShowVideo] = useState(null);

  useEffect(() => {
    localStorage.setItem("palmelo_learned", JSON.stringify(learned));
  }, [learned]);

  useEffect(() => {
    localStorage.setItem("palmelo_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleFlip = (id) => setFlipped(f => ({ ...f, [id]: !f[id] }));
  const toggleLearned = (id, e) => { e.stopPropagation(); setLearned(l => ({ ...l, [id]: !l[id] })); };
  const toggleBookmark = (id, e) => { e.stopPropagation(); setBookmarks(b => ({ ...b, [id]: !b[id] })); };

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === QUIZ_QUESTIONS[quizIndex].answer) setQuizScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (quizIndex + 1 >= QUIZ_QUESTIONS.length) setQuizDone(true);
    else { setQuizIndex(i => i + 1); setSelected(null); setAnswered(false); }
  };

  const resetQuiz = () => {
    setQuizIndex(0); setQuizScore(0); setQuizDone(false);
    setSelected(null); setAnswered(false);
  };

  const totalLearned = Object.values(learned).filter(Boolean).length;

  const filterItems = (items, keyFn) => {
    return items.filter(item => {
      const matchSearch = search === "" ||
        keyFn(item).toLowerCase().includes(search.toLowerCase()) ||
        item.desc?.toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === "all" || item.level === levelFilter;
      return matchSearch && matchLevel;
    });
  };

  const getTabData = () => {
    const tabMap = {
      2: { key: "phrases", keyFn: i => i.sign },
      3: { key: "family", keyFn: i => i.sign },
      4: { key: "food", keyFn: i => i.sign },
      5: { key: "colors", keyFn: i => i.sign },
      6: { key: "time", keyFn: i => i.sign },
      7: { key: "school", keyFn: i => i.sign },
      8: { key: "medical", keyFn: i => i.sign },
      9: { key: "travel", keyFn: i => i.sign },
      10: { key: "emergency", keyFn: i => i.sign },
    };
    return tabMap[activeTab];
  };

  const renderCards = (items, idPrefix = "") => (
    <div className="cards-grid-large">
      {items.map((item, i) => {
        const id = idPrefix + (item.letter || item.num || item.sign);
        return (
          <motion.div key={id}
            className={`sign-card ${flipped[id] ? "flipped" : ""} ${learned[id] ? "is-learned" : ""}`}
            onClick={() => toggleFlip(id)}
            whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <div className="flip-inner">
              <div className="flip-front">
                <div className="card-level-badge" style={{ background: LEVEL_COLORS[item.level] + "22", color: LEVEL_COLORS[item.level] }}>
                  {item.level}
                </div>
                <div className="card-emoji-large">{item.emoji}</div>
                <div className="card-sign-name">{item.letter || item.num || item.sign}</div>
                <div className="card-tap-hint">Tap to learn</div>
                <div className="card-actions">
                  <button className={`card-btn ${learned[id] ? "learned" : ""}`} onClick={e => toggleLearned(id, e)} title="Mark learned">
                    {learned[id] ? <Check size={13} /> : <Star size={13} />}
                  </button>
                  <button className={`card-btn ${bookmarks[id] ? "bookmarked" : ""}`} onClick={e => toggleBookmark(id, e)} title="Bookmark">
                    {bookmarks[id] ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                  </button>
                </div>
              </div>
              <div className="flip-back">
                <div className="card-emoji-large">{item.emoji}</div>
                <div className="card-sign-name small">{item.letter || item.num || item.sign}</div>
                <div className="card-desc-full">{item.desc}</div>
                {item.video && (
                  <button className="video-btn" onClick={e => { e.stopPropagation(); setShowVideo(item.video); }}>
                    ▶ Watch Video
                  </button>
                )}
                <div className="card-actions">
                  <button className={`card-btn ${learned[id] ? "learned" : ""}`} onClick={e => toggleLearned(id, e)}>
                    {learned[id] ? "✓ Learned" : "Mark learned"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="learn-page">
      {/* Video modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div className="video-modal" onClick={() => setShowVideo(null)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="video-modal-inner" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button className="video-close" onClick={() => setShowVideo(null)}>✕</button>
              <iframe width="100%" height="315" src={showVideo.replace("watch?v=", "embed/")}
                title="Sign language video" frameBorder="0" allowFullScreen />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="learn-nav">
        <button className="learn-back" onClick={() => navigate("/app")}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="learn-title">🤟 Learn Sign Language</div>
        <div className="learn-nav-right">
          <div className="progress-pill">
            ✅ {totalLearned} learned
          </div>
          <button className="learn-chat-btn" onClick={() => navigate("/chat")}>💬 Chat</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="learn-hero">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Learn Sign Language</h1>
          <p>Master signs, track your progress, and communicate inclusively</p>
        </motion.div>
        <div className="learn-hero-stats">
          <div className="lh-stat"><span>26</span><small>Alphabets</small></div>
          <div className="lh-stat"><span>10</span><small>Numbers</small></div>
          <div className="lh-stat"><span>100+</span><small>Signs</small></div>
          <div className="lh-stat"><span>{totalLearned}</span><small>Learned</small></div>
        </div>

        {/* Search + filter */}
        <div className="learn-controls">
          <div className="search-box">
            <Search size={15} />
            <input placeholder="Search any sign..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="level-filters">
            {["all", "beginner", "intermediate", "advanced"].map(l => (
              <button key={l}
                className={`level-btn ${levelFilter === l ? "active" : ""}`}
                style={levelFilter === l && l !== "all" ? { background: LEVEL_COLORS[l] + "33", borderColor: LEVEL_COLORS[l], color: LEVEL_COLORS[l] } : {}}
                onClick={() => setLevelFilter(l)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="learn-tabs">
        {TABS.map((tab, i) => (
          <button key={tab}
            className={`learn-tab ${activeTab === i ? "active" : ""}`}
            onClick={() => { setActiveTab(i); setSearch(""); setLevelFilter("all"); }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="learn-content">
        <AnimatePresence mode="wait">

          {/* Alphabet */}
          {activeTab === 0 && (
            <motion.div key="alpha" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {renderCards(filterItems(ALPHABET, i => i.letter))}
            </motion.div>
          )}

          {/* Numbers */}
          {activeTab === 1 && (
            <motion.div key="nums" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {renderCards(filterItems(NUMBERS, i => i.num), "n")}
            </motion.div>
          )}

          {/* All category tabs */}
          {activeTab >= 2 && activeTab <= 10 && (() => {
            const tabData = getTabData();
            if (!tabData) return null;
            const items = filterItems(CATEGORIES[tabData.key], tabData.keyFn);
            return (
              <motion.div key={`tab-${activeTab}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {activeTab === 10 && (
                  <div className="emergency-banner">
                    ⚠️ Learn these signs — they could save a life in an emergency!
                  </div>
                )}
                {items.length === 0
                  ? <div className="no-results">🔍 No signs found for "{search}"</div>
                  : renderCards(items)
                }
              </motion.div>
            );
          })()}

          {/* Quiz */}
          {activeTab === 11 && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="quiz-wrapper">
              {quizDone ? (
                <motion.div className="quiz-result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <div className="result-icon">{quizScore >= 8 ? "🏆" : quizScore >= 5 ? "🎉" : "📚"}</div>
                  <h2>Quiz Complete!</h2>
                  <div className="result-score">{quizScore} / {QUIZ_QUESTIONS.length}</div>
                  <p className="result-msg">
                    {quizScore >= 8 ? "Excellent! You're a sign language pro! 🌟"
                      : quizScore >= 5 ? "Good job! Keep practising! 💪"
                      : "Keep learning — you'll get there! 📖"}
                  </p>
                  <div className="result-badges">
                    {quizScore >= 3 && <span className="badge">🥉 Learner</span>}
                    {quizScore >= 6 && <span className="badge">🥈 Practitioner</span>}
                    {quizScore >= 9 && <span className="badge">🥇 Expert</span>}
                  </div>
                  <button className="quiz-reset-btn" onClick={resetQuiz}>
                    <RotateCcw size={16} /> Try Again
                  </button>
                </motion.div>
              ) : (
                <div className="quiz-card">
                  <div className="quiz-progress-bar">
                    <div className="quiz-progress-fill" style={{ width: `${(quizIndex / QUIZ_QUESTIONS.length) * 100}%` }} />
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
                          <span className="option-letter">{["A", "B", "C", "D"][i]}</span>
                          {opt}
                          {answered && i === QUIZ_QUESTIONS[quizIndex].answer && <Check size={16} className="option-icon correct-icon" />}
                          {answered && i === selected && i !== QUIZ_QUESTIONS[quizIndex].answer && <X size={16} className="option-icon wrong-icon" />}
                        </motion.button>
                      );
                    })}
                  </div>
                  {answered && (
                    <motion.button className="quiz-next-btn" onClick={nextQuestion}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      {quizIndex + 1 >= QUIZ_QUESTIONS.length ? "See Results 🏆" : "Next Question →"}
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Video Resources Section */}
<div className="video-resources">
  <h2 className="vr-title">📺 Video Learning Resources</h2>
  <p className="vr-sub">Curated YouTube playlists to help you learn sign language faster</p>
  <div className="vr-grid">
    {[
      { title: "First 50 ASL Signs", desc: "Essential signs for complete beginners — greetings, polite words, daily life", emoji: "🌱", url: "https://www.youtube.com/watch?v=v1desDduz5M", level: "beginner" },
      { title: "ASL Alphabet A-Z", desc: "Learn the complete fingerspelling alphabet clearly and slowly", emoji: "🔤", url: "https://www.youtube.com/watch?v=tkMg8g8vVUo", level: "beginner" },
      { title: "Numbers 1-100", desc: "Count and sign numbers from 1 to 100 in ASL", emoji: "🔢", url: "https://www.youtube.com/watch?v=iFNCSBToJCg", level: "beginner" },
      { title: "Family Signs", desc: "Signs for mother, father, sister, brother and more family members", emoji: "👨‍👩‍👧", url: "https://www.youtube.com/watch?v=sOFRjRPPfk8", level: "beginner" },
      { title: "Colors in ASL", desc: "Learn all the basic and advanced color signs", emoji: "🎨", url: "https://www.youtube.com/watch?v=7TOL6RrXMQ4", level: "beginner" },
      { title: "Food & Drinks", desc: "Signs for common foods, drinks and meals", emoji: "🍽️", url: "https://www.youtube.com/watch?v=nDHjqBOHm8c", level: "intermediate" },
      { title: "Days & Time", desc: "Days of week, months, and time expressions in ASL", emoji: "📅", url: "https://www.youtube.com/watch?v=5VEDSiCvCP4", level: "beginner" },
      { title: "School Signs", desc: "40 essential school and education signs for students", emoji: "🏫", url: "https://www.youtube.com/watch?v=hPLLSsOSJXg", level: "intermediate" },
      { title: "Medical Signs", desc: "Important health and medical signs including doctor, hospital, pain", emoji: "🏥", url: "https://www.youtube.com/watch?v=Zfv5T4-7ALo", level: "intermediate" },
      { title: "Travel & Directions", desc: "Signs for travel, transport and giving directions", emoji: "✈️", url: "https://www.youtube.com/watch?v=8RWtB-oY9_s", level: "intermediate" },
      { title: "Emergency Signs", desc: "Critical safety signs — help, stop, danger, fire and more", emoji: "🆘", url: "https://www.youtube.com/watch?v=nPMqwPJGx1k", level: "beginner" },
      { title: "Full Beginner Course", desc: "Complete free ASL course covering all basics in one playlist", emoji: "🎓", url: "https://www.youtube.com/watch?v=0FcwzMq4iWg", level: "beginner" },
    ].map((item, i) => (
      <motion.a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
        className="vr-card"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.05 }}
        whileHover={{ y: -4 }}>
        <div className="vr-emoji">{item.emoji}</div>
        <div className="vr-card-level" style={{
          background: LEVEL_COLORS[item.level] + "22",
          color: LEVEL_COLORS[item.level]
        }}>{item.level}</div>
        <div className="vr-card-title">{item.title}</div>
        <div className="vr-card-desc">{item.desc}</div>
        <div className="vr-watch">▶ Watch on YouTube</div>
      </motion.a>
    ))}
  </div>
</div>
    </div>
  );
}