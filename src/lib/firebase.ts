import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJJfKnfK0NYZWbYtgBMEBKr6v-w45Xu2g",
  authDomain: "scary-chat.firebaseapp.com",
  projectId: "scary-chat",
  storageBucket: "scary-chat.firebasestorage.app",
  messagingSenderId: "1093069331868",
  appId: "1:1093069331868:web:2640f09dce98d67203fc59",
  measurementId: "G-R7XRSSDRNW",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
