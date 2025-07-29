import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { database, config } from '../lib/appwrite';
import { Query } from 'react-native-appwrite';
import MentorCard, { Mentor } from '../components/MentorCard';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Models } from 'react-native-appwrite';
import { useNavigation } from '@react-navigation/native';
import { account } from '../lib/appwrite';

// Define the screen params for type safety
type RootStackParamList = {
    MentorDirectory: undefined;
    MentorProfile: { mentorId: string };
};

type MentorDirectoryProps = NativeStackScreenProps<RootStackParamList, 'MentorDirectory'>;

// Mock Data for UI development with profile pictures
const MOCK_MENTORS: Mentor[] = [
  {
    $id: 'am1',
    name: 'Dr. Anne‑Marie Imafidon',
    bio: 'CEO of Stemettes and Oxford MMath graduate. Advocates for women in tech.',
    skills: ['AI', 'Education', 'Social Enterprise'],
    profilePic: 'https://randomuser.me/api/portraits/women/71.jpg',
  },
  {
    $id: 'aya1',
    name: 'Aya Mouallem',
    bio: 'Stanford engineer & co‑founder of All Girls Code, empowering girls in Lebanon.',
    skills: ['Electrical Engineering', 'Coding', 'Mentorship'],
    profilePic: 'https://randomuser.me/api/portraits/women/72.jpg',
  },
  {
    $id: 'sara1',
    name: 'Sara Berkai',
    bio: 'Founder of Ambessa Play; innovator in STEM kits for refugee youth.',
    skills: ['Product Design', 'STEM Education', 'Social Impact'],
    profilePic: 'https://randomuser.me/api/portraits/women/73.jpg',
  },
  {
    $id: 'jed1',
    name: 'Dr. Jedidah Isler',
    bio: 'Astrophysicist and TED Fellow advocating for diversity in STEM.',
    skills: ['Astrophysics', 'Research', 'Public Speaking'],
    profilePic: 'https://randomuser.me/api/portraits/women/74.jpg',
  },
  {
    $id: 'evelyn1',
    name: 'Dr. Evelyn Reed',
    bio: 'AI researcher with 10+ years at Google. Passionate about guiding young women in tech.',
    skills: ['AI', 'Machine Learning', 'Python', 'Natural Language Processing'],
    profilePic: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    $id: 'aisha1',
    name: 'Aisha Khan',
    bio: 'Biotech pioneer, specializing in gene editing. Loves to help students navigate the world of biotech.',
    skills: ['Biotech', 'CRISPR', 'Genetics', 'Molecular Biology'],
    profilePic: 'https://randomuser.me/api/portraits/women/69.jpg',
  },
  {
    $id: 'maria1',
    name: 'Maria Garcia',
    bio: 'Software Engineer at Microsoft. Focused on cloud computing and scalable systems.',
    skills: ['Azure', 'Databases', 'C#', '.NET', 'Distributed Systems'],
    profilePic: 'https://randomuser.me/api/portraits/women/70.jpg',
  },
  {
    $id: 'sophia1',
    name: 'Dr. Sophia Chen',
    bio: 'Quantum computing researcher at IBM. Breaking barriers in quantum algorithms.',
    skills: ['Quantum Computing', 'Physics', 'Algorithms', 'Research'],
    profilePic: 'https://randomuser.me/api/portraits/women/75.jpg',
  },
  {
    $id: 'priya1',
    name: 'Priya Patel',
    bio: 'Data scientist and machine learning expert. Helping women break into AI.',
    skills: ['Data Science', 'Machine Learning', 'Python', 'Statistics'],
    profilePic: 'https://randomuser.me/api/portraits/women/76.jpg',
  },
  {
    $id: 'lisa1',
    name: 'Lisa Thompson',
    bio: 'Cybersecurity expert and ethical hacker. Teaching digital safety and security.',
    skills: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Penetration Testing'],
    profilePic: 'https://randomuser.me/api/portraits/women/77.jpg',
  },
  {
    $id: 'jennifer1',
    name: 'Jennifer Rodriguez',
    bio: 'Robotics engineer and automation specialist. Building the future of manufacturing.',
    skills: ['Robotics', 'Automation', 'Mechanical Engineering', 'Control Systems'],
    profilePic: 'https://randomuser.me/api/portraits/women/78.jpg',
  },
  {
    $id: 'rachel1',
    name: 'Rachel Kim',
    bio: 'Blockchain developer and DeFi expert. Innovating in decentralized finance.',
    skills: ['Blockchain', 'DeFi', 'Smart Contracts', 'Solidity'],
    profilePic: 'https://randomuser.me/api/portraits/women/79.jpg',
  }
];


const MentorDirectoryScreen: React.FC<MentorDirectoryProps> = ({ navigation }) => {
    const [mentors, setMentors] = useState<Models.Document[]>([]);
    const [currentUser, setCurrentUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (!isMounted) return;
            setLoading(true);
            try {
                const userRes = await account.get();
                if (isMounted) {
                    setCurrentUser(userRes);
                    setUserRole(userRes.prefs?.role ?? null);
                    // Use mock data for better UI demonstration
                    setMentors(MOCK_MENTORS as any);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                // Fallback to mock data if database fails
                if (isMounted) {
                    setMentors(MOCK_MENTORS as any);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    const calculateMatchScore = (mentor: Models.Document): number => {
        if (!currentUser) return 0;
        const menteeSkills = currentUser.prefs?.skills || [];
        const menteeInterests = currentUser.prefs?.fieldsOfInterest || [];
        const mentorSkills = mentor.skills || [];
        const mentorInterests = mentor.fieldsOfInterest || [];
        const skillOverlap = menteeSkills.filter((s: string) => mentorSkills.includes(s)).length;
        const interestOverlap = menteeInterests.filter((i: string) => mentorInterests.includes(i)).length;
        const totalPossible = menteeSkills.length + menteeInterests.length;
        if (totalPossible === 0) return 50; // Default score if mentee has no prefs
        return ((skillOverlap + interestOverlap) / totalPossible) * 100;
    };

    const mentorsWithScores = mentors
        .map(mentor => ({ ...mentor, matchScore: calculateMatchScore(mentor) }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    const filteredMentors = mentorsWithScores.filter((mentor: any) =>
        (mentor.name as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mentor.skills as string[])?.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Find a Mentor</Text>
                <Text style={styles.subtitle}>Connect with experienced women in STEM who can guide you.</Text>
                {userRole === 'mentor' && (
                    <TouchableOpacity style={styles.requestsButton} onPress={() => navigation.navigate('MentorshipRequestsTab' as never)}>
                        <Feather name="bell" size={20} color={COLORS.primary} />
                        <Text style={styles.requestsButtonText}>Requests</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or skill..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Popular Skills:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                        {['AI', 'Machine Learning', 'Python', 'Data Science', 'Cybersecurity', 'Biotech'].map((skill) => (
                            <TouchableOpacity
                                key={skill}
                                style={[styles.filterChip, searchQuery === skill && styles.activeFilterChip]}
                                onPress={() => setSearchQuery(searchQuery === skill ? '' : skill)}
                            >
                                <Text style={[styles.filterChipText, searchQuery === skill && styles.activeFilterChipText]}>
                                    {skill}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsText}>
                        {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
                    </Text>
                    <Text style={styles.resultsSubtext}>
                        Sorted by match score
                    </Text>
                </View>

                <FlatList
                    data={filteredMentors}
                    renderItem={({ item }) => (
                        <MentorCard 
                            mentor={item as unknown as Mentor} 
                            onPress={() => navigation.navigate('MentorProfile', { mentorId: item.$id })}
                        />
                    )}
                    keyExtractor={(item) => item.$id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="search" size={48} color={COLORS.textSecondary} />
                            <Text style={styles.emptyTitle}>No mentors found</Text>
                            <Text style={styles.emptyText}>
                                Try adjusting your search terms or browse all mentors
                            </Text>
                        </View>
                    }
                />
            </View>
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
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: COLORS.text,
    },
    requestsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        backgroundColor: COLORS.accent,
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    requestsButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 6,
    },
    resultsHeader: {
        marginBottom: 16,
    },
    resultsText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    resultsSubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    filterContainer: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    filterScroll: {
        flexGrow: 0,
    },
    filterChip: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    activeFilterChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    activeFilterChipText: {
        color: COLORS.white,
    },
});

export default MentorDirectoryScreen; 