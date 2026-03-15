import streamlit as st
import cv2
import mediapipe as mp
import pickle
from gtts import gTTS
import pygame
import time
import winsound
from datetime import datetime
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__)))
from firebase_chat import send_message, get_messages

st.set_page_config(page_title="Palmelo", page_icon="🤟", layout="wide")

st.markdown("""
<style>
    /* Global */
    html, body, [data-testid="stAppViewContainer"] {
        background-color: #f8f9fa;
        font-family: 'Segoe UI', sans-serif;
    }
    [data-testid="stSidebar"] { background-color: #ffffff; }
    
    /* Hide streamlit branding */
    #MainMenu, footer, header { visibility: hidden; }

    /* Top navbar */
    .navbar {
        background: #ffffff;
        border-bottom: 1px solid #e9ecef;
        padding: 16px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        border-radius: 0 0 12px 12px;
    }
    .navbar-logo {
        font-size: 1.6rem;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: -0.5px;
    }
    .navbar-logo span { color: #00b894; }
    .navbar-sub {
        font-size: 0.85rem;
        color: #868e96;
    }
    .status-dot {
        width: 8px; height: 8px;
        background: #00b894;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
    }

    /* Cards */
    .card {
        background: #ffffff;
        border-radius: 16px;
        padding: 20px;
        border: 1px solid #e9ecef;
        margin-bottom: 16px;
    }
    .card-title {
        font-size: 0.75rem;
        font-weight: 600;
        color: #868e96;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 12px;
    }

    /* Gesture display */
    .gesture-display {
        background: #f0fdf8;
        border: 2px solid #00b894;
        border-radius: 16px;
        padding: 24px;
        text-align: center;
    }
    .gesture-name {
        font-size: 2rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 4px;
    }
    .gesture-phrase {
        font-size: 1rem;
        color: #00b894;
        font-weight: 500;
    }

    /* SOS */
    .sos-card {
        background: #fff5f5;
        border: 2px solid #ff6b6b;
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        color: #ff6b6b;
        font-weight: 700;
        font-size: 1.2rem;
    }
    .clear-card {
        background: #f0fdf8;
        border: 1px solid #00b894;
        border-radius: 16px;
        padding: 12px 20px;
        text-align: center;
        color: #00b894;
        font-weight: 500;
        font-size: 0.9rem;
    }

    /* Spoken */
    .spoken-card {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 14px 18px;
        border-left: 4px solid #00b894;
        color: #1a1a1a;
        font-size: 1rem;
        font-weight: 500;
    }

    /* Chat */
    .chat-header {
        background: #ffffff;
        border-radius: 16px 16px 0 0;
        padding: 14px 20px;
        border: 1px solid #e9ecef;
        border-bottom: none;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .chat-avatar {
        width: 36px; height: 36px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.85rem;
    }
    .av-signer { background: #00b894; color: #fff; }
    .av-reply  { background: #4c6ef5; color: #fff; }
    .chat-wrapper {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-top: none;
        border-bottom: none;
        padding: 16px;
        height: 360px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .bubble-right {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        gap: 8px;
    }
    .bubble-right .bubble {
        background: #00b894;
        color: #ffffff;
        border-radius: 18px 18px 4px 18px;
        padding: 10px 16px;
        max-width: 65%;
        font-size: 0.92rem;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0,184,148,0.15);
    }
    .bubble-left {
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 8px;
    }
    .bubble-left .bubble {
        background: #ffffff;
        color: #1a1a1a;
        border-radius: 18px 18px 18px 4px;
        padding: 10px 16px;
        max-width: 65%;
        font-size: 0.92rem;
        border: 1px solid #e9ecef;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .bubble-sos {
        display: flex;
        justify-content: center;
    }
    .bubble-sos .bubble {
        background: #fff5f5;
        color: #ff6b6b;
        border: 1px solid #ff6b6b;
        border-radius: 18px;
        padding: 10px 20px;
        font-weight: 700;
        text-align: center;
    }
    .chat-time {
        font-size: 0.68rem;
        color: #adb5bd;
        margin-top: 3px;
        text-align: right;
    }
    .chat-time-left {
        font-size: 0.68rem;
        color: #adb5bd;
        margin-top: 3px;
    }
    .chat-footer {
        background: #ffffff;
        border-radius: 0 0 16px 16px;
        padding: 12px 16px;
        border: 1px solid #e9ecef;
        border-top: 1px solid #f1f3f5;
    }
    .no-messages {
        text-align: center;
        color: #adb5bd;
        font-size: 0.9rem;
        margin-top: 40px;
    }

    /* Buttons */
    .stButton button {
        border-radius: 10px !important;
        font-weight: 600 !important;
        font-size: 0.9rem !important;
    }

    /* Select box */
    .stSelectbox label { color: #868e96 !important; font-size: 0.8rem !important; }
</style>
""", unsafe_allow_html=True)

# Navbar
st.markdown("""
<div class="navbar">
    <div>
        <div class="navbar-logo">🤟 <span>Palmelo</span></div>
        <div class="navbar-sub">Sign Language to Speech Translator</div>
    </div>
    <div style="font-size:0.85rem;color:#868e96">
        <span class="status-dot"></span>AI Powered · MediaPipe + SVM
    </div>
</div>
""", unsafe_allow_html=True)

lang = st.selectbox("Output Language", ["English", "Hindi"])
lang_code = "en" if lang == "English" else "hi"

PHRASES = {
    "en": {
        "hello": "Hello there!",
        "yes": "Yes!",
        "no": "No!",
        "thankyou": "Thank you!",
        "help": "I need help!"
    },
    "hi": {
        "hello": "नमस्ते!",
        "yes": "हाँ!",
        "no": "नहीं!",
        "thankyou": "धन्यवाद!",
        "help": "मुझे मदद चाहिए!"
    }
}

@st.cache_resource
def load_model():
    with open("models/gesture_model.pkl", "rb") as f:
        return pickle.load(f)

model = load_model()
pygame.mixer.init()

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

def render_chat():
    messages = get_messages()
    if not messages:
        return '<div class="chat-wrapper"><div class="no-messages">💬 No messages yet — start signing!</div></div>'
    html = '<div class="chat-wrapper">'
    for msg in messages:
        t = datetime.fromtimestamp(msg.get('timestamp', 0) / 1000).strftime("%H:%M") if msg.get('timestamp') else ""
        if msg.get('sos'):
            html += f'''<div class="bubble-sos"><div>
                <div class="bubble">🚨 SOS ALERT — Emergency!</div>
                <div class="chat-time">{t}</div>
            </div></div>'''
        elif msg.get('sender') == 'signer':
            html += f'''<div class="bubble-right">
                <div>
                    <div class="bubble">🤟 {msg["message"]}</div>
                    <div class="chat-time">{t}</div>
                </div>
                <div class="chat-avatar av-signer">V</div>
            </div>'''
        else:
            html += f'''<div class="bubble-left">
                <div class="chat-avatar av-reply">R</div>
                <div>
                    <div class="bubble">{msg["message"]}</div>
                    <div class="chat-time-left">{t}</div>
                </div>
            </div>'''
    html += '</div>'
    return html

# Main layout
col1, col2 = st.columns([3, 2])

with col1:
    st.markdown('<div class="card-title">📷 Live Camera</div>', unsafe_allow_html=True)
    frame_placeholder = st.empty()

with col2:
    st.markdown('<div class="card-title">💬 Detected Gesture</div>', unsafe_allow_html=True)
    phrase_placeholder = st.empty()
    phrase_placeholder.markdown('<div class="gesture-display"><div class="gesture-name">—</div><div class="gesture-phrase">Waiting for gesture...</div></div>', unsafe_allow_html=True)

    st.markdown('<div style="margin-top:16px" class="card-title">🔊 Last Spoken</div>', unsafe_allow_html=True)
    spoken_placeholder = st.empty()
    spoken_placeholder.markdown('<div class="spoken-card">Nothing spoken yet</div>', unsafe_allow_html=True)

    st.markdown('<div style="margin-top:16px" class="card-title">🚨 SOS Status</div>', unsafe_allow_html=True)
    sos_placeholder = st.empty()
    sos_placeholder.markdown('<div class="clear-card">✅ All clear</div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Chat section
st.markdown("""
<div class="chat-header">
    <div class="chat-avatar av-signer">V</div>
    <div>
        <div style="font-weight:600;color:#1a1a1a;font-size:0.95rem">Palmelo Chat</div>
        <div style="color:#00b894;font-size:0.75rem">🟢 Live via Firebase</div>
    </div>
</div>
""", unsafe_allow_html=True)

chat_placeholder = st.empty()
chat_placeholder.markdown(render_chat(), unsafe_allow_html=True)

st.markdown('<div class="chat-footer">', unsafe_allow_html=True)
reply_col, send_col, refresh_col = st.columns([5, 1, 1])
with reply_col:
    reply_text = st.text_input("", placeholder="Type a reply...",
                               label_visibility="collapsed", key="reply_box")
with send_col:
    if st.button("Send 💬", use_container_width=True):
        if reply_text.strip():
            send_message("reply", reply_text.strip())
            chat_placeholder.markdown(render_chat(), unsafe_allow_html=True)
with refresh_col:
    if st.button("🔄", use_container_width=True):
        chat_placeholder.markdown(render_chat(), unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)
btn_col1, btn_col2 = st.columns(2)
with btn_col1:
    start = st.button("▶ Start Camera", type="primary", use_container_width=True)
with btn_col2:
    stop = st.button("⏹ Stop Camera", use_container_width=True)

def speak(phrase, lang_code):
    try:
        pygame.mixer.music.stop()
        pygame.mixer.music.unload()
        time.sleep(0.1)
        tts = gTTS(text=phrase, lang=lang_code)
        tts.save("temp_audio.mp3")
        pygame.mixer.music.load("temp_audio.mp3")
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
    except Exception as e:
        print(f"Audio error: {e}")

if start:
    cap = cv2.VideoCapture(0)
    last_spoken = ""
    last_time = 0
    cooldown = 3

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        if result.multi_hand_landmarks:
            if len(result.multi_hand_landmarks) == 2:
                overlay = frame.copy()
                cv2.rectangle(overlay, (0, 0), (frame.shape[1], frame.shape[0]), (0, 100, 80), -1)
                cv2.addWeighted(overlay, 0.4, frame, 0.6, 0, frame)
                cv2.putText(frame, "SOS ALERT!", (80, 200),
                            cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 100, 100), 6)

                sos_placeholder.markdown('<div class="sos-card">🚨 SOS ALERT! Emergency triggered!</div>', unsafe_allow_html=True)
                phrase_placeholder.markdown('<div class="sos-card">🚨 EMERGENCY!</div>', unsafe_allow_html=True)
                spoken_placeholder.markdown('<div class="spoken-card">🚨 SOS triggered!</div>', unsafe_allow_html=True)

                send_message("signer", "SOS ALERT!", is_sos=True)
                chat_placeholder.markdown(render_chat(), unsafe_allow_html=True)

                frame_placeholder.image(frame, channels="RGB", use_container_width=True)
                winsound.Beep(1000, 500)
                time.sleep(2)
                continue

            else:
                sos_placeholder.markdown('<div class="clear-card">✅ All clear</div>', unsafe_allow_html=True)
                lm = result.multi_hand_landmarks[0].landmark
                row = [val for p in lm for val in (p.x, p.y)]
                prediction = model.predict([row])[0]
                confidence = max(model.predict_proba([row])[0]) * 100
                phrase = PHRASES[lang_code].get(prediction, prediction)

                phrase_placeholder.markdown(f'''
                    <div class="gesture-display">
                        <div class="gesture-name">{prediction}</div>
                        <div class="gesture-phrase">{phrase}</div>
                        <div style="font-size:0.75rem;color:#adb5bd;margin-top:8px">
                            Confidence: {confidence:.1f}%
                        </div>
                    </div>''', unsafe_allow_html=True)

                if prediction != last_spoken or time.time() - last_time > cooldown:
                    speak(phrase, lang_code)
                    spoken_placeholder.markdown(f'<div class="spoken-card">🔊 {phrase}</div>', unsafe_allow_html=True)
                    send_message("signer", phrase)
                    chat_placeholder.markdown(render_chat(), unsafe_allow_html=True)
                    last_spoken = prediction
                    last_time = time.time()

            for hand_landmarks in result.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        frame_placeholder.image(frame, channels="RGB", use_container_width=True)

        if stop:
            break

    cap.release()