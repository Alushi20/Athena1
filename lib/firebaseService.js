import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { db, storage, auth, COLLECTIONS, STORAGE_PATHS } from './firebase-config';

// Authentication Services
export const authService = {
  // Sign up new user
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// User Services
export const userService = {
  // Create user profile
  async createUserProfile(userId, userData) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: userId, ...userData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { id: userId, ...updates };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get users by role
  async getUsersByRole(role) {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('role', '==', role));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Mentorship Services
export const mentorshipService = {
  // Create mentorship match
  async createMentorshipMatch(matchData) {
    try {
      const matchRef = collection(db, COLLECTIONS.MENTORSHIP_MATCHES);
      const docRef = await addDoc(matchRef, {
        ...matchData,
        status: 'pending',
        matchedOn: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...matchData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get mentorship matches for user
  async getMentorshipMatches(userId) {
    try {
      const matchesRef = collection(db, COLLECTIONS.MENTORSHIP_MATCHES);
      const q = query(
        matchesRef,
        where('mentorId', '==', userId),
        orderBy('matchedOn', 'desc')
      );
      const snapshot = await getDocs(q);
      const mentorMatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const q2 = query(
        matchesRef,
        where('menteeId', '==', userId),
        orderBy('matchedOn', 'desc')
      );
      const snapshot2 = await getDocs(q2);
      const menteeMatches = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return [...mentorMatches, ...menteeMatches];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Update mentorship match status
  async updateMentorshipMatch(matchId, updates) {
    try {
      const matchRef = doc(db, COLLECTIONS.MENTORSHIP_MATCHES, matchId);
      await updateDoc(matchRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { id: matchId, ...updates };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Delete mentorship match
  async deleteMentorshipMatch(matchId) {
    try {
      const matchRef = doc(db, COLLECTIONS.MENTORSHIP_MATCHES, matchId);
      await deleteDoc(matchRef);
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Session Services
export const sessionService = {
  // Create mentorship session
  async createMentorshipSession(sessionData) {
    try {
      const sessionRef = collection(db, COLLECTIONS.MENTORSHIP_SESSIONS);
      const docRef = await addDoc(sessionRef, {
        ...sessionData,
        status: 'upcoming',
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...sessionData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get sessions for user
  async getSessionsForUser(userId) {
    try {
      const sessionsRef = collection(db, COLLECTIONS.MENTORSHIP_SESSIONS);
      const q = query(
        sessionsRef,
        where('mentorId', '==', userId),
        orderBy('scheduledTime', 'desc')
      );
      const snapshot = await getDocs(q);
      const mentorSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const q2 = query(
        sessionsRef,
        where('menteeId', '==', userId),
        orderBy('scheduledTime', 'desc')
      );
      const snapshot2 = await getDocs(q2);
      const menteeSessions = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return [...mentorSessions, ...menteeSessions];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Update session
  async updateSession(sessionId, updates) {
    try {
      const sessionRef = doc(db, COLLECTIONS.MENTORSHIP_SESSIONS, sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { id: sessionId, ...updates };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Availability Services
export const availabilityService = {
  // Create availability slot
  async createAvailabilitySlot(slotData) {
    try {
      const slotRef = collection(db, COLLECTIONS.MENTOR_AVAILABILITY);
      const docRef = await addDoc(slotRef, {
        ...slotData,
        reserved: false,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...slotData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get availability slots for mentor
  async getMentorAvailability(mentorId) {
    try {
      const slotsRef = collection(db, COLLECTIONS.MENTOR_AVAILABILITY);
      const q = query(
        slotsRef,
        where('mentorId', '==', mentorId),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Update slot reservation
  async updateSlotReservation(slotId, reserved) {
    try {
      const slotRef = doc(db, COLLECTIONS.MENTOR_AVAILABILITY, slotId);
      await updateDoc(slotRef, {
        reserved,
        updatedAt: serverTimestamp()
      });
      return { id: slotId, reserved };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Delete availability slot
  async deleteAvailabilitySlot(slotId) {
    try {
      const slotRef = doc(db, COLLECTIONS.MENTOR_AVAILABILITY, slotId);
      await deleteDoc(slotRef);
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Chat Services
export const chatService = {
  // Send message
  async sendMessage(messageData) {
    try {
      const messageRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
      const docRef = await addDoc(messageRef, {
        ...messageData,
        timestamp: serverTimestamp()
      });
      return { id: docRef.id, ...messageData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get messages for match
  async getMessagesForMatch(matchId) {
    try {
      const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
      const q = query(
        messagesRef,
        where('matchId', '==', matchId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Listen to messages in real-time
  listenToMessages(matchId, callback) {
    const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
    const q = query(
      messagesRef,
      where('matchId', '==', matchId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });
  }
};

// Feedback Services
export const feedbackService = {
  // Submit feedback
  async submitFeedback(feedbackData) {
    try {
      const feedbackRef = collection(db, COLLECTIONS.MENTORSHIP_FEEDBACK);
      const docRef = await addDoc(feedbackRef, {
        ...feedbackData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...feedbackData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get feedback for session
  async getSessionFeedback(sessionId) {
    try {
      const feedbackRef = collection(db, COLLECTIONS.MENTORSHIP_FEEDBACK);
      const q = query(feedbackRef, where('sessionId', '==', sessionId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get feedback for user
  async getUserFeedback(userId) {
    try {
      const feedbackRef = collection(db, COLLECTIONS.MENTORSHIP_FEEDBACK);
      const q = query(
        feedbackRef,
        where('mentorId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const mentorFeedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const q2 = query(
        feedbackRef,
        where('menteeId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot2 = await getDocs(q2);
      const menteeFeedback = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return [...mentorFeedback, ...menteeFeedback];
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Storage Services
export const storageService = {
  // Upload file
  async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Upload profile picture
  async uploadProfilePicture(file, userId) {
    const path = `${STORAGE_PATHS.PROFILE_PICS}/${userId}/${file.name}`;
    return this.uploadFile(file, path);
  },

  // Upload CV
  async uploadCV(file, userId) {
    const path = `${STORAGE_PATHS.CVS}/${userId}/${file.name}`;
    return this.uploadFile(file, path);
  },

  // Delete file
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Workshop Services
export const workshopService = {
  // Create workshop
  async createWorkshop(workshopData) {
    try {
      const workshopRef = collection(db, COLLECTIONS.WORKSHOPS);
      const docRef = await addDoc(workshopRef, {
        ...workshopData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...workshopData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get all workshops
  async getAllWorkshops() {
    try {
      const workshopRef = collection(db, COLLECTIONS.WORKSHOPS);
      const q = query(workshopRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Register for workshop
  async registerForWorkshop(workshopId, userId) {
    try {
      const workshopRef = doc(db, COLLECTIONS.WORKSHOPS, workshopId);
      await updateDoc(workshopRef, {
        registeredUsers: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Event Services
export const eventService = {
  // Create event
  async createEvent(eventData) {
    try {
      const eventRef = collection(db, COLLECTIONS.EVENTS);
      const docRef = await addDoc(eventRef, {
        ...eventData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...eventData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get all events
  async getAllEvents() {
    try {
      const eventRef = collection(db, COLLECTIONS.EVENTS);
      const q = query(eventRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // RSVP for event
  async rsvpForEvent(eventId, userId) {
    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      await updateDoc(eventRef, {
        rsvpUsers: arrayUnion(userId),
        rsvpCount: increment(1),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

export default {
  authService,
  userService,
  mentorshipService,
  sessionService,
  availabilityService,
  chatService,
  feedbackService,
  storageService,
  workshopService,
  eventService
}; 