// Firebase Database Setup Script
// This script sets up the initial database structure and security rules

import { db, COLLECTIONS } from './firebase-config';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Sample data for initial setup
const sampleData = {
  users: [
    {
      id: 'sample-mentor-1',
      name: 'Dr. Anne‑Marie Imafidon',
      email: 'anne@example.com',
      role: 'mentor',
      bio: 'CEO of Stemettes and Oxford MMath graduate. Advocates for women in tech.',
      skills: ['AI', 'Education', 'Social Enterprise'],
      profilePic: 'https://randomuser.me/api/portraits/women/71.jpg',
      location: 'London, UK',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sample-mentor-2',
      name: 'Aya Mouallem',
      email: 'aya@example.com',
      role: 'mentor',
      bio: 'Stanford engineer & co‑founder of All Girls Code, empowering girls in Lebanon.',
      skills: ['Electrical Engineering', 'Coding', 'Mentorship'],
      profilePic: 'https://randomuser.me/api/portraits/women/72.jpg',
      location: 'Beirut, Lebanon',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  workshops: [
    {
      id: 'ws1',
      title: 'Negotiation Role-Play',
      date: '2024-08-01',
      time: '14:00',
      duration: 90,
      skill: 'Negotiation',
      description: 'Practice salary negotiation with a coach.',
      location: 'Virtual',
      maxParticipants: 20,
      registeredUsers: [],
      createdAt: new Date()
    },
    {
      id: 'ws2',
      title: 'Bias Response Practice',
      date: '2024-08-10',
      time: '10:00',
      duration: 60,
      skill: 'Bias Response',
      description: 'Learn to respond to bias in real time.',
      location: 'Virtual',
      maxParticipants: 15,
      registeredUsers: [],
      createdAt: new Date()
    }
  ],
  events: [
    {
      id: 'event1',
      title: 'Women in AI - Tel Aviv',
      date: '2024-07-15',
      time: '18:00',
      endTime: '21:00',
      location: 'WeWork, Tel Aviv',
      description: 'Panel and networking for women in AI.',
      rsvpCount: 42,
      rsvpUsers: [],
      createdAt: new Date()
    },
    {
      id: 'event2',
      title: 'Monthly STEM Meetup',
      date: '2024-07-28',
      time: '19:00',
      endTime: '22:00',
      location: 'Technion, Haifa',
      description: 'Casual networking and lightning talks.',
      rsvpCount: 18,
      rsvpUsers: [],
      createdAt: new Date()
    }
  ]
};

// Initialize collections with sample data
export const initializeDatabase = async () => {
  try {
    console.log('Starting Firebase database initialization...');

    // Initialize Users collection
    console.log('Setting up Users collection...');
    for (const user of sampleData.users) {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      await setDoc(userRef, user);
      console.log(`Created user: ${user.name}`);
    }

    // Initialize Workshops collection
    console.log('Setting up Workshops collection...');
    for (const workshop of sampleData.workshops) {
      const workshopRef = doc(db, COLLECTIONS.WORKSHOPS, workshop.id);
      await setDoc(workshopRef, workshop);
      console.log(`Created workshop: ${workshop.title}`);
    }

    // Initialize Events collection
    console.log('Setting up Events collection...');
    for (const event of sampleData.events) {
      const eventRef = doc(db, COLLECTIONS.EVENTS, event.id);
      await setDoc(eventRef, event);
      console.log(`Created event: ${event.title}`);
    }

    console.log('Firebase database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase database:', error);
    throw error;
  }
};

// Check if collections exist and have data
export const checkDatabaseStatus = async () => {
  try {
    console.log('Checking Firebase database status...');

    const collections = [
      COLLECTIONS.USERS,
      COLLECTIONS.WORKSHOPS,
      COLLECTIONS.EVENTS,
      COLLECTIONS.MENTORSHIP_MATCHES,
      COLLECTIONS.MENTORSHIP_SESSIONS,
      COLLECTIONS.MENTORSHIP_FEEDBACK,
      COLLECTIONS.MENTOR_AVAILABILITY,
      COLLECTIONS.CHAT_MESSAGES
    ];

    const status = {};

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        status[collectionName] = {
          exists: true,
          documentCount: snapshot.size
        };
        console.log(`${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        status[collectionName] = {
          exists: false,
          error: error.message
        };
        console.log(`${collectionName}: Error - ${error.message}`);
      }
    }

    return status;
  } catch (error) {
    console.error('Error checking database status:', error);
    throw error;
  }
};

// Clear all data (for testing)
export const clearDatabase = async () => {
  try {
    console.log('Clearing Firebase database...');
    
    const collections = [
      COLLECTIONS.USERS,
      COLLECTIONS.WORKSHOPS,
      COLLECTIONS.EVENTS,
      COLLECTIONS.MENTORSHIP_MATCHES,
      COLLECTIONS.MENTORSHIP_SESSIONS,
      COLLECTIONS.MENTORSHIP_FEEDBACK,
      COLLECTIONS.MENTOR_AVAILABILITY,
      COLLECTIONS.CHAT_MESSAGES
    ];

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        const deletePromises = snapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        
        await Promise.all(deletePromises);
        console.log(`Cleared ${collectionName}: ${snapshot.size} documents deleted`);
      } catch (error) {
        console.log(`Error clearing ${collectionName}: ${error.message}`);
      }
    }

    console.log('Database cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// Export functions for use in scripts
export default {
  initializeDatabase,
  checkDatabaseStatus,
  clearDatabase
}; 