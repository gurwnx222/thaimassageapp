import React, { useState } from 'react';
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
} from 'react-native';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Firebase create user account function
  const createUserAccount = async (email, password) => {
    try {
      // Create user with email and password
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      const user = userCredential.user;
      
      console.log('User account created successfully:', user.uid);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        message: 'Account created successfully!'
      };
      
    } catch (error) {
      console.error('Error creating user account:', error);
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'An error occurred while creating your account.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already registered. Please use a different email or try signing in.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  };

  // Handle create account
  const handleCreateAccount = async () => {
    // Clear previous error
    setErrorMessage('');

    // Validate inputs
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await createUserAccount(email.trim(), password);

      if (result.success) {
        // Account created successfully - Navigate directly to OTP screen
        navigation.navigate('otp'); // Update with your actual OTP screen route name
      } else {
        // Show error message
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error('Create account error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign Up (you can implement this later)
  const handleGoogleSignUp = async () => {
    Alert.alert('Info', 'Google Sign Up will be implemented soon!');
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
              <View style={styles.arrowContainer}>
                <Text style={styles.backArrow}>‹</Text>
              </View>
              <Text style={styles.backText}>Back</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>book your massage effortlessly and{'\n'}privately...</Text>
        </View>

        {/* Error Message */}
        {errorMessage ? (
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
              placeholder="Enter your email"
              placeholderTextColor="#A68FA6"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(''); // Clear error on input
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, errorMessage && styles.textInputError]}
              placeholder="Create password"
              placeholderTextColor="#A68FA6"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(''); // Clear error on input
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <View style={styles.eyeIcon}>
                <Text style={styles.eyeText}>👁</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity 
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create my account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerSection}>
            <Text style={styles.dividerText}>or sign up with</Text>
          </View>

          {/* Google Button */}
          <TouchableOpacity 
            style={[styles.googleButton, loading && styles.googleButtonDisabled]}
            activeOpacity={0.7}
            disabled={loading}
            onPress={handleGoogleSignUp}
          >
            <View style={styles.googleButtonContent}>
              <View style={styles.googleIcon}>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleBlue}>G</Text>
                  <Text style={styles.googleRed}>o</Text>
                  <Text style={styles.googleYellow}>o</Text>
                  <Text style={styles.googleBlue}>g</Text>
                  <Text style={styles.googleGreen}>l</Text>
                  <Text style={styles.googleRed}>e</Text>
                </View>
              </View>
              <Text style={styles.googleButtonText}>create account with google</Text>
            </View>
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
    paddingBottom: 40,
  },
  header: {
    marginTop: 80,
    marginBottom: 40,
  },
  backButton: {
    marginLeft: 20,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(237, 207, 201, 0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 24,
    color: '#5D4A5D',
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    color: '#5D4A5D',
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: 30,
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D1B47',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6B7A',
    lineHeight: 22,
    fontWeight: '400',
  },
  errorContainer: {
    marginHorizontal: 30,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(217, 96, 115, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D96073',
  },
  errorText: {
    color: '#D96073',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  formSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    width: width - 60,
    maxWidth: 348,
    height: 56,
    backgroundColor: '#EDCFC9',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2D1B47',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#EDCFC9',
    shadowColor: '#262628',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 4,
  },
  textInputError: {
    borderColor: '#D96073',
    borderWidth: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 40,
    top: '50%',
    marginTop: -12,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 18,
    color: '#B8736B',
  },
  createButton: {
    width: width - 70,
    maxWidth: 338,
    height: 54,
    backgroundColor: '#D96073',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 30,
    shadowColor: '#262628',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(217, 96, 115, 0.6)',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerText: {
    fontSize: 15,
    color: '#8B7B8B',
    fontWeight: '500',
  },
  googleButton: {
    width: width - 70,
    maxWidth: 338,
    height: 54,
    backgroundColor: 'rgba(237, 207, 201, 0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  googleIcon: {
    marginRight: 12,
  },
  googleIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleBlue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleRed: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EA4335',
  },
  googleYellow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FBBC05',
  },
  googleGreen: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34A853',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#5D4A5D',
    fontWeight: '500',
  },
});

export default Signup;