import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ICON_SIZE = 96;
const BG_SIZE = 112;

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('options');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E6D9FB" />
      <LinearGradient
        colors={['#E6D9FB', '#F1DCE7']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconBackground}>
            <Image
              source={require('../assets/png.png')}
              style={styles.icon}
              resizeMode="contain"
              accessible
              accessibilityLabel="App icon"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: BG_SIZE,
    height: BG_SIZE,
    borderRadius: 20,
    backgroundColor: '#CDB7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.6,
    borderColor: 'rgba(0,0,0,0.05)',
    // iOS shadow properties
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    // Android shadow property
    elevation: 12,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});

export default SplashScreen;