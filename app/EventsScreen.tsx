import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import CalendarIntegration from '../components/CalendarIntegration';
import { CalendarEvent } from '../lib/googleCalendar';

const EVENTS = [
  {
    id: 'event1',
    title: 'Women in AI - Tel Aviv',
    date: '2024-07-15',
    time: '18:00',
    endTime: '21:00',
    location: 'WeWork, Tel Aviv',
    description: 'Panel and networking for women in AI.',
    rsvpCount: 42,
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
  },
  {
    id: 'event3',
    title: 'Tech Career Fair',
    date: '2024-08-05',
    time: '10:00',
    endTime: '16:00',
    location: 'Tel Aviv Convention Center',
    description: 'Connect with top tech companies and find your next opportunity.',
    rsvpCount: 156,
  },
  {
    id: 'event4',
    title: 'Women in Engineering Conference',
    date: '2024-08-12',
    time: '09:00',
    endTime: '17:00',
    location: 'Hilton Tel Aviv',
    description: 'Annual conference celebrating women in engineering with keynote speakers and workshops.',
    rsvpCount: 89,
  },
];

const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState(EVENTS);
  const [rsvped, setRsvped] = useState<Record<string, boolean>>({});

  const handleRSVP = (id: string) => {
    setEvents(evts => evts.map(e => e.id === id ? { ...e, rsvpCount: e.rsvpCount + 1 } : e));
    setRsvped(r => ({ ...r, [id]: true }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events & Community</Text>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventInfo}><Feather name="calendar" size={14} color={COLORS.primary} /> {item.date}</Text>
            <Text style={styles.eventInfo}><Feather name="clock" size={14} color={COLORS.primary} /> {item.time} - {item.endTime}</Text>
            <Text style={styles.eventInfo}><Feather name="map-pin" size={14} color={COLORS.primary} /> {item.location}</Text>
            <Text style={styles.eventDesc}>{item.description}</Text>
            <View style={styles.rsvpRow}>
              <Text style={styles.rsvpCount}><Feather name="users" size={14} color={COLORS.secondary} /> {item.rsvpCount} RSVP</Text>
              <View style={styles.eventActions}>
              <TouchableOpacity
                style={[styles.rsvpBtn, rsvped[item.id] && styles.rsvpBtnDisabled]}
                onPress={() => handleRSVP(item.id)}
                disabled={!!rsvped[item.id]}
              >
                <Text style={styles.rsvpBtnText}>{rsvped[item.id] ? 'RSVPed' : 'RSVP'}</Text>
              </TouchableOpacity>
                
                <CalendarIntegration
                  event={{
                    title: item.title,
                    description: `${item.description}\n\nLocation: ${item.location}`,
                    startDate: new Date(`${item.date}T${item.time}`),
                    endDate: new Date(`${item.date}T${item.endTime}`),
                    location: item.location,
                    type: 'event',
                  }}
                  buttonStyle="secondary"
                  buttonText="Add to Calendar"
                  showConfirmation={true}
                />
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 18,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  eventInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  eventDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  rsvpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rsvpCount: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  rsvpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  rsvpBtnDisabled: {
    backgroundColor: COLORS.accent,
  },
  rsvpBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

export default EventsScreen; 