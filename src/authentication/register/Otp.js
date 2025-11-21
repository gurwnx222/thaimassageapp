import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

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

const Otp = ({ navigation }) => {
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleOtpChange = (value, index) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    // Check if all OTP digits are filled
    const isComplete = otp.every(digit => digit !== '');
    
    if (isComplete) {
      // Navigate to profile screen
      navigation.navigate('profile');
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
          >
            <View style={styles.backButtonContainer}>
              {/* Arrow with background circle */}
              <View style={styles.arrowContainer}>
                <Text style={styles.backArrow}>‹</Text>
              </View>
              <Text style={styles.backText}>{t('otp.back')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('otp.title')}</Text>
          <Text style={styles.subtitle}>{t('otp.subtitle')}</Text>
        </View>

        {/* OTP Input Section */}
        <View style={styles.otpSection}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <View key={index} style={styles.otpInputContainer}>
                <TextInput
                  ref={inputRefs[index]}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : {},
                    index === 0 && digit ? styles.otpInputActive : {},
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
                {/* Underline for empty inputs */}
                {!digit && <View style={styles.otpUnderline} />}
              </View>
            ))}
          </View>
        </View>

        {/* Verify Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={styles.verifyButton}
            activeOpacity={0.8}
            onPress={handleVerify}
          >
            <Text style={styles.verifyButtonText}>{t('otp.verifyButton')}</Text>
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
    paddingBottom: verticalScale(40),
  },
  header: {
    marginTop: verticalScale(52),
    marginBottom: verticalScale(40),
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
    fontSize: scaleFont(28),
    color: '#D96073',
    fontWeight: 'bold',
  },
  backText: {
    fontSize: scaleFont(16),
    color: '#5D4A5D',
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: moderateScale(30),
    marginBottom: verticalScale(80),
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
  },
  otpSection: {
    alignItems: 'center',
    marginBottom: verticalScale(120),
    paddingHorizontal: moderateScale(30),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: moderateScale(280),
  },
  otpInputContainer: {
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
    backgroundColor: 'rgba(237, 207, 201, 0.8)',
    borderColor: '#D96073',
  },
  otpInputActive: {
    borderColor: '#D96073',
    borderWidth: 2,
  },
  otpUnderline: {
    position: 'absolute',
    bottom: moderateScale(15),
    width: moderateScale(20),
    height: moderateScale(2),
    backgroundColor: '#8B7B8B',
    borderRadius: moderateScale(1),
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
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
});

export default Otp;