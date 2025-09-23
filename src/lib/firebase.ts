import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC2Sf5a_eJmMxKD6Gjwr8m0e72GMBHmhQU",
  authDomain: "studio-3984463046-877ea.firebaseapp.com",
  databaseURL: "https://studio-3984463046-877ea-default-rtdb.firebaseio.com",
  projectId: "studio-3984463046-877ea",
  storageBucket: "studio-3984463046-877ea.appspot.com",
  messagingSenderId: "603583251180",
  appId: "1:603583251180:web:eec85f96890a5908b81bc9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, database, firestore, storage };
