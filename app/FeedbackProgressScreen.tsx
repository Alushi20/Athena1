import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { account, database, config } from '../lib/appwrite';

const FeedbackProgressScreen: React.FC = ({ route, navigation }: any) => {
    const { matchId, mentorId, menteeId } = route.params || {};
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const progress = 0.6; // 60% complete

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await database.createDocument(
                config.dbId,
                config.col.mentorshipFeedbackCol,
                'unique()',
                {
                    matchId,
                    mentorId,
                    menteeId,
                    rating,
                    comment,
                    private: isPrivate,
                }
            );
            Alert.alert('Success', 'Your feedback has been submitted!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Could not submit feedback.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
    <View style={styles.container}>
      <Text style={styles.title}>Feedback & Progress</Text>
      {matchId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Feedback</Text>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Feather name="star" size={28} color={i <= rating ? COLORS.warning : COLORS.accent} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <View style={styles.privateRow}>
            <Text style={styles.privateLabel}>Private</Text>
            <Switch value={isPrivate} onValueChange={setIsPrivate} />
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skill Track Progress</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}% Complete</Text>
      </View>
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
  section: {
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
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
    minHeight: 40,
  },
  privateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  privateLabel: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginRight: 8,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBarBg: {
    height: 18,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'right',
  },
});

export default FeedbackProgressScreen; 