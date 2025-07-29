import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { account, database, config } from '../lib/appwrite';
import { Models, Query } from 'react-native-appwrite';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface MentorshipMatch {
  $id: string;
  menteeId: string;
  mentorId: string;
  status: string;
  matchedOn: string;
}

interface MenteeProfile {
  $id: string;
  name: string;
  profilePic?: string;
  bio?: string;
}

const MentorshipRequestsScreen: React.FC = () => {
  const [requests, setRequests] = useState<MentorshipMatch[]>([]);
  const [mentees, setMentees] = useState<Record<string, MenteeProfile>>({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const user = await account.get();
        if (!isMounted) return;
        setCurrentUserId(user.$id);
        // Fetch all pending requests for this mentor
        const res = await database.listDocuments(
          config.dbId,
          config.col.mentorshipMatchesCol,
          [
            Query.equal('mentorId', user.$id),
            Query.equal('status', 'pending')
          ]
        );
        if (!isMounted) return;
        setRequests(res.documents as MentorshipMatch[]);
        // Fetch mentee profiles
        const menteeIds = res.documents.map((r: any) => r.menteeId);
        if (menteeIds.length > 0) {
          const menteeRes = await database.listDocuments(
            config.dbId,
            config.col.usersCol,
            [Query.equal('$id', menteeIds)]
          );
          const menteeMap: Record<string, MenteeProfile> = {};
          menteeRes.documents.forEach((mentee: any) => {
            menteeMap[mentee.$id] = mentee;
          });
          setMentees(menteeMap);
        }
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
    return () => { isMounted = false; };
  }, []);

  const handleUpdateStatus = async (matchId: string, newStatus: 'active' | 'declined') => {
    try {
      await database.updateDocument(
        config.dbId,
        config.col.mentorshipMatchesCol,
        matchId,
        { status: newStatus }
      );
      setRequests(reqs => reqs.filter(r => r.$id !== matchId));
      Alert.alert('Success', `Request ${newStatus === 'active' ? 'accepted' : 'declined'}.`);
    } catch (error) {
      Alert.alert('Error', 'Could not update request.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!currentUserId) {
    return <View style={styles.center}><Text>Not logged in.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mentorship Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={item => item.$id}
        renderItem={({ item }) => {
          const mentee = mentees[item.menteeId];
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Feather name="user" size={32} color={COLORS.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.menteeName}>{mentee?.name || 'Unknown'}</Text>
                  <Text style={styles.menteeBio} numberOfLines={2}>{mentee?.bio || ''}</Text>
                </View>
              </View>
              <View style={styles.buttonRow}>
                {item.status === 'pending' && (
                  <>
                    <TouchableOpacity style={[styles.button, styles.acceptBtn]} onPress={() => handleUpdateStatus(item.$id, 'active')}>
                      <Feather name="check" size={18} color={COLORS.white} />
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.declineBtn]} onPress={() => handleUpdateStatus(item.$id, 'declined')}>
                      <Feather name="x" size={18} color={COLORS.white} />
                      <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                  </>
                )}
                {item.status === 'active' && (
                  <TouchableOpacity style={[styles.button, styles.acceptBtn]} onPress={() => navigation.navigate('MentorshipChat', { matchId: item.$id })}>
                    <Feather name="message-circle" size={18} color={COLORS.white} />
                    <Text style={styles.buttonText}>Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No pending requests.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 18,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  menteeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  menteeBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginLeft: 8,
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
  },
  declineBtn: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MentorshipRequestsScreen; 