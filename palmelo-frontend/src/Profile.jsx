import { useState } from "react";
import { auth } from "./firebase";
import { signOut, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { motion } from "framer-motion";
import { LogOut, Edit2, Check, X, Hand, MessageCircle, Zap } from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(auth.currentUser, { displayName: newName });
    setSaving(false);
    setEditing(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase();

  return (
    <div className="profile-page">
      <nav className="profile-nav">
        <button className="back-btn" onClick={() => navigate("/app")}>← Back to App</button>
        <div className="profile-nav-logo">🤟 Palmelo</div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={15} /> Sign out
        </button>
      </nav>

      <div className="profile-content">
        <motion.div className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>

          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar">{initials}</div>
            )}
            <div className="profile-badge">🤟</div>
          </div>

          {/* Name */}
          <div className="profile-name-row">
            {editing ? (
              <div className="profile-edit-row">
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  className="profile-name-input" autoFocus />
                <button onClick={handleSave} disabled={saving} className="icon-btn green">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditing(false)} className="icon-btn red">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <h1 className="profile-name">{user?.displayName || "Palmelo User"}</h1>
                <button onClick={() => setEditing(true)} className="icon-btn gray">
                  <Edit2 size={15} />
                </button>
              </>
            )}
          </div>

          <p className="profile-email">{user?.email}</p>
          <div className="profile-joined">
            Joined {new Date(user?.metadata?.creationTime).toLocaleDateString("en-IN", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <Hand size={20} color="#00b894" />
              <span className="stat-val">5</span>
              <span className="stat-lbl">Gestures learned</span>
            </div>
            <div className="profile-stat">
              <MessageCircle size={20} color="#4c6ef5" />
              <span className="stat-val">—</span>
              <span className="stat-lbl">Messages sent</span>
            </div>
            <div className="profile-stat">
              <Zap size={20} color="#FFB347" />
              <span className="stat-val">Active</span>
              <span className="stat-lbl">Status</span>
            </div>
          </div>

          {/* Gestures */}
          <div className="profile-gestures">
            <h3>Gestures you know</h3>
            <div className="gesture-tags">
              {["hello", "yes", "no", "thankyou", "help"].map(g => (
                <span key={g} className="gesture-tag">🤟 {g}</span>
              ))}
            </div>
          </div>

          <button className="launch-btn" onClick={() => navigate("/app")}>
            Launch App →
          </button>
        </motion.div>
      </div>
    </div>
  );
}