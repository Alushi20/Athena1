import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/Colors';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

type Community = {
    id: string;
    title: string;
    description: string;
    icon: string;
    memberCount?: number;
    category?: string;
};

type Post = {
    id: string;
    author: string;
    content: string;
    upvotes: number;
    replies: Reply[];
    isHelpful?: boolean;
    timestamp: string;
    authorAvatar?: string;
};

type Reply = {
    id: string;
    author: string;
    content: string;
    timestamp: string;
};

type RootStackParamList = {
    CommunityDetail: { community: Community };
};

type CommunityDetailProps = NativeStackScreenProps<RootStackParamList, 'CommunityDetail'>;

// Enhanced hardcoded data for demonstration
const HARDCODED_POSTS: Post[] = [
    { 
        id: '1', 
        author: 'Sarah J.', 
        content: 'Just started my first job in a tech startup and feeling a bit of imposter syndrome. Any advice on how to handle it?', 
        upvotes: 28, 
        timestamp: '2 hours ago',
        replies: [
            { id: 'r1', author: 'Dr. Evelyn Reed', content: "That's completely normal! Focus on your small wins and remember that everyone learns at their own pace. You've got this!", timestamp: '1 hour ago' },
            { id: 'r2', author: 'Aisha K.', content: 'I found that keeping a "brag document" of my accomplishments really helped boost my confidence.', timestamp: '45 min ago' }
        ], 
        isHelpful: true 
    },
    { 
        id: '2', 
        author: 'Emily R.', 
        content: 'How do you all approach asking for a raise? I feel like I deserve one but I\'m nervous to bring it up.', 
        upvotes: 45, 
        timestamp: '4 hours ago',
        replies: [
            { id: 'r3', author: 'Maria G.', content: 'Come prepared with data! List your key achievements and the value you brought to the company. Practice your pitch beforehand.', timestamp: '3 hours ago' }
        ]
    },
    {
        id: '3',
        author: 'Jessica L.',
        content: 'What are your favorite resources for learning new programming languages? I want to expand my skillset.',
        upvotes: 32,
        timestamp: '6 hours ago',
        replies: [
            { id: 'r4', author: 'Tech Mentor', content: 'I recommend starting with freeCodeCamp and then moving to Udemy courses. Also, build small projects to practice!', timestamp: '5 hours ago' },
            { id: 'r5', author: 'Code Queen', content: 'YouTube channels like Traversy Media and The Net Ninja are amazing for visual learners.', timestamp: '4 hours ago' }
        ]
    }
];

const CommunityDetailScreen: React.FC<CommunityDetailProps> = ({ route, navigation }) => {
    const { community } = route.params;
    const [posts, setPosts] = useState(HARDCODED_POSTS);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
        ]).start();
    }, []);

    const handleAddPost = () => {
        if (newPost.trim()) {
            setLoading(true);
            setTimeout(() => {
                const newPostData: Post = {
                    id: (posts.length + 1).toString(),
                    author: 'You',
                    content: newPost,
                    upvotes: 0,
                    replies: [],
                    timestamp: 'Just now'
                };
                setPosts([newPostData, ...posts]);
                setNewPost('');
                setLoading(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            }, 800);
        }
    };

    const toggleReplies = (postId: string) => {
        setShowReplies(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleUpvote = (postId: string) => {
        setPosts(prev => 
            prev.map(post => 
                post.id === postId 
                    ? { ...post, upvotes: post.upvotes + 1 }
                    : post
            )
        );
    };

    const renderPost = ({ item }: { item: Post }) => (
        <Animated.View style={[styles.postCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.postHeader}>
                <View style={styles.authorInfo}>
                    <View style={styles.avatar}>
                        <Feather name="user" size={20} color={COLORS.white} />
                    </View>
                    <View>
                        <Text style={styles.postAuthor}>{item.author}</Text>
                        <Text style={styles.postTimestamp}>{item.timestamp}</Text>
                    </View>
                </View>
                {item.isHelpful && (
                    <View style={styles.helpfulBadge}>
                        <Feather name="award" size={14} color={COLORS.success} />
                        <Text style={styles.helpfulText}>Helpful</Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.postContent}>{item.content}</Text>
            
            <View style={styles.postActions}>
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => handleUpvote(item.id)}
                    activeOpacity={0.7}
                >
                    <Feather name="thumbs-up" size={16} color={COLORS.primary} />
                    <Text style={styles.actionText}>{item.upvotes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => toggleReplies(item.id)}
                    activeOpacity={0.7}
                >
                    <Feather name="message-circle" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.actionText}>{item.replies.length} replies</Text>
                </TouchableOpacity>
            </View>

            {showReplies[item.id] && item.replies.length > 0 && (
                <View style={styles.repliesContainer}>
                    {item.replies.map((reply) => (
                        <View key={reply.id} style={styles.replyCard}>
                            <View style={styles.replyHeader}>
                                <View style={styles.replyAvatar}>
                                    <Feather name="user" size={14} color={COLORS.white} />
                                </View>
                                <Text style={styles.replyAuthor}>{reply.author}</Text>
                                <Text style={styles.replyTimestamp}>{reply.timestamp}</Text>
                            </View>
                            <Text style={styles.replyContent}>{reply.content}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
            <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Feather name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <View style={styles.communityIcon}>
                            <MaterialCommunityIcons name={community.icon as any} size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{community.title}</Text>
                            {community.memberCount && (
                                <Text style={styles.memberCount}>{community.memberCount.toLocaleString()} members</Text>
                            )}
                        </View>
                    </View>
            </View>

            <Text style={styles.headerDescription}>{community.description}</Text>

                {/* Post Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Share your thoughts or ask a question..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={newPost}
                    onChangeText={setNewPost}
                    multiline
                        maxLength={500}
                />
                    <TouchableOpacity 
                        style={[styles.sendButton, !newPost.trim() && styles.sendButtonDisabled]} 
                        onPress={handleAddPost} 
                        disabled={loading || !newPost.trim()}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size={18} color={COLORS.white} />
                        ) : (
                            <Feather name="send" size={20} color={COLORS.white} />
                        )}
                </TouchableOpacity>
                </View>

                {success && (
                    <Animated.View style={[styles.successBox, { opacity: fadeAnim }]}>
                        <Feather name="check-circle" size={18} color={COLORS.success} />
                        <Text style={styles.successText}>Post sent successfully!</Text>
                    </Animated.View>
                )}

                {/* Posts List */}
                <FlatList
                    data={posts}
                    keyExtractor={item => item.id}
                    renderItem={renderPost}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderTitle}>Recent Discussions</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="forum-outline" size={64} color={COLORS.textSecondary} />
                            <Text style={styles.emptyTitle}>No posts yet</Text>
                            <Text style={styles.emptyText}>Be the first to start a discussion!</Text>
                        </View>
                    }
                />
            </KeyboardAvoidingView>
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
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    communityIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: `${COLORS.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    memberCount: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    headerDescription: {
        fontSize: 16,
        color: COLORS.textSecondary,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        margin: 20,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'flex-end',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 16,
        paddingVertical: 8,
        fontSize: 16,
        color: COLORS.text,
        maxHeight: 100,
        textAlignVertical: 'top',
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 10,
        marginLeft: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,
        minHeight: 44,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.border,
    },
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.success}15`,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: `${COLORS.success}30`,
    },
    successText: {
        color: COLORS.success,
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 8,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    listHeader: {
        marginBottom: 16,
    },
    listHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    postCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    postAuthor: {
        fontWeight: 'bold',
        color: COLORS.text,
        fontSize: 16,
        marginBottom: 2,
    },
    postTimestamp: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    helpfulBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.success}15`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    helpfulText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    postContent: {
        color: COLORS.text,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 6,
    },
    repliesContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    replyCard: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    replyAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    replyAuthor: {
        fontWeight: '600',
        color: COLORS.text,
        fontSize: 14,
        marginRight: 8,
    },
    replyTimestamp: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    replyContent: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
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
    },
});

export default CommunityDetailScreen; 