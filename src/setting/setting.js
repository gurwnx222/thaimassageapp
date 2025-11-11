import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  PixelRatio,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../component/BottomNav';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { useLanguage } from '../context/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device type detection
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;
const isTablet = SCREEN_WIDTH >= 768;

// Responsive scaling functions with device-specific adjustments
const scale = (size) => {
  const baseWidth = isTablet ? 768 : 375;
  return (SCREEN_WIDTH / baseWidth) * size;
};

const verticalScale = (size) => {
  const baseHeight = isTablet ? 1024 : 812;
  return (SCREEN_HEIGHT / baseHeight) * size;
};

const moderateScale = (size, factor = 0.5) => {
  if (isTablet) factor = 0.3; // Less scaling on tablets
  return size + (scale(size) - size) * factor;
};

const scaleFont = (size) => {
  const scaledSize = scale(size);
  const maxSize = size * (isTablet ? 1.5 : 1.3);
  const minSize = size * 0.85;
  const finalSize = Math.min(Math.max(scaledSize, minSize), maxSize);
  return Math.round(PixelRatio.roundToNearestPixel(finalSize));
};

// Responsive dimensions with device-specific values
const HORIZONTAL_PADDING = isTablet 
  ? moderateScale(40) 
  : isSmallDevice 
    ? moderateScale(16) 
    : moderateScale(20);

const ROW_HEIGHT = isTablet 
  ? moderateScale(60) 
  : moderateScale(48);

const MAX_CONTENT_WIDTH = isTablet 
  ? Math.min(SCREEN_WIDTH * 0.7, 600)
  : Math.min(SCREEN_WIDTH - HORIZONTAL_PADDING * 2, moderateScale(348));

const AVATAR_SIZE = isTablet 
  ? moderateScale(120) 
  : isSmallDevice 
    ? moderateScale(75) 
    : moderateScale(90);

const PROFILE_CARD_WIDTH = isTablet 
  ? moderateScale(320) 
  : isSmallDevice 
    ? moderateScale(220) 
    : moderateScale(244);

const PROFILE_CARD_HEIGHT = isTablet 
  ? verticalScale(180) 
  : verticalScale(140);

const ProfileRow = ({ label, value, onPress, t, formatText, isNumeric = false, fieldType = 'text' }) => {
  const [translatedValue, setTranslatedValue] = useState(value || label);
  const { currentLanguage, translateDynamic } = useLanguage();

  useEffect(() => {
    const loadTranslation = async () => {
      if (!value) {
        setTranslatedValue(label);
        return;
      }

      if (value === 'Male' || value === 'Female') {
        setTranslatedValue(t(`genderValues.${value}`));
      } else if (isNumeric) {
        setTranslatedValue(formatText(value));
      } else if (fieldType === 'location' || fieldType === 'name') {
        if (currentLanguage === 'th') {
          const translated = await translateDynamic(value);
          setTranslatedValue(translated);
        } else {
          setTranslatedValue(value);
        }
      } else {
        setTranslatedValue(value);
      }
    };

    loadTranslation();
  }, [value, currentLanguage, fieldType]);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.row}>
      <Text style={styles.rowText} numberOfLines={1}>{translatedValue}</Text>
      <MaterialIcons name="keyboard-arrow-right" size={moderateScale(20)} color="#C97B84" />
    </TouchableOpacity>
  );
};

const LanguageOptionRow = ({ label, isSelected, onPress }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.row}>
    <Text style={styles.rowText}>{label}</Text>
    <View style={styles.radioButton}>
      {isSelected && <View style={styles.radioButtonInner} />}
    </View>
  </TouchableOpacity>
);

const Setting = ({ navigation }) => {
  const { currentLanguage, changeLanguage, t, formatNum, formatText, translateDynamic } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [tempValue, setTempValue] = useState('');
  const [translatedName, setTranslatedName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const translateName = async () => {
      if (userData?.name) {
        if (currentLanguage === 'th') {
          const translated = await translateDynamic(userData.name);
          setTranslatedName(translated);
        } else {
          setTranslatedName(userData.name);
        }
      }
    };

    translateName();
  }, [userData?.name, currentLanguage]);

  const fetchUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        console.log('Fetching user data for:', currentUser.uid);
        
        const userDoc = await firestore()
          .collection('Useraccount')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const data = userDoc.data();
          console.log('User data loaded:', data);
          setUserData(data);
          setProfileImage(data.profileImage || null);
        } else {
          console.log('No user document found, creating initial data');
          const initialData = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || t('profile.name'),
            selectedLanguageType: 'default',
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
            profileCompleted: false,
          };
          await firestore()
            .collection('Useraccount')
            .doc(currentUser.uid)
            .set(initialData);
          setUserData(initialData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert(t('alerts.error'), t('alerts.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert(t('alerts.error'), t('alerts.imagePickerError'));
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        await uploadImageToFirebase(asset);
      }
    });
  };

  const uploadImageToFirebase = async (asset) => {
    try {
      setUploadingImage(true);
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const imageUri = Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
      const filename = `profile_${currentUser.uid}_${Date.now()}.jpg`;
      const reference = storage().ref(`profileImages/${filename}`);

      await reference.putFile(imageUri);
      const downloadURL = await reference.getDownloadURL();

      await firestore()
        .collection('Useraccount')
        .doc(currentUser.uid)
        .update({
          profileImage: downloadURL,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      setProfileImage(downloadURL);
      setUserData((prev) => ({ ...prev, profileImage: downloadURL }));
      
      console.log('Profile image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(t('alerts.error'), t('alerts.imageUploadFailed'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLanguageTypeSelect = async (lang) => {
    try {
      await changeLanguage(lang);
      console.log(`Language changed to: ${lang}`);
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert(t('alerts.error'), t('alerts.languageUpdateFailed'));
    }
  };

  const openModal = (type, currentValue) => {
    setModalType(type);
    setModalValue(currentValue || '');
    setTempValue(currentValue || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType('');
    setModalValue('');
    setTempValue('');
  };

  const saveField = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert(t('alerts.error'), t('alerts.noUser'));
        return;
      }

      if (modalType !== 'gender') {
        if (!tempValue || tempValue.trim() === '') {
          Alert.alert(t('alerts.error'), t('alerts.enterValue'));
          return;
        }
      }

      if (modalType === 'gender' && !tempValue) {
        Alert.alert(t('alerts.error'), t('alerts.selectOption'));
        return;
      }

      console.log(`Updating ${modalType} to:`, tempValue);

      const updateData = {
        [modalType]: tempValue.trim ? tempValue.trim() : tempValue,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (modalType === 'location') {
        updateData.locationCompleted = true;
      }

      await firestore()
        .collection('Useraccount')
        .doc(currentUser.uid)
        .update(updateData);

      console.log('Field updated successfully');
      setUserData((prev) => ({ ...prev, ...updateData }));
      closeModal();
    } catch (error) {
      console.error('Error updating field:', error);
      Alert.alert(t('alerts.error'), t('alerts.updateFailed'));
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      await AsyncStorage.multiRemove(['userToken', 'isRegistered', 'userEmail']);
      console.log('✅ AsyncStorage cleared');
      
      await auth().signOut();
      console.log('✅ Firebase sign out successful');
      
      setLogoutModalVisible(false);
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'splash' }],
      });
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error logging out:', error);
      Alert.alert(t('alerts.error'), t('alerts.logoutFailed'));
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'location': return t('personalDetails.location');
      case 'age': return t('personalDetails.age');
      case 'weight': return t('personalDetails.weight');
      case 'gender': return t('personalDetails.gender');
      default: return '';
    }
  };

  const getModalPlaceholder = () => {
    switch (modalType) {
      case 'location': return t('modal.enterLocation');
      case 'age': return t('modal.enterAge');
      case 'weight': return t('modal.enterWeight');
      case 'gender': return t('modal.selectGender');
      default: return '';
    }
  };

  const renderModalContent = () => {
    if (modalType === 'gender') {
      return (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              tempValue === 'Male' && styles.optionSelected,
            ]}
            onPress={() => setTempValue('Male')}
          >
            <Text style={styles.optionText}>{t('gender.male')}</Text>
            <View style={styles.radioButton}>
              {tempValue === 'Male' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              tempValue === 'Female' && styles.optionSelected,
            ]}
            onPress={() => setTempValue('Female')}
          >
            <Text style={styles.optionText}>{t('gender.female')}</Text>
            <View style={styles.radioButton}>
              {tempValue === 'Female' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TextInput
        style={styles.input}
        value={tempValue}
        onChangeText={setTempValue}
        placeholder={getModalPlaceholder()}
        placeholderTextColor="#B5A5A5"
        keyboardType={
          modalType === 'age' || modalType === 'weight' ? 'numeric' : 'default'
        }
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C97B84" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#D4A5AC" />

      {/* Two-Tone Background Layout */}
      <View style={styles.mainContainer}>
        {/* Top Half - Gradient Background */}
        <LinearGradient
          colors={['#D4A5AC', '#E8C4D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topHalfBackground}
        >
          <Text style={styles.headerTitle}>{t('profile.header')}</Text>
        </LinearGradient>

        {/* Profile Card - Positioned to overlap both sections */}
        <View style={styles.profileCardAbsolute}>
          <View style={styles.profileCardContainer}>
            {/* Shadow/Background Layer */}
            <View style={styles.profileCardShadow} />
            
            {/* Main Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarInner}>
                  <View style={styles.avatarCircle}>
                    {uploadingImage ? (
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    ) : profileImage ? (
                      <Image 
                        source={{ uri: profileImage }} 
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.avatarEmoji}>😊</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.editBadge}
                    onPress={handleImagePicker}
                    disabled={uploadingImage}
                  >
                    <MaterialCommunityIcons 
                      name="pencil" 
                      size={moderateScale(14)} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.profileName} numberOfLines={2}>
                {translatedName || t('profile.name')}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Half - Main Background Color */}
        <View style={styles.bottomHalfBackground} />
      </View>

      {/* Main Content with ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('personalDetails.title')}</Text>
          <ProfileRow 
            label={t('personalDetails.location')}
            value={userData?.location}
            onPress={() => openModal('location', userData?.location)}
            t={t}
            formatText={formatText}
            isNumeric={false}
            fieldType="location"
          />
          <ProfileRow 
            label={t('personalDetails.age')}
            value={userData?.age}
            onPress={() => openModal('age', userData?.age)}
            t={t}
            formatText={formatText}
            isNumeric={true}
            fieldType="age"
          />
          <ProfileRow 
            label={t('personalDetails.weight')}
            value={userData?.weight}
            onPress={() => openModal('weight', userData?.weight)}
            t={t}
            formatText={formatText}
            isNumeric={true}
            fieldType="weight"
          />
          <ProfileRow 
            label={t('personalDetails.gender')}
            value={userData?.gender}
            onPress={() => openModal('gender', userData?.gender)}
            t={t}
            formatText={formatText}
            isNumeric={false}
            fieldType="gender"
          />
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.title')}</Text>
          
          <LanguageOptionRow
            label={t('settings.english')}
            isSelected={currentLanguage === 'en'}
            onPress={() => handleLanguageTypeSelect('en')}
          />

          <LanguageOptionRow
            label={t('settings.thai')}
            isSelected={currentLanguage === 'th'}
            onPress={() => handleLanguageTypeSelect('th')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          activeOpacity={0.9} 
          onPress={() => setLogoutModalVisible(true)}
        >
          <Feather name="log-out" size={moderateScale(18)} color="#C97B84" />
          <Text style={styles.logoutText}>{t('logout.button')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} active="setting" />

      {/* Edit Field Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>

            {renderModalContent()}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>{t('modal.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.doneButton} 
                onPress={saveField}
              >
                <Text style={styles.doneButtonText}>{t('modal.done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <View style={styles.logoutIconContainer}>
              <Feather name="log-out" size={moderateScale(48)} color="#C97B84" />
            </View>
            
            <Text style={styles.logoutModalTitle}>{t('logout.title')}</Text>
            <Text style={styles.logoutModalMessage}>
              {t('logout.message')}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('modal.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.logoutConfirmButton} 
                onPress={handleLogout}
              >
                <Text style={styles.doneButtonText}>{t('logout.button')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#EDE2E0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDE2E0',
  },
  
  // Main Container for Two-Tone Background
  mainContainer: {
    position: 'relative',
    width: '100%',
    height: isTablet ? verticalScale(320) : verticalScale(280),
  },

  // Top Half - Gradient Background
  topHalfBackground: {
    width: '100%',
    height: '55%',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' 
      ? moderateScale(16) 
      : moderateScale(12),
  },
    headerTitle: {
    fontSize: scaleFont(32),
    fontWeight: '700',
    color: '#2D1B47',
    letterSpacing: 0.5,
    marginTop: isTablet 
      ? moderateScale(30) 
      : isSmallDevice 
        ? moderateScale(15)  // Reduced for small devices
        : moderateScale(20), // Reduced for normal devices
    textAlign: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  // Bottom Half - Main Background Color
  bottomHalfBackground: {
    width: '100%',
    height: '45%',
    backgroundColor: '#EDE2E0',
  },

  // Profile Card - Absolutely Positioned
  profileCardAbsolute: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    transform: [{ 
      translateY: isTablet 
        ? moderateScale(-90) 
        : moderateScale(-70) 
    }],
    alignItems: 'center',
    zIndex: 100,
  },

  // ScrollView Content
  scrollContent: {
    paddingTop: 0,
    paddingBottom: isTablet ? verticalScale(200) : verticalScale(160),
    alignItems: 'center',
    backgroundColor: '#EDE2E0',
  },

  // Profile Card Container
  profileCardContainer: {
    position: 'relative',
    width: PROFILE_CARD_WIDTH,
    height: PROFILE_CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardShadow: {
    position: 'absolute',
    width: PROFILE_CARD_WIDTH,
    height: PROFILE_CARD_HEIGHT,
    backgroundColor: 'transparent',
    borderRadius: moderateScale(16),
    top: 0,
    left: 0,
  },
  profileCard: {
    width: PROFILE_CARD_WIDTH,
    height: PROFILE_CARD_HEIGHT,
    backgroundColor: 'transparent',
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(8),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarWrap: {
    marginBottom: moderateScale(8),
  },
  avatarInner: {
    position: 'relative',
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#2D1B47',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarEmoji: {
    fontSize: scaleFont(40),
  },
  editBadge: {
    position: 'absolute',
    right: moderateScale(-4),
    bottom: 0,
    backgroundColor: '#C97B84',
    borderRadius: moderateScale(12),
    padding: moderateScale(6),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: scaleFont(14),
    color: '#7A6B7A',
    fontWeight: '500',
    maxWidth: PROFILE_CARD_WIDTH - moderateScale(24),
    textAlign: 'center',
  },

  // Sections
  section: {
    width: MAX_CONTENT_WIDTH,
    marginBottom: verticalScale(25),
    paddingHorizontal: isTablet ? 0 : HORIZONTAL_PADDING,
  },
  sectionTitle: {
    fontSize: scaleFont(16),
    color: '#2D1B47',
    fontWeight: '600',
    marginBottom: moderateScale(12),
  },
  row: {
    height: ROW_HEIGHT,
    backgroundColor: '#FEC9BE',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(8),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  rowText: {
    fontSize: scaleFont(16),
    color: '#2D1B47',
    fontWeight: '500',
    flex: 1,
    marginRight: moderateScale(8),
  },

  // Logout Button
  logoutBtn: {
    width: MAX_CONTENT_WIDTH,
    backgroundColor: '#FFF6EF',
    height: moderateScale(52),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: verticalScale(10),
    marginHorizontal: isTablet ? 0 : HORIZONTAL_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 4,
  },
  logoutText: {
    marginLeft: moderateScale(10),
    color: '#C97B84',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  modalContent: {
    width: '100%',
    maxWidth: isTablet ? moderateScale(480) : moderateScale(380),
    backgroundColor: '#FEC9BE',
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(12),
    elevation: 8,
  },
  modalTitle: {
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: '#2D1B47',
    marginBottom: moderateScale(20),
  },
  input: {
    backgroundColor: '#F5DDD8',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
    fontSize: scaleFont(16),
    color: '#2D1B47',
    marginBottom: moderateScale(24),
    borderWidth: 1,
    borderColor: '#E6C4C0',
    minHeight: moderateScale(50),
  },
  optionsContainer: {
    marginBottom: moderateScale(24),
  },
  option: {
    backgroundColor: '#F5DDD8',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
    marginBottom: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6C4C0',
    minHeight: moderateScale(50),
  },
  optionSelected: {
    borderColor: '#C97B84',
    borderWidth: 2,
    backgroundColor: '#F5E5E1',
  },
  optionText: {
    fontSize: scaleFont(16),
    color: '#2D1B47',
    fontWeight: '500',

  },
  radioButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#C97B84',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioButtonInner: {
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: '#C97B84',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: moderateScale(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E8D4D0',
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScale(48),
  },
  cancelButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#7A6B7A',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#C97B84',
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScale(48),
  },
  doneButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Logout Modal
  logoutModalContent: {
    width: '100%',
    maxWidth: isTablet ? moderateScale(420) : moderateScale(340),
    backgroundColor: '#FEC9BE',
    borderRadius: moderateScale(24),
    padding: moderateScale(32),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(6) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(16),
    elevation: 10,
  },
  logoutIconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#F5DDD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(20),
    shadowColor: '#C97B84',
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
    elevation: 4,
  },
  logoutModalTitle: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: '#2D1B47',
    marginBottom: moderateScale(12),
    textAlign: 'center',
  },
  logoutModalMessage: {
    fontSize: scaleFont(16),
    color: '#7A6B7A',
    textAlign: 'center',
    marginBottom: moderateScale(28),
    lineHeight: scaleFont(22),
    paddingHorizontal: moderateScale(10),
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: '#C97B84',
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScale(48),
  },
});

export default Setting;