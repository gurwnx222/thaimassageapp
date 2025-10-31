import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const options = ({navigation}) => { // Changed from 'options' to 'LuciScreen'
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(100)).current;
  const slideAnim2 = useRef(new Animated.Value(100)).current;
  const scaleAnim1 = useRef(new Animated.Value(0.8)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.8)).current;
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const bounceAnim1 = useRef(new Animated.Value(0)).current;
  const bounceAnim2 = useRef(new Animated.Value(0)).current;
  const glowAnim1 = useRef(new Animated.Value(0)).current;
  const glowAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Complex card animations
    Animated.sequence([
      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Staggered card entrance with multiple effects
      Animated.stagger(400, [
        // First card animation sequence
        Animated.parallel([
          Animated.spring(slideAnim1, {
            toValue: 0,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim1, {
            toValue: 1,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(rotateAnim1, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Second card animation sequence
        Animated.parallel([
          Animated.spring(slideAnim2, {
            toValue: 0,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim2, {
            toValue: 1,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(rotateAnim2, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    ]).start(() => {
      // Start continuous animations after entrance
      startContinuousAnimations();
    });
  }, []);

  const startContinuousAnimations = () => {
    // Continuous bounce effect
    const bounce1 = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const bounce2 = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim2, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim2, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow effect
    const glow1 = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim1, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim1, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const glow2 = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim2, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim2, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    bounce1.start();
    bounce2.start();
    glow1.start();
    glow2.start();
  };

  const card1RotateInterpolate = rotateAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const card2RotateInterpolate = rotateAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-5deg'],
  });

  const bounce1Interpolate = bounceAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const bounce2Interpolate = bounceAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const glow1Interpolate = glowAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const glow2Interpolate = glowAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#C8B5DB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Luci</Text>
        <Text style={styles.subtitle}>Book your favorite massage</Text>
      </View>

      {/* Animated Notification Cards with Enhanced Effects */}
      <Animated.View 
        style={[
          styles.cardsContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        {/* Zen Thai Studio Card */}
        <Animated.View
          style={[
            styles.notificationCard,
            styles.cardShadowContainer,
            {
              transform: [
                { translateY: Animated.add(slideAnim1, bounce1Interpolate) },
                { scale: scaleAnim1 },
                { rotate: card1RotateInterpolate }
              ],
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.cardGlowEffect,
              { opacity: glow1Interpolate }
            ]} 
          />
          <View style={styles.cardBackground} />
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <View style={styles.zenIcon}>
                <Text style={styles.omSymbol}>ॐ</Text>
                <View style={styles.iconGlow} />
              </View>
            </View>
            <View style={styles.textContent}>
              <Text style={styles.serviceName}>Zen Thai Studio</Text>
              <Text style={styles.serviceMessage}>thank you for book.....</Text>
            </View>
            <Text style={styles.timestamp}>now</Text>
          </View>
        </Animated.View>

        {/* Caccoon Healing Card */}
        <Animated.View
          style={[
            styles.notificationCard,
            styles.cardShadowContainer,
            {
              transform: [
                { translateY: Animated.add(slideAnim2, bounce2Interpolate) },
                { scale: scaleAnim2 },
                { rotate: card2RotateInterpolate }
              ],
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.cardGlowEffect,
              { opacity: glow2Interpolate }
            ]} 
          />
          <View style={styles.cardBackground} />
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <View style={styles.caccoonIcon}>
                <Text style={styles.flowerSymbol}>🌸</Text>
                <View style={styles.iconGlow} />
              </View>
            </View>
            <View style={styles.textContent}>
              <Text style={styles.serviceName}>Caccoon</Text>
              <Text style={styles.strikethrough}>Healing</Text>
              <Text style={styles.serviceMessage}>thank you for book.....</Text>
            </View>
            <Text style={styles.timestamp}>6:30 A.M</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Dark bars on sides */}
      <View style={styles.darkBarsContainer}>
        <View style={styles.leftDarkBar} />
        <View style={styles.rightDarkBar} />
      </View>

      {/* Bottom shade */}
      <View style={styles.bottomShadeContainer}>
        <View style={styles.bottomShade} />
      </View>

      {/* Bottom Buttons with exact specifications */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.createAccountButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('signup')}
        >
          <Text style={styles.createAccountText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('login')}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Home Indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE2E0',
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 80,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2D1B47',
    marginBottom: 10,
    letterSpacing: 1,
    textShadowColor: 'rgba(45, 27, 71, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#7A6B7A',
    fontWeight: '500',
  },
  cardsContainer: {
    paddingHorizontal: 25,
    marginBottom: 100,
    gap: 25,
  },
  cardShadowContainer: {
    shadowColor: '#2D1B47',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 15,
  },
  notificationCard: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 34,
    zIndex: -2,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EDCFC9',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EDCFC9',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 22,
    zIndex: 1,
  },
  iconContainer: {
    marginRight: 18,
    position: 'relative',
  },
  zenIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#4A7C59',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A7C59',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  caccoonIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#8B7B8B',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B7B8B',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 34,
    zIndex: -1,
  },
  omSymbol: {
    fontSize: 28,
    color: '#E8A87C',
    fontWeight: 'bold',
  },
  flowerSymbol: {
    fontSize: 24,
  },
  textContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D1B47',
    marginBottom: 3,
  },
  strikethrough: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D1B47',
    textDecorationLine: 'line-through',
    marginBottom: 3,
  },
  serviceMessage: {
    fontSize: 15,
    color: '#7A6B7A',
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 15,
    color: '#7A6B7A',
    fontWeight: '600',
  },
  darkBarsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 50,
  },
  leftDarkBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: '100%',
    backgroundColor: '#2D1B47',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  rightDarkBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: '100%',
    backgroundColor: '#2D1B47',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  bottomShadeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  bottomShade: {
    flex: 1,
    backgroundColor: 'rgba(210, 190, 240, 1)',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%',
    gap: 15,
  },
  createAccountButton: {
    // Exact specifications from your layout
    width: 216,
    height: 52,
    backgroundColor: '#D96073',
    borderRadius: 16, // Changed from 28 to 16 as per specs
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BA7F88',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  createAccountText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loginButton: {
    // Same dimensions as create account button
    width: 216,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16, // Changed from 28 to 16 as per specs
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  loginText: {
    color: '#7A6B7A',
    fontSize: 18,
    fontWeight: '600',
  },

});

export default options; // Changed from 'options' to 'LuciScreen'