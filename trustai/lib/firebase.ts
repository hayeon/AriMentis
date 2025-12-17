import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";

const fbCfg = {
  apiKey: "AIzaSyBBK0zytfzj-UyuKySF_Qw11YkZONP9lkQ",
  authDomain: "trustai-cc238.firebaseapp.com",
  projectId: "trustai-cc238",
  storageBucket: "trustai-cc238.firebasestorage.app",
  messagingSenderId: "977597508146",
  appId: "1:977597508146:web:3989418c296c21dfa46a2b",
  measurementId: "G-67VZMPHVWF"
};

let app: FirebaseApp | undefined;
let db: Firestore | null = null;
let anly: Analytics | null = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(fbCfg) : getApps()[0];
  db = getFirestore(app);
  anly = getAnalytics(app);
}

export { db, anly };
