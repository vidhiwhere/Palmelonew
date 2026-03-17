import { useState, useEffect, useRef } from "react";
import { db, auth } from "./firebase";
import { ref, push, onValue, set, remove, update } from "firebase/database";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Search, LogOut, Trash2, CornerUpLeft, X, Image, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import "./Chat.css";

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimeout = useRef(null);

  // Register user
  useEffect(() => {
    if (!user) return;
    set(ref(db, `users/${user.uid}`), {
      uid: user.uid,
      name: user.displayName || user.email,
      email: user.email,
      avatar: user.photoURL || "",
      lastSeen: Date.now(),
      online: true
    });
    // Set offline on disconnect
    const onDisconnectRef = ref(db, `users/${user.uid}/online`);
    set(onDisconnectRef, false);
    return () => set(onDisconnectRef, false);
  }, [user]);

  // Fetch all users
  useEffect(() => {
    const unsub = onValue(ref(db, "users"), (snap) => {
      const data = snap.val();
      if (data) setUsers(Object.values(data).filter(u => u.uid !== user?.uid));
    });
    return () => unsub();
  }, [user]);

  const getChatId = (uid1, uid2) => [uid1, uid2].sort().join("_");

  // Listen to messages
  useEffect(() => {
    if (!selectedUser || !user) return;
    const chatId = getChatId(user.uid, selectedUser.uid);
    const unsub = onValue(ref(db, `chats/${chatId}`), (snap) => {
      const data = snap.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);
        // Mark all their messages as read
        msgs.forEach(msg => {
          if (msg.sender !== user.uid && !msg.read) {
            update(ref(db, `chats/${chatId}/${msg.id}`), { read: true });
          }
        });
      } else {
        setMessages([]);
      }
    });
    return () => unsub();
  }, [selectedUser, user]);

  // Listen to typing indicator
  useEffect(() => {
    if (!selectedUser || !user) return;
    const chatId = getChatId(user.uid, selectedUser.uid);
    const unsub = onValue(ref(db, `typing/${chatId}/${selectedUser.uid}`), (snap) => {
      setOtherTyping(snap.val() === true);
    });
    return () => unsub();
  }, [selectedUser, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const handleTyping = (val) => {
    setText(val);
    if (!selectedUser) return;
    const chatId = getChatId(user.uid, selectedUser.uid);
    set(ref(db, `typing/${chatId}/${user.uid}`), true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      set(ref(db, `typing/${chatId}/${user.uid}`), false);
    }, 1500);
  };

  const sendMessage = (imageUrl = null) => {
    if ((!text.trim() && !imageUrl) || !selectedUser) return;
    const chatId = getChatId(user.uid, selectedUser.uid);
    const msg = {
      text: imageUrl ? "" : text.trim(),
      imageUrl: imageUrl || null,
      sender: user.uid,
      senderName: user.displayName || user.email,
      timestamp: Date.now(),
      read: false,
      replyTo: replyTo ? {
        id: replyTo.id,
        text: replyTo.text || "📷 Image",
        senderName: replyTo.senderName
      } : null
    };
    push(ref(db, `chats/${chatId}`), msg);
    setText("");
    setReplyTo(null);
    setShowEmoji(false);
    set(ref(db, `typing/${chatId}/${user.uid}`), false);
  };

  const deleteMessage = (msgId) => {
    if (!selectedUser) return;
    const chatId = getChatId(user.uid, selectedUser.uid);
    remove(ref(db, `chats/${chatId}/${msgId}`));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => sendMessage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const onEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  const filteredMessages = msgSearch
    ? messages.filter(m => m.text?.toLowerCase().includes(msgSearch.toLowerCase()))
    : messages;

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="chat-page" onClick={() => setShowEmoji(false)}>
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
              <div className="online-dot" />
            </div>
            <div className="sidebar-info">
              <div className="sidebar-name">{user?.displayName || "User"}</div>
              <div className="sidebar-status">🟢 Online</div>
            </div>
          </div>
          <div className="sidebar-actions">
            <button onClick={() => navigate("/app")}>
              <ArrowLeft size={15} /> App
            </button>
            <button onClick={() => signOut(auth).then(() => navigate("/login"))}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="sidebar-search">
          <Search size={14} />
          <input placeholder="Search users..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="sidebar-label">People ({filteredUsers.length})</div>

        <div className="user-list">
          {filteredUsers.length === 0 && (
            <div className="no-users">
              <p>No other users yet</p>
              <span>Share the app so others can join!</span>
            </div>
          )}
          {filteredUsers.map((u, i) => (
            <motion.div key={u.uid}
              className={`user-item ${selectedUser?.uid === u.uid ? "active" : ""}`}
              onClick={() => { setSelectedUser(u); setShowMsgSearch(false); setMsgSearch(""); }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}>
              <div className="user-item-avatar">
                {u.avatar ? <img src={u.avatar} alt="avatar" /> : <span>{initials(u.name)}</span>}
                {u.online && <div className="user-online-dot" />}
              </div>
              <div className="user-item-info">
                <div className="user-item-name">{u.name}</div>
                <div className="user-item-email">
                  {u.online ? "🟢 Online" : "⚫ Offline"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="chat-main" onClick={e => e.stopPropagation()}>
        {!selectedUser ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">💬</div>
            <h2>Start a conversation</h2>
            <p>Select a person from the left to start chatting</p>
          </div>
        ) : (
          <>
            {/* Topbar */}
            <div className="chat-topbar">
              <div className="chat-topbar-left">
                <div className="chat-topbar-avatar">
                  {selectedUser.avatar
                    ? <img src={selectedUser.avatar} alt="avatar" />
                    : <span>{initials(selectedUser.name)}</span>
                  }
                  {selectedUser.online && <div className="topbar-online-dot" />}
                </div>
                <div>
                  <div className="chat-topbar-name">{selectedUser.name}</div>
                  <div className="chat-topbar-status">
                    {otherTyping
                      ? <span className="typing-status">typing...</span>
                      : selectedUser.online ? "🟢 Online" : "⚫ Offline"
                    }
                  </div>
                </div>
              </div>
              <button className="topbar-search-btn"
                onClick={() => setShowMsgSearch(s => !s)}>
                <Search size={16} />
              </button>
            </div>

            {/* Message search */}
            <AnimatePresence>
              {showMsgSearch && (
                <motion.div className="msg-search-bar"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}>
                  <Search size={14} />
                  <input placeholder="Search messages..."
                    value={msgSearch}
                    onChange={e => setMsgSearch(e.target.value)}
                    autoFocus />
                  {msgSearch && (
                    <button onClick={() => setMsgSearch("")}><X size={14} /></button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reply preview */}
            <AnimatePresence>
              {replyTo && (
                <motion.div className="reply-preview"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}>
                  <div className="reply-preview-content">
                    <CornerUpLeft size={13} />
                    <div>
                      <span className="reply-name">{replyTo.senderName}</span>
                      <span className="reply-text">{replyTo.text || "📷 Image"}</span>
                    </div>
                  </div>
                  <button onClick={() => setReplyTo(null)}><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="chat-messages">
              {filteredMessages.length === 0 && !msgSearch && (
                <div className="messages-empty">
                  <p>No messages yet</p>
                  <span>Say hello to {selectedUser.name}! 👋</span>
                </div>
              )}
              {filteredMessages.length === 0 && msgSearch && (
                <div className="messages-empty">
                  <p>No messages found for "{msgSearch}"</p>
                </div>
              )}
              <AnimatePresence>
                {filteredMessages.map((msg, i) => {
                  const isMe = msg.sender === user.uid;
                  return (
                    <motion.div key={msg.id || i}
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
                        {/* Reply reference */}
                        {msg.replyTo && (
                          <div className={`reply-ref ${isMe ? "reply-ref-me" : "reply-ref-them"}`}>
                            <CornerUpLeft size={10} />
                            <span className="reply-ref-name">{msg.replyTo.senderName}</span>
                            <span className="reply-ref-text">{msg.replyTo.text}</span>
                          </div>
                        )}

                        <div className={`msg-bubble ${isMe ? "bubble-me" : "bubble-them"}`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="sent"
                              className="msg-image"
                              onClick={() => window.open(msg.imageUrl, "_blank")} />
                          )}
                          {msg.text && <span>{msg.text}</span>}
                        </div>

                        <div className={`msg-meta ${isMe ? "meta-right" : "meta-left"}`}>
                          <span className="msg-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMe && (
                            <span className={`read-receipt ${msg.read ? "read" : ""}`}>
                              {msg.read ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className={`msg-actions ${isMe ? "actions-left" : "actions-right"}`}>
                        <button className="msg-action-btn"
                          onClick={() => setReplyTo(msg)} title="Reply">
                          <CornerUpLeft size={12} />
                        </button>
                        {isMe && (
                          <button className="msg-action-btn delete"
                            onClick={() => deleteMessage(msg.id)} title="Delete">
                            <Trash2 size={12} />
                          </button>
                        )}
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

              {/* Typing indicator */}
              <AnimatePresence>
                {otherTyping && (
                  <motion.div className="typing-indicator"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}>
                    <div className="typing-avatar">
                      {selectedUser.avatar
                        ? <img src={selectedUser.avatar} alt="av" />
                        : <span>{initials(selectedUser.name)}</span>
                      }
                    </div>
                    <div className="typing-bubble">
                      <span /><span /><span />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div className="emoji-picker-wrapper"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={e => e.stopPropagation()}>
                  <EmojiPicker onEmojiClick={onEmojiClick}
                    height={350} width="100%"
                    theme="light" searchDisabled={false} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar */}
            <div className="chat-input-bar" onClick={e => e.stopPropagation()}>
              <button className="input-icon-btn"
                onClick={e => { e.stopPropagation(); setShowEmoji(s => !s); }}
                title="Emoji">
                <Smile size={18} />
              </button>

              <button className="input-icon-btn"
                onClick={() => fileRef.current.click()} title="Send image">
                <Image size={18} />
              </button>
              <input type="file" ref={fileRef} accept="image/*"
                style={{ display: "none" }} onChange={handleImage} />

              <input
                type="text"
                placeholder={`Message ${selectedUser.name}...`}
                value={text}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />

              <button className="send-btn" onClick={() => sendMessage()} disabled={!text.trim()}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}