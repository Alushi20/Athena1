import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { account } from '../lib/appwrite';

const MENTEE_QUESTIONS = {
  missionMatch: {
    question: "What kind of transformation are you hoping for?",
    options: ["Clarity about my career or passion", "More confidence in who I am", "Mastering technical skills", "Help dealing with pressure or doubt", "Becoming a leader or taking initiative", "Building something real (startup/project)"]
  },
  stageAlignment: {
    question: "Which best describes where you are now?",
    options: ["I’m exploring what I like", "I’m studying and building knowledge", "I’m starting out in my field", "I’m shifting into STEM", "I’ve started a business/project", "I’m not sure—I need help figuring it out"]
  },
  energySync: {
    question: "What kind of support do you respond best to?",
    options: ["Step-by-step plans", "A mix depending on the week", "Talking it out to find direction", "Motivation and emotional encouragement", "Fast tips and straight-up advice"]
  },
  commitmentVibe: {
    question: "How much mentorship do you feel you need right now?",
    options: ["Regular weekly support", "A couple of sessions per month", "Monthly check-ins are enough", "I want advice when needed", "I prefer group learning or chats"]
  },
  valuesChemistry: {
    question: "Which qualities do you hope your mentor brings? (Choose up to 3)",
    options: ["Someone who understands me", "Someone who tells me the truth", "Someone who makes me feel safe", "Someone who keeps me on track", "Someone who helps me think differently", "Someone who’s patient with me", "Someone who pushes me to grow"],
    multiSelect: 3
  }
};

const MenteeOnboardingScreen = ({ navigation }: any) => {
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSelect = (key: string, value: string, multiSelect?: number) => {
    setAnswers((prev: any) => {
      if (multiSelect) {
        const current = prev[key] || [];
        const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        return { ...prev, [key]: updated.slice(0, multiSelect) };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const user = await account.get();
        await account.updatePrefs({ ...user.prefs, ...answers });
        Alert.alert('Success', 'Your mentee profile is complete!');
        navigation.replace('Main');
    } catch (error: any) {
        Alert.alert('Error', error.message || 'Could not save your answers.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mentee Onboarding</Text>
      {Object.entries(MENTEE_QUESTIONS).map(([key, q]) => (
        <View key={key} style={styles.questionBox}>
          <Text style={styles.question}>{q.question}</Text>
          <View style={styles.optionsContainer}>
            {q.options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.option, (answers[key] || []).includes(opt) && styles.optionSelected]}
                onPress={() => handleSelect(key, opt, q.multiSelect)}
              >
                <Text style={[styles.optionText, (answers[key] || []).includes(opt) && styles.optionTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>Complete Profile</Text>}
      </TouchableOpacity>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 18,
    },
    questionBox: {
        marginBottom: 24,
    },
    question: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 12,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    option: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: COLORS.accent,
    },
    optionSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    optionText: {
        color: COLORS.text,
        fontSize: 15,
    },
    optionTextSelected: {
        color: COLORS.white,
    },
    submitBtn: {
        backgroundColor: COLORS.secondary,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 18,
    },
    submitBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 17,
    },
});

export default MenteeOnboardingScreen; 
