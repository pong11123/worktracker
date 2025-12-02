import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAIA2YAf6Ffn9JHJmFsoXYMmvCplUsy3_k",
  authDomain: "worktrack-pro-89063.firebaseapp.com",
  projectId: "worktrack-pro-89063",
  storageBucket: "worktrack-pro-89063.firebasestorage.app",
  messagingSenderId: "589773162240",
  appId: "1:589773162240:web:802c8256556f97c9e3d5e5",
  measurementId: "G-272K6DBT51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);