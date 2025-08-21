// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'sitescribe-v6um9',
  appId: '1:811749818450:web:15e99c80c6767041ac9f8b',
  storageBucket: 'sitescribe-v6um9.firebasestorage.app',
  apiKey: 'AIzaSyCM544iSvibKEpydGfPGbsF4tVm1YsaUuw',
  authDomain: 'sitescribe-v6um9.firebaseapp.com',
  messagingSenderId: '811749818450',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
