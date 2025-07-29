import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  TextInput, 
  Animated, 
  Platform, 
  Linking,
  ScrollView,
  Dimensions,
  Modal,
  FlatList
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import CustomButton from "../components/CustomButton";
import { Account, Storage, ID } from "react-native-appwrite";
import { client, config } from "../lib/appwrite";
import { 
  Feather, 
  MaterialCommunityIcons, 
  Ionicons, 
  FontAwesome, 
  Entypo,
  AntDesign,
  MaterialIcons,
  Octicons,
  SimpleLineIcons
} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS,FONTS } from "../constants/Colors";

const { width, height } = Dimensions.get('window');

// Define the screen params for type safety
type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  LoginPage: undefined;
};

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  // Basic Profile Data
  const [email, setEmail] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [skills, setSkills] = useState<string>("");
  const [linkedIn, setLinkedIn] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("");
  const [languages, setLanguages] = useState<string>("");
  const [interests, setInterests] = useState<string>("");
  
  // Professional Info
  const [company, setCompany] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [certifications, setCertifications] = useState<string>("");
  
  // Files & Documents
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvName, setCvName] = useState<string | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [verificationDocName, setVerificationDocName] = useState<string | null>(null);
  
  // Settings & Preferences
  const [themeDark, setThemeDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [mentorshipNotifications, setMentorshipNotifications] = useState(true);
  const [workshopNotifications, setWorkshopNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showLocation, setShowLocation] = useState(true);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'settings' | 'privacy'>('profile');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#a66cff');
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Animations
  const [editAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const [tabAnim] = useState(new Animated.Value(0));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const account = new Account(client);
  const storage = new Storage(client);

  useEffect(() => {
    setLoading(true);
    async function fetchUserData() {
      try {
        const user = await account.get();
        setEmail(user.email);
        setDisplayName(user.name);
        if (user.prefs && user.prefs.profilePic) setProfilePic(user.prefs.profilePic);
        if (user.prefs && user.prefs.themeDark !== undefined) setThemeDark(user.prefs.themeDark);
        if (user.prefs && user.prefs.notifications !== undefined) setNotifications(user.prefs.notifications);
        if (user.prefs && user.prefs.bio) setBio(user.prefs.bio);
        if (user.prefs && user.prefs.username) setUsername(user.prefs.username);
        if (user.prefs && user.prefs.phone) setPhone(user.prefs.phone);
        if (user.prefs && user.prefs.location) setLocation(user.prefs.location);
        if (user.prefs && user.prefs.skills) setSkills(user.prefs.skills);
        if (user.prefs && user.prefs.linkedIn) setLinkedIn(user.prefs.linkedIn);
        if (user.prefs && user.prefs.cvUrl) {
          setCvUrl(user.prefs.cvUrl);
          setCvName(user.prefs.cvName || null);
        }
        setVerificationStatus(user.prefs.verificationStatus || 'unverified');
        setVerificationDocName(user.prefs.verificationDocName || null);
        setRole(user.prefs.role || null);
      } catch (error) {
        setError("Failed to fetch user data.");
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }
    }
    fetchUserData();
  }, []);

  // Enhanced Profile completeness calculation
  const completeness = (() => {
    const profileFields = [
      profilePic, bio, username, phone, location, skills, linkedIn, cvUrl,
      company, position, experience, education, github, website,
      timezone, languages, interests, certifications
    ];
    const filled = profileFields.filter(field => field && field.trim() !== '').length;
    return filled / profileFields.length;
  })();

  // Theme colors for customization
  const themeColors = [
    '#a66cff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'
  ];

  // Tab configuration
  const tabs = [
    { id: 'profile', title: 'Profile', icon: 'user' },
    { id: 'professional', title: 'Professional', icon: 'briefcase' },
    { id: 'settings', title: 'Settings', icon: 'settings' },
    { id: 'privacy', title: 'Privacy', icon: 'shield' }
  ];

  // Helper function to render skill tags
  const renderSkillTags = (skillsString: string) => {
    if (!skillsString) return null;
    const skillArray = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);
    return (
      <View style={styles.skillTagsContainer}>
        {skillArray.map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillTagText}>{skill}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Helper function to render social links
  const renderSocialLinks = () => {
    const socialLinks = [
      { platform: 'LinkedIn', url: linkedIn, icon: 'linkedin', color: '#0077b5' },
      { platform: 'GitHub', url: github, icon: 'github', color: '#333' },
      { platform: 'Website', url: website, icon: 'globe', color: '#4ecdc4' }
    ].filter(link => link.url);

    if (socialLinks.length === 0) return null;

    return (
      <View style={styles.socialLinksContainer}>
        <Text style={styles.sectionSubtitle}>Social Links</Text>
        {socialLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.socialLink, { backgroundColor: link.color }]}
            onPress={() => Linking.openURL(link.url)}
          >
            <Feather name={link.icon as any} size={16} color="#fff" />
            <Text style={styles.socialLinkText}>{link.platform}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: completeness,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [completeness]);

  // Pick and upload profile picture
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      try {
        const asset = result.assets[0];
        const fileUri = asset.uri;
        const fileName = fileUri.split('/').pop() || `profile_${Date.now()}.jpg`;
        const fileType = asset.type || 'image/jpeg';
        const fileSize = asset.fileSize || 1;
        // Upload to Appwrite Storage
        const fileRes = await storage.createFile(
          config.dbId,
          ID.unique(),
          {
            uri: fileUri,
            name: fileName,
            type: fileType,
            size: fileSize,
          }
        );
        // Get file preview URL
        const fileUrl = storage.getFilePreview(config.dbId, fileRes.$id).href;
        setProfilePic(fileUrl);
        await account.updatePrefs({ profilePic: fileUrl });
      } catch (err) {
        Alert.alert("Upload failed", "Could not upload profile picture.");
      } finally {
        setUploading(false);
      }
    }
  };

  // Pick and upload CV
  const pickCV = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.assets && result.assets.length > 0) {
      setUploading(true);
      try {
        const asset = result.assets[0];
        const fileUri = asset.uri;
        const fileName = asset.name || `cv_${Date.now()}`;
        const fileType = asset.mimeType || 'application/pdf';
        const fileSize = asset.size || 1;
        const fileRes = await storage.createFile(
          config.dbId,
          ID.unique(),
          {
            uri: fileUri,
            name: fileName,
            type: fileType,
            size: fileSize,
          }
        );
        const fileUrl = storage.getFileView(config.dbId, fileRes.$id).href;
        setCvUrl(fileUrl);
        setCvName(fileName);
        await account.updatePrefs({ cvUrl: fileUrl, cvName: fileName });
      } catch (err) {
        Alert.alert("Upload failed", "Could not upload CV.");
      } finally {
        setUploading(false);
      }
    }
  };

  // Pick and upload verification document
  const pickVerificationDoc = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (result.assets && result.assets.length > 0) {
        const { name, uri, mimeType, size } = result.assets[0];
        const file = { uri, name, type: mimeType || 'application/pdf', size: size || 0 };
        const uploadedFile = await storage.createFile(config.storageId, ID.unique(), file);
        const user = await account.get();
        await account.updatePrefs({
          ...user.prefs,
          verificationStatus: 'pending',
          verificationDocId: uploadedFile.$id,
          verificationDocName: name,
        });
        setVerificationStatus('pending');
        setVerificationDocName(name);
        Alert.alert("Document Uploaded", "Your verification document is pending review.");
      }
    } catch (error) {
      Alert.alert("Upload Failed", "Could not upload the verification document.");
    }
  };

  // Toggle theme and notifications
  const toggleTheme = async () => {
    setThemeDark((prev) => !prev);
    await account.updatePrefs({ themeDark: !themeDark });
  };
  const toggleNotifications = async () => {
    setNotifications((prev) => !prev);
    await account.updatePrefs({ notifications: !notifications });
  };

  // Edit mode animation
  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    Animated.timing(editAnim, {
      toValue: editMode ? 0 : 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  // Enhanced save profile fields
  const saveProfile = async () => {
    setLoading(true);
    try {
      const profileData = {
        bio, username, phone, location, skills, linkedIn, github, website,
        timezone, languages, interests, company, position, experience,
        education, certifications, portfolioUrl,
        // Privacy settings
        showEmail, showPhone, showLocation, privacyPublic,
        // Notification settings
        emailNotifications, pushNotifications, mentorshipNotifications,
        workshopNotifications, eventNotifications,
        // Theme settings
        selectedColor
      };
      
      await account.updatePrefs(profileData);
      setEditMode(false);
      Animated.timing(editAnim, { toValue: 0, duration: 400, useNativeDriver: false }).start();
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      Alert.alert("Save failed", "Could not save profile info.");
    } finally {
      setLoading(false);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
  return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.infoCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
                  <Feather name={editMode ? "x" : "edit-3"} size={20} color={selectedColor} />
        </TouchableOpacity>
            </View>
              
        <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email-outline" size={22} color={selectedColor} style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>{email || "N/A"}</Text>
        </View>
              
        <View style={styles.infoRow}>
                <Ionicons name="person-circle-outline" size={22} color={selectedColor} style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>{displayName || "No Name"}</Text>
        </View>

              <Animated.View style={{ 
                overflow: 'hidden', 
                height: editAnim.interpolate({ 
                  inputRange: [0, 1], 
                  outputRange: [0, 500] 
                }) 
              }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
                      placeholder="@yourusername"
                      value={username}
                      onChangeText={setUsername}
                      editable={editMode}
                      placeholderTextColor="#b983ff"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bio</Text>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Tell us about yourself..."
              value={bio}
              onChangeText={setBio}
              editable={editMode}
              placeholderTextColor="#b983ff"
              multiline
                      numberOfLines={4}
            />
          </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
                    placeholder="+1 (555) 123-4567"
              value={phone}
              onChangeText={setPhone}
              editable={editMode}
              placeholderTextColor="#b983ff"
              keyboardType="phone-pad"
            />
          </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
                    placeholder="City, Country"
              value={location}
              onChangeText={setLocation}
              editable={editMode}
              placeholderTextColor="#b983ff"
            />
          </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Skills</Text>
            <TextInput
              style={styles.input}
                    placeholder="React Native, JavaScript, UI/UX Design"
              value={skills}
              onChangeText={setSkills}
              editable={editMode}
              placeholderTextColor="#b983ff"
            />
          </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Languages</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="English, Spanish, French"
                    value={languages}
                    onChangeText={setLanguages}
                    editable={editMode}
                    placeholderTextColor="#b983ff"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Interests</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="AI, Machine Learning, Photography"
                    value={interests}
                    onChangeText={setInterests}
                    editable={editMode}
                    placeholderTextColor="#b983ff"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Timezone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="UTC-5 (EST)"
                    value={timezone}
                    onChangeText={setTimezone}
                    editable={editMode}
                    placeholderTextColor="#b983ff"
                  />
                </View>

                {editMode && (
                  <CustomButton
                    title="Save Changes"
                    onPress={saveProfile}
                    style={[styles.saveBtn, { backgroundColor: selectedColor }]}
                    textStyle={styles.saveBtnText}
                  />
                )}
                </ScrollView>
              </Animated.View>

              {!editMode && (
                <>
                  {username && (
          <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="at" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>@{username}</Text>
                    </View>
                  )}
                  {bio && (
                    <View style={styles.infoRow}>
                      <FontAwesome name="info-circle" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{bio}</Text>
                    </View>
                  )}
                  {phone && (
                    <View style={styles.infoRow}>
                      <Feather name="phone" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{phone}</Text>
                    </View>
                  )}
                  {location && (
                    <View style={styles.infoRow}>
                      <Entypo name="location-pin" size={22} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{location}</Text>
                    </View>
                  )}
                  {skills && (
                    <View style={styles.infoRow}>
                      <Feather name="star" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      {renderSkillTags(skills)}
                    </View>
                  )}
                  {languages && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="language" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{languages}</Text>
                    </View>
                  )}
                  {interests && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="favorite" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{interests}</Text>
                    </View>
                  )}
                  {timezone && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="access-time" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{timezone}</Text>
                    </View>
                  )}
                  {renderSocialLinks()}
                </>
              )}
            </View>
          </Animated.View>
        );

      case 'professional':
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.infoCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Professional Information</Text>
                <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
                  <Feather name={editMode ? "x" : "edit-3"} size={20} color={selectedColor} />
                </TouchableOpacity>
              </View>

              <Animated.View style={{ 
                overflow: 'hidden', 
                height: editAnim.interpolate({ 
                  inputRange: [0, 1], 
                  outputRange: [0, 450] 
                }) 
              }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                  <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Company</Text>
            <TextInput
              style={styles.input}
                    placeholder="Your company name"
                    value={company}
                    onChangeText={setCompany}
                    editable={editMode}
                    placeholderTextColor="#b983ff"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Position</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your job title"
                    value={position}
                    onChangeText={setPosition}
                    editable={editMode}
                    placeholderTextColor="#b983ff"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Experience</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe your experience..."
                    value={experience}
                    onChangeText={setExperience}
                    editable={editMode}
                    placeholderTextColor="#b983ff"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Education</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Your educational background..."
                    value={education}
                    onChangeText={setEducation}
                    editable={editMode}
                    placeholderTextColor="#b983ff"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Certifications</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Your certifications and achievements..."
                    value={certifications}
                    onChangeText={setCertifications}
                    editable={editMode}
                    placeholderTextColor="#b983ff"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Portfolio URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://your-portfolio.com"
                    value={portfolioUrl || ''}
                    onChangeText={setPortfolioUrl}
              editable={editMode}
              placeholderTextColor="#b983ff"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

                {editMode && (
          <CustomButton
                    title="Save Changes"
            onPress={saveProfile}
                    style={[styles.saveBtn, { backgroundColor: selectedColor }]}
            textStyle={styles.saveBtnText}
          />
                )}
                </ScrollView>
        </Animated.View>

        {!editMode && (
          <>
                  {company && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="business" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{company}</Text>
                    </View>
                  )}
                  {position && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="work" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{position}</Text>
                    </View>
                  )}
                  {experience && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="timeline" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{experience}</Text>
                    </View>
                  )}
                  {education && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="school" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{education}</Text>
                    </View>
                  )}
                  {certifications && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="verified" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <Text style={styles.infoText}>{certifications}</Text>
                    </View>
                  )}
                  {portfolioUrl && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="link" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                      <TouchableOpacity onPress={() => Linking.openURL(portfolioUrl)}>
                        <Text style={[styles.infoText, { color: selectedColor, textDecorationLine: 'underline' }]}>
                          View Portfolio
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
          </>
        )}
      </View>
          </Animated.View>
        );

      case 'settings':
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>App Settings</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              
              <View style={styles.settingGroup}>
                <Text style={styles.settingGroupTitle}>Theme & Appearance</Text>
                
        <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="moon" size={20} color={selectedColor} style={{ marginRight: 8 }} />
          <Text style={styles.optionText}>Dark Theme</Text>
        </View>
                  <Switch 
                    value={themeDark} 
                    onValueChange={toggleTheme} 
                    thumbColor={themeDark ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

        <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="palette" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Theme Color</Text>
        </View>
                  <TouchableOpacity 
                    style={[styles.colorPicker, { backgroundColor: selectedColor }]}
                    onPress={() => setShowColorPicker(true)}
                  />
                </View>
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.settingGroupTitle}>Notifications</Text>
                
        <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="bell" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>All Notifications</Text>
                  </View>
                  <Switch 
                    value={notifications} 
                    onValueChange={setNotifications} 
                    thumbColor={notifications ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="mail" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Email Notifications</Text>
                  </View>
                  <Switch 
                    value={emailNotifications} 
                    onValueChange={setEmailNotifications} 
                    thumbColor={emailNotifications ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="smartphone" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Push Notifications</Text>
                  </View>
                  <Switch 
                    value={pushNotifications} 
                    onValueChange={setPushNotifications} 
                    thumbColor={pushNotifications ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="users" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Mentorship Updates</Text>
                  </View>
                  <Switch 
                    value={mentorshipNotifications} 
                    onValueChange={setMentorshipNotifications} 
                    thumbColor={mentorshipNotifications ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="book-open" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Workshop Reminders</Text>
                  </View>
                  <Switch 
                    value={workshopNotifications} 
                    onValueChange={setWorkshopNotifications} 
                    thumbColor={workshopNotifications ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="calendar" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Event Updates</Text>
                  </View>
                  <Switch 
                    value={eventNotifications} 
                    onValueChange={setEventNotifications} 
                    thumbColor={eventNotifications ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.settingGroupTitle}>Documents</Text>
                
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="file-text" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>CV/Resume</Text>
                  </View>
                  <TouchableOpacity onPress={pickCV} disabled={uploading} style={[styles.cvBtn, { backgroundColor: selectedColor }]}>
            <Text style={styles.cvBtnText}>{cvUrl ? "Update" : "Upload"}</Text>
          </TouchableOpacity>
        </View>
                
        {cvUrl && (
          <TouchableOpacity style={styles.cvFileRow} onPress={() => Linking.openURL(cvUrl)}>
                    <Feather name="download" size={18} color={selectedColor} style={{ marginRight: 6 }} />
            <Text style={styles.cvFileText}>{cvName || "View CV"}</Text>
          </TouchableOpacity>
        )}
      </View>
              </ScrollView>
            </View>
          </Animated.View>
        );

      case 'privacy':
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Privacy Settings</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              
              <View style={styles.settingGroup}>
                <Text style={styles.settingGroupTitle}>Profile Visibility</Text>
                
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="globe" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Public Profile</Text>
                  </View>
                  <Switch 
                    value={privacyPublic} 
                    onValueChange={setPrivacyPublic} 
                    thumbColor={privacyPublic ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="mail" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Show Email</Text>
                  </View>
                  <Switch 
                    value={showEmail} 
                    onValueChange={setShowEmail} 
                    thumbColor={showEmail ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="phone" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Show Phone</Text>
                  </View>
                  <Switch 
                    value={showPhone} 
                    onValueChange={setShowPhone} 
                    thumbColor={showPhone ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Feather name="map-pin" size={20} color={selectedColor} style={{ marginRight: 8 }} />
                    <Text style={styles.optionText}>Show Location</Text>
                  </View>
                  <Switch 
                    value={showLocation} 
                    onValueChange={setShowLocation} 
                    thumbColor={showLocation ? selectedColor : "#fff"} 
                    trackColor={{ true: `${selectedColor}40`, false: "#ccc" }} 
                  />
                </View>
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.settingGroupTitle}>Verification</Text>
        <View style={styles.verificationRow}>
          <Feather
            name={verificationStatus === 'verified' ? 'check-circle' : 'alert-circle'}
            size={24}
            color={verificationStatus === 'verified' ? '#4CAF50' : '#FFC107'}
          />
          <Text style={styles.verificationText}>
            Status: {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
          </Text>
        </View>
        {verificationStatus !== 'verified' && (
                  <TouchableOpacity style={[styles.uploadButton, { backgroundColor: selectedColor }]} onPress={pickVerificationDoc}>
            <Feather name="upload" size={18} color="#fff" />
            <Text style={styles.uploadButtonText}>
              {verificationStatus === 'pending' ? 'Re-upload Document' : 'Upload for Verification'}
            </Text>
          </TouchableOpacity>
        )}
        {verificationDocName && <Text style={styles.docNameText}>Uploaded: {verificationDocName}</Text>}
      </View>
              </ScrollView>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  // Animated progress bar width
  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#a66cff" /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}>
        {/* Enhanced Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.profileImageWrapper}>
              <Image 
                source={profilePic ? { uri: profilePic } : require('../assets/images/icon.png')} 
                style={styles.profileImage} 
              />
              <View style={styles.cameraIconWrapper}>
                <Feather name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName || "No Name"}</Text>
            {role && (
              <View style={[styles.roleBadge, { backgroundColor: selectedColor }]}>
                <Text style={styles.roleBadgeText}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </View>
            )}

          </View>
        </View>

        {/* Profile Completeness Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Profile Completeness</Text>
            <Text style={styles.progressPercentage}>{Math.round(completeness * 100)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: progressBarWidth,
                  backgroundColor: selectedColor 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressSubtext}>
            Complete your profile to get better mentorship matches
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  activeTab === tab.id && { backgroundColor: selectedColor }
                ]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Feather 
                  name={tab.icon as any} 
                  size={18} 
                  color={activeTab === tab.id ? "#fff" : selectedColor} 
                />
                <Text style={[
                  styles.tabButtonText,
                  activeTab === tab.id && { color: "#fff" }
                ]}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
      <CustomButton
        title="Logout"
        onPress={async () => {
          try {
            await account.deleteSession("current");
            navigation.replace("LoginPage");
          } catch (error) {
            console.error("Logout failed", error);
          }
        }}
            style={[styles.logoutBtn, { borderColor: selectedColor }]}
            textStyle={[styles.logoutBtnText, { color: selectedColor }]}
      />
        </View>
    </Animated.ScrollView>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme Color</Text>
              <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.colorGrid}>
              {themeColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption
                  ]}
                  onPress={() => {
                    setSelectedColor(color);
                    setShowColorPicker(false);
                  }}
                >
                  {selectedColor === color && (
                    <Feather name="check" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  errorText: {
    color: '#a66cff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#a66cff',
  },
  cameraIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#a66cff',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
    fontFamily: FONTS.title,
  },
  profileEmail: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  roleBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  roleBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Progress Section
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    fontFamily: FONTS.title,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a66cff',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },

  // Tab Navigation
  tabContainer: {
    marginBottom: 16,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#a66cff',
  },

  // Content Cards
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },

  // Form Elements
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    color: '#2d3748',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    fontSize: 16,
    color: '#2d3748',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },

  // Skill Tags
  skillTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  skillTag: {
    backgroundColor: '#a66cff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  skillTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Social Links
  socialLinksContainer: {
    marginTop: 16,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  socialLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Settings Groups
  settingGroup: {
    marginBottom: 24,
  },
  settingGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },

  // Color Picker
  colorPicker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },

  // Buttons
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cvBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cvBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cvFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 8,
  },
  cvFileText: {
    color: '#a66cff',
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Verification
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  docNameText: {
    fontSize: 13,
    color: '#718096',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedColorOption: {
    borderColor: '#2d3748',
    borderWidth: 3,
  },
});
