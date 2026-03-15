import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBg9pA2tNtHxJhDXjyNogPZPUjKrq05bWc",
  authDomain: "palmelo-aa37d.firebaseapp.com",
  databaseURL: "https://palmelo-aa37d-default-rtdb.firebaseio.com",
  projectId: "palmelo-aa37d",
  storageBucket: "palmelo-aa37d.firebasestorage.app",
  messagingSenderId: "122378391127",
  appId: "1:122378391127:web:4dbd6fb345ec9f49e99d12"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();