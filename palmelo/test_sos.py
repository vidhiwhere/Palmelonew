import cv2
import mediapipe as mp
import pickle
import os
from gtts import gTTS
import pygame
import time
import winsound

# Phrase dictionary
PHRASES = {
    "hello": "Hello there!",
    "yes": "Yes!",
    "no": "No!",
    "thankyou": "Thank you!",
    "help": "I need help!"
}

with open("models/gesture_model.pkl", "rb") as f:
    model = pickle.load(f)

pygame.mixer.init()

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

cap = cv2.VideoCapture(0)

last_spoken = ""
last_time = 0
cooldown = 3
sos_active = False

def speak(phrase):
    try:
        pygame.mixer.music.stop()
        pygame.mixer.music.unload()
        time.sleep(0.1)
        tts = gTTS(text=phrase, lang='en')
        tts.save("temp_audio.mp3")
        pygame.mixer.music.load("temp_audio.mp3")
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
    except Exception as e:
        print(f"Audio error: {e}")

print("Show gestures! Show BOTH HANDS for SOS! Press Q to quit")

while True:
    ret, frame = cap.read()
    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    label = ""

    if result.multi_hand_landmarks and len(result.multi_hand_landmarks) == 2:
        sos_active = True
        # Full red screen
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (frame.shape[1], frame.shape[0]), (0, 0, 255), -1)
        cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
        # SOS text
        cv2.putText(frame, "SOS ALERT!", (80, 200),
                    cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 255, 255), 6)
        cv2.putText(frame, "EMERGENCY TRIGGERED", (60, 280),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        winsound.Beep(1000, 500)
        print("SOS TRIGGERED!")

    elif result.multi_hand_landmarks and len(result.multi_hand_landmarks) == 1:
        sos_active = False
        lm = result.multi_hand_landmarks[0].landmark
        row = [val for p in lm for val in (p.x, p.y)]
        prediction = model.predict([row])[0]
        confidence = max(model.predict_proba([row])[0]) * 100
        label = prediction

        if prediction != last_spoken or time.time() - last_time > cooldown:
            phrase = PHRASES.get(prediction, prediction)
            speak(phrase)
            last_spoken = prediction
            last_time = time.time()

        mp_draw.draw_landmarks(frame, result.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS)
        cv2.rectangle(frame, (0, 0), (500, 60), (0, 0, 0), -1)
        cv2.putText(frame, f"Gesture: {label} ({confidence:.1f}%)", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    else:
        sos_active = False
        cv2.rectangle(frame, (0, 0), (500, 60), (0, 0, 0), -1)
        cv2.putText(frame, "No hand detected", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Palmelo - SOS Alert", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()