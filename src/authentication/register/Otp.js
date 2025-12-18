import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  PixelRatio,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { verifyOTPFromFirestore, resendOTP, deleteOTP } from '../../utils/otpHelper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';  // ✅ ADDED:  Import auth

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const scaleFont = (size) => {
  const scaledSize = (SCREEN_WIDTH / 375) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

const BUTTON_WIDTH = Math.min(SCREEN_WIDTH - moderateScale(70), moderateScale(338));

const Otp = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { email, password } = route.params || {};  // ✅ ADDED:  Get password from params
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Timer countdown for resend OTP
  useEffect(() => {
    let interval;
    
    if (timer > 0 && ! canResend) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      Alert.alert(
        'Error',
        'Email address not found. Please sign up again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('signup'),
          },
        ]
      );
    } else {
      console.log('📧 OTP screen loaded for:', email);
      console.log('🔑 Password available:', !!password);  // ✅ Log if password is available
      setSuccessMessage(`Verification code sent to ${email}`);
      
      // Focus first input
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 500);
    }
  }, [email, password, navigation]);

  const handleOtpChange = (value, index) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear messages when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?. focus();
    }

    // Auto-verify when all digits are entered
    if (value && index === 3) {
      const enteredOtp = [... newOtp. slice(0, 3), value].join('');
      if (enteredOtp. length === 4) {
        // Small delay for better UX
        setTimeout(() => {
          handleVerify(enteredOtp);
        }, 300);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === 'Backspace' && ! otp[index] && index > 0) {
      inputRefs[index - 1]. current?.focus();
      
      // Also clear the previous input
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  // ✅ UPDATED: Handle verify with auto sign-in
  const handleVerify = async (providedOtp = null) => {
    const enteredOTP = providedOtp || otp. join('');
    
    // Check if all OTP digits are filled
    if (enteredOTP.length !== 4) {
      setErrorMessage('Please enter the complete 4-digit code');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('🔍 Verifying OTP for email:', email);
      
      // Verify OTP from Firestore
      const result = await verifyOTPFromFirestore(email, enteredOTP);

      if (result.success) {
        console.log('✅ OTP verified successfully');
        
        let userId = null;
        
        // Update user's email verification status in Firestore
        try {
          const userQuery = await firestore()
            .collection('Useraccount')
            .where('email', '==', email)
            .limit(1)
            .get();

          if (! userQuery.empty) {
            const userDoc = userQuery.docs[0];
            userId = userDoc. id;
            
            console.log('✅ Found user document, userId:', userId);
            
            await firestore()
              .collection('Useraccount')
              .doc(userDoc.id)
              .update({
                emailVerified: true,
                updatedAt: firestore.FieldValue.serverTimestamp(),
              });
            
            console.log('✅ User emailVerified status updated');
          } else {
            console.error('❌ User document not found for email:', email);
          }
        } catch (firestoreError) {
          console.error('⚠️ Error updating Firestore:', firestoreError);
          // Continue even if Firestore update fails
        }

        // ✅ NEW: Sign user back in after OTP verification
        try {
          if (password && email) {
            console.log('🔐 Signing user back in.. .');
            
            await auth().signInWithEmailAndPassword(email, password);
            
            console.log('✅ User signed back in successfully! ');
          } else {
            console.warn('⚠️ Password not available, user will remain signed out');
          }
        } catch (signInError) {
          console.error('❌ Error signing user back in:', signInError);
          // Continue anyway - user can sign in manually later
        }

        // Delete OTP after successful verification
        await deleteOTP(email);

        // Show success message briefly
        setSuccessMessage('✓ Verified! ');
        
        // Navigate after brief delay (500ms for better UX)
        setTimeout(() => {
          console.log('➡️ Navigating to profile screen');
          
          // Pass userId and email to profile screen (backup in case sign-in fails)
          navigation. replace('profile', { 
            email:  email,
            userId: userId,
            fromOtpVerification: true
          });
        }, 500);
        
      } else {
        // Verification failed
        console.error('❌ OTP verification failed:', result.error);
        setErrorMessage(result.error || 'Invalid OTP.  Please try again.');
        
        // Clear OTP inputs on error
        setOtp(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      setErrorMessage('Verification failed. Please try again.');
      
      // Clear OTP inputs
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (! canResend || resending) {
      return;
    }

    setResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('🔄 Resending OTP to:', email);
      
      const result = await resendOTP(email);

      if (result.success) {
        console.log('✅ OTP resent successfully');
        
        setSuccessMessage('✓ New verification code sent to your email');
        
        // Reset timer
        setTimer(60);
        setCanResend(false);
        
        // Clear previous OTP
        setOtp(['', '', '', '']);
        inputRefs[0].current?.focus();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(result.error || 'Failed to resend OTP.  Please try again.');
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      setErrorMessage('Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      'Cancel Verification',
      'Are you sure you want to go back?  You will need to sign up again.',
      [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Go Back',
          onPress: async () => {
            // Clean up OTP data
            if (email) {
              await deleteOTP(email);
            }
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
            onPress={handleBackPress}
            activeOpacity={0.7}
            disabled={loading || resending}
          >
            <View style={styles.backButtonContainer}>
              <View style={styles. arrowContainer}>
                <Text style={styles.backArrow}>‹</Text>
              </View>
              <Text style={styles.backText}>{t('otp.back') || 'Back'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('otp.title') || 'Verify Your Email'}</Text>
          <Text style={styles.subtitle}>
            {'We sent a verification code to: '}
          </Text>
          {email && (
            <Text style={styles.emailText}>{email}</Text>
          )}
        </View>

        {/* Success Message */}
        {successMessage ?  (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {/* Error Message */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* OTP Input Section */}
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Enter 4-Digit Code</Text>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <View key={index} style={styles.otpInputContainer}>
                <TextInput
                  ref={inputRefs[index]}
                  style={[
                    styles.otpInput,
                    digit ?  styles.otpInputFilled : {},
                    errorMessage ?  styles.otpInputError : {},
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  editable={!loading && !resending}
                  selectTextOnFocus
                  autoComplete="off"
                  autoCorrect={false}
                />
                {! digit && ! errorMessage && <View style={styles.otpUnderline} />}
              </View>
            ))}
          </View>
        </View>

        {/* Resend OTP Section */}
        <View style={styles.resendSection}>
          <Text style={styles.didntReceiveText}>Didn't receive the code?</Text>
          
          {canResend ? (
            <TouchableOpacity 
              onPress={handleResendOTP}
              disabled={resending || loading}
              activeOpacity={0.7}
              style={styles.resendButton}
            >
              {resending ? (
                <View style={styles.resendingContainer}>
                  <ActivityIndicator size="small" color="#D96073" />
                  <Text style={styles.resendingText}>Sending...</Text>
                </View>
              ) : (
                <Text style={styles.resendText}>Resend Code</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                Resend available in {formatTimer(timer)}
              </Text>
            </View>
          )}
        </View>

        {/* Verify Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={[
              styles.verifyButton, 
              (loading || resending) && styles.verifyButtonDisabled
            ]}
            activeOpacity={0.8}
            onPress={() => handleVerify()}
            disabled={loading || resending}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles. verifyButtonText}>
                {t('otp.verifyButton') || 'Verify Email'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Check your spam folder if you don't see the email
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:  1,
    backgroundColor: '#EDE2E0',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(40),
  },
  header: {
    marginTop: verticalScale(52),
    marginBottom: verticalScale(40),
    paddingHorizontal:  moderateScale(32),
  },
  backButton: {},
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    width: moderateScale(45),
    height: moderateScale(45),
    backgroundColor:  'rgba(237, 207, 201, 0.8)',
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  backArrow: {
    fontSize: scaleFont(32),
    color: '#D96073',
    fontWeight: 'bold',
    lineHeight:  scaleFont(32),
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
    marginBottom: verticalScale(40),
  },
  title: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color:  '#2D1B47',
    marginBottom: moderateScale(12),
    letterSpacing:  0.5,
  },
  subtitle: {
    fontSize:  scaleFont(16),
    color: '#7A6B7A',
    lineHeight: scaleFont(22),
    fontWeight: '400',
    marginBottom: moderateScale(8),
  },
  emailText: {
    fontSize: scaleFont(16),
    color: '#D96073',
    fontWeight:  '600',
    marginTop: moderateScale(4),
  },
  successContainer: {
    marginHorizontal: moderateScale(30),
    marginBottom: moderateScale(20),
    padding: moderateScale(15),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: moderateScale(8),
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    color: '#2E7D32',
    fontSize:  scaleFont(14),
    fontWeight: '500',
    textAlign: 'center',
  },
  errorContainer: {
    marginHorizontal: moderateScale(30),
    marginBottom: moderateScale(20),
    padding: moderateScale(15),
    backgroundColor: 'rgba(217, 96, 115, 0.1)',
    borderRadius: moderateScale(8),
    borderLeftWidth: 4,
    borderLeftColor:  '#D96073',
  },
  errorText: {
    color: '#D96073',
    fontSize: scaleFont(14),
    fontWeight: '500',
    textAlign: 'center',
  },
  otpSection: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
    paddingHorizontal: moderateScale(30),
  },
  otpLabel: {
    fontSize: scaleFont(14),
    color: '#7A6B7A',
    fontWeight: '500',
    marginBottom: moderateScale(20),
    textAlign: 'center',
  },
  otpContainer:  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: moderateScale(280),
  },
  otpInputContainer:  {
    position: 'relative',
    alignItems: 'center',
  },
  otpInput: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: 'rgba(237, 207, 201, 0.6)',
    borderRadius: moderateScale(12),
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: '#2D1B47',
    borderWidth: 2,
    borderColor: 'rgba(237, 207, 201, 0.8)',
  },
  otpInputFilled: {
    backgroundColor: 'rgba(237, 207, 201, 0.9)',
    borderColor: '#D96073',
  },
  otpInputError: {
    borderColor: '#D96073',
    borderWidth: 2,
    backgroundColor: 'rgba(217, 96, 115, 0.1)',
  },
  otpUnderline: {
    position: 'absolute',
    bottom: moderateScale(15),
    width: moderateScale(20),
    height: moderateScale(2),
    backgroundColor: '#8B7B8B',
    borderRadius: moderateScale(1),
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
    paddingHorizontal: moderateScale(30),
  },
  didntReceiveText: {
    fontSize: scaleFont(14),
    color: '#7A6B7A',
    marginBottom: moderateScale(12),
  },
  resendButton: {
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(16),
  },
  resendText: {
    fontSize: scaleFont(16),
    color: '#D96073',
    fontWeight:  '600',
    textDecorationLine: 'underline',
  },
  resendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendingText:  {
    fontSize: scaleFont(16),
    color: '#D96073',
    fontWeight:  '500',
    marginLeft: moderateScale(8),
  },
  timerContainer: {
    paddingVertical: moderateScale(8),
  },
  timerText: {
    fontSize: scaleFont(16),
    color: '#8B7B8B',
    fontWeight: '500',
  },
  buttonSection: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(30),
  },
  verifyButton: {
    width: BUTTON_WIDTH,
    height: moderateScale(54),
    backgroundColor: '#D96073',
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems:  'center',
    shadowColor: '#262628',
    shadowOffset: {
      width: 0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(12),
    elevation: 8,
  },
  verifyButtonDisabled: {
    backgroundColor:  'rgba(217, 96, 115, 0.6)',
  },
  verifyButtonText: {
    color:  '#FFFFFF',
    fontSize:  scaleFont(18),
    fontWeight: '700',
  },
  helpText: {
    fontSize: scaleFont(12),
    color: '#8B7B8B',
    textAlign: 'center',
    marginTop: moderateScale(16),
    lineHeight: scaleFont(18),
    paddingHorizontal: moderateScale(20),
  },
});

export default Otp;