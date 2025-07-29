// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzuxYrnDEOujT2jztZiLmH5K8kczjci6o",
  authDomain: "athena-8ad1b.firebaseapp.com",
  projectId: "athena-8ad1b",
  storageBucket: "athena-8ad1b.firebasestorage.app",
  messagingSenderId: "530327553262",
  appId: "1:530327553262:web:317e3eb87c4ef1c63ddfff",
  measurementId: "G-MFMVX4M4EK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  MENTORSHIP_MATCHES: 'mentorshipMatches',
  MENTORSHIP_SESSIONS: 'mentorshipSessions',
  MENTORSHIP_FEEDBACK: 'mentorshipFeedback',
  MENTOR_AVAILABILITY: 'mentorAvailability',
  CHAT_MESSAGES: 'chatMessages',
  WORKSHOPS: 'workshops',
  EVENTS: 'events',
  COMMUNITIES: 'communities'
};

// Storage paths
export const STORAGE_PATHS = {
  PROFILE_PICS: 'profile-pictures',
  CVS: 'cv-documents',
  WORKSHOP_MATERIALS: 'workshop-materials',
  EVENT_MATERIALS: 'event-materials'
};

export default app;