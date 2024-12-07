import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBWh5RwYOPGw7575pQIFjhY6ZM0JHdS93c",
    authDomain: "studentcompanion-200cb.firebaseapp.com",
    projectId: "studentcompanion-200cb",
    storageBucket: "studentcompanion-200cb.appspot.com",
    messagingSenderId: "641420568126",
    appId: "1:641420568126:web:c794da35692312fcc8d36f",
    measurementId: "G-EXY03Y4N8Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore and Storage references
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };