import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { BlurView } from '@react-native-community/blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const scaleFont = (size) => {
  const scaledSize = (SCREEN_WIDTH / 375) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

const options = ({navigation}) => {
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
    outputRange: [0, moderateScale(-8)],
  });

  const bounce2Interpolate = bounceAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, moderateScale(-6)],
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
      <StatusBar barStyle="dark-content" backgroundColor="#EDE2E0" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Luci</Text>
        <Text style={styles.subtitle}>Book your favorite massage</Text>
      </View>

      {/* Phone Frame Container */}
      <View style={styles.phoneFrameContainer}>
        {/* Phone Bezel Wrapper */}
        <View style={styles.phoneBezeLWrapper}>
          {/* Top Notch */}
          <View style={styles.notchContainer}>
            <View style={styles.notch} />
          </View>

          {/* Phone Border Container */}
          <View style={styles.phoneBorderContainer}>
            {/* Phone Screen Content */}
            <View style={styles.phoneScreen}>
              {/* Date & Time Display */}
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateText}>Monday, October 31</Text>
                <Text style={styles.timeText}>9:41</Text>
              </View>

              {/* Animated Notification Cards */}
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
                      </View>
                    </View>
                    <View style={styles.textContent}>
                      <Text style={styles.serviceName}>Zen Thai Studio</Text>
                      <Text style={styles.serviceMessage} numberOfLines={1}>thank you for book.....</Text>
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
                      </View>
                    </View>
                    <View style={styles.textContent}>
                      <View style={styles.serviceNameContainer}>
                        <Text style={styles.serviceName}>Caccoon </Text>
                        <Text style={styles.strikethrough}>Healing</Text>
                      </View>
                      <Text style={styles.serviceMessage} numberOfLines={1}>thank you for book.....</Text>
                    </View>
                    <Text style={styles.timestamp}>6:30 A.M</Text>
                  </View>
                </Animated.View>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Curved Arch Section with Blur */}
      <View style={styles.bottomArchContainer}>
        <Svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${SCREEN_WIDTH} 250`}
          preserveAspectRatio="none"
          style={styles.archSvg}
        >
          <Defs>
            <SvgLinearGradient id="archGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgba(225, 210, 240, 0.6)" stopOpacity="1" />
              <Stop offset="25%" stopColor="rgba(215, 195, 235, 0.75)" stopOpacity="1" />
              <Stop offset="50%" stopColor="rgba(208, 188, 228, 0.88)" stopOpacity="1" />
              <Stop offset="100%" stopColor="rgba(200, 181, 219, 1)" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          {/* Upside-down arch/dome shape */}
          <Path
            d={`M 0 0
                L 0 60
                Q ${SCREEN_WIDTH * 0.5} 0, ${SCREEN_WIDTH} 60
                L ${SCREEN_WIDTH} 250
                L 0 250 Z`}
            fill="url(#archGradient)"
          />
        </Svg>
        
        {/* Blur overlay */}
        {Platform.OS === 'ios' ? (
          <BlurView
            style={styles.blurOverlay}
            blurType="light"
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(210, 190, 240, 0.75)"
          />
        ) : (
          <View style={styles.androidBlurOverlay} />
        )}
      </View>

      {/* Bottom Buttons */}
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
    marginTop: verticalScale(50),
    marginBottom: verticalScale(20),
    paddingHorizontal: moderateScale(30),
    zIndex: 10,
  },
  title: {
    fontSize: scaleFont(48),
    fontWeight: 'bold',
    color: '#2D1B47',
    marginBottom: moderateScale(8),
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: scaleFont(16),
    color: '#7A6B7A',
    fontWeight: '400',
  },
  phoneFrameContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: verticalScale(15),
    marginBottom: 0,
    zIndex: 1,
  },
  phoneBezeLWrapper: {
    flex: 1,
    width: moderateScale(280),
    maxWidth: moderateScale(320),
    position: 'relative',
    marginBottom: moderateScale(-80),
  },
  notchContainer: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: moderateScale(-75) }],
    zIndex: 10,
  },
  notch: {
    width: moderateScale(150),
    height: moderateScale(28),
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  phoneBorderContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    paddingTop: moderateScale(8),
    paddingHorizontal: moderateScale(8),
    paddingBottom: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(10),
    },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(20),
    elevation: 15,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#E6D5E1',
    borderTopLeftRadius: moderateScale(32),
    borderTopRightRadius: moderateScale(32),
    borderBottomLeftRadius: moderateScale(32),
    borderBottomRightRadius: moderateScale(32),
    overflow: 'hidden',
  },
  dateTimeContainer: {
    alignItems: 'center',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(20),
  },
  dateText: {
    fontSize: scaleFont(12),
    color: '#B08BA5',
    fontWeight: '500',
    marginBottom: moderateScale(4),
  },
  timeText: {
    fontSize: scaleFont(48),
    color: '#B08BA5',
    fontWeight: '300',
    letterSpacing: -1,
  },
  cardsContainer: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(12),
  },
  cardShadowContainer: {
    shadowColor: '#2D1B47',
    shadowOffset: {
      width: 0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(8),
    elevation: 6,
  },
  notificationCard: {
    height: moderateScale(65),
    borderRadius: moderateScale(18),
    overflow: 'visible',
    position: 'relative',
  },
  cardGlowEffect: {
    position: 'absolute',
    top: moderateScale(-3),
    left: moderateScale(-3),
    right: moderateScale(-3),
    bottom: moderateScale(-3),
    backgroundColor: 'rgba(237, 207, 201, 0.4)',
    borderRadius: moderateScale(21),
    zIndex: -2,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EDCFC9',
    borderRadius: moderateScale(18),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    height: '100%',
    zIndex: 1,
  },
  iconContainer: {
    marginRight: moderateScale(12),
  },
  zenIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    backgroundColor: '#4A7C59',
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  caccoonIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    backgroundColor: '#8B7B8B',
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  omSymbol: {
    fontSize: scaleFont(20),
    color: '#E8A87C',
    fontWeight: 'bold',
  },
  flowerSymbol: {
    fontSize: scaleFont(18),
  },
  textContent: {
    flex: 1,
    marginRight: moderateScale(12),
    justifyContent: 'center',
  },
  serviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(2),
  },
  serviceName: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: '#2D1B47',
  },
  strikethrough: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: '#2D1B47',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  serviceMessage: {
    fontSize: scaleFont(12),
    color: '#7A6B7A',
    fontWeight: '400',
  },
  timestamp: {
    fontSize: scaleFont(11),
    color: '#7A6B7A',
    fontWeight: '500',
  },
  bottomArchContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(250),
    zIndex: 5,
    overflow: 'hidden',
  },
  archSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  buttonsContainer: {
    position: 'absolute',
    bottom: verticalScale(40),
    alignItems: 'center',
    width: '100%',
    gap: moderateScale(14),
    zIndex: 10,
  },
  createAccountButton: {
    width: moderateScale(200),
    height: moderateScale(50),
    backgroundColor: '#D96073',
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D96073',
    shadowOffset: {
      width: 0,
      height: moderateScale(6),
    },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(12),
    elevation: 8,
  },
  createAccountText: {
    color: '#FFFFFF',
    fontSize: scaleFont(17),
    fontWeight: '700',
  },
  loginButton: {
    width: moderateScale(200),
    height: moderateScale(50),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 4,
  },
  loginText: {
    color: '#7A6B7A',
    fontSize: scaleFont(17),
    fontWeight: '600',
  },
});

export default options;