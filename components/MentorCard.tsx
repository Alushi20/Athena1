import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';

export type Mentor = {
  $id: string;
  name: string;
  profilePic?: string;
  bio?: string;
  skills?: string[];
  fieldsOfInterest?: string[];
  matchScore?: number; // Add matchScore property
};

type MentorCardProps = {
  mentor: Mentor;
  onPress: () => void;
};

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onPress }) => {
  const scoreColor = mentor.matchScore && mentor.matchScore > 75 ? COLORS.success : mentor.matchScore && mentor.matchScore > 50 ? COLORS.warning : COLORS.error;
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {mentor.profilePic ? (
      <Image
          source={{ uri: mentor.profilePic }}
        style={styles.avatar}
      />
      ) : (
        <View style={[styles.avatar, styles.fallbackAvatar]}>
          <Text style={styles.fallbackText}>{getInitials(mentor.name)}</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{mentor.name}</Text>
        <Text style={styles.bio} numberOfLines={2}>{mentor.bio || 'No bio available.'}</Text>
        <View style={styles.skillsContainer}>
          {(mentor.skills || []).slice(0, 3).map((skill) => (
            <View key={skill} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      {mentor.matchScore && (
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{Math.round(mentor.matchScore)}%</Text>
        </View>
      )}
      <Feather name="chevron-right" size={24} color={COLORS.primary} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: 8,
  },
  fallbackAvatar: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default MentorCard; 