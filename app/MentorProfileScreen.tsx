import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { account, database, config } from '../lib/appwrite';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { Mentor } from '../components/MentorCard'; 
import { Models } from 'react-native-appwrite';
import { Query } from 'react-native-appwrite';

// Reusing mock data for this screen
const MOCK_MENTORS: Mentor[] = [
    { $id: '1', name: 'Dr. Evelyn Reed', bio: 'AI researcher with 10+ years at Google. Passionate about guiding young women in tech. My goal is to demystify AI and make it accessible for everyone. I believe in a hands-on approach to learning and mentorship.', skills: ['AI', 'Machine Learning', 'Python', 'Natural Language Processing', 'Deep Learning'], fieldsOfInterest: ['Artificial Intelligence', 'Tech Ethics'], profilePic: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { $id: '2', name: 'Aisha Khan', bio: 'Biotech pioneer, specializing in gene editing. Loves to help students navigate the world of biotech. My work focuses on developing novel therapies for genetic disorders.', skills: ['Biotech', 'CRISPR', 'Genetics', 'Molecular Biology', 'Lab Research'], fieldsOfInterest: ['Biotechnology', 'Healthcare'], profilePic: 'https://randomuser.me/api/portraits/women/69.jpg' },
    { $id: '3', name: 'Maria Garcia', bio: 'Software Engineer at Microsoft. Focused on cloud computing and scalable systems. I enjoy building robust back-end services and mentoring early-career engineers.', skills: ['Azure', 'Databases', 'C#', '.NET', 'Distributed Systems'], fieldsOfInterest: ['Cloud Computing', 'Software Architecture'], profilePic: 'https://randomuser.me/api/portraits/women/70.jpg' },
];

type RootStackParamList = {
    MentorProfile: { mentorId: string };
};

type MentorProfileProps = NativeStackScreenProps<RootStackParamList, 'MentorProfile'>;

const MentorProfileScreen: React.FC<MentorProfileProps> = ({ route, navigation }) => {
    const { mentorId } = route.params;
    const [mentor, setMentor] = useState<Models.Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'sent' | 'matched' | 'error'>("idle");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchMentorProfile = async () => {
            if(!isMounted) return;
            setLoading(true);
            try {
                const response = await database.getDocument(
                    config.dbId,
                    config.col.usersCol,
                    mentorId
                );
                if(isMounted) {
                    setMentor(response);
                }
            } catch (error) {
                console.error("Failed to fetch mentor profile:", error);
            } finally {
                if(isMounted) {
                    setLoading(false);
                }
            }
        };
        const fetchCurrentUser = async () => {
            try {
                const user = await account.get();
                setCurrentUserId(user.$id);
            } catch (error) {
                setCurrentUserId(null);
            }
        };
        fetchMentorProfile();
        fetchCurrentUser();
        return () => {
            isMounted = false;
        };
    }, [mentorId]);

    const handleRequestMentorship = async () => {
        if (!currentUserId || !mentor) return;
        setRequestStatus('pending');
        try {
            // Check for existing match
            const existing = await database.listDocuments(
                config.dbId,
                config.col.mentorshipMatchesCol,
                [
                    // @ts-ignore
                    Query.equal('mentorId', mentor.$id),
                    Query.equal('menteeId', currentUserId),
                    Query.or([
                        Query.equal('status', 'pending'),
                        Query.equal('status', 'active')
                    ])
                ]
            );
            if (existing.documents.length > 0) {
                setRequestStatus('matched');
                return;
            }
            // Create new match
            await database.createDocument(
                config.dbId,
                config.col.mentorshipMatchesCol,
                'unique()',
                {
                    mentorId: mentor.$id,
                    menteeId: currentUserId,
                    status: 'pending',
                    matchedOn: new Date().toISOString(),
                }
            );
            setRequestStatus('sent');
        } catch (error) {
            setRequestStatus('error');
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />;
    }

    if (!mentor) {
        return <View style={styles.container}><Text>Mentor not found.</Text></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Image source={{ uri: mentor.profilePic as string || undefined }} style={styles.avatar} />
                    <Text style={styles.name}>{mentor.name as string}</Text>
                    <View style={styles.pillsContainer}>
                        {(mentor.fieldsOfInterest as string[] || []).map(field => (
                             <View key={field} style={[styles.pill, styles.fieldPill]}>
                                <Text style={[styles.pillText, styles.fieldPillText]}>{field}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About Me</Text>
                    <Text style={styles.bio}>{mentor.bio as string}</Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.pillsContainer}>
                        {(mentor.skills as string[] || []).map(skill => (
                            <View key={skill} style={[styles.pill, styles.skillPill]}>
                                <Text style={[styles.pillText, styles.skillPillText]}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.requestButton, (requestStatus === 'sent' || requestStatus === 'matched' || requestStatus === 'pending') && { backgroundColor: COLORS.accent }]} 
                    onPress={handleRequestMentorship} 
                    activeOpacity={0.8}
                    disabled={requestStatus === 'sent' || requestStatus === 'matched' || requestStatus === 'pending'}
                >
                    <Feather name="link" size={20} color={COLORS.white} />
                    <Text style={styles.requestButtonText}>
                        {requestStatus === 'idle' && 'Request Mentorship'}
                        {requestStatus === 'pending' && 'Sending...'}
                        {requestStatus === 'sent' && 'Request Sent'}
                        {requestStatus === 'matched' && 'Already Requested'}
                        {requestStatus === 'error' && 'Error, Try Again'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.primary,
        marginBottom: 16,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 18,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 12,
    },
    bio: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        justifyContent: 'center',
    },
    pill: {
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 14,
        margin: 4,
    },
    skillPill: {
        backgroundColor: COLORS.accent,
    },
    fieldPill: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
    },
    skillPillText: {
        color: COLORS.primary,
    },
    fieldPillText: {
        color: COLORS.secondary,
    },
    requestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        paddingVertical: 14,
        marginTop: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    requestButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default MentorProfileScreen; 