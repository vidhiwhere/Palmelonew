import cv2
import mediapipe as mp
import csv
import os

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

# Gestures to record
GESTURES = ["hello", "yes", "no", "thankyou", "help"]

def collect(gesture_name, num_samples=100):
    cap = cv2.VideoCapture(0)
    samples = []
    print(f"\nGet ready to show gesture: {gesture_name.upper()}")
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

        cv2.imshow("Collect Data", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord(' '):
            recording = True
        if len(samples) >= num_samples:
            print(f"Done! Collected {num_samples} samples for {gesture_name}")
            break
        if key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return samples

# Collect all gestures
os.makedirs("data", exist_ok=True)
all_data = []

for gesture in GESTURES:
    input(f"\nPress ENTER when ready to record: {gesture.upper()}")
    data = collect(gesture)
    all_data.extend(data)

# Save to CSV
with open("data/gestures.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["label"] + [f"x{i}" if j==0 else f"y{i}" for i in range(21) for j in range(2)])
    writer.writerows(all_data)

print("\nAll gestures saved to data/gestures.csv!")