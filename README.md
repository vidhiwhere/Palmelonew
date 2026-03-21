# 🤟 Palmelo — Real-time Sign Language to Speech Translator

> **AI for Social Good · CodeSangram Hackathon 2026 · Poornima University**

Palmelo is a full-stack web application that uses computer vision and machine learning to translate hand gestures into spoken words in real time — making communication inclusive for 70 million+ deaf and hard-of-hearing people worldwide.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-palmelonew.vercel.app-00b894?style=for-the-badge)](https://palmelonew.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-vidhiwhere%2FPalmelonew-1a1a2e?style=for-the-badge&logo=github)](https://github.com/vidhiwhere/Palmelonew)

> ⚠️ **Important Note:** The Python backend (gesture detection) is **NOT deployed** on any cloud server due to MediaPipe compatibility issues with cloud Linux environments. To use gesture detection, you must run the backend locally. The frontend (homepage, login, chat, learn, profile) works fully on the live Vercel URL without the backend.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running Locally](#-running-locally)
- [Supported Gestures](#-supported-gestures)
- [Firebase Setup](#-firebase-setup)
- [ML Model Training](#-ml-model-training)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Application Routes](#-application-routes)
- [Common Issues & Fixes](#-common-issues--fixes)
- [Cost Analysis](#-cost-analysis)
- [Future Scope](#-future-scope)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤟 Real-time Gesture Detection | Webcam captures hand gestures; MediaPipe detects 21 landmarks per hand |
| 🔊 Multilingual Speech Output | Detected gestures spoken aloud in English and Hindi |
| 🚨 SOS Emergency Alert | Both hands visible triggers instant emergency alarm |
| 💬 Private Real-time Messaging | WhatsApp-style chat with typing indicators and read receipts |
| 📚 Sign Language Learning | 100+ interactive flip cards across 11 categories with quiz |
| 🔐 User Authentication | Firebase Auth with email/password and Google OAuth |
| 👤 User Profile | Editable profile with gesture stats and progress tracking |
| 🌐 Multilingual | English and Hindi support |
| 📱 Responsive Design | Works on desktop and mobile browsers |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| Framer Motion | 11.x | Animations and transitions |
| React Router DOM | 6.x | Client-side routing |
| Firebase SDK | 10.x | Auth, Realtime DB |
| Lucide React | 0.383.x | Icons |
| Emoji Picker React | 4.x | Emoji picker in chat |
| TensorFlow.js | Latest | In-browser hand detection (future) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10 – 3.11 | Backend language |
| FastAPI | Latest | REST API framework |
| Uvicorn | Latest | ASGI server |
| MediaPipe | 0.10.9 | Hand landmark detection |
| OpenCV | 4.8.x | Video capture and image processing |
| Scikit-learn | 1.7.2 | SVM gesture classifier |
| NumPy | Latest | Numerical computation |
| gTTS | Latest | Text-to-speech (Streamlit version) |
| Pygame | Latest | Audio playback (Streamlit version) |
| Firebase Admin | Latest | Firebase server SDK |

### Infrastructure
| Service | Status | Purpose |
|---|---|---|
| Firebase Realtime Database | ✅ Live | Real-time messaging and user data |
| Firebase Authentication | ✅ Live | User login with Google OAuth |
| Vercel | ✅ Live | Frontend deployment |
| Backend (FastAPI) | ⚠️ Local only | Gesture detection — NOT deployed |
| GitHub | ✅ Live | Version control |

---

## 📁 Project Structure

```
Palmelonew/
├── palmelo/                          # Python backend
│   ├── app/
│   │   ├── app.py                    # Streamlit UI (alternative frontend)
│   │   └── firebase_chat.py          # Firebase chat helper
│   ├── data/
│   │   └── gestures.csv              # Training data (21 landmarks × 2 hands)
│   ├── models/
│   │   └── gesture_model.pkl         # Trained SVM model
│   ├── backend.py                    # FastAPI backend
│   ├── collect_data.py               # Gesture data collection script
│   ├── train_model.py                # Model training script
│   ├── test_cam.py                   # Webcam test
│   ├── test_hands.py                 # Hand detection test
│   ├── test_model.py                 # Gesture recognition test
│   ├── test_sos.py                   # SOS alert test
│   ├── test_speech.py                # Speech output test
│   ├── fix_data.py                   # Re-record specific gestures
│   ├── firebase_key.json             # Firebase service account (NOT in git)
│   ├── requirements.txt              # Python dependencies
│   └── venv/                         # Python virtual environment
│
├── palmelo-frontend/                 # React frontend
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.png              # Palmelo logo
│   │   ├── App.jsx                   # Main gesture detection page
│   │   ├── App.css                   # Main app styles
│   │   ├── AuthContext.jsx           # Firebase auth context
│   │   ├── Chat.jsx                  # Private messaging page
│   │   ├── Chat.css                  # Chat styles
│   │   ├── firebase.js               # Firebase configuration
│   │   ├── Home.jsx                  # Landing page
│   │   ├── Home.css                  # Landing page styles
│   │   ├── Learn.jsx                 # Sign language learning page
│   │   ├── Learn.css                 # Learning page styles
│   │   ├── Login.jsx                 # Authentication page
│   │   ├── Login.css                 # Login styles
│   │   ├── main.jsx                  # App entry point with routes
│   │   ├── Profile.jsx               # User profile page
│   │   ├── Profile.css               # Profile styles
│   │   ├── ProtectedRoute.jsx        # Auth guard for protected routes
│   │   └── index.css                 # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ✅ Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Python | 3.10 – 3.11 | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Comes with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| Webcam | Any | Built-in or USB |

> ⚠️ **Important:** Python 3.12+ is NOT supported — MediaPipe requires Python 3.10 or 3.11.

Check your versions:
```bash
python --version      # Should be 3.10.x or 3.11.x
node --version        # Should be 18.x or higher
npm --version         # Should be 9.x or higher
```

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/vidhiwhere/Palmelonew.git
cd Palmelonew
```

### Step 2 — Backend Setup (Python)

```bash
# Navigate to the backend folder
cd palmelo

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

> 💡 If `requirements.txt` is missing, install manually:
```bash
pip install fastapi uvicorn opencv-python mediapipe==0.10.9 scikit-learn==1.7.2 numpy python-multipart gtts pygame streamlit firebase-admin pyttsx3 pandas protobuf==3.20.3
```

### Step 3 — Frontend Setup (React)

```bash
# Navigate to frontend folder
cd ../palmelo-frontend

# Install all Node dependencies
npm install
```

### Step 4 — Firebase Setup

See the [Firebase Setup](#-firebase-setup) section below.

---

## 🏃 Running Locally

You need **2 terminals** running simultaneously:

### Terminal 1 — Start the Python Backend

```bash
cd Palmelonew/palmelo
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

uvicorn backend:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Verify: open `http://localhost:8000/health` → should show `{"status":"ok"}`

### Terminal 2 — Start the React Frontend

```bash
cd Palmelonew/palmelo-frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Open the App

Open your browser and go to: **`http://localhost:5173`**

> ⚠️ **Important:** Make sure `App.jsx` has the backend URL set to localhost:
> ```javascript
> const res = await fetch("http://localhost:8000/detect", {
> ```

---

## 🤟 Supported Gestures

| Gesture Name | Hand Sign | English Phrase | Hindi Phrase |
|---|---|---|---|
| hello | Open palm, wave | Hello there! | नमस्ते! |
| yes | Thumbs up | Yes! | हाँ! |
| no | Index finger up | No! | नहीं! |
| thankyou | Flat hand from chin | Thank you! | धन्यवाद! |
| help | Fist on flat palm | I need help! | मुझे मदद चाहिए! |
| stop | Flat palm facing camera | Please stop! | रुकिए! |
| goodmorning | Hand rises upward | Good morning! | सुप्रभात! |
| hungry | C hand slides down chest | I am hungry! | मुझे भूख लगी है! |
| water | W hand taps chin | I need water! | मुझे पानी चाहिए! |
| sorry | Fist circles on chest | I am sorry! | माफ़ कीजिए! |
| please | Flat hand circles chest | Please! | कृपया! |
| iloveyou | Thumb + index + pinky out | I love you! | मैं तुमसे प्यार करता हूँ! |
| **SOS** | **Both hands visible** | **🚨 Emergency Alert!** | **🚨 आपातकालीन!** |

---

## 🔥 Firebase Setup

1. Go to [firebase.google.com](https://firebase.google.com) and create a project named **Palmelo**
2. Enable **Realtime Database** → Start in test mode
3. Enable **Authentication** → Email/Password + Google
4. Go to Project Settings → Service Accounts → Generate new private key
5. Save the downloaded JSON file as `palmelo/firebase_key.json`
6. Go to Project Settings → Your Apps → Web App → copy the config

Update `palmelo-frontend/src/firebase.js` with your config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Set Firebase Realtime Database rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "messages": { ".indexOn": ["timestamp"] },
    "users": { ".indexOn": ["email"] },
    "chats": { ".indexOn": ["timestamp"] },
    "typing": { ".indexOn": ["timestamp"] }
  }
}
```

---

## 🧠 ML Model Training

If you want to retrain the model with your own gestures:

### Step 1 — Collect gesture data
```bash
cd palmelo
venv\Scripts\activate
python collect_data.py
```
- Press **SPACE** to start recording each gesture
- Each gesture collects 120 samples
- Data saved to `data/gestures.csv`

### Step 2 — Train the model
```bash
python train_model.py
```
- Saves model to `models/gesture_model.pkl`

### Step 3 — Test the model live
```bash
python test_model.py
```

### Model Details
| Parameter | Value |
|---|---|
| Algorithm | SVM (RBF Kernel) |
| Features | 84 (2 hands × 21 landmarks × x,y) |
| Training samples | 1,440 (120 per gesture × 12 gestures) |
| Train/Test split | 80% / 20% |
| Accuracy | 98% |
| Model size | ~50KB |

---

## 📡 API Reference

Base URL (local only): `http://localhost:8000`

> ⚠️ Backend is NOT deployed. Run locally using instructions above.

### POST `/detect`
Detect gesture from a webcam frame image.

**Request:**
```
Content-Type: multipart/form-data
Body: file (image/jpeg)
```

**Response:**
```json
{
  "detected": true,
  "gesture": "hello",
  "phrase": "Hello there!",
  "confidence": 98.5,
  "hands": 1
}
```

### POST `/classify`
Classify gesture from pre-extracted landmarks.

**Request:**
```json
{
  "landmarks": [0.123, 0.456, ...] // 84 float values
}
```

**Response:**
```json
{
  "detected": true,
  "gesture": "yes",
  "phrase": "Yes!",
  "confidence": 97.2
}
```

### GET `/health`
```json
{ "status": "ok" }
```

---

## 🌍 Deployment

### Frontend — Vercel ✅ Live
**URL:** https://palmelonew.vercel.app

```bash
cd palmelo-frontend
npm run build
# Connect GitHub repo to Vercel for auto-deploy
```

### Backend — ⚠️ NOT Deployed (Local Only)

> The Python backend is **NOT currently deployed** on any cloud server.
>
> **Reason:** MediaPipe's `solutions` API is incompatible with Python 3.14 on Render's free tier Linux environment. Every deployment attempt failed with:
> ```
> AttributeError: module 'mediapipe' has no attribute 'solutions'
> ```
>
> **Workaround:** Run the backend locally using the steps in [Running Locally](#-running-locally).
>
> **Future Plan:** Migrate gesture detection entirely to the browser using TensorFlow.js HandPose Detection — eliminating the need for a Python backend completely.

To run locally and connect to frontend:
```bash
# Terminal 1 - Backend
cd palmelo
venv\Scripts\activate
uvicorn backend:app --reload --port 8000

# In App.jsx - use localhost URL
const res = await fetch("http://localhost:8000/detect", {
```

---

## 🗺 Application Routes

| Route | Page | Auth Required | Works Without Backend |
|---|---|---|---|
| `/` | Homepage | ❌ No | ✅ Yes |
| `/login` | Login / Sign Up | ❌ No | ✅ Yes |
| `/app` | Gesture Detection | ✅ Yes | ❌ No (needs local backend) |
| `/chat` | Private Messaging | ✅ Yes | ✅ Yes |
| `/learn` | Sign Language Learning | ✅ Yes | ✅ Yes |
| `/profile` | User Profile | ✅ Yes | ✅ Yes |

---

## 🐛 Common Issues & Fixes

### MediaPipe `solutions` error
```
AttributeError: module 'mediapipe' has no attribute 'solutions'
```
```bash
pip uninstall mediapipe -y
pip install mediapipe==0.10.9
```

### OpenCV not found
```
ModuleNotFoundError: No module named 'cv2'
```
```bash
pip install opencv-python
```

### Protobuf error
```
AttributeError: 'SymbolDatabase' object has no attribute 'GetPrototype'
```
```bash
pip install protobuf==3.20.3
```

### Webcam not detected
Allow camera permissions in your browser settings.

### Backend CORS error
Make sure `backend.py` has CORS middleware configured for all origins.

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Gesture detection not working on live site
Backend is not deployed. Run locally and update `App.jsx` URL to `http://localhost:8000`.

---

## 📊 Cost Analysis

| Stage | Description | Cost |
|---|---|---|
| Prototype (Hackathon) | Current build — all open source | ₹0 – ₹1,000 |
| Pilot (College/NGO) | Cloud deploy + more gestures | ₹8,000 – ₹15,000 |
| Scaled Public Rollout | Production + mobile app | ₹10,000 – ₹20,000/month |

---

## 🔮 Future Scope

- [ ] Indian Sign Language (ISL) support
- [ ] Mobile app (React Native) for iOS and Android
- [ ] Migrate gesture detection to TensorFlow.js (no backend needed)
- [ ] Bidirectional mode — sign avatar for non-signers
- [ ] 100+ gestures covering all daily scenarios
- [ ] Offline mode — on-device model inference
- [ ] WebRTC video call integration
- [ ] Badge and gamification system
- [ ] Hospital and school API integration
- [ ] Raspberry Pi / edge device deployment

---

## 👩‍💻 Developer

**Vidhi Kumari**
- GitHub: [@vidhiwhere](https://github.com/vidhiwhere)
- Email: vidhikumari6025@gmail.com

---

## 🙏 Acknowledgements

- [MediaPipe](https://mediapipe.dev) — Hand landmark detection
- [Firebase](https://firebase.google.com) — Real-time database and authentication
- [Scikit-learn](https://scikit-learn.org) — Machine learning library
- [FastAPI](https://fastapi.tiangolo.com) — Python web framework
- [React](https://react.dev) — Frontend framework
- [Vercel](https://vercel.com) — Frontend hosting
- [Framer Motion](https://www.framer.com/motion) — Animation library

---

<div align="center">
  <strong>🤟 Palmelo — Your hands have a voice.</strong><br>
  Built with ❤️ for AI for Social Good · Hackathon 2026
</div>
