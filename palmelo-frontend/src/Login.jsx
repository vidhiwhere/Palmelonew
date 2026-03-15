import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Login.css";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isSignup) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/app");
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(.*\)/, ""));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/app");
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(.*\)/, ""));
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">🤟 Palmelo</div>
        <h1>Breaking barriers with <span>sign language</span></h1>
        <p>AI-powered real-time sign language to speech translator. Inclusive communication for everyone.</p>
        <div className="login-stats">
          <div className="login-stat"><span>70M+</span><small>Users worldwide</small></div>
          <div className="login-stat"><span>100%</span><small>Accuracy</small></div>
          <div className="login-stat"><span>₹0</span><small>Cost to start</small></div>
        </div>
      </div>

      <div className="login-right">
        <motion.div className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}>

          <div className="login-logo">🤟</div>
          <h2>{isSignup ? "Create account" : "Welcome back"}</h2>
          <p className="login-sub">{isSignup ? "Join Palmelo today" : "Sign in to continue"}</p>

          <button className="google-btn" onClick={handleGoogle} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width={18} />
            Continue with Google
          </button>

          <div className="divider"><span>or</span></div>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" placeholder="Vidhi Kumar"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <div className="login-error">⚠️ {error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="login-switch">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button onClick={() => { setIsSignup(!isSignup); setError(""); }}>
              {isSignup ? " Sign in" : " Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}