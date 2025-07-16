// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDKxFk9Rf21RNsj9QrD5PwSAfTR7XKQLXY",
  authDomain: "kimdog-modding.firebaseapp.com",
  databaseURL: "https://kimdog-modding-default-rtdb.firebaseio.com",
  projectId: "kimdog-modding",
  storageBucket: "kimdog-modding.appspot.com", // corrected typo
  messagingSenderId: "79168107878",
  appId: "1:79168107878:web:4bd22d9211cc10dca044a7",
  measurementId: "G-G675C4K14H",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);  // NEW export for storage

export { app };