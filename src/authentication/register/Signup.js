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
  ActivityIndicator,
  PixelRatio,
  Image,
  Platform,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useLanguage } from '../../context/LanguageContext';
import Svg, { Path } from 'react-native-svg';
import TermsAndConditions from '../../context/TermsAndConditions';
import { saveOTPAndSendEmail } from '../../utils/otpHelper';

const { width:  SCREEN_WIDTH, height:  SCREEN_HEIGHT } = Dimensions. get('window');

// Responsive scaling functions
const scale = (size) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const scaleFont = (size) => {
  const scaledSize = (SCREEN_WIDTH / 375) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

// Responsive dimensions
const INPUT_WIDTH = Math.min(SCREEN_WIDTH - moderateScale(60), moderateScale(348));
const BUTTON_WIDTH = Math.min(SCREEN_WIDTH - moderateScale(70), moderateScale(338));

// Google Logo SVG Component
const GoogleLogo = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <Path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <Path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <Path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </Svg>
);

const Signup = ({ navigation }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Configure Google Sign-In
  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        await GoogleSignin.configure({
          webClientId: '164432241102-2ubmgo9etcjv28dlqrdqgl4plsrlpv8j.apps.googleusercontent.com',
          offlineAccess: true,
          hostedDomain: '',
          forceCodeForRefreshToken: true,
        });
        console.log('✅ Google Sign-In configured successfully');
      } catch (error) {
        console.error('❌ Google Sign-In configuration error:', error);
      }
    };

    configureGoogleSignIn();
  }, []);

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Save user data to Firestore
  const saveUserToFirestore = async (userId, userData, isExistingUser = false) => {
    try {
      console.log('💾 Saving user data to Firestore:', { userId, isExistingUser });
      
      const safeUserData = userData || {};
      
      if (isExistingUser) {
        const userDoc = await firestore()
          .collection('Useraccount')
          .doc(userId)
          .get();
        
        const existingData = userDoc.exists ?  userDoc.data() || {} : {};
        
        await firestore()
          .collection('Useraccount')
          .doc(userId)
          .set({
            name: existingData.name || safeUserData.name || '',
            email: safeUserData.email || existingData.email || '',
            photoURL: safeUserData.photoURL || existingData.photoURL || '',
            gender: existingData.gender || '',
            location: existingData.location || '',
            emailVerified: safeUserData.emailVerified !== undefined ? safeUserData.emailVerified : existingData.emailVerified || false,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        
        console.log('✅ Existing user data updated');
      } else {
        await firestore()
          .collection('Useraccount')
          .doc(userId)
          .set({
            name: safeUserData.name || '',
            email: safeUserData.email || '',
            gender: '',
            location: '',
            photoURL: safeUserData.photoURL || '',
            emailVerified: safeUserData.emailVerified || false,
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore. FieldValue.serverTimestamp(),
          });
        
        console.log('✅ New user data saved to Firestore');
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving user to Firestore:', error);
      return { success: false, error:  error.message };
    }
  };

  // Check if user profile is complete
  const checkUserProfile = async (userId) => {
    try {
      const userDoc = await firestore()
        .collection('Useraccount')
        .doc(userId)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        
        if (userData.name && userData.gender && userData.location) {
          return { complete:  true, needsLocation: false, needsProfile: false };
        } else if (userData.name && userData.gender) {
          return { complete:  false, needsLocation: true, needsProfile: false };
        } else {
          return { complete: false, needsLocation: false, needsProfile: true };
        }
      } else {
        return { complete:  false, needsLocation: false, needsProfile: true };
      }
    } catch (error) {
      console.error('❌ Error checking user profile:', error);
      return { complete:  false, needsLocation: false, needsProfile: true };
    }
  };

  // Get translated error message for signup
  const getSignupErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return t('signup.emailAlreadyInUse') || 'This email is already registered';
      case 'auth/invalid-email':
        return t('signup.invalidEmail') || 'Invalid email format';
      case 'auth/operation-not-allowed':
        return t('signup.operationNotAllowed') || 'Operation not allowed';
      case 'auth/weak-password':
        return t('signup.weakPassword') || 'Password is too weak';
      case 'auth/network-request-failed':
        return t('signup.networkError') || 'Network error';
      case 'auth/too-many-requests':
        return t('signup.tooManyRequests') || 'Too many requests';
      default:
        return t('signup. unexpectedError') || 'An unexpected error occurred';
    }
  };

  // Create user account with OTP
  const createUserAccount = async (email, password) => {
    try {
      console.log('🔐 Creating user account for:', email);
      
      // Step 1: Create Firebase user
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase user created:', user.uid);
      
      // Step 2: Save to Firestore (user is still signed in)
      await saveUserToFirestore(user. uid, {
        email: user.email,
        emailVerified: false,
      }, false);
      
      // Step 3: Generate and send OTP
      console.log('📧 Generating and sending OTP...');
      const otpResult = await saveOTPAndSendEmail(email);
      
      if (! otpResult.success) {
        console.error('❌ Failed to send OTP:', otpResult.error);
        
        return {
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: false,
          },
          message: 'Account created!  Please check your email for verification code.',
          otpWarning: true,
        };
      }
      
      console.log('✅ OTP sent successfully');
      
      // Sign out AFTER sending OTP
      await auth().signOut();
      console.log('🚪 User signed out - awaiting verification');
      
      return {
        success: true,
        user:  {
          uid: user.uid,
          email: user.email,
          emailVerified: false,
        },
        message:  'Account created!  Verification code sent to your email.',
      };
      
    } catch (error) {
      console.error('❌ Error creating user account:', error);
      
      return {
        success: false,
        error:  getSignupErrorMessage(error. code),
        code: error?. code || 'unknown',
      };
    }
  };

  // Google Sign-In error messages
  const getGoogleErrorMessage = (errorCode) => {
    switch (errorCode) {
      case statusCodes.SIGN_IN_CANCELLED: 
        return t('signup.signInCancelled') || 'Sign in cancelled';
      case statusCodes.IN_PROGRESS:
        return t('signup.signInInProgress') || 'Sign in in progress';
      case statusCodes. PLAY_SERVICES_NOT_AVAILABLE:
        return t('signup.playServicesUnavailable') || 'Play Services unavailable';
      case 'auth/account-exists-with-different-credential':
        return t('signup. accountExists') || 'Account exists with different credential';
      case 'auth/invalid-credential':
        return t('signup. invalidCredential') || 'Invalid credential';
      case 'auth/network-request-failed':
        return t('signup.networkError') || 'Network error';
      case 'auth/user-disabled':
        return t('signup. userDisabled') || 'User disabled';
      case 'auth/operation-not-allowed':
        return t('signup.operationNotAllowedGoogle') || 'Operation not allowed';
      default:
        return t('signup. googleSignInFailed') || 'Google sign-in failed';
    }
  };

  // Google Sign-In function
  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage('');

      console.log('🔍 Starting Google Sign-In...');

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      const signInResult = await GoogleSignin. signIn();
      
      let idToken, googleUser;
      
      if (signInResult.type === 'success') {
        idToken = signInResult.data?. idToken;
        googleUser = signInResult.data?.user;
      } else if (signInResult.idToken) {
        idToken = signInResult.idToken;
        googleUser = signInResult. user;
      }
      
      if (!idToken) {
        throw new Error('Failed to get user credentials from Google Sign-In');
      }
      
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      console.log('✅ Firebase authentication successful');
      
      const userDocBefore = await firestore()
        .collection('Useraccount')
        .doc(userCredential.user.uid)
        .get();
      
      const isExistingUser = userDocBefore.exists;
      
      const userEmail = googleUser?. email || userCredential.user.email || '';
      
      await saveUserToFirestore(
        userCredential.user.uid,
        {
          email:  userEmail,
          emailVerified: true,
        },
        isExistingUser
      );
      
      if (! isExistingUser) {
        navigation.navigate('profile');
      } else {
        const profileStatus = await checkUserProfile(userCredential.user.uid);
        
        if (profileStatus.complete) {
          navigation.navigate('Home');
        } else if (profileStatus.needsProfile) {
          navigation.navigate('profile');
        } else if (profileStatus.needsLocation) {
          navigation.navigate('location');
        }
      }
      
    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);
      
      let errorMsg = getGoogleErrorMessage(error?. code);
      
      if (error && typeof error === 'object' && error.message && ! error.code) {
        errorMsg = error.message;
      }
      
      if (error?.code !== statusCodes.SIGN_IN_CANCELLED) {
        setErrorMessage(errorMsg);
      }
      
    } finally {
      setGoogleLoading(false);
    }
  };

  // ✅ UPDATED:  Handle create account button press
  const handleCreateAccount = async () => {
    setErrorMessage('');

    if (!email. trim()) {
      setErrorMessage(t('signup.enterEmailError') || 'Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage(t('signup. validEmailError') || 'Please enter a valid email');
      return;
    }

    if (! password.trim()) {
      setErrorMessage(t('signup.enterPasswordError') || 'Please enter a password');
      return;
    }

    if (password.length < 8) {
      setErrorMessage(t('signup.passwordTooShort') || 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await createUserAccount(email. trim(), password);

      if (result.success) {
        console.log('✅ Account creation successful');
        
        if (result.otpWarning) {
          Alert.alert(
            'Account Created',
            'Your account was created but we had trouble sending the verification email. You can request a new code on the next screen.',
            [
              {
                text: 'Continue',
                // ✅ FIX: Pass password for auto sign-in after OTP
                onPress: () => navigation.navigate('otp', { 
                  email: email.trim(),
                  password: password  // Pass password securely
                }),
              },
            ]
          );
        } else {
          // ✅ FIX:  Navigate to OTP screen with email AND password
          navigation.navigate('otp', { 
            email: email.trim(),
            password: password  // Pass password for auto sign-in after verification
          });
        }
      } else {
        console.error('❌ Account creation failed:', result.error);
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setErrorMessage(t('signup.unexpectedError') || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    await signInWithGoogle();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDE2E0" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            disabled={loading || googleLoading}
          >
            <View style={styles.backButtonContainer}>
              <View style={styles.arrowContainer}>
                <Text style={styles.backArrow}>‹</Text>
              </View>
              <Text style={styles.backText}>{t('signup.back') || 'Back'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>{t('signup.subtitle') || 'Sign up to get started'}</Text>
        </View>

        {/* Error Message */}
        {errorMessage ?  (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, errorMessage && styles.textInputError]}
              placeholder={t('signup.enterEmail') || 'Enter your email'}
              placeholderTextColor="#A68FA6"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !googleLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, errorMessage && styles.textInputError]}
              placeholder={t('signup.createPassword') || 'Create a password'}
              placeholderTextColor="#A68FA6"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              secureTextEntry={! showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !googleLoading}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading || googleLoading}
            >
              <Image 
                source={require('../../assets/eye_line 1.png')}
                style={styles.eyeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity 
            style={[styles.createButton, (loading || googleLoading) && styles.createButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleCreateAccount}
            disabled={loading || googleLoading}
          >
            {loading ?  (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles. createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerSection}>
            <Text style={styles.dividerText}>{t('signup.orSignUpWith') || 'or sign up with'}</Text>
          </View>

          {/* Google Button */}
          <TouchableOpacity 
            style={[styles.googleButton, (loading || googleLoading) && styles.googleButtonDisabled]}
            activeOpacity={0.7}
            disabled={loading || googleLoading}
            onPress={handleGoogleSignUp}
          >
            <View style={styles.googleButtonContent}>
              {googleLoading ? (
                <ActivityIndicator size="small" color="#5D4A5D" style={{ marginRight: moderateScale(12) }} />
              ) : (
                <View style={styles.googleIconWrapper}>
                  <GoogleLogo size={moderateScale(20)} />
                </View>
              )}
              <Text style={styles.googleButtonText}>
                {googleLoading ? t('signup.signingIn') || 'Signing in...' :  t('signup.signUpWithGoogle') || 'Sign up with Google'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Terms and Conditions Link */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsPrefix}>By creating an account, you agree to our </Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setShowTermsModal(true)}
              disabled={loading || googleLoading}
            >
              <Text style={styles.termsLink}>Terms and Conditions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Terms and Conditions Modal */}
      <TermsAndConditions 
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
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
    paddingBottom: verticalScale(40),
  },
  header: {
    marginTop: verticalScale(52),
    marginBottom: verticalScale(40),
    paddingHorizontal: moderateScale(32),
  },
  backButton: {},
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
    alignItems:  'center',
    marginRight: moderateScale(12),
  },
  backArrow: {
    fontSize: scaleFont(32),
    color: '#D96073',
    fontWeight: 'bold',
    lineHeight: scaleFont(32),
    marginTop: Platform.OS === 'android' ?  moderateScale(-2) : 0,
    textAlign: 'center',
  },
  backText: {
    fontSize: scaleFont(16),
    color: '#5D4A5D',
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: moderateScale(30),
    marginBottom: verticalScale(60),
  },
  title: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color: '#2D1B47',
    marginBottom: moderateScale(12),
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize:  scaleFont(16),
    color: '#7A6B7A',
    lineHeight: scaleFont(22),
    fontWeight: '400',
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
    paddingHorizontal: moderateScale(20),
  },
  inputContainer: {
    position: 'relative',
    marginBottom: moderateScale(20),
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    width: INPUT_WIDTH,
    height: moderateScale(56),
    backgroundColor: '#EDCFC9',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    paddingVertical:  moderateScale(16),
    fontSize: scaleFont(16),
    color: '#2D1B47',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#EDCFC9',
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
  eyeButton: {
    position: 'absolute',
    right: (SCREEN_WIDTH - INPUT_WIDTH) / 2 + moderateScale(20),
    top: moderateScale(16),
  },
  eyeIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  createButton: {
    width:  BUTTON_WIDTH,
    height: moderateScale(54),
    backgroundColor: '#D96073',
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(32),
    marginBottom: moderateScale(30),
    shadowColor: '#262628',
    shadowOffset: {
      width:  0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(12),
    elevation: 8,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(217, 96, 115, 0.6)',
  },
  createButtonText: {
    color:  '#FFFFFF',
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
  dividerSection: {
    alignItems: 'center',
    marginBottom: moderateScale(25),
  },
  dividerText: {
    fontSize: scaleFont(15),
    color: '#8B7B8B',
    fontWeight:  '500',
  },
  googleButton: {
    width: BUTTON_WIDTH,
    height: moderateScale(54),
    backgroundColor: 'rgba(237, 207, 201, 0.6)',
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems:  'center',
    borderWidth: 1,
    borderColor: 'rgba(237, 207, 201, 0.8)',
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconWrapper: {
    marginRight: moderateScale(12),
  },
  googleButtonText: {
    fontSize: scaleFont(16),
    color: '#5D4A5D',
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(20),
    paddingHorizontal: moderateScale(20),
  },
  termsPrefix: {
    fontSize: scaleFont(13),
    color: '#7A6B7A',
    fontWeight: '400',
  },
  termsLink: {
    fontSize: scaleFont(13),
    color: '#D96073',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default Signup;