
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDIVMMLM8oYk9ZwklZtk43apmI84etEw10",
  authDomain: "ubiq-crm-ee9a9.firebaseapp.com",
  projectId: "ubiq-crm-ee9a9",
  storageBucket: "ubiq-crm-ee9a9.firebasestorage.app",
  messagingSenderId: "544030782561",
  appId: "1:544030782561:web:4101f7a8ac47483bfa6620",
  measurementId: "G-5RR1SEL0B5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
