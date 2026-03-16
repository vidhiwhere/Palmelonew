import { useState, useEffect, useRef } from "react";
import { db, auth } from "./firebase";
import { ref, push, onValue, set } from "firebase/database";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Search, LogOut, User } from "lucide-react";
import "./Chat.css";

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const chatEndRef = useRef(null);

  // Register current user in /users
  useEffect(() => {
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    set(userRef, {
      uid: user.uid,
      name: user.displayName || user.email,
      email: user.email,
      avatar: user.photoURL || "",
      lastSeen: Date.now()
    });
  }, [user]);

  // Fetch all users
  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsub = onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.values(data).filter(u => u.uid !== user?.uid);
        setUsers(list);
      }
    });
    return () => unsub();
  }, [user]);

  const getChatId = (uid1, uid2) => [uid1, uid2].sort().join("_");

  // Listen to messages for selected conversation
  useEffect(() => {
    if (!selectedUser || !user) return;
    const chatId = getChatId(user.uid, selectedUser.uid);
    const msgsRef = ref(db, `chats/${chatId}`);
    const unsub = onValue(msgsRef, (snap) => {
      const data = snap.val();
      if (data) setMessages(Object.values(data).sort((a, b) => a.timestamp - b.timestamp));
      else setMessages([]);
    });
    return () => unsub();
  }, [selectedUser, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;
    const chatId = getChatId(user.uid, selectedUser.uid);
    push(ref(db, `chats/${chatId}`), {
      text: text.trim(),
      sender: user.uid,
      senderName: user.displayName || user.email,
      timestamp: Date.now()
    });
    setText("");
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">🤟 Palmelo</div>

          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.photoURL
                ? <img src={user.photoURL} alt="avatar" />
                : <span>{initials(user?.displayName || user?.email)}</span>
              }
            </div>
            <div className="sidebar-info">
              <div className="sidebar-name">{user?.displayName || "User"}</div>
              <div className="sidebar-email">{user?.email}</div>
            </div>
          </div>

          <div className="sidebar-actions">
            <button onClick={() => navigate("/app")} title="Back to app">
              <ArrowLeft size={15} /> App
            </button>
            <button onClick={() => signOut(auth).then(() => navigate("/login"))} title="Sign out">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="sidebar-search">
          <Search size={14} />
          <input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="sidebar-label">People ({filteredUsers.length})</div>

        <div className="user-list">
          {filteredUsers.length === 0 && (
            <div className="no-users">
              <User size={28} strokeWidth={1.2} />
              <p>No other users yet</p>
              <span>Share the app so others can join!</span>
            </div>
          )}
          {filteredUsers.map((u, i) => (
            <motion.div key={u.uid}
              className={`user-item ${selectedUser?.uid === u.uid ? "active" : ""}`}
              onClick={() => setSelectedUser(u)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}>
              <div className="user-item-avatar">
                {u.avatar
                  ? <img src={u.avatar} alt="avatar" />
                  : <span>{initials(u.name)}</span>
                }
              </div>
              <div className="user-item-info">
                <div className="user-item-name">{u.name}</div>
                <div className="user-item-email">{u.email}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="chat-main">
        {!selectedUser ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">💬</div>
            <h2>Start a conversation</h2>
            <p>Select a person from the left to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat topbar */}
            <div className="chat-topbar">
              <div className="chat-topbar-avatar">
                {selectedUser.avatar
                  ? <img src={selectedUser.avatar} alt="avatar" />
                  : <span>{initials(selectedUser.name)}</span>
                }
              </div>
              <div>
                <div className="chat-topbar-name">{selectedUser.name}</div>
                <div className="chat-topbar-email">{selectedUser.email}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="messages-empty">
                  <p>No messages yet</p>
                  <span>Say hello to {selectedUser.name}! 👋</span>
                </div>
              )}
              <AnimatePresence>
                {messages.map((msg, i) => {
                  const isMe = msg.sender === user.uid;
                  return (
                    <motion.div key={i}
                      className={`msg-row ${isMe ? "me" : "them"}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}>
                      {!isMe && (
                        <div className="msg-avatar them-avatar">
                          {selectedUser.avatar
                            ? <img src={selectedUser.avatar} alt="av" />
                            : <span>{initials(selectedUser.name)}</span>
                          }
                        </div>
                      )}
                      <div className="msg-bubble-wrap">
                        <div className={`msg-bubble ${isMe ? "bubble-me" : "bubble-them"}`}>
                          {msg.text}
                        </div>
                        <div className={`msg-time ${isMe ? "time-right" : "time-left"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                      </div>
                      {isMe && (
                        <div className="msg-avatar me-avatar">
                          {user.photoURL
                            ? <img src={user.photoURL} alt="av" />
                            : <span>{initials(user.displayName || user.email)}</span>
                          }
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-bar">
              <input
                type="text"
                placeholder={`Message ${selectedUser.name}...`}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                autoFocus
              />
              <button onClick={sendMessage} disabled={!text.trim()}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}