import * as Calendar from 'expo-calendar';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// Google Calendar API configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your Google Client ID
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'athena',
  path: 'calendar-callback'
});

// Calendar event types
export interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees?: string[];
  type: 'mentorship' | 'workshop' | 'event';
  mentorName?: string;
  menteeName?: string;
  meetingLink?: string;
}

// Google Calendar service class
class GoogleCalendarService {
  private accessToken: string | null = null;
  private calendarId: string | null = null;

  // Request calendar permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  }

  // Get user's default calendar
  async getDefaultCalendar(): Promise<Calendar.Calendar | null> {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isPrimary);
      return defaultCalendar || calendars[0] || null;
    } catch (error) {
      console.error('Error getting default calendar:', error);
      return null;
    }
  }

  // Create a calendar event
  async createEvent(event: CalendarEvent): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permission not granted');
      }

      const calendar = await this.getDefaultCalendar();
      if (!calendar) {
        throw new Error('No calendar available');
      }

      const eventDetails: Calendar.EventInput = {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        notes: event.description,
        alarms: [{ relativeOffset: -15 }], // 15 minutes before
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Add attendees if provided
      if (event.attendees && event.attendees.length > 0) {
        eventDetails.attendees = event.attendees.map(email => ({ email }));
      }

      const eventId = await Calendar.createEventAsync(calendar.id, eventDetails);
      return eventId;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  // Create a mentorship session event
  async createMentorshipEvent(
    mentorName: string,
    menteeName: string,
    startDate: Date,
    duration: number, // in minutes
    meetingLink?: string
  ): Promise<string | null> {
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    const event: CalendarEvent = {
      title: `Mentorship Session: ${mentorName} & ${menteeName}`,
      description: `One-on-one mentorship session between ${mentorName} and ${menteeName}.${meetingLink ? `\n\nMeeting Link: ${meetingLink}` : ''}`,
      startDate,
      endDate,
      type: 'mentorship',
      mentorName,
      menteeName,
      meetingLink
    };

    return this.createEvent(event);
  }

  // Create a workshop event
  async createWorkshopEvent(
    title: string,
    description: string,
    startDate: Date,
    duration: number,
    location?: string
  ): Promise<string | null> {
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    const event: CalendarEvent = {
      title: `Workshop: ${title}`,
      description: `${description}\n\nJoin us for this interactive workshop!`,
      startDate,
      endDate,
      location,
      type: 'workshop'
    };

    return this.createEvent(event);
  }

  // Create an event
  async createCommunityEvent(
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location?: string
  ): Promise<string | null> {
    const event: CalendarEvent = {
      title: `Event: ${title}`,
      description: `${description}\n\nJoin our community event!`,
      startDate,
      endDate,
      location,
      type: 'event'
    };

    return this.createEvent(event);
  }

  // Get upcoming events
  async getUpcomingEvents(days: number = 30): Promise<Calendar.Event[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permission not granted');
      }

      const calendar = await this.getDefaultCalendar();
      if (!calendar) {
        throw new Error('No calendar available');
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const events = await Calendar.getEventsAsync(
        [calendar.id],
        startDate,
        endDate
      );

      return events;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }

  // Delete an event
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Update an event
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<boolean> {
    try {
      const calendar = await this.getDefaultCalendar();
      if (!calendar) {
        throw new Error('No calendar available');
      }

      const eventDetails: Partial<Calendar.EventInput> = {};
      
      if (updates.title) eventDetails.title = updates.title;
      if (updates.description) eventDetails.notes = updates.description;
      if (updates.startDate) eventDetails.startDate = updates.startDate;
      if (updates.endDate) eventDetails.endDate = updates.endDate;
      if (updates.location) eventDetails.location = updates.location;

      await Calendar.updateEventAsync(eventId, eventDetails);
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Helper functions for common calendar operations
export const CalendarHelpers = {
  // Format date for display
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  // Format time for display
  formatTime: (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  // Format date and time
  formatDateTime: (date: Date): string => {
    return `${CalendarHelpers.formatDate(date)} at ${CalendarHelpers.formatTime(date)}`;
  },

  // Create a meeting link (placeholder for actual implementation)
  createMeetingLink: (): string => {
    // In a real app, this would integrate with Zoom, Google Meet, etc.
    return `https://meet.google.com/${Math.random().toString(36).substring(2, 8)}`;
  },

  // Validate event data
  validateEvent: (event: CalendarEvent): boolean => {
    return !!(
      event.title &&
      event.startDate &&
      event.endDate &&
      event.startDate < event.endDate
    );
  }
}; 