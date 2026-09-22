import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAbnf37tVmhbLeNj7I5j8KEw7_ulrd6uj4",
  authDomain: "help5-d7f86.firebaseapp.com",
  projectId: "help5-d7f86",
  storageBucket: "help5-d7f86.firebasestorage.app",
  messagingSenderId: "199141086604",
  appId: "1:199141086604:web:ee9282d2b17c4e2c9132a9",
  measurementId: "G-BWBCJXZZW0"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
