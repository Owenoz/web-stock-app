import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config (same as original app)
const firebaseConfig = {
  apiKey: "AIzaSyA7CiM0w89CRZF-o6VQCVeKrEtjrAmdSV8",
  authDomain: "textile-shop-app.firebaseapp.com",
  projectId: "textile-shop-app",
  storageBucket: "textile-shop-app.firebasestorage.app",
  messagingSenderId: "628122484474",
  appId: "1:628122484474:web:c63221e789e65fc2c9d343",
  measurementId: "G-QG2LBCL3ZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
