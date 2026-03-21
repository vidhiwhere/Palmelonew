from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
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

import mediapipe as mp
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.components import containers
from mediapipe.tasks import python

# Download hand landmarker model
import urllib.request
import os

MODEL_PATH = "hand_landmarker.task"
if not os.path.exists(MODEL_PATH):
    print("Downloading hand landmarker model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        MODEL_PATH
    )
    print("Model downloaded!")

base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5
)
detector = vision.HandLandmarker.create_from_options(options)

PHRASES = {
    "hello": "Hello there!",
    "yes": "Yes!",
    "no": "No!",
    "thankyou": "Thank you!",
    "help": "I need help!",
    "stop": "Please stop!",
    "goodmorning": "Good morning!",
    "hungry": "I am hungry!",
    "water": "I need water!",
    "sorry": "I am sorry!",
    "please": "Please!",
    "iloveyou": "I love you!"
}

@app.post("/detect")
async def detect_gesture(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = detector.detect(mp_image)

    if result.hand_landmarks:
        landmarks = result.hand_landmarks
        row = []
        for hand_idx in range(2):
            if hand_idx < len(landmarks):
                lm = landmarks[hand_idx]
                row += [val for p in lm for val in (p.x, p.y)]
            else:
                row += [0.0] * 42

        prediction = model.predict([row])[0]
        confidence = float(max(model.predict_proba([row])[0])) * 100
        phrase = PHRASES.get(prediction, prediction)
        return {
            "detected": True,
            "gesture": prediction,
            "phrase": phrase,
            "confidence": round(confidence, 1),
            "hands": len(landmarks)
        }

    return {"detected": False, "gesture": "", "phrase": "", "confidence": 0, "hands": 0}

@app.get("/health")
def health():
    return {"status": "ok"}
