import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { account, database, config } from '../lib/appwrite';
import { Query } from 'react-native-appwrite';
import CalendarIntegration from '../components/CalendarIntegration';
import { CalendarEvent } from '../lib/googleCalendar';

const SchedulingScreen = ({ route, navigation }: any) => {
  const { mentorId, matchId } = route.params;
  const [slots, setSlots] = useState<any[]>([]);
  const [isMentor, setIsMentor] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndFetchSlots = async () => {
      setLoading(true);
      try {
        const user = await account.get();
        const userIsMentor = user.$id === mentorId;
        setIsMentor(userIsMentor);
        const res = await database.listDocuments(
          config.dbId,
          'mentorAvailability', // Assume new collection 'mentorAvailability'
          [Query.equal('mentorId', mentorId)]
        );
        setSlots(res.documents);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    checkRoleAndFetchSlots();
  }, [mentorId]);

  const handleAddSlot = async () => {
    if (newSlot.date && newSlot.time) {
      const res = await database.createDocument(
        config.dbId,
        'mentorAvailability',
        'unique()',
        { mentorId, date: newSlot.date, time: newSlot.time, reserved: false }
      );
      setSlots(prev => [...prev, res]);
      setNewSlot({ date: '', time: '' });
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    await database.deleteDocument(config.dbId, 'mentorAvailability', slotId);
    setSlots(prev => prev.filter(s => s.$id !== slotId));
  };

  const handleBook = async (slotId: string) => {
    setBooking(true);
    try {
      await database.createDocument(
        config.dbId,
        config.col.mentorshipSessionsCol,
        'unique()',
        { matchId, scheduledTime: new Date().toISOString(), status: 'upcoming' }
      );
      await database.updateDocument(config.dbId, 'mentorAvailability', slotId, { reserved: true });
      setSlots(slots => slots.map(s => s.id === slotId ? { ...s, reserved: true } : s));
      Alert.alert('Session Booked', 'Your mentorship session has been scheduled!');
    } catch (error) {
      Alert.alert('Error', 'Could not book session.');
    } finally {
      setBooking(false);
    }
  };

  const renderMentorControls = () => (
    <View style={styles.addSlotSection}>
      <Text style={styles.sectionTitle}>Manage Your Availability</Text>
      <View style={styles.inputRow}>
        <TextInput placeholder="Date (YYYY-MM-DD)" style={styles.input} onChangeText={t => setNewSlot(s => ({ ...s, date: t }))} />
        <TextInput placeholder="Time (HH:MM)" style={styles.input} onChangeText={t => setNewSlot(s => ({ ...s, time: t }))} />
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={handleAddSlot}>
        <Feather name="plus" size={18} color={COLORS.white} />
        <Text style={styles.addBtnText}>Add Slot</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Schedule a Session</Text>
      {isMentor && renderMentorControls()}
      <Text style={styles.sectionTitle}>{isMentor ? 'Your Slots' : 'Available Slots'}</Text>
      <FlatList
        data={slots}
        keyExtractor={item => item.$id}
        renderItem={({ item }) => (
          <View style={styles.slotCard}>
            <View>
              <Text style={styles.slotText}><Feather name="calendar" size={16} color={COLORS.primary} /> {item.date}</Text>
              <Text style={styles.slotText}><Feather name="clock" size={16} color={COLORS.primary} /> {item.time}</Text>
            </View>
            <View style={styles.slotActions}>
            {isMentor ? (
              <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveSlot(item.$id)}>
                <Feather name="trash-2" size={18} color={COLORS.error} />
              </TouchableOpacity>
            ) : (
                <>
              <TouchableOpacity
                style={[styles.bookBtn, item.reserved && styles.bookBtnDisabled]}
                onPress={() => handleBook(item.$id)}
                disabled={item.reserved || booking}
                activeOpacity={0.85}
              >
                <Text style={styles.bookBtnText}>{item.reserved ? 'Reserved' : 'Book'}</Text>
              </TouchableOpacity>
                  
                  {!item.reserved && (
                    <CalendarIntegration
                      event={{
                        title: 'Mentorship Session',
                        description: 'Scheduled mentorship session',
                        startDate: new Date(`${item.date}T${item.time}`),
                        endDate: new Date(`${item.date}T${item.time}`),
                        type: 'mentorship',
                      }}
                      buttonStyle="icon"
                      showConfirmation={false}
                    />
                  )}
                </>
            )}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 18,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 18,
    },
    addSlotSection: {
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 10,
        fontSize: 15,
        color: COLORS.text,
        marginBottom: 10,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 10,
    },
    addBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 6,
    },
    removeBtn: {
        padding: 8,
    },
    slotCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    slotText: {
        fontSize: 15,
        color: COLORS.text,
        marginRight: 12,
    },
    bookBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 24,
    },
    bookBtnDisabled: {
        backgroundColor: COLORS.accent,
    },
    bookBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 15,
    },
    slotActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});

export default SchedulingScreen; 