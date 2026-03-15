from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import pickle
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("models/gesture_model.pkl", "rb") as f:
    model = pickle.load(f)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

PHRASES = {
    "hello": "Hello there!",
    "yes": "Yes!",
    "no": "No!",
    "thankyou": "Thank you!",
    "help": "I need help!"
}

@app.post("/detect")
async def detect_gesture(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        lm = result.multi_hand_landmarks[0].landmark
        row = [val for p in lm for val in (p.x, p.y)]
        prediction = model.predict([row])[0]
        confidence = float(max(model.predict_proba([row])[0])) * 100
        phrase = PHRASES.get(prediction, prediction)
        return {
            "detected": True,
            "gesture": prediction,
            "phrase": phrase,
            "confidence": round(confidence, 1)
        }

    return {"detected": False, "gesture": "", "phrase": "", "confidence": 0}

@app.get("/health")
def health():
    return {"status": "ok"}