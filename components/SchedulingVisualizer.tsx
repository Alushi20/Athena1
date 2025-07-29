import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import CalendarIntegration from './CalendarIntegration';
import { CalendarEvent } from '../lib/googleCalendar';

interface Session {
  id: string;
  title: string;
  mentorName: string;
  menteeName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'one-on-one' | 'group' | 'workshop';
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  session?: Session;
}

interface DaySchedule {
  date: string;
  dayName: string;
  timeSlots: TimeSlot[];
}

const SchedulingVisualizer: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-15');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Mock data
  const sessions: Session[] = [
    {
      id: '1',
      title: 'AI Fundamentals Session',
      mentorName: 'Dr. Evelyn Reed',
      menteeName: 'Sarah Johnson',
      date: '2024-01-15',
      time: '14:00',
      duration: 60,
      status: 'scheduled',
      type: 'one-on-one'
    },
    {
      id: '2',
      title: 'CRISPR Technology Workshop',
      mentorName: 'Aisha Khan',
      menteeName: 'Maria Garcia',
      date: '2024-01-16',
      time: '10:00',
      duration: 90,
      status: 'scheduled',
      type: 'workshop'
    },
    {
      id: '3',
      title: 'Cloud Computing Basics',
      mentorName: 'Maria Garcia',
      menteeName: 'Emily Chen',
      date: '2024-01-17',
      time: '16:00',
      duration: 45,
      status: 'completed',
      type: 'one-on-one'
    }
  ];

  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const session = sessions.find(s => s.date === date);
    
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const hasSession = session && session.time === time;
      
      slots.push({
        id: `${date}-${time}`,
        time,
        available: !hasSession,
        session: hasSession ? session : undefined
      });
    }
    
    return slots;
  };

  const generateWeekSchedule = (): DaySchedule[] => {
    const days: DaySchedule[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(2024, 0, 15 + i);
      const dateStr = date.toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        dayName: dayNames[i],
        timeSlots: generateTimeSlots(dateStr)
      });
    }
    
    return days;
  };

  const weekSchedule = generateWeekSchedule();

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'one-on-one': return COLORS.primary;
      case 'group': return COLORS.secondary;
      case 'workshop': return COLORS.success;
      default: return COLORS.accent;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return COLORS.warning;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const handleSessionPress = (session: Session) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  const handleBookSession = () => {
    Alert.alert('Book Session', 'Session booking feature coming soon!');
  };

  const handleCancelSession = () => {
    Alert.alert('Cancel Session', 'Session cancellation feature coming soon!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Schedule & Sessions</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.activeToggle]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.activeToggleText]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'month' && styles.activeToggle]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.toggleText, viewMode === 'month' && styles.activeToggleText]}>Month</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Feather name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.statNumber}>{sessions.filter(s => s.status === 'scheduled').length}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="check-circle" size={20} color={COLORS.success} />
          <Text style={styles.statNumber}>{sessions.filter(s => s.status === 'completed').length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="clock" size={20} color={COLORS.warning} />
          <Text style={styles.statNumber}>{sessions.filter(s => s.status === 'scheduled').reduce((acc, s) => acc + s.duration, 0)}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
      </View>

      {/* Week Schedule */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleContainer}>
        {weekSchedule.map((day) => (
          <View key={day.date} style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.dayName}</Text>
              <Text style={styles.dayDate}>{new Date(day.date).getDate()}</Text>
            </View>
            
            <ScrollView style={styles.timeSlotsContainer}>
              {day.timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlot,
                    slot.session && styles.sessionSlot,
                    slot.session && { backgroundColor: getSessionColor(slot.session.type) + '20' }
                  ]}
                  onPress={() => slot.session && handleSessionPress(slot.session)}
                  disabled={!slot.session}
                >
                  <Text style={styles.timeText}>{slot.time}</Text>
                  {slot.session && (
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionTitle, { color: getSessionColor(slot.session.type) }]}>
                        {slot.session.title}
                      </Text>
                      <Text style={styles.sessionParticipants}>
                        {slot.session.mentorName} → {slot.session.menteeName}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(slot.session.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(slot.session.status) }]}>
                          {slot.session.status}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleBookSession}>
          <Feather name="plus" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Book Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]} onPress={() => Alert.alert('Availability', 'Set availability feature coming soon!')}>
          <Feather name="clock" size={20} color={COLORS.primary} />
          <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Set Availability</Text>
        </TouchableOpacity>
      </View>

      {/* Session Detail Modal */}
      <Modal
        visible={showSessionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSession && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Session Details</Text>
                  <TouchableOpacity onPress={() => setShowSessionModal(false)}>
                    <Feather name="x" size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.sessionDetails}>
                  <Text style={styles.detailTitle}>{selectedSession.title}</Text>
                  <Text style={styles.detailText}>Mentor: {selectedSession.mentorName}</Text>
                  <Text style={styles.detailText}>Mentee: {selectedSession.menteeName}</Text>
                  <Text style={styles.detailText}>Date: {selectedSession.date}</Text>
                  <Text style={styles.detailText}>Time: {selectedSession.time}</Text>
                  <Text style={styles.detailText}>Duration: {selectedSession.duration} minutes</Text>
                  <Text style={styles.detailText}>Type: {selectedSession.type}</Text>
                  
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedSession.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedSession.status) }]}>
                      {selectedSession.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  {selectedSession && (
                    <CalendarIntegration
                      event={{
                        title: selectedSession.title,
                        description: `Mentorship session between ${selectedSession.mentorName} and ${selectedSession.menteeName}`,
                        startDate: new Date(`${selectedSession.date}T${selectedSession.time}`),
                        endDate: new Date(`${selectedSession.date}T${selectedSession.time}`),
                        type: 'mentorship',
                        mentorName: selectedSession.mentorName,
                        menteeName: selectedSession.menteeName,
                      }}
                      buttonStyle="primary"
                      buttonText="Add to Calendar"
                      showConfirmation={true}
                    />
                  )}
                  <TouchableOpacity style={styles.modalButton} onPress={handleCancelSession}>
                    <Text style={styles.modalButtonText}>Cancel Session</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.primaryModalButton]} onPress={() => Alert.alert('Join', 'Join session feature coming soon!')}>
                    <Text style={[styles.modalButtonText, { color: COLORS.white }]}>Join Session</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeToggleText: {
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scheduleContainer: {
    flex: 1,
  },
  dayColumn: {
    width: 120,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 2,
  },
  timeSlotsContainer: {
    flex: 1,
    padding: 8,
  },
  timeSlot: {
    padding: 8,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    minHeight: 60,
  },
  sessionSlot: {
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionParticipants: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  secondaryAction: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sessionDetails: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
  },
  primaryModalButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default SchedulingVisualizer; 