import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

const MOCK_EVENTS = [
  {
    id: 'event1',
    title: 'Women in AI - Tel Aviv',
    date: '2024-07-15',
    location: 'WeWork, Tel Aviv',
    description: 'Panel and networking for women in AI.',
    rsvpCount: 42,
  },
  {
    id: 'event2',
    title: 'Monthly STEM Meetup',
    date: '2024-07-28',
    location: 'Technion, Haifa',
    description: 'Casual networking and lightning talks.',
    rsvpCount: 18,
  },
];

const EventDetailScreen = ({ route, navigation }: any) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvped, setRsvped] = useState(false);
  const [success, setSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const found = MOCK_EVENTS.find(e => e.id === eventId);
      if (found) {
        setEvent(found);
        setError('');
      } else {
        setError('Event not found.');
      }
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 700);
  }, [eventId]);

  const handleRSVP = () => {
    setRsvped(true);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1800);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }] }>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={22} color={COLORS.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.info}><Feather name="calendar" size={16} color={COLORS.primary} /> {event.date}</Text>
      <Text style={styles.info}><Feather name="map-pin" size={16} color={COLORS.primary} /> {event.location}</Text>
      <Text style={styles.desc}>{event.description}</Text>
      <Text style={styles.rsvpCount}><Feather name="users" size={16} color={COLORS.secondary} /> {event.rsvpCount + (rsvped ? 1 : 0)} RSVP</Text>
      <TouchableOpacity
        style={[styles.rsvpBtn, rsvped && styles.rsvpBtnDisabled]}
        onPress={handleRSVP}
        disabled={rsvped}
        activeOpacity={0.85}
      >
        <Text style={styles.rsvpBtnText}>{rsvped ? 'RSVPed' : 'RSVP'}</Text>
      </TouchableOpacity>
      {success && (
        <View style={styles.successBox}>
          <Feather name="check-circle" size={22} color={COLORS.success} />
          <Text style={styles.successText}>RSVP Confirmed!</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  info: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  desc: {
    fontSize: 15,
    color: COLORS.text,
    marginVertical: 14,
  },
  rsvpCount: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 12,
  },
  rsvpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  rsvpBtnDisabled: {
    backgroundColor: COLORS.accent,
  },
  rsvpBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 17,
    fontWeight: 'bold',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 6,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  successText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});

export default EventDetailScreen; 