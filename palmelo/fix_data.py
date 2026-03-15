import cv2
import mediapipe as mp
import csv
import os

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

# Only re-record these
GESTURES = ["hello", "help"]

def collect(gesture_name, num_samples=150):
    cap = cv2.VideoCapture(0)
    samples = []
    print(f"\nGet ready: {gesture_name.upper()}")
    print("Press SPACE to start recording...")
    recording = False

    while True:
        ret, frame = cap.read()
        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        status = f"RECORDING {len(samples)}/{num_samples}" if recording else "Press SPACE to start"
        cv2.putText(frame, f"Gesture: {gesture_name}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        cv2.putText(frame, status, (10, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        if recording and result.multi_hand_landmarks:
            lm = result.multi_hand_landmarks[0].landmark
            row = [gesture_name] + [val for p in lm for val in (p.x, p.y)]
            samples.append(row)
            mp_draw.draw_landmarks(frame, result.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS)

        cv2.imshow("Fix Data", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            recording = True
        if len(samples) >= num_samples:
            print(f"Done! {num_samples} samples for {gesture_name}")
            break
        if key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return samples

# Append to existing CSV
for gesture in GESTURES:
    input(f"\nPress ENTER when ready for: {gesture.upper()}")
    data = collect(gesture)
    with open("data/gestures.csv", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(data)
    print(f"Added {gesture} data to CSV!")

print("\nDone! Now re-run train_model.py")