# 🔥 Firebase Database Migration Guide

## 📋 Overview

This guide provides a complete step-by-step process to migrate your Athena app from Appwrite to Firebase database. The migration includes authentication, database operations, file storage, and real-time features.

## 🚀 Migration Steps

### **Step 1: Install Firebase Dependencies**

```bash
npm install firebase @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/auth
```

### **Step 2: Firebase Console Setup**

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing `athena-8ad1b`
   - Enable Google Analytics (optional)

2. **Enable Services**
   - **Authentication**: Enable Email/Password authentication
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Firebase Storage
   - **Hosting**: Enable hosting (optional)

3. **Configure Security Rules**
   - Upload `firestore.rules` to Firestore Database
   - Upload `storage.rules` to Storage

### **Step 3: Update Configuration Files**

#### **Firebase Config** (`lib/firebase-config.js`)
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "athena-8ad1b.firebaseapp.com",
  projectId: "athena-8ad1b",
  storageBucket: "athena-8ad1b.firebasestorage.app",
  messagingSenderId: "530327553262",
  appId: "1:530327553262:web:317e3eb87c4ef1c63ddfff"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### **Step 4: Database Structure**

#### **Collections Structure**

```javascript
// Users Collection
users/{userId}
{
  name: string,
  email: string,
  role: 'mentor' | 'mentee',
  bio: string,
  skills: string[],
  profilePic: string,
  location: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

// Mentorship Matches
mentorshipMatches/{matchId}
{
  mentorId: string,
  menteeId: string,
  status: 'pending' | 'active' | 'completed' | 'cancelled',
  matchedOn: timestamp,
  fieldsMatchedOn: string[],
  aiScore: number,
  createdAt: timestamp
}

// Mentorship Sessions
mentorshipSessions/{sessionId}
{
  matchId: string,
  scheduledTime: timestamp,
  meetingLink: string,
  status: 'upcoming' | 'completed' | 'cancelled',
  feedbackGiven: boolean,
  createdAt: timestamp
}

// Mentor Availability
mentorAvailability/{slotId}
{
  mentorId: string,
  date: string,
  time: string,
  reserved: boolean,
  createdAt: timestamp
}

// Chat Messages
chatMessages/{messageId}
{
  matchId: string,
  senderId: string,
  body: string,
  timestamp: timestamp
}

// Workshops
workshops/{workshopId}
{
  title: string,
  date: string,
  time: string,
  duration: number,
  skill: string,
  description: string,
  location: string,
  maxParticipants: number,
  registeredUsers: string[],
  createdAt: timestamp
}

// Events
events/{eventId}
{
  title: string,
  date: string,
  time: string,
  endTime: string,
  location: string,
  description: string,
  rsvpCount: number,
  rsvpUsers: string[],
  createdAt: timestamp
}
```

### **Step 5: Code Migration**

#### **Authentication Migration**

**Before (Appwrite):**
```javascript
import { Account } from "react-native-appwrite";
const account = new Account(client);
await account.create(userId, email, password, name);
```

**After (Firebase):**
```javascript
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(userCredential.user, { displayName: name });
```

#### **Database Operations Migration**

**Before (Appwrite):**
```javascript
import { Databases } from "react-native-appwrite";
const database = new Databases(client);
const res = await database.listDocuments(dbId, collectionId, queries);
```

**After (Firebase):**
```javascript
import { collection, getDocs, query, where } from "firebase/firestore";
const q = query(collection(db, "users"), where("role", "==", "mentor"));
const snapshot = await getDocs(q);
const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### **File Storage Migration**

**Before (Appwrite):**
```javascript
import { Storage } from "react-native-appwrite";
const storage = new Storage(client);
const uploaded = await storage.createFile(storageId, fileId, file);
```

**After (Firebase):**
```javascript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
const snapshot = await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(snapshot.ref);
```

### **Step 6: Update Components**

#### **Files to Update:**

1. **Authentication Screens**
   - `app/loginPage.tsx`
   - `app/SignUpScreen.tsx`

2. **Database Operations**
   - `app/MentorDirectoryScreen.tsx`
   - `app/MentorshipRequestsScreen.tsx`
   - `app/MyMentorshipsScreen.tsx`
   - `app/SchedulingScreen.tsx`
   - `app/FeedbackProgressScreen.tsx`
   - `app/ChatScreen.tsx`
   - `app/UnifiedMentorshipScreen.tsx`

3. **File Upload Components**
   - Profile picture upload
   - CV upload
   - Workshop materials

### **Step 7: Real-time Features**

#### **Chat Real-time Updates**

**Before (Appwrite):**
```javascript
const interval = setInterval(fetchMessages, 1000);
```

**After (Firebase):**
```javascript
import { onSnapshot } from "firebase/firestore";
const unsubscribe = onSnapshot(q, (snapshot) => {
  const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setMessages(messages);
});
```

### **Step 8: Testing**

#### **Database Setup Commands**

```bash
# Initialize database with sample data
npm run firebase:setup

# Check database status
npm run firebase:check

# Clear database (for testing)
npm run firebase:clear
```

#### **Testing Checklist**

- [ ] User registration and login
- [ ] Profile creation and updates
- [ ] Mentor directory listing
- [ ] Mentorship request creation
- [ ] Session booking
- [ ] Real-time chat
- [ ] File uploads
- [ ] Workshop registration
- [ ] Event RSVP
- [ ] Feedback submission

## 🔧 Configuration Files

### **Firebase Config** (`lib/firebase-config.js`)
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAzuxYrnDEOujT2jztZiLmH5K8kczjci6o",
  authDomain: "athena-8ad1b.firebaseapp.com",
  projectId: "athena-8ad1b",
  storageBucket: "athena-8ad1b.firebasestorage.app",
  messagingSenderId: "530327553262",
  appId: "1:530327553262:web:317e3eb87c4ef1c63ddfff",
  measurementId: "G-MFMVX4M4EK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

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
```

### **Firebase Service** (`lib/firebaseService.js`)
Complete service layer with all database operations.

### **Security Rules** (`firestore.rules`)
Comprehensive security rules for all collections.

### **Storage Rules** (`storage.rules`)
File upload and access control rules.

## 📊 Migration Benefits

### **Performance Improvements**
- **Real-time Updates**: Native Firestore real-time listeners
- **Offline Support**: Automatic offline data synchronization
- **Scalability**: Google's infrastructure for global scale
- **Caching**: Intelligent caching for better performance

### **Developer Experience**
- **Better Documentation**: Comprehensive Firebase documentation
- **SDK Quality**: Mature and well-maintained SDKs
- **Debugging Tools**: Firebase console for debugging
- **Analytics**: Built-in analytics and monitoring

### **Cost Benefits**
- **Free Tier**: Generous free tier for development
- **Pay-as-you-go**: Only pay for what you use
- **Predictable Pricing**: Clear pricing structure
- **No Server Costs**: No backend server maintenance

## 🚨 Important Notes

### **Data Migration**
- Export existing Appwrite data
- Transform data to Firestore format
- Import data using Firebase Admin SDK
- Verify data integrity

### **Security Considerations**
- Review and test security rules
- Implement proper authentication
- Set up proper file access controls
- Monitor usage and costs

### **Testing Strategy**
- Test all CRUD operations
- Verify real-time features
- Test offline functionality
- Performance testing
- Security testing

## 🔄 Rollback Plan

### **If Migration Fails**
1. Keep Appwrite configuration
2. Revert Firebase changes
3. Update import statements
4. Test existing functionality
5. Plan next migration attempt

### **Gradual Migration**
1. Run both systems in parallel
2. Migrate one feature at a time
3. Test thoroughly before moving to next
4. Monitor performance and errors
5. Complete migration when confident

## 📞 Support

### **Firebase Resources**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Community](https://firebase.google.com/community)

### **Migration Tools**
- Firebase Admin SDK for data migration
- Firebase CLI for deployment
- Firebase Emulator for local development

---

This migration will provide a more robust, scalable, and feature-rich backend for your Athena app! 🔥✨ 