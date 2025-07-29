import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator } from 'react-native';
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

const UnifiedMentorshipScreen: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'connections' | 'progress'>('overview');
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
          completedSessions: Math.floor(Math.random() * 10),
          upcomingSessions: Math.floor(Math.random() * 5)
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
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
          </ScrollView>
        );

      case 'schedule':
        return <SchedulingVisualizer />;

      case 'connections':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <MentorshipStatusOverview
              mentorships={mentorships}
              userRole={userRole || 'mentee'}
              onMentorshipPress={(mentorship) => {
                console.log('Mentorship pressed:', mentorship);
              }}
            />
          </ScrollView>
        );

      case 'progress':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress Tracking</Text>
              <View style={styles.progressCard}>
                <Text style={styles.progressTitle}>Learning Progress</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
                <Text style={styles.progressText}>75% Complete</Text>
              </View>
              
              <View style={styles.progressCard}>
                <Text style={styles.progressTitle}>Goals Achieved</Text>
                <Text style={styles.progressText}>3 out of 5 goals completed</Text>
              </View>
              
              <View style={styles.progressCard}>
                <Text style={styles.progressTitle}>Sessions Attended</Text>
                <Text style={styles.progressText}>12 sessions completed</Text>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
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
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mentorship Hub</Text>
          <Text style={styles.subtitle}>
            {userRole === 'mentor' ? 'Guide and inspire the next generation' : 'Grow with expert guidance'}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Feather name="home" size={20} color={activeTab === 'overview' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
            onPress={() => setActiveTab('schedule')}
          >
            <Feather name="calendar" size={20} color={activeTab === 'schedule' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
            onPress={() => setActiveTab('connections')}
          >
            <Feather name="users" size={20} color={activeTab === 'connections' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'connections' && styles.activeTabText]}>Connections</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
            onPress={() => setActiveTab('progress')}
          >
            <Feather name="bar-chart-2" size={20} color={activeTab === 'progress' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {renderTabContent()}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('MentorDirectory' as never)}
          >
            <Feather name="search" size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>Find Mentors</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Scheduling' as never, { mentorId: '', matchId: '' } as never)}
          >
            <Feather name="plus" size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
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
    textAlign: 'center',
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
  progressCard: {
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
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.accent,
  },
  quickActionButton: {
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
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default UnifiedMentorshipScreen; 