import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Animated, 
  SafeAreaView,
  StatusBar,
  Dimensions
} from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';

const { width } = Dimensions.get('window');

const COMMUNITIES = [
  {
    id: "1",
    title: "Job Search Tips",
    description: "Advice and resources for finding your next STEM job.",
    icon: "briefcase-search-outline",
    memberCount: 1247,
    isJoined: false,
    category: "Career"
  },
  {
    id: "2",
    title: "First Year in STEM",
    description: "Share your experiences and get support in your first year.",
    icon: "calendar-star",
    memberCount: 892,
    isJoined: true,
    category: "Support"
  },
  {
    id: "3",
    title: "Handling Workplace Bias",
    description: "Discuss challenges and solutions for bias in STEM fields.",
    icon: "account-group-outline",
    memberCount: 2156,
    isJoined: false,
    category: "Advocacy"
  },
  {
    id: "4",
    title: "Early Career Struggles",
    description: "Talk about the ups and downs of starting out in STEM.",
    icon: "emoticon-sad-outline",
    memberCount: 1567,
    isJoined: true,
    category: "Support"
  },
  {
    id: "5",
    title: "Weekly Panel & Q&A",
    description: "Join our weekly expert panel and ask your questions!",
    icon: "forum-outline",
    memberCount: 3421,
    isJoined: false,
    category: "Events"
  },
  {
    id: "6",
    title: "Mentorship Stories",
    description: "Share your mentorship experiences and success stories.",
    icon: "heart-multiple",
    memberCount: 987,
    isJoined: false,
    category: "Mentorship"
  },
  {
    id: "7",
    title: "Tech Leadership",
    description: "Discuss leadership challenges and growth in tech.",
    icon: "crown",
    memberCount: 743,
    isJoined: false,
    category: "Leadership"
  },
  {
    id: "8",
    title: "Work-Life Balance",
    description: "Tips and discussions about maintaining balance in STEM careers.",
    icon: "scale-balance",
    memberCount: 1123,
    isJoined: true,
    category: "Wellness"
  }
];

const CATEGORIES = ["All", "Career", "Support", "Advocacy", "Events", "Mentorship", "Leadership", "Wellness"];

export default function CommunitiesScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [communities, setCommunities] = useState(COMMUNITIES);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const filteredCommunities = selectedCategory === "All" 
    ? communities 
    : communities.filter(community => community.category === selectedCategory);

  const toggleJoin = (communityId: string) => {
    setCommunities(prev => 
      prev.map(community => 
        community.id === communityId 
          ? { ...community, isJoined: !community.isJoined }
          : community
      )
    );
  };

  const renderCommunityCard = ({ item }: { item: any }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CommunityDetail', { community: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name={item.icon as any} size={28} color={COLORS.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.categoryContainer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.joinButton, item.isJoined && styles.joinedButton]}
            onPress={() => toggleJoin(item.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.joinButtonText, item.isJoined && styles.joinedButtonText]}>
              {item.isJoined ? 'Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.memberCount}>
            <Ionicons name="people" size={14} color={COLORS.textSecondary} />
            <Text style={styles.memberCountText}>{item.memberCount.toLocaleString()}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryFilter,
              selectedCategory === item && styles.selectedCategoryFilter
            ]}
            onPress={() => setSelectedCategory(item)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.categoryFilterText,
              selectedCategory === item && styles.selectedCategoryFilterText
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Communities</Text>
          <Text style={styles.headerSubtitle}>Connect with like-minded professionals</Text>
        </View>

        {/* Category Filters */}
        {renderCategoryFilter()}

        {/* Communities List */}
        <FlatList
          data={filteredCommunities}
          keyExtractor={item => item.id}
          renderItem={renderCommunityCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-group-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No communities found</Text>
              <Text style={styles.emptyText}>Try selecting a different category</Text>
            </View>
          }
        />

        {/* Create Community Button */}
        <View style={styles.createButtonContainer}>
          <TouchableOpacity style={styles.createBtn} activeOpacity={0.9}>
            <Feather name="plus" size={24} color={COLORS.white} />
        <Text style={styles.createBtnText}>Create New Community</Text>
      </TouchableOpacity>
    </View>
      </View>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  categoryContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCategoryFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectedCategoryFilterText: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  categoryBadge: {
    backgroundColor: `${COLORS.secondary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: COLORS.success,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: COLORS.white,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
}); 