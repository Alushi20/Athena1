import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

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

interface MentorshipStatusOverviewProps {
  mentorships: Mentorship[];
  userRole: 'mentor' | 'mentee';
  onMentorshipPress?: (mentorship: Mentorship) => void;
}

const MentorshipStatusOverview: React.FC<MentorshipStatusOverviewProps> = ({
  mentorships,
  userRole,
  onMentorshipPress
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'completed': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'check-circle';
      case 'pending': return 'clock';
      case 'completed': return 'award';
      default: return 'circle';
    }
  };

  const getDisplayName = (mentorship: Mentorship) => {
    return userRole === 'mentor' ? mentorship.menteeName : mentorship.mentorName;
  };

  const getRoleLabel = () => {
    return userRole === 'mentor' ? 'Mentee' : 'Mentor';
  };

  if (mentorships.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={48} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>No {userRole === 'mentor' ? 'mentees' : 'mentors'} yet</Text>
        <Text style={styles.emptyDescription}>
          {userRole === 'mentor' 
            ? 'Start connecting with mentees to begin your mentorship journey'
            : 'Find a mentor to start your learning journey'
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your {userRole === 'mentor' ? 'Mentees' : 'Mentors'}</Text>
        <Text style={styles.subtitle}>
          {mentorships.length} {userRole === 'mentor' ? 'mentee' : 'mentor'}{mentorships.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {mentorships.map((mentorship) => (
        <TouchableOpacity
          key={mentorship.id}
          style={styles.mentorshipCard}
          onPress={() => onMentorshipPress && onMentorshipPress(mentorship)}
          activeOpacity={0.8}
        >
          <View style={styles.mentorshipHeader}>
            <View style={styles.profileSection}>
              <Image
                source={
                  mentorship.profilePic 
                    ? { uri: mentorship.profilePic }
                    : require('../assets/images/icon.png')
                }
                style={styles.profilePic}
              />
              <View style={styles.nameSection}>
                <Text style={styles.name}>{getDisplayName(mentorship)}</Text>
                <Text style={styles.role}>{getRoleLabel()}</Text>
              </View>
            </View>
            
            <View style={styles.statusSection}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mentorship.status) + '20' }]}>
                <Feather 
                  name={getStatusIcon(mentorship.status) as any} 
                  size={12} 
                  color={getStatusColor(mentorship.status)} 
                />
                <Text style={[styles.statusText, { color: getStatusColor(mentorship.status) }]}>
                  {mentorship.status.charAt(0).toUpperCase() + mentorship.status.slice(1)}
                </Text>
              </View>
              {mentorship.matchScore && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{mentorship.matchScore}%</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.mentorshipDetails}>
            <View style={styles.detailRow}>
              <Feather name="clock" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>Last activity: {mentorship.lastActivity}</Text>
            </View>
            
            {mentorship.nextSession && (
              <View style={styles.detailRow}>
                <Feather name="calendar" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>Next session: {mentorship.nextSession}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.chatButton]}>
              <Feather name="message-circle" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.scheduleButton]}>
              <Feather name="calendar" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.feedbackButton]}>
              <Feather name="star" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginVertical: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  mentorshipCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  mentorshipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  role: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  scoreBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  mentorshipDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  chatButton: {
    backgroundColor: COLORS.primary,
  },
  scheduleButton: {
    backgroundColor: COLORS.secondary,
  },
  feedbackButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 4,
  },
});

export default MentorshipStatusOverview; 