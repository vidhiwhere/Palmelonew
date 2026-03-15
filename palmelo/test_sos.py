import cv2
import mediapipe as mp
import pickle
import os
from gtts import gTTS
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

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

cap = cv2.VideoCapture(0)

last_spoken = ""
last_time = 0
cooldown = 3
sos_active = False

print("Show gestures! Show BOTH HANDS for SOS! Press Q to quit")

while True:
    ret, frame = cap.read()
    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    label = ""

    # SOS — both hands visible
    if result.multi_hand_landmarks and len(result.multi_hand_landmarks) == 2:
        sos_active = True
        # Flash red screen
        cv2.rectangle(frame, (0, 0), (frame.shape[1], frame.shape[0]), (0, 0, 255), -1)
        cv2.putText(frame, "SOS ALERT!", (100, 250),
                    cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 255, 255), 5)
        # Beep alarm
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
            tts = gTTS(text=phrase, lang='en')
            tts.save("temp_audio.mp3")
            os.system("start temp_audio.mp3")
            last_spoken = prediction
            last_time = time.time()

        mp_draw.draw_landmarks(frame, result.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS)
        cv2.rectangle(frame, (0, 0), (500, 60), (0, 0, 0), -1)
        cv2.putText(frame, f"Gesture: {label}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    else:
        cv2.rectangle(frame, (0, 0), (500, 60), (0, 0, 0), -1)
        cv2.putText(frame, "No hand detected", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Palmelo - SOS Alert", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()