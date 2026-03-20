import cv2
import mediapipe as mp
import csv
import os

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

GESTURES = [
    "hello", "yes", "no", "thankyou", "help",
    "stop", "goodmorning", "hungry", "water",
    "sorry", "please", "iloveyou"
]

def collect(gesture_name, num_samples=120):
    cap = cv2.VideoCapture(0)
    samples = []
    print(f"\n{'='*40}")
    print(f"GESTURE: {gesture_name.upper()}")
    print(f"{'='*40}")
    recording = False

    while True:
        ret, frame = cap.read()
        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        if recording:
            status = f"RECORDING {len(samples)}/{num_samples}"
            color = (0, 255, 0)
        else:
            status = "Press SPACE to start"
            color = (0, 255, 255)

        cv2.rectangle(frame, (0, 0), (640, 80), (0, 0, 0), -1)
        cv2.putText(frame, f"Gesture: {gesture_name.upper()}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)
        cv2.putText(frame, status, (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        if recording and result.multi_hand_landmarks:
            landmarks = result.multi_hand_landmarks
            # Always use 2 hands — pad with zeros if only 1 hand visible
            row = [gesture_name]
            for hand_idx in range(2):
                if hand_idx < len(landmarks):
                    lm = landmarks[hand_idx].landmark
                    row += [val for p in lm for val in (p.x, p.y)]
                else:
                    row += [0.0] * 42  # pad with zeros if second hand missing
            samples.append(row)
            for hand_landmarks in landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks,
                                       mp_hands.HAND_CONNECTIONS)

        # Progress bar
        if recording:
            progress = int((len(samples) / num_samples) * 600)
            cv2.rectangle(frame, (20, 460), (620, 480), (50, 50, 50), -1)
            cv2.rectangle(frame, (20, 460), (20 + progress, 480), (0, 255, 0), -1)

        cv2.imshow("Collect Data - Palmelo", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord(' ') and not recording:
            recording = True
            print("Recording started!")
        if len(samples) >= num_samples:
            print(f"✅ Done! {num_samples} samples for {gesture_name}")
            break
        if key == ord('q'):
            print("Skipped!")
            break

    cap.release()
    cv2.destroyAllWindows()
    return samples

# Main
os.makedirs("data", exist_ok=True)
all_data = []

# Header — 2 hands × 21 landmarks × 2 (x,y) = 84 values
header = ["label"] + [
    f"h{h}_{'x' if j==0 else 'y'}{i}"
    for h in range(2)
    for i in range(21)
    for j in range(2)
]

print("\n🤟 PALMELO GESTURE COLLECTION — 2 HANDS")
print(f"Total gestures: {len(GESTURES)}")
print("Tips:")
print("- Show one OR both hands depending on the gesture")
print("- Good lighting, hand clearly visible")
print("- Press SPACE when ready\n")

for i, gesture in enumerate(GESTURES):
    print(f"\n[{i+1}/{len(GESTURES)}] Next: {gesture.upper()}")
    input(f"Press ENTER when ready...")
    data = collect(gesture)
    all_data.extend(data)
    print(f"Total samples so far: {len(all_data)}")

with open("data/gestures.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(all_data)

print(f"\n✅ All done! {len(all_data)} samples saved!")
print("Now run: python train_model.py")