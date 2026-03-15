import streamlit as st
import cv2
import mediapipe as mp
import pickle
from gtts import gTTS
import pygame
import time
import winsound

st.set_page_config(page_title="Palmelo", page_icon="🤟", layout="wide")

st.markdown("""
<style>
    .main { background-color: #0f0f0f; }
    .title { font-size: 3rem; font-weight: 800; color: #00ff88; text-align: center; }
    .subtitle { font-size: 1.2rem; color: #aaaaaa; text-align: center; }
    .phrase-box { background: #1a1a2e; border: 2px solid #00ff88;
                  border-radius: 15px; padding: 20px; text-align: center;
                  font-size: 2rem; color: #ffffff; margin: 10px 0; }
    .sos-box { background: #ff0000; border-radius: 15px; padding: 20px;
               text-align: center; font-size: 2rem; color: #ffffff; }
</style>
""", unsafe_allow_html=True)

st.markdown('<p class="title">🤟 Palmelo</p>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">Real-time Sign Language to Speech Translator</p>', unsafe_allow_html=True)
st.divider()

lang = st.selectbox("🌐 Output Language", ["English", "Hindi"])
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

col1, col2 = st.columns([2, 1])
with col1:
    st.subheader("📷 Live Camera")
    frame_placeholder = st.empty()
with col2:
    st.subheader("💬 Detected Gesture")
    phrase_placeholder = st.empty()
    st.subheader("🔊 Last Spoken")
    spoken_placeholder = st.empty()
    st.subheader("🚨 SOS Status")
    sos_placeholder = st.empty()

start = st.button("▶ Start Camera", type="primary", use_container_width=True)
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
                # SOS — draw red overlay on frame
                overlay = frame.copy()
                cv2.rectangle(overlay, (0, 0), (frame.shape[1], frame.shape[0]), (0, 0, 255), -1)
                cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)
                cv2.putText(frame, "SOS ALERT!", (80, 200),
                            cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 255, 255), 6)

                # Update all placeholders
                sos_placeholder.markdown('<div class="sos-box">🚨 SOS ALERT!</div>', unsafe_allow_html=True)
                phrase_placeholder.markdown('<div class="sos-box">🚨 EMERGENCY!</div>', unsafe_allow_html=True)
                spoken_placeholder.markdown("🚨 **SOS triggered!**")

                # Show frame first then beep
                frame_placeholder.image(frame, channels="RGB", use_container_width=True)
                winsound.Beep(1000, 500)
                time.sleep(2)
                continue

            else:
                sos_placeholder.markdown("✅ All clear")
                lm = result.multi_hand_landmarks[0].landmark
                row = [val for p in lm for val in (p.x, p.y)]
                prediction = model.predict([row])[0]
                phrase = PHRASES[lang_code].get(prediction, prediction)

                phrase_placeholder.markdown(
                    f'<div class="phrase-box">🤟 {prediction}<br><small>{phrase}</small></div>',
                    unsafe_allow_html=True
                )

                if prediction != last_spoken or time.time() - last_time > cooldown:
                    speak(phrase, lang_code)
                    spoken_placeholder.markdown(f"🔊 **{phrase}**")
                    last_spoken = prediction
                    last_time = time.time()

            for hand_landmarks in result.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        frame_placeholder.image(frame, channels="RGB", use_container_width=True)

        if stop:
            break

    cap.release()