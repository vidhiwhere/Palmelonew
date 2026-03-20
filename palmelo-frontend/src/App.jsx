import { useState, useRef, useEffect, useCallback } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, AlertTriangle, Hand, Activity, LogOut, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./App.css";
import { BookOpen } from "lucide-react";

const COOLDOWN = 3000;

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const lastSpokenRef = useRef("");
  const lastTimeRef = useRef(0);

  const [isRunning, setIsRunning] = useState(false);
  const [gesture, setGesture] = useState(null);
  const [sos, setSos] = useState(false);
  const [lang, setLang] = useState("en");
  const [confidence, setConfidence] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  const PHRASES = {
    en: { hello: "Hello there!", yes: "Yes!", no: "No!", thankyou: "Thank you!", help: "I need help!" },
    hi: { hello: "नमस्ते!", yes: "हाँ!", no: "नहीं!", thankyou: "धन्यवाद!", help: "मुझे मदद चाहिए!" }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const res = await fetch("https://palmelonew.onrender.com/detect", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.detected) {
          setGesture(data.gesture);
          setConfidence(data.confidence);
          setSos(false);
          const now = Date.now();
          const phrase = PHRASES[lang][data.gesture] || data.phrase;
          if (data.gesture !== lastSpokenRef.current || now - lastTimeRef.current > COOLDOWN) {
            speak(phrase);
            lastSpokenRef.current = data.gesture;
            lastTimeRef.current = now;
          }
        } else {
          setGesture(null);
          setConfidence(0);
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, "image/jpeg", 0.8);
  }, [lang]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsRunning(true);
      intervalRef.current = setInterval(captureAndDetect, 800);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setGesture(null);
    setSos(false);
  };

  const handleLogout = async () => {
    stopCamera();
    await signOut(auth);
    navigate("/login");
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src="/src/assets/logo.png" alt="Palmelo" className="nav-logo-img" />
          <span className="tagline">Sign Language to Speech</span>
        </div>
        <div className="header-right">
          <button className="nav-icon-btn" onClick={() => navigate("/learn")} title="Learn">
  <BookOpen size={17} />
</button>
          <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 Hindi</option>
          </select>

          <div className={`status-badge ${isRunning ? "active" : ""}`}>
            <span className="dot" />
            {isRunning ? "Live" : "Offline"}
          </div>

          {/* Messages button */}
          <button className="nav-icon-btn" onClick={() => navigate("/chat")} title="Messages">
            <MessageSquare size={17} />
          </button>

          {/* Profile */}
          <button className="profile-btn" onClick={() => navigate("/profile")} title="Profile">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="nav-avatar" />
              : <div className="nav-avatar-initials">{initials}</div>
            }
          </button>

          {/* Logout */}
          <button className="nav-icon-btn danger" onClick={handleLogout} title="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Welcome bar */}
      <div className="welcome-bar">
        👋 Welcome back, <strong>{user?.displayName || user?.email}</strong>!
        <button className="welcome-chat-btn" onClick={() => navigate("/chat")}>
          <MessageSquare size={13} /> Open Messages
        </button>
      </div>

      <main className="main-single">
        {/* Camera section — full width */}
        <section className="camera-section full">
          <div className="section-label">
            <Activity size={14} /> Live Gesture Detection
          </div>

          <div className="video-wrapper">
            <video ref={videoRef} className="video" muted playsInline />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {!isRunning && (
              <div className="video-overlay">
                <Hand size={48} strokeWidth={1.5} />
                <p>Camera is off</p>
              </div>
            )}
            {sos && (
              <motion.div className="sos-overlay"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}>
                🚨 SOS ALERT
              </motion.div>
            )}
          </div>

          <div className="camera-controls">
            <button className={`btn-primary ${isRunning ? "danger" : ""}`}
              onClick={isRunning ? stopCamera : startCamera}>
              {isRunning ? <><MicOff size={16} /> Stop Camera</> : <><Mic size={16} /> Start Camera</>}
            </button>
          </div>

          {/* Gesture + stats row */}
          <div className="gesture-row">
            <AnimatePresence mode="wait">
              {gesture ? (
                <motion.div key={gesture} className="gesture-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}>
                  <div className="gesture-emoji">🤟</div>
                  <div className="gesture-name">{gesture}</div>
                  <div className="gesture-phrase">{PHRASES[lang][gesture]}</div>
                  <div className="confidence-bar-wrapper">
                    <div className="confidence-bar" style={{ width: `${confidence}%` }} />
                  </div>
                  <div className="confidence-label">{confidence}% confidence</div>
                </motion.div>
              ) : (
                <motion.div key="empty" className="gesture-card empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="gesture-emoji">✋</div>
                  <div className="gesture-name">No gesture detected</div>
                  <div className="gesture-phrase">Show your hand to the camera</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick stats */}
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="qs-icon">🧠</span>
                <span className="qs-label">Model</span>
                <span className="qs-val">SVM</span>
              </div>
              <div className="quick-stat">
                <span className="qs-icon">🎯</span>
                <span className="qs-label">Accuracy</span>
                <span className="qs-val">100%</span>
              </div>
              <div className="quick-stat">
                <span className="qs-icon">🤟</span>
                <span className="qs-label">Gestures</span>
                <span className="qs-val">5</span>
              </div>
              <div className="quick-stat">
                <span className="qs-icon">🌐</span>
                <span className="qs-label">Languages</span>
                <span className="qs-val">EN / HI</span>
              </div>
            </div>
          </div>

          {/* Gesture guide */}
          <div className="gesture-guide">
            <div className="guide-title">Gesture Guide</div>
            <div className="guide-grid">
              {[
                { g: "hello", e: "🖐", d: "Open palm" },
                { g: "yes", e: "👍", d: "Thumbs up" },
                { g: "no", e: "☝️", d: "Index up" },
                { g: "thankyou", e: "🤲", d: "Flat hand" },
                { g: "help", e: "✊", d: "Closed fist" },
              ].map(item => (
                <div key={item.g} className={`guide-item ${gesture === item.g ? "active" : ""}`}>
                  <span className="guide-emoji">{item.e}</span>
                  <span className="guide-name">{item.g}</span>
                  <span className="guide-desc">{item.d}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}