import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { googleCalendarService, CalendarEvent, CalendarHelpers } from '../lib/googleCalendar';

interface CalendarIntegrationProps {
  event: CalendarEvent;
  onSuccess?: (eventId: string) => void;
  onError?: (error: string) => void;
  buttonStyle?: 'primary' | 'secondary' | 'icon';
  buttonText?: string;
  showConfirmation?: boolean;
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  event,
  onSuccess,
  onError,
  buttonStyle = 'primary',
  buttonText = 'Add to Calendar',
  showConfirmation = true
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAddToCalendar = async () => {
    if (showConfirmation) {
      setShowModal(true);
      return;
    }
    
    await addEventToCalendar();
  };

  const addEventToCalendar = async () => {
    setLoading(true);
    setShowModal(false);

    try {
      // Validate event data
      if (!CalendarHelpers.validateEvent(event)) {
        throw new Error('Invalid event data');
      }

      const eventId = await googleCalendarService.createEvent(event);
      
      if (eventId) {
        Alert.alert(
          'Success!',
          'Event has been added to your calendar.',
          [{ text: 'OK' }]
        );
        onSuccess?.(eventId);
      } else {
        throw new Error('Failed to create calendar event');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Error',
        `Failed to add event to calendar: ${errorMessage}`,
        [{ text: 'OK' }]
      );
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderButton = () => {
    const baseStyle = [styles.button];
    
    switch (buttonStyle) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'icon':
        baseStyle.push(styles.iconButton);
        break;
    }

    if (loading) {
      baseStyle.push(styles.loadingButton);
    }

    return (
      <TouchableOpacity
        style={baseStyle}
        onPress={handleAddToCalendar}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <Feather name="loader" size={16} color={COLORS.white} style={styles.spinning} />
        ) : (
          <Feather name="calendar" size={16} color={buttonStyle === 'secondary' ? COLORS.primary : COLORS.white} />
        )}
        {buttonStyle !== 'icon' && (
          <Text style={[
            styles.buttonText,
            buttonStyle === 'secondary' && styles.secondaryButtonText
          ]}>
            {loading ? 'Adding...' : buttonText}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Confirmation Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Feather name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Add to Calendar</Text>
            </View>

            <View style={styles.eventPreview}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDateTime}>
                {CalendarHelpers.formatDateTime(event.startDate)}
              </Text>
              {event.location && (
                <Text style={styles.eventLocation}>
                  📍 {event.location}
                </Text>
              )}
              <Text style={styles.eventDescription} numberOfLines={3}>
                {event.description}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addEventToCalendar}
              >
                <Text style={styles.confirmButtonText}>Add to Calendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  iconButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  loadingButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  eventPreview: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  eventDateTime: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CalendarIntegration; 