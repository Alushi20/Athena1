import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert, Image } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Account, Storage, ID } from 'react-native-appwrite';
import { client, config } from '../lib/appwrite';

const account = new Account(client);
const storage = new Storage(client);

const SKILLS = [
  'Biotechnology', 'Astrophysics', 'Environmental Science', 'Microbiology', 'Geology', 'Neuroscience', 'Chemistry', 'Marine Biology', 'Genetics', 'Physics',
  'Artificial Intelligence (AI)', 'Cybersecurity', 'Data Science', 'Software Development', 'Game Development', 'Robotics', 'Cloud Computing', 'Web Development',
  'Internet of Things (IoT)', 'Human-Computer Interaction (HCI)', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Aerospace Engineering',
  'Biomedical Engineering', 'Chemical Engineering', 'Nuclear Engineering', 'Industrial Engineering', 'Environmental Engineering', 'Software Engineering'
];

const SignUpScreen = ({ navigation }: any) => {
  const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<any>(null);
  const [cv, setCv] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickProfilePic = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfilePic(result.assets[0]);
    }
  };

  const handlePickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.assets && result.assets.length > 0) {
      setCv(result.assets[0]);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSkills(skills => skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill]);
  };

  const handleSignUp = async () => {
    if (!role) {
      Alert.alert('Please select a role', 'Are you signing up as a mentor or a mentee?');
      return;
    }
    setLoading(true);
    try {
      // 1. Create user
      const userId = ID.unique();
      await account.create(userId, email, password, name);
      // 2. Upload profile pic
      let profilePicUrl = '';
      if (profilePic) {
        const file = { uri: profilePic.uri, name: profilePic.fileName || 'profile.jpg', type: profilePic.mimeType || 'image/jpeg', size: profilePic.fileSize || 1 };
        const uploaded = await storage.createFile(config.storageId, ID.unique(), file);
        profilePicUrl = uploaded.$id;
      }
      // 3. Upload CV
      let cvUrl = '';
      if (cv) {
        const file = { uri: cv.uri, name: cv.name, type: cv.mimeType || 'application/pdf', size: cv.size || 1 };
        const uploaded = await storage.createFile(config.storageId, ID.unique(), file);
        cvUrl = uploaded.$id;
      }
      // 4. Save preferences
      await account.updatePrefs({
        role, // Save the selected role
        username,
        phone,
        showPhone,
        bio,
        location,
        skills,
        profilePicUrl,
        cvUrl,
      });
      Alert.alert('Success', 'Account created! Please complete your onboarding.');
      if (role === 'mentor') {
        navigation.replace('MentorOnboarding');
      } else {
        navigation.replace('MenteeOnboarding');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.roleSelection}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'mentor' && styles.roleButtonSelected]}
          onPress={() => setRole('mentor')}
        >
          <Text style={[styles.roleButtonText, role === 'mentor' && styles.roleButtonTextSelected]}>I'm a Mentor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'mentee' && styles.roleButtonSelected]}
          onPress={() => setRole('mentee')}
        >
          <Text style={[styles.roleButtonText, role === 'mentee' && styles.roleButtonTextSelected]}>I'm a Mentee</Text>
        </TouchableOpacity>
      </View>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Show on profile</Text>
          <Switch value={showPhone} onValueChange={setShowPhone} />
        </View>
      </View>
      <TextInput style={styles.input} placeholder="Bio (optional)" value={bio} onChangeText={setBio} multiline />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <Text style={styles.sectionTitle}>Skills/Sector</Text>
      <View style={styles.skillsContainer}>
        {SKILLS.map(skill => (
          <TouchableOpacity
            key={skill}
            style={[styles.skillTag, skills.includes(skill) && styles.skillTagSelected]}
            onPress={() => handleSkillToggle(skill)}
          >
            <Text style={[styles.skillText, skills.includes(skill) && styles.skillTextSelected]}>{skill}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.uploadRow}>
        <TouchableOpacity style={styles.uploadBtn} onPress={handlePickProfilePic}>
          <Feather name="image" size={18} color={COLORS.white} />
          <Text style={styles.uploadBtnText}>{profilePic ? 'Change Profile Picture' : 'Upload Profile Picture'}</Text>
        </TouchableOpacity>
        {profilePic && <Image source={{ uri: profilePic.uri }} style={styles.previewImg} />}
      </View>
      <View style={styles.uploadRow}>
        <TouchableOpacity style={styles.uploadBtn} onPress={handlePickCV}>
          <Feather name="file" size={18} color={COLORS.white} />
          <Text style={styles.uploadBtnText}>{cv ? 'Change CV' : 'Upload CV'}</Text>
        </TouchableOpacity>
        {cv && <Text style={styles.cvName}>{cv.name}</Text>}
      </View>
      <TouchableOpacity style={styles.submitBtn} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>Sign Up</Text>}
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
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  switchLabel: {
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillTag: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTagSelected: {
    backgroundColor: COLORS.primary,
  },
  skillText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  skillTextSelected: {
    color: COLORS.white,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  uploadBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  previewImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  cvName: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
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
  roleSelection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
  },
  roleButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  roleButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  roleButtonTextSelected: {
    color: COLORS.secondary,
  },
});

export default SignUpScreen; 