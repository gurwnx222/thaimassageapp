import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Wait for 3 seconds, then navigate to options screen
    const timer = setTimeout(() => {
      navigation.replace('options');
    }, 3000);

    // Clean up timer when component unmounts
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C8B5DB" />
      <View style={styles.background}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <Circle cx="12" cy="10" r="2.5" fill="#2D1B47" />
              <Path
                d="M7 13c0-.8.7-1.5 1.5-1.5h7c.8 0 1.5.7 1.5 1.5v2H7v-2z"
                fill="#2D1B47"
              />
              <Path
                d="M5 16h14c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1z"
                fill="#2D1B47"
              />
              <Path
                d="M21 12c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z"
                fill="#2D1B47"
              />
              <Path
                d="M22.5 13.5c1 0 2 .5 2 1.5s-1 1.5-2 1.5"
                stroke="#2D1B47"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#C8B5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default SplashScreen;
