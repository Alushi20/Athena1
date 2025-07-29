import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: 'completed' | 'current' | 'upcoming';
  screen?: string;
  params?: any;
}

interface MentorshipFlowDiagramProps {
  currentStep?: string;
  onStepPress?: (step: FlowStep) => void;
  showNavigation?: boolean;
}

const MentorshipFlowDiagram: React.FC<MentorshipFlowDiagramProps> = ({
  currentStep = 'discover',
  onStepPress,
  showNavigation = true
}) => {
  const flowSteps: FlowStep[] = [
    {
      id: 'discover',
      title: 'Discover',
      description: 'Browse mentors and find the right match',
      icon: 'search',
      color: COLORS.primary,
      status: 'completed',
      screen: 'MentorDirectory'
    },
    {
      id: 'connect',
      title: 'Connect',
      description: 'Send mentorship request',
      icon: 'user-plus',
      color: COLORS.warning,
      status: 'completed',
      screen: 'MentorProfile'
    },
    {
      id: 'chat',
      title: 'Chat',
      description: 'Start conversation and build rapport',
      icon: 'message-circle',
      color: COLORS.success,
      status: 'current',
      screen: 'MentorshipChat'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'Book sessions and meetings',
      icon: 'calendar',
      color: COLORS.secondary,
      status: 'upcoming',
      screen: 'Scheduling'
    },
    {
      id: 'learn',
      title: 'Learn',
      description: 'Attend sessions and workshops',
      icon: 'book-open',
      color: COLORS.primary,
      status: 'upcoming',
      screen: 'LearningCenter'
    },
    {
      id: 'grow',
      title: 'Grow',
      description: 'Track progress and get feedback',
      icon: 'trending-up',
      color: COLORS.success,
      status: 'upcoming',
      screen: 'FeedbackProgress'
    }
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = flowSteps.findIndex(step => step.id === stepId);
    const currentIndex = flowSteps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const renderStep = (step: FlowStep, index: number) => {
    const status = getStepStatus(step.id);
    const isLast = index === flowSteps.length - 1;

    return (
      <View key={step.id} style={styles.stepContainer}>
        <TouchableOpacity
          style={[
            styles.stepButton,
            status === 'completed' && styles.stepCompleted,
            status === 'current' && styles.stepCurrent,
            status === 'upcoming' && styles.stepUpcoming
          ]}
          onPress={() => showNavigation && onStepPress && onStepPress(step)}
          disabled={!showNavigation}
        >
          <View style={[
            styles.stepIcon,
            { backgroundColor: status === 'completed' ? COLORS.success : step.color }
          ]}>
            <Feather 
              name={status === 'completed' ? 'check' : step.icon as any} 
              size={16} 
              color={COLORS.white} 
            />
          </View>
          <Text style={[
            styles.stepTitle,
            status === 'completed' && styles.stepTitleCompleted,
            status === 'current' && styles.stepTitleCurrent
          ]}>
            {step.title}
          </Text>
          <Text style={[
            styles.stepDescription,
            status === 'completed' && styles.stepDescriptionCompleted
          ]}>
            {step.description}
          </Text>
        </TouchableOpacity>
        
        {!isLast && (
          <View style={[
            styles.connector,
            status === 'completed' && styles.connectorCompleted,
            status === 'current' && styles.connectorCurrent
          ]} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Mentorship Journey</Text>
      <Text style={styles.subtitle}>Track your progress through the mentorship process</Text>
      
      <View style={styles.flowContainer}>
        {flowSteps.map((step, index) => renderStep(step, index))}
      </View>

      {showNavigation && (
        <View style={styles.navigationHint}>
          <Feather name="info" size={16} color={COLORS.textSecondary} />
          <Text style={styles.navigationText}>Tap on any step to navigate there</Text>
        </View>
      )}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  flowContainer: {
    alignItems: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    backgroundColor: COLORS.background,
  },
  stepCompleted: {
    backgroundColor: COLORS.success + '10',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  stepCurrent: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  stepUpcoming: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  stepTitleCompleted: {
    color: COLORS.success,
  },
  stepTitleCurrent: {
    color: COLORS.primary,
  },
  stepDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  stepDescriptionCompleted: {
    color: COLORS.success + 'CC',
  },
  connector: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.accent,
    marginVertical: 8,
  },
  connectorCompleted: {
    backgroundColor: COLORS.success,
  },
  connectorCurrent: {
    backgroundColor: COLORS.primary,
  },
  navigationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  navigationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
});

export default MentorshipFlowDiagram; 