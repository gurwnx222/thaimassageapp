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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import BottomNav from '../component/BottomNav';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

const HORIZONTAL_PADDING = 20;
const ROW_HEIGHT = 48;
const PROFILE_CARD_TOP = 122;
const MAX_CONTENT_WIDTH = Math.min(width - HORIZONTAL_PADDING * 2, 348);

const ProfileRow = ({ label, value, onPress }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.row}>
    <Text style={styles.rowText}>{value || label}</Text>
    <MaterialIcons name="keyboard-arrow-right" size={20} color="#C97B84" />
  </TouchableOpacity>
);

const Setting = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore()
          .collection('Useraccount')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          // Create initial document if it doesn't exist
          const initialData = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || 'User',
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
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
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
      if (!currentUser) return;

      const updateData = {
        [modalType]: tempValue,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Special handling for location
      if (modalType === 'location') {
        updateData.locationCompleted = true;
      }

      await firestore()
        .collection('Useraccount')
        .doc(currentUser.uid)
        .update(updateData);

      setUserData((prev) => ({ ...prev, ...updateData }));
      closeModal();
    } catch (error) {
      console.error('Error updating field:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      setLogoutModalVisible(false);
      navigation.replace('Login'); // Adjust to your login screen name
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'location': return 'Location';
      case 'age': return 'Age';
      case 'weight': return 'Weight';
      case 'gender': return 'Gender';
      case 'language': return 'Default Language';
      case 'preference': return 'Preference Language';
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
            <Text style={styles.optionText}>Male</Text>
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
            <Text style={styles.optionText}>Female</Text>
            <View style={styles.radioButton}>
              {tempValue === 'Female' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (modalType === 'language') {
      return (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              tempValue === 'English' && styles.optionSelected,
            ]}
            onPress={() => setTempValue('English')}
          >
            <Text style={styles.optionText}>English</Text>
            <View style={styles.radioButton}>
              {tempValue === 'English' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              tempValue === 'Thai' && styles.optionSelected,
            ]}
            onPress={() => setTempValue('Thai')}
          >
            <Text style={styles.optionText}>Thai</Text>
            <View style={styles.radioButton}>
              {tempValue === 'Thai' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (modalType === 'preference') {
      return (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              tempValue === 'English' && styles.optionSelected,
            ]}
            onPress={() => setTempValue('English')}
          >
            <Text style={styles.optionText}>English</Text>
            <View style={styles.radioButton}>
              {tempValue === 'English' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              tempValue === 'Thai' && styles.optionSelected,
            ]}
            onPress={() => setTempValue('Thai')}
          >
            <Text style={styles.optionText}>Thai</Text>
            <View style={styles.radioButton}>
              {tempValue === 'Thai' && <View style={styles.radioButtonInner} />}
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
        placeholder={`Enter ${getModalTitle()}`}
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
      <StatusBar barStyle="dark-content" backgroundColor="#DEAAB2" />

      <LinearGradient
        colors={['#DEAAB2', '#FFDDE5']}
        start={{ x: -0.02, y: 0 }}
        end={{ x: 0.97, y: 1 }}
        style={styles.topGradient}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCardContainer}>
          <View style={styles.profileCardBackground} />
          
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarInner}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarEmoji}>😊</Text>
                </View>
                <View style={styles.editBadge}>
                  <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
                </View>
              </View>
            </View>
            <Text style={styles.profileName}>{userData?.name || 'User'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details -</Text>
          <ProfileRow 
            label="Location" 
            value={userData?.location}
            onPress={() => openModal('location', userData?.location)} 
          />
          <ProfileRow 
            label="Age" 
            value={userData?.age}
            onPress={() => openModal('age', userData?.age)} 
          />
          <ProfileRow 
            label="Weight" 
            value={userData?.weight}
            onPress={() => openModal('weight', userData?.weight)} 
          />
          <ProfileRow 
            label="Gender" 
            value={userData?.gender}
            onPress={() => openModal('gender', userData?.gender)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings -</Text>
          <ProfileRow 
            label="default language" 
            value={userData?.language}
            onPress={() => openModal('language', userData?.language)} 
          />
          <ProfileRow 
            label="preference" 
            value={userData?.preference}
            onPress={() => openModal('preference', userData?.preference)} 
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn} 
          activeOpacity={0.9} 
          onPress={() => setLogoutModalVisible(true)}
        >
          <Feather name="log-out" size={18} color="#C97B84" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} active="setting" />

      {/* Modal for editing fields */}
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
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.doneButton} 
                onPress={saveField}
              >
                <Text style={styles.doneButtonText}>Done</Text>
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
              <Feather name="log-out" size={48} color="#C97B84" />
            </View>
            
            <Text style={styles.logoutModalTitle}>Log Out</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.logoutConfirmButton} 
                onPress={handleLogout}
              >
                <Text style={styles.doneButtonText}>Log Out</Text>
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
  container: {
    paddingTop: 40,
    paddingBottom: 160,
    paddingHorizontal: HORIZONTAL_PADDING,
    alignItems: 'center',
    backgroundColor: '#EDE2E0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDE2E0',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PROFILE_CARD_TOP + 59,
    zIndex: -1,
  },
  headerWrap: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D1B47',
  },
  profileCardContainer: {
    position: 'relative',
    width: 244,
    height: 140,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF6EF',
  },
  profileCardBackground: {
    position: 'absolute',
    width: 244,
    height: 140,
    backgroundColor: '#FFF6EF',
    opacity: 0.3,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#262628',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  profileCard: {
    width: 244,
    height: 140,
    backgroundColor: '#FFF6EF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    elevation: 8,
    shadowColor: '#262628',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  avatarWrap: {
    marginBottom: 8,
  },
  avatarInner: {
    position: 'relative',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2D1B47',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    backgroundColor: '#C97B84',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 14,
    color: '#7A6B7A',
    fontWeight: '500',
  },
  section: {
    width: MAX_CONTENT_WIDTH,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#2D1B47',
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    height: ROW_HEIGHT,
    backgroundColor: '#FEC9BE',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowText: {
    fontSize: 16,
    color: '#2D1B47',
    fontWeight: '500',
  },
  logoutBtn: {
    width: MAX_CONTENT_WIDTH,
    backgroundColor: '#FFF6EF',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    marginLeft: 10,
    color: '#C97B84',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FEC9BE',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D1B47',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5DDD8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D1B47',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E6C4C0',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#F5DDD8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6C4C0',
  },
  optionSelected: {
    borderColor: '#C97B84',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#2D1B47',
    fontWeight: '500',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C97B84',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioButtonInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#C97B84',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E8D4D0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A6B7A',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#C97B84',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Logout Modal styles
  logoutModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FEC9BE',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEC9BE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#C97B84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D1B47',
    marginBottom: 12,
  },
  logoutModalMessage: {
    fontSize: 16,
    color: '#7A6B7A',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: '#C97B84',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Setting;