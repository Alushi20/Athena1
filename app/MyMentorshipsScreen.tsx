import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { account, database, config } from '../lib/appwrite';
import { Query } from 'react-native-appwrite';

const MyMentorshipsScreen: React.FC = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const user = await account.get();
                const response = await database.listDocuments(
                    config.dbId,
                    config.col.mentorshipMatchesCol,
                    [
                        Query.or([
                            Query.equal('menteeId', user.$id),
                            Query.equal('mentorId', user.$id)
                        ])
                    ]
                );
                setMatches(response.documents);
            } catch (e) {
                setError("Failed to fetch mentorships.");
            } finally {
                setLoading(false);
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
            }
        };
        fetchMatches();
    }, []);

    const renderMatchCard = ({ item }: { item: any }) => (
        <Animated.View style={styles.card}>
            <Text style={styles.matchTitle}>Mentor: {item.mentorId.name} | Mentee: {item.menteeId.name}</Text>
            <Text style={styles.status}>Status: <Text style={{ color: item.status === 'active' ? COLORS.success : COLORS.warning }}>{item.status}</Text></Text>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.chatBtn]} onPress={() => navigation.navigate('MentorshipChat' as never, { matchId: item.$id } as never)}>
                    <Feather name="message-circle" size={18} color={COLORS.white} />
                    <Text style={styles.buttonText}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.scheduleBtn]} onPress={() => navigation.navigate('Scheduling' as never, { mentorId: item.mentorId, matchId: item.$id } as never)}>
                    <Feather name="calendar" size={18} color={COLORS.white} />
                    <Text style={styles.buttonText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.feedbackBtn]} onPress={() => navigation.navigate('Feedback' as never, { matchId: item.$id, mentorId: item.mentorId, menteeId: item.menteeId } as never)}>
                    <Feather name="star" size={18} color={COLORS.white} />
                    <Text style={styles.buttonText}>Feedback</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }
    if (error) {
        return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Mentorships</Text>
            <FlatList
                data={matches}
                keyExtractor={item => item.$id}
                renderItem={renderMatchCard}
                ListEmptyComponent={<Text style={styles.emptyText}>No mentorships yet.</Text>}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
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
    card: {
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
    matchTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    status: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    chatBtn: {
        backgroundColor: COLORS.primary,
    },
    scheduleBtn: {
        backgroundColor: COLORS.secondary,
    },
    feedbackBtn: {
        backgroundColor: COLORS.accent,
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
});

export default MyMentorshipsScreen; 