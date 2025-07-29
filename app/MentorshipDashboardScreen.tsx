import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { account, database, config } from '../lib/appwrite';
import { Query } from 'react-native-appwrite';
import MentorshipFlowDiagram from '../components/MentorshipFlowDiagram';
import MentorshipStatusOverview from '../components/MentorshipStatusOverview';
import SchedulingVisualizer from '../components/SchedulingVisualizer';

interface MentorshipStatus {
  totalMentorships: number;
  activeMentorships: number;
  pendingRequests: number;
  completedSessions: number;
  upcomingSessions: number;
}

interface RecentActivity {
  id: string;
  type: 'request' | 'chat' | 'session' | 'feedback';
  title: string;
  description: string;
  timestamp: string;
  mentorName?: string;
  menteeName?: string;
}

interface Mentorship {
  id: string;
  mentorName: string;
  menteeName: string;
  status: 'active' | 'pending' | 'completed';
  lastActivity: string;
  nextSession?: string;
  profilePic?: string;
  matchScore?: number;
}

const MentorshipDashboardScreen: React.FC = () => {
  const [status, setStatus] = useState<MentorshipStatus>({
    totalMentorships: 0,
    activeMentorships: 0,
    pendingRequests: 0,
    completedSessions: 0,
    upcomingSessions: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'mentor' | 'mentee' | null>(null);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const user = await account.get();
        const userRole = user.prefs?.role || 'mentee';
        setUserRole(userRole);

        // Fetch mentorship matches
        const matchesResponse = await database.listDocuments(
          config.dbId,
          config.col.mentorshipMatchesCol,
          [
            Query.or([
              Query.equal('mentorId', user.$id),
              Query.equal('menteeId', user.$id)
            ])
          ]
        );

        const matches = matchesResponse.documents;
        const activeMatches = matches.filter((m: any) => m.status === 'active');
        const pendingMatches = matches.filter((m: any) => m.status === 'pending');

        setStatus({
          totalMentorships: matches.length,
          activeMentorships: activeMatches.length,
          pendingRequests: pendingMatches.length,
          completedSessions: Math.floor(Math.random() * 10), // Mock data
          upcomingSessions: Math.floor(Math.random() * 5) // Mock data
        });

        // Generate mock recent activity
        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'chat',
            title: 'New message from mentor',
            description: 'Dr. Evelyn Reed sent you a message about your AI project',
            timestamp: '2 hours ago',
            mentorName: 'Dr. Evelyn Reed'
          },
          {
            id: '2',
            type: 'session',
            title: 'Upcoming session scheduled',
            description: 'Session with Aisha Khan on CRISPR technology',
            timestamp: '1 day ago',
            mentorName: 'Aisha Khan'
          },
          {
            id: '3',
            type: 'request',
            title: 'New mentorship request',
            description: 'Maria Garcia wants to mentor you in cloud computing',
            timestamp: '3 days ago',
            menteeName: 'Maria Garcia'
          }
        ];
        setRecentActivity(mockActivity);

        // Generate mock mentorships data
        const mockMentorships: Mentorship[] = [
          {
            id: '1',
            mentorName: 'Dr. Evelyn Reed',
            menteeName: 'Sarah Johnson',
            status: 'active',
            lastActivity: '2 hours ago',
            nextSession: 'Tomorrow at 3 PM',
            profilePic: 'https://randomuser.me/api/portraits/women/68.jpg',
            matchScore: 95
          },
          {
            id: '2',
            mentorName: 'Aisha Khan',
            menteeName: 'Maria Garcia',
            status: 'pending',
            lastActivity: '1 day ago',
            profilePic: 'https://randomuser.me/api/portraits/women/69.jpg',
            matchScore: 87
          }
        ];
        setMentorships(mockMentorships);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat': return 'message-circle';
      case 'session': return 'calendar';
      case 'request': return 'user-plus';
      case 'feedback': return 'star';
      default: return 'activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'chat': return COLORS.primary;
      case 'session': return COLORS.success;
      case 'request': return COLORS.warning;
      case 'feedback': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your mentorship dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView 
        style={[styles.container, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mentorship Dashboard</Text>
          <Text style={styles.subtitle}>
            {userRole === 'mentor' ? 'Guide and inspire the next generation' : 'Grow with expert guidance'}
          </Text>
        </View>

        {/* Status Cards */}
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <Feather name="users" size={24} color={COLORS.primary} />
            <Text style={styles.statusNumber}>{status.totalMentorships}</Text>
            <Text style={styles.statusLabel}>Total Connections</Text>
          </View>
          <View style={styles.statusCard}>
            <Feather name="check-circle" size={24} color={COLORS.success} />
            <Text style={styles.statusNumber}>{status.activeMentorships}</Text>
            <Text style={styles.statusLabel}>Active</Text>
          </View>
          <View style={styles.statusCard}>
            <Feather name="clock" size={24} color={COLORS.warning} />
            <Text style={styles.statusNumber}>{status.pendingRequests}</Text>
            <Text style={styles.statusLabel}>Pending</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('MentorDirectory' as never)}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
                <Feather name="search" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionTitle}>Find Mentors</Text>
              <Text style={styles.actionSubtitle}>Discover new connections</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyMentorships' as never)}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success }]}>
                <Feather name="users" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionTitle}>My Mentorships</Text>
              <Text style={styles.actionSubtitle}>Manage connections</Text>
            </TouchableOpacity>

            {userRole === 'mentor' && (
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('MentorshipRequests' as never)}
              >
                <View style={[styles.actionIcon, { backgroundColor: COLORS.warning }]}>
                  <Feather name="bell" size={20} color={COLORS.white} />
                </View>
                <Text style={styles.actionTitle}>Requests</Text>
                <Text style={styles.actionSubtitle}>Review applications</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Scheduling' as never, { mentorId: '', matchId: '' } as never)}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary }]}>
                <Feather name="calendar" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.actionTitle}>Schedule</Text>
              <Text style={styles.actionSubtitle}>Book sessions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scheduling Visualizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Overview</Text>
          <View style={styles.schedulingContainer}>
            <SchedulingVisualizer />
          </View>
        </View>

        {/* Mentorship Flow */}
        <View style={styles.section}>
          <MentorshipFlowDiagram 
            currentStep="chat"
            onStepPress={(step) => {
              if (step.screen) {
                navigation.navigate(step.screen as never, step.params as never);
              }
            }}
          />
        </View>

        {/* Mentorship Status Overview */}
        <View style={styles.section}>
          <MentorshipStatusOverview
            mentorships={mentorships}
            userRole={userRole || 'mentee'}
            onMentorshipPress={(mentorship) => {
              // Navigate to mentorship details or chat
              console.log('Mentorship pressed:', mentorship);
            }}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                <Feather name={getActivityIcon(activity.type) as any} size={16} color={COLORS.white} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Learning Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Resources</Text>
          <View style={styles.resourcesGrid}>
            <TouchableOpacity 
              style={styles.resourceCard}
              onPress={() => navigation.navigate('LearningCenter' as never)}
            >
              <Feather name="book-open" size={24} color={COLORS.primary} />
              <Text style={styles.resourceTitle}>Learning Center</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.resourceCard}
              onPress={() => navigation.navigate('Workshops' as never)}
            >
              <Feather name="award" size={24} color={COLORS.primary} />
              <Text style={styles.resourceTitle}>Workshops</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.resourceCard}
              onPress={() => navigation.navigate('Events' as never)}
            >
              <Feather name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.resourceTitle}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.resourceCard}
              onPress={() => navigation.navigate('Communities' as never)}
            >
              <Feather name="users" size={24} color={COLORS.primary} />
              <Text style={styles.resourceTitle}>Communities</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  schedulingContainer: {
    height: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default MentorshipDashboardScreen; 