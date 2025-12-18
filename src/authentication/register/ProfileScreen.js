import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  PixelRatio,
  Platform, // ADD Platform import
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions - MAKE SURE THESE MATCH YOUR SIGNUP COMPONENT
const scale = (size) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size; // FIXED: Correct name
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const scaleFont = (size) => {
  const scaledSize = (SCREEN_WIDTH / 375) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

// Responsive dimensions
const INPUT_WIDTH = Math.min(SCREEN_WIDTH - moderateScale(60), moderateScale(348));
const BUTTON_WIDTH = Math.min(SCREEN_WIDTH - moderateScale(70), moderateScale(338));
const DROPDOWN_WIDTH = INPUT_WIDTH;

const ProfileScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [showGenderOptions, setShowGenderOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  // Gender options with translation keys
  const genderOptions = [
    { value: 'Male', label: t('profileScreen.male') || 'Male' },
    { value: 'Female', label: t('profileScreen.female') || 'Female' }
  ];

  // Get email from route params or auth
  useEffect(() => {
    // Get email from navigation params (passed from signup)
    const emailFromParams = route.params?.email;
    
    if (emailFromParams) {
      setUserEmail(emailFromParams);
      console.log('📧 Email from params:', emailFromParams);
    } else {
      // If no params, check if user is logged in
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUserEmail(currentUser.email);
        setUserId(currentUser.uid);
        console.log('👤 User is logged in:', currentUser.uid);
      }
    }
  }, [route.params]);

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderOptions(false);
    if (errorMessage) setErrorMessage('');
  };

  // Get translated gender label for display
  const getGenderLabel = (value) => {
    const option = genderOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Save user profile to Firestore
  const saveUserProfile = async () => {
    // Validate inputs
    if (!name.trim()) {
      setErrorMessage(t('profileScreen.enterNameError') || 'Please enter your name');
      return;
    }

    if (!gender) {
      setErrorMessage(t('profileScreen.selectGenderError') || 'Please select your gender');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Get current user OR use userId from state
      let currentUserId = userId;
      let currentUserEmail = userEmail;

      // If no userId in state, check auth
      if (!currentUserId) {
        const currentUser = auth().currentUser;
        if (currentUser) {
          currentUserId = currentUser.uid;
          currentUserEmail = currentUser.email;
        }
      }

      // If still no userId, we need to get it from Firestore using email
      if (!currentUserId && currentUserEmail) {
        console.log('🔍 Searching for user by email:', currentUserEmail);
        
        // Query Firestore for user by email
        const usersSnapshot = await firestore()
          .collection('Useraccount')
          .where('email', '==', currentUserEmail)
          .limit(1)
          .get();
        
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          currentUserId = userDoc.id;
          console.log('✅ Found user in Firestore:', currentUserId);
        } else {
          throw new Error('User not found in database');
        }
      }

      if (!currentUserId) {
        setErrorMessage(t('profileScreen.noUserLoggedIn') || 'No user logged in. Please sign up first.');
        setLoading(false);
        return;
      }

      console.log('💾 Saving profile for user:', currentUserId);

      // Prepare user data
      const userData = {
        name: name.trim(),
        gender: gender,
        profileCompleted: true,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Save to Firestore 'Useraccount' collection
      await firestore()
        .collection('Useraccount')
        .doc(currentUserId)
        .set(userData, { merge: true });

      console.log('✅ User profile saved successfully!');

      // Navigate to location screen
      navigation.navigate('location', { email: currentUserEmail });

    } catch (error) {
      console.error('❌ Error saving user profile:', error);
      
      let errorMsg = t('profileScreen.saveFailed') || 'Failed to save profile';
      
      if (error.code === 'firestore/permission-denied') {
        errorMsg = t('profileScreen.permissionDenied') || 'Permission denied';
      } else if (error.code === 'firestore/unavailable') {
        errorMsg = t('profileScreen.networkError') || 'Network error';
      } else if (error.message === 'User not found in database') {
        errorMsg = 'User account not found. Please try signing up again.';
      }
      
      setErrorMessage(errorMsg);
      Alert.alert(t('profileScreen.error') || 'Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDE2E0" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            disabled={loading}
          >
            <View style={styles.backButtonContainer}>
              <View style={styles.arrowContainer}>
                <Text style={styles.backArrow}>‹</Text>
              </View>
              <Text style={styles.backText}>{t('profileScreen.back') || 'Back'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('profileScreen.title') || 'Complete Your Profile'}</Text>
          <Text style={styles.subtitle}>{t('profileScreen.subtitle') || 'Tell us a bit about yourself'}</Text>
          
          {/* Show email if available */}
          {userEmail ? (
            <Text style={styles.emailText}>
              Email: {userEmail}
            </Text>
          ) : null}
        </View>

        {/* Error Message */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, errorMessage && !name.trim() && styles.textInputError]}
              placeholder={t('profileScreen.enterName') || 'Enter your full name'}
              placeholderTextColor="#A68FA6"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Gender Dropdown */}
          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[
                styles.dropdownInput,
                showGenderOptions && styles.dropdownInputExpanded,
                errorMessage && !gender && styles.textInputError
              ]}
              onPress={() => !loading && setShowGenderOptions(!showGenderOptions)}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={[
                styles.dropdownText,
                gender ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder
              ]}>
                {gender ? getGenderLabel(gender) : t('profileScreen.selectGender') || 'Select Gender'}
              </Text>
              <View style={styles.dropdownArrow}>
                <Text style={[
                  styles.dropdownArrowText,
                  showGenderOptions && styles.dropdownArrowUp
                ]}>
                  ⌄
                </Text>
              </View>
            </TouchableOpacity>

            {/* Gender Options */}
            {showGenderOptions && (
              <View style={styles.genderOptionsContainer}>
                {genderOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOptionItem,
                      index === genderOptions.length - 1 && styles.genderOptionItemLast
                    ]}
                    onPress={() => handleGenderSelect(option.value)}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Text style={styles.genderOptionText}>{option.label}</Text>
                    <View style={styles.radioButtonContainer}>
                      <View style={[
                        styles.radioButton,
                        gender === option.value && styles.radioButtonSelected
                      ]}>
                        {gender === option.value && <View style={styles.radioButtonInner} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Complete Profile Button */}
          <TouchableOpacity 
            style={[
              styles.completeButton,
              showGenderOptions ? styles.completeButtonExpanded : styles.completeButtonCollapsed,
              loading && styles.completeButtonDisabled
            ]}
            activeOpacity={0.8}
            onPress={saveUserProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.completeButtonText}>{t('profileScreen.completeButton') || 'Complete Profile'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE2E0',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(40), // FIXED: Correct function name
  },
  header: {
    marginTop: verticalScale(52), // FIXED: Correct function name
    marginBottom: verticalScale(40), // FIXED: Correct function name
    paddingHorizontal: moderateScale(32),
  },
  backButton: {
    // Main back button container
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    width: moderateScale(45),
    height: moderateScale(45),
    backgroundColor: 'rgba(237, 207, 201, 0.8)',
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  backArrow: {
    fontSize: scaleFont(32),
    color: '#D96073',
    fontWeight: 'bold',
    lineHeight: scaleFont(32),
    marginTop: Platform.OS === 'android' ? moderateScale(-2) : 0,
    textAlign: 'center',
  },
  backText: {
    fontSize: scaleFont(16),
    color: '#5D4A5D',
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: moderateScale(30),
    marginBottom: verticalScale(80), // FIXED: Correct function name
  },
  title: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color: '#2D1B47',
    marginBottom: moderateScale(12),
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: scaleFont(16),
    color: '#7A6B7A',
    lineHeight: scaleFont(22),
    fontWeight: '400',
    marginBottom: moderateScale(10),
  },
  emailText: {
    fontSize: scaleFont(14),
    color: '#5D4A5D',
    fontStyle: 'italic',
    marginTop: moderateScale(5),
  },
  errorContainer: {
    marginHorizontal: moderateScale(30),
    marginBottom: moderateScale(20),
    padding: moderateScale(15),
    backgroundColor: 'rgba(217, 96, 115, 0.1)',
    borderRadius: moderateScale(8),
    borderLeftWidth: 4,
    borderLeftColor: '#D96073',
  },
  errorText: {
    color: '#D96073',
    fontSize: scaleFont(14),
    fontWeight: '500',
    textAlign: 'center',
  },
  formSection: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(32),
  },
  inputContainer: {
    marginBottom: moderateScale(30),
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    width: INPUT_WIDTH,
    height: moderateScale(56),
    backgroundColor: '#EDCFC9',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    fontSize: scaleFont(16),
    color: '#2D1B47',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#D96073',
    shadowColor: '#262628',
    shadowOffset: {
      width: 0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(1),
    elevation: 4,
  },
  textInputError: {
    borderColor: '#D96073',
    borderWidth: 2,
  },
  genderContainer: {
    width: DROPDOWN_WIDTH,
    marginBottom: moderateScale(30),
    position: 'relative',
  },
  dropdownInput: {
    width: DROPDOWN_WIDTH,
    height: moderateScale(56),
    backgroundColor: '#EDCFC9',
    borderTopLeftRadius: moderateScale(12),
    borderTopRightRadius: moderateScale(12),
    borderBottomLeftRadius: moderateScale(12),
    borderBottomRightRadius: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    borderWidth: 1,
    borderColor: '#D96073',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: {
      width: 0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(1),
    elevation: 4,
  },
  dropdownInputExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: {
    fontSize: scaleFont(16),
    fontWeight: '500',
  },
  dropdownTextPlaceholder: {
    color: '#A68FA6',
  },
  dropdownTextSelected: {
    color: '#2D1B47',
  },
  dropdownArrow: {
    marginLeft: moderateScale(10),
  },
  dropdownArrowText: {
    fontSize: scaleFont(20),
    color: '#D96073',
    fontWeight: 'bold',
    transform: [{ rotate: '0deg' }],
  },
  dropdownArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  genderOptionsContainer: {
    width: DROPDOWN_WIDTH,
    height: moderateScale(119),
    backgroundColor: '#EDCFC9',
    borderBottomLeftRadius: moderateScale(12),
    borderBottomRightRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#EDCFC9',
    borderTopWidth: 0,
    position: 'absolute',
    top: moderateScale(56),
    zIndex: 10,
  },
  genderOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(18),
    paddingHorizontal: moderateScale(20),
    height: moderateScale(59.5),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 123, 139, 0.2)',
  },
  genderOptionItemLast: {
    borderBottomWidth: 0,
  },
  genderOptionText: {
    fontSize: scaleFont(18),
    color: '#2D1B47',
    fontWeight: '500',
  },
  radioButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#D96073',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  radioButtonSelected: {
    backgroundColor: '#D96073',
  },
  radioButtonInner: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#FFFFFF',
  },
  completeButton: {
    width: BUTTON_WIDTH,
    height: moderateScale(54),
    backgroundColor: '#D96073',
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#262628',
    shadowOffset: {
      width: 0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(12),
    elevation: 8,
  },
  completeButtonDisabled: {
    backgroundColor: 'rgba(217, 96, 115, 0.6)',
  },
  completeButtonCollapsed: {
    marginTop: moderateScale(50),
  },
  completeButtonExpanded: {
    marginTop: moderateScale(170),
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
});

export default ProfileScreen;