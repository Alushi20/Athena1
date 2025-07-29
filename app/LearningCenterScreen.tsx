import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Animated, TextInput } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

const TRACKS = [
  {
    id: 'confidence',
    title: 'Confidence Bootcamp',
    description: 'Build your confidence in STEM with these quick lessons.',
    contents: [
      { id: 'vid1', type: 'video', title: 'How to Speak Up in Meetings', duration: '3:12' },
      { id: 'art1', type: 'article', title: 'Overcoming Self-Doubt', duration: '2 min read' },
    ]
  },
  {
    id: 'bias',
    title: 'Bias Survival Guide',
    description: 'Learn to recognize and respond to bias in the workplace.',
    contents: [
      { id: 'vid2', type: 'video', title: 'Handling Biased Comments', duration: '4:01' },
      { id: 'art2', type: 'article', title: 'Your Rights at Work', duration: '3 min read' },
    ]
  },
];

const REFLECTION_PROMPT = 'What is one thing you can apply from this lesson to your daily life?';

const LearningCenterScreen: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 800);
  }, []);

  const handleReflectionSubmit = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1200);
    setReflection('');
    setSelectedContent(null);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }
  return (
    <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }] }>
      <Text style={styles.title}>Learning Center</Text>
      {TRACKS.map(track => (
        <View key={track.id} style={styles.trackSection}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackDesc}>{track.description}</Text>
          <FlatList
            data={track.contents}
            horizontal
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Animated.View style={styles.contentCard}>
                <Feather name={item.type === 'video' ? 'play-circle' : 'file-text'} size={28} color={COLORS.primary} />
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentType}>{item.type === 'video' ? 'Video' : 'Article'} • {item.duration}</Text>
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => setSelectedContent(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.startBtnText}>Start</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        </View>
      ))}
      {selectedContent && (
        <View style={styles.reflectionBox}>
          <Text style={styles.reflectionPrompt}>{REFLECTION_PROMPT}</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your reflection..."
            value={reflection}
            onChangeText={setReflection}
            multiline
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleReflectionSubmit} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedContent(null)}>
            <Feather name="x" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}
      {success && (
        <View style={styles.successBox}>
          <Feather name="check-circle" size={18} color={COLORS.success} />
          <Text style={styles.successText}>Reflection saved!</Text>
        </View>
      )}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 17,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 18,
  },
  trackSection: {
    marginBottom: 28,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  trackDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 14,
    width: 200,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  contentType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 6,
  },
  startBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  reflectionBox: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    position: 'relative',
  },
  reflectionPrompt: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
    minHeight: 40,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  successText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default LearningCenterScreen; 