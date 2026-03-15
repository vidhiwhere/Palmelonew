import { useState, useRef, useEffect, useCallback } from "react";
import { db, auth } from "./firebase";
import { ref, push, onValue, query, limitToLast } from "firebase/database";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, AlertTriangle, Hand, MessageCircle, Activity, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./App.css";

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
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [lang, setLang] = useState("en");
  const [confidence, setConfidence] = useState(0);
  const chatEndRef = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const PHRASES = {
    en: { hello: "Hello there!", yes: "Yes!", no: "No!", thankyou: "Thank you!", help: "I need help!" },
    hi: { hello: "नमस्ते!", yes: "हाँ!", no: "नहीं!", thankyou: "धन्यवाद!", help: "मुझे मदद चाहिए!" }
  };

  useEffect(() => {
    const msgRef = query(ref(db, "messages"), limitToLast(30));
    const unsub = onValue(msgRef, (snap) => {
      const data = snap.val();
      if (data) setMessages(Object.values(data));
      else setMessages([]);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const sendToFirebase = (sender, message, isSos = false) => {
    push(ref(db, "messages"), {
      sender,
      message,
      sos: isSos,
      timestamp: Date.now(),
      userName: user?.displayName || user?.email || "User"
    });
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
        const res = await fetch("http://localhost:8000/detect", {
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
            sendToFirebase("signer", phrase);
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

  const sendReply = () => {
    if (!replyText.trim()) return;
    sendToFirebase("reply", replyText.trim());
    setReplyText("");
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
          <span className="logo">🤟 Palmelo</span>
          <span className="tagline">Sign Language to Speech</span>
        </div>
        <div className="header-right">
          <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 Hindi</option>
          </select>

          <div className={`status-badge ${isRunning ? "active" : ""}`}>
            <span className="dot" />
            {isRunning ? "Live" : "Offline"}
          </div>

          {/* Profile button */}
          <button className="profile-btn" onClick={() => navigate("/profile")} title="View profile">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="nav-avatar" />
            ) : (
              <div className="nav-avatar-initials">{initials}</div>
            )}
          </button>

          {/* Logout */}
          <button className="nav-logout" onClick={handleLogout} title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Welcome bar */}
      <div className="welcome-bar">
        👋 Welcome back, <strong>{user?.displayName || user?.email}</strong>!
      </div>

      <main className="main">
        {/* Left — Camera */}
        <section className="camera-section">
          <div className="section-label">
            <Activity size={14} /> Live Camera
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
              {isRunning ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Start Camera</>}
            </button>
          </div>

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
                <div className="gesture-name">No gesture</div>
                <div className="gesture-phrase">Show your hand to the camera</div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right — Chat */}
        <section className="chat-section">
          <div className="section-label">
            <MessageCircle size={14} /> Live Chat
            <span className="firebase-badge">🔥 Firebase</span>
          </div>

          <div className="chat-window">
            <AnimatePresence>
              {messages.length === 0 && (
                <div className="chat-empty">
                  <MessageCircle size={32} strokeWidth={1.2} />
                  <p>No messages yet</p>
                  <span>Start signing to send messages</span>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`message ${msg.sos ? "sos" : msg.sender === "signer" ? "right" : "left"}`}>
                  {msg.sos ? (
                    <div className="bubble sos-bubble">
                      <AlertTriangle size={14} /> SOS ALERT — Emergency!
                    </div>
                  ) : (
                    <div className="bubble">
                      {msg.sender === "signer" && <span className="msg-icon">🤟 </span>}
                      {msg.message}
                      <span className="msg-time">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a reply..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendReply()}
            />
            <button className="send-btn" onClick={sendReply}>
              <Send size={16} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}