import cv2
import mediapipe as mp
import pickle
import numpy as np

# Load model
with open("models/gesture_model.pkl", "rb") as f:
    model = pickle.load(f)

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

cap = cv2.VideoCapture(0)
print("Show a gesture! Press Q to quit")

while True:
    ret, frame = cap.read()
    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    label = "No hand detected"

    if result.multi_hand_landmarks:
        lm = result.multi_hand_landmarks[0].landmark
        row = [val for p in lm for val in (p.x, p.y)]
        prediction = model.predict([row])[0]
        confidence = max(model.predict_proba([row])[0]) * 100
        label = f"{prediction} ({confidence:.1f}%)"
        mp_draw.draw_landmarks(frame, result.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS)

    # Display prediction
    cv2.rectangle(frame, (0, 0), (400, 60), (0, 0, 0), -1)
    cv2.putText(frame, label, (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Palmelo - Gesture Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()