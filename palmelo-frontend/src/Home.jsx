import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hand, Mic, MessageCircle, Zap, Heart, Globe, Shield, ChevronRight } from "lucide-react";
import "./Home.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }
  })
};

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: <Zap size={22} />, color: "#FFB347", title: "Real-time Detection", desc: "Detects hand gestures instantly using MediaPipe with 21 key landmarks" },
    { icon: <Mic size={22} />, color: "#00b894", title: "Speech Output", desc: "Converts gestures to spoken words in English and Hindi automatically" },
    { icon: <MessageCircle size={22} />, color: "#4c6ef5", title: "Live Chat", desc: "Real-time messaging between signers and non-signers via Firebase" },
    { icon: <Shield size={22} />, color: "#ff6b6b", title: "SOS Alert", desc: "Show both hands to instantly trigger an emergency alarm" },
    { icon: <Globe size={22} />, color: "#a29bfe", title: "Multilingual", desc: "Supports English and Hindi with more languages coming soon" },
    { icon: <Heart size={22} />, color: "#fd79a8", title: "Inclusive Design", desc: "Built for accessibility — works on any laptop or phone with a webcam" },
  ];

  const steps = [
    { number: "01", icon: "📷", title: "Open the app", desc: "Click 'Start Camera' and allow webcam access. No setup needed." },
    { number: "02", icon: "🤟", title: "Show a gesture", desc: "Hold a sign language gesture in front of your webcam clearly." },
    { number: "03", icon: "🔊", title: "Hear the phrase", desc: "Palmelo detects your gesture and speaks the phrase out loud instantly." },
  ];

  const team = [
    { name: "Vidhi", role: "AI & Full Stack Developer", emoji: "👩‍💻", color: "#e8f5e9" },
  ];

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-logo">🤟 Palmelo</div>
        <div className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#team">Team</a>
          <button className="nav-cta" onClick={() => navigate("/app")}>
            Launch App <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-blob blob1" />
        <div className="hero-blob blob2" />
        <div className="hero-content">
          <motion.div className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}>
            🏆 AI for Social Good · Hackathon 2026
          </motion.div>

          <motion.h1 className="hero-title"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            Breaking barriers with <span className="highlight">sign language</span>
          </motion.h1>

          <motion.p className="hero-sub"
            variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            Palmelo uses AI + computer vision to translate hand gestures into speech in real time —
            making communication inclusive for 70 million+ deaf and hard-of-hearing people.
          </motion.p>

          <motion.div className="hero-btns"
            variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <button className="btn-hero-primary" onClick={() => navigate("/app")}>
              Try it live <ChevronRight size={16} />
            </button>
            <a href="#how" className="btn-hero-secondary">See how it works</a>
          </motion.div>

          <motion.div className="hero-stats"
            variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <div className="stat">
              <span className="stat-num">70M+</span>
              <span className="stat-label">Sign language users</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">100%</span>
              <span className="stat-label">Model accuracy</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">₹0</span>
              <span className="stat-label">Prototype cost</span>
            </div>
          </motion.div>
        </div>

        <motion.div className="hero-visual"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}>
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="mockup-cam">📷</div>
              <div className="mockup-gesture">🤟</div>
              <div className="mockup-label">Hello there!</div>
              <div className="mockup-bar">
                <div className="mockup-bar-fill" />
              </div>
              <div className="mockup-conf">98% confidence</div>
              <div className="mockup-chat">
                <div className="mockup-bubble right">Hello there! 🤟</div>
                <div className="mockup-bubble left">Hi! How are you?</div>
                <div className="mockup-bubble right">I need help! 🤟</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="how-section" id="how">
        <motion.div className="section-header"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="section-tag">Simple & fast</span>
          <h2>How it works</h2>
          <p>Three steps to seamless communication</p>
        </motion.div>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <motion.div key={i} className="step-card"
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }} custom={i}>
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < steps.length - 1 && <div className="step-arrow">→</div>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <motion.div className="section-header"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="section-tag">What we offer</span>
          <h2>Everything you need</h2>
          <p>Built for real-world communication</p>
        </motion.div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div key={i} className="feature-card"
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }} custom={i}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="feature-icon" style={{ background: f.color + "22", color: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="team-section" id="team">
        <motion.div className="section-header"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="section-tag">The builder</span>
          <h2>Meet the team</h2>
          <p>Built with ❤️ for social good</p>
        </motion.div>

        <div className="team-grid">
          {team.map((member, i) => (
            <motion.div key={i} className="team-card"
              style={{ background: member.color }}
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }} custom={i}>
              <div className="team-avatar">{member.emoji}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <motion.div className="cta-box"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2>Ready to try Palmelo?</h2>
          <p>No downloads, no hardware — just your webcam</p>
          <button className="btn-hero-primary" onClick={() => navigate("/app")}>
            Launch App <ChevronRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <span>🤟 Palmelo · Built for AI for Social Good Hackathon 2026</span>
      </footer>
    </div>
  );
}