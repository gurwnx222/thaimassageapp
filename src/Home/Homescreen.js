import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  StatusBar,
  PixelRatio,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import BottomNav from '../component/BottomNav';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const scaleFont = (size) => {
  const scaledSize = (SCREEN_WIDTH / 375) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

// Card dimensions that adapt to screen
const getCardWidth = () => {
  const cardWidth = SCREEN_WIDTH * 0.88; // 88% of screen
  return Math.min(cardWidth, 400); // Max 400px on tablets
};

const getCardHeight = () => {
  const cardWidth = getCardWidth();
  const idealHeight = cardWidth * 1.65; // Maintain aspect ratio
  const maxHeight = SCREEN_HEIGHT * 0.68; // Max 68% of screen height
  return Math.min(idealHeight, maxHeight);
};

const CARD_WIDTH = getCardWidth();
const CARD_HEIGHT = getCardHeight();
const SWIPE_THRESHOLD = scale(100);
const CARD_RAISE = verticalScale(40);

const Homescreen = ({ navigation }) => {
  const { currentLanguage, t, formatText, translateDynamic } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [userName, setUserName] = useState('User');
  const [translatedUserName, setTranslatedUserName] = useState('User');
  const [translatedStudios, setTranslatedStudios] = useState([]);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    fetchUserName();
  }, []);

  useEffect(() => {
    const translateName = async () => {
      if (userName && userName !== 'User') {
        if (currentLanguage === 'th') {
          const translated = await translateDynamic(userName);
          setTranslatedUserName(translated);
        } else {
          setTranslatedUserName(userName);
        }
      } else {
        setTranslatedUserName(userName);
      }
    };
    translateName();
  }, [userName, currentLanguage]);

  const studios = [
    { 
      id: 1, 
      name: 'Zen Thai Studio', 
      price: 99, 
      rating: 4.5, 
      location: 'Watthana, Bangkok', 
      services: ['Aromatherapy', 'Oil massage', 'Foot massage'] 
    },
    { 
      id: 2, 
      name: 'Serenity Spa', 
      price: 120, 
      rating: 4.8, 
      location: 'Sukhumvit, Bangkok', 
      services: ['Thai massage', 'Deep tissue', 'Hot stone'] 
    },
    { 
      id: 3, 
      name: 'Harmony Wellness', 
      price: 85, 
      rating: 4.3, 
      location: 'Silom, Bangkok', 
      services: ['Swedish massage', 'Reflexology', 'Sports massage'] 
    },
  ];

  useEffect(() => {
    const translateStudios = async () => {
      if (currentLanguage === 'th') {
        const translated = await Promise.all(
          studios.map(async (studio) => ({
            ...studio,
            name: await translateDynamic(studio.name),
            location: await translateDynamic(studio.location),
            services: await Promise.all(
              studio.services.map(service => translateDynamic(service))
            ),
          }))
        );
        setTranslatedStudios(translated);
      } else {
        setTranslatedStudios(studios);
      }
    };
    translateStudios();
  }, [currentLanguage]);

  const fetchUserName = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore()
          .collection('Useraccount')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserName(userData?.name || 'User');
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) swipeRight();
        else if (gesture.dx < -SWIPE_THRESHOLD) swipeLeft();
        else resetPosition();
      },
    })
  ).current;

  const swipeRight = () => {
    Animated.timing(position, { 
      toValue: { x: SCREEN_WIDTH + 100, y: 0 }, 
      duration: 250, 
      useNativeDriver: false 
    }).start(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
      nextCard();
    });
  };
  
  const swipeLeft = () => {
    Animated.timing(position, { 
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 }, 
      duration: 250, 
      useNativeDriver: false 
    }).start(() => nextCard());
  };
  
  const resetPosition = () => {
    Animated.spring(position, { 
      toValue: { x: 0, y: 0 }, 
      useNativeDriver: false 
    }).start();
  };
  
  const nextCard = () => { 
    const studiosToUse = translatedStudios.length > 0 ? translatedStudios : studios;
    setCurrentIndex((p) => (p + 1) % studiosToUse.length); 
    position.setValue({ x: 0, y: 0 }); 
  };

  const renderBackgroundCards = () => (
    <View style={[styles.backgroundCardsContainer, { transform: [{ translateY: -CARD_RAISE }] }]}>
      <View style={[styles.backgroundCard, styles.thirdCard]}>
        <LinearGradient colors={['#FFFFFF', '#EDCFC9']} style={styles.backgroundCardInner} />
      </View>
      <View style={[styles.backgroundCard, styles.secondCard]}>
        <LinearGradient colors={['#FFFFFF', '#EDCFC9']} style={styles.backgroundCardInner} />
      </View>
      <View style={[styles.backgroundCard, styles.firstCard]}>
        <LinearGradient colors={['#FFFFFF', '#EDCFC9']} style={styles.backgroundCardInner} />
      </View>
    </View>
  );

  const renderCard = (studio, index) => {
    if (index < currentIndex) return null;
    if (index !== currentIndex) return null;

    const combinedTransforms = [
      ...position.getTranslateTransform(),
      { translateY: -CARD_RAISE },
    ];

    return (
      <Animated.View
        key={studio.id}
        style={[styles.cardContainer, { transform: combinedTransforms }]}
        {...panResponder.panHandlers}
      >
        <LinearGradient colors={['#FFFFFF', '#EDCFC9']} style={styles.card}>
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <View style={styles.placeholderContent}>
                <Text style={styles.placeholderText}>{t('home.studioImage')}</Text>
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={moderateScale(16)} color="#FDB022" />
              <Text style={styles.ratingText}>{formatText(studio.rating.toString())}</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.studioName} numberOfLines={1}>{studio.name}</Text>
            <View style={styles.infoRow}>
              <View style={styles.priceContainer}>
                <Icon name="currency-usd" size={moderateScale(16)} color="#C97B84" />
                <Text style={styles.infoText}>
                  {t('home.from')} ${formatText(studio.price.toString())}
                </Text>
              </View>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={moderateScale(16)} color="#C97B84" />
                <Text style={styles.infoText} numberOfLines={1}>{studio.location}</Text>
              </View>
            </View>
            <View style={styles.tagsContainer}>
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>{studio.services[0]}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>{studio.services[1]}</Text>
                </View>
              </View>
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>{studio.services[2]}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const studiosToRender = translatedStudios.length > 0 ? translatedStudios : studios;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDE2E0" />
      <View style={styles.header}>
        <View style={styles.userBadge}>
          <Text style={styles.userName} numberOfLines={1}>
            {t('home.greeting')} {translatedUserName}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('notifications')}
        >
          <Icon name="bell-outline" size={moderateScale(22)} color="#D96073" />
        </TouchableOpacity>
      </View>

      {showNotification && (
        <View style={styles.notification}>
          <Icon name="check" size={moderateScale(18)} color="#D96073" style={styles.checkIcon} />
          <Text style={styles.notificationText}>{t('home.bookingRequestSent')}</Text>
        </View>
      )}

      <View style={styles.cardsContainer}>
        {renderBackgroundCards()}
        {studiosToRender.map((s, i) => renderCard(s, i))}
      </View>

      <BottomNav navigation={navigation} active="home" bottomOffset={moderateScale(12)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#EDE2E0' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: moderateScale(20), 
    paddingTop: verticalScale(50), 
    paddingBottom: moderateScale(16) 
  },
  userBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EDCFC9', 
    paddingHorizontal: moderateScale(16), 
    paddingVertical: moderateScale(10), 
    borderRadius: moderateScale(10),
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  userName: { 
    fontSize: scaleFont(15), 
    fontWeight: '600', 
    color: '#3D2C2C' 
  },
  notificationButton: { 
    width: moderateScale(46), 
    height: moderateScale(46), 
    backgroundColor: '#EDCFC9', 
    borderRadius: moderateScale(12), 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  notification: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E8C4CC', 
    marginHorizontal: moderateScale(40), 
    marginTop: moderateScale(8), 
    marginBottom: moderateScale(8), 
    paddingVertical: moderateScale(10), 
    paddingHorizontal: moderateScale(20), 
    borderRadius: moderateScale(20), 
    alignSelf: 'center' 
  },
  checkIcon: { 
    marginRight: moderateScale(8) 
  },
  notificationText: { 
    fontSize: scaleFont(14), 
    color: '#D96073', 
    fontWeight: '700' 
  },

  cardsContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingBottom: verticalScale(80),
  },

  backgroundCardsContainer: { 
    position: 'absolute', 
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center' 
  },
  backgroundCard: { 
    position: 'absolute', 
    width: '100%', 
    height: '100%' 
  },
  backgroundCardInner: { 
    width: '100%', 
    height: '100%', 
    borderRadius: moderateScale(48), 
    borderWidth: 1.5, 
    borderColor: '#E5D7D3' 
  },
  firstCard: { 
    transform: [{ translateX: moderateScale(6) }], 
    zIndex: 3 
  },
  secondCard: { 
    transform: [{ translateX: moderateScale(12) }], 
    zIndex: 2 
  },
  thirdCard: { 
    transform: [{ translateX: moderateScale(18) }], 
    zIndex: 1 
  },

  cardContainer: { 
    position: 'absolute', 
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center', 
    zIndex: 10, 
    shadowColor: '#9E6B62', 
    shadowOffset: { width: 0, height: moderateScale(4) }, 
    shadowOpacity: 0.5, 
    shadowRadius: moderateScale(12), 
    elevation: 12 
  },
  card: { 
    flex: 1, 
    borderRadius: moderateScale(48), 
    overflow: 'hidden' 
  },
  imageContainer: { 
    height: '67%', 
    backgroundColor: '#E8DDD8', 
    borderRadius: moderateScale(38), 
    margin: moderateScale(10), 
    overflow: 'hidden', 
    position: 'relative' 
  },
  imagePlaceholder: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: '#D4C4BC' 
  },
  placeholderContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderText: { 
    fontSize: scaleFont(15), 
    color: '#9B8B8B' 
  },
  ratingBadge: { 
    position: 'absolute', 
    top: moderateScale(12), 
    right: moderateScale(12), 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'transparent', 
    paddingHorizontal: moderateScale(10), 
    paddingVertical: moderateScale(5), 
    borderRadius: moderateScale(50), 
    gap: moderateScale(4), 
    borderWidth: 1, 
    borderColor: '#FFFFFF' 
  },
  ratingText: { 
    fontSize: scaleFont(12), 
    fontWeight: '700', 
    color: '#3D2C2C' 
  },

  detailsContainer: { 
    flex: 1, 
    paddingHorizontal: moderateScale(20), 
    paddingTop: moderateScale(4), 
    paddingBottom: moderateScale(12) 
  },
  studioName: { 
    fontSize: scaleFont(19), 
    fontWeight: '700', 
    color: '#3D2C2C', 
    marginBottom: moderateScale(10) 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: moderateScale(10), 
    gap: moderateScale(16) 
  },
  priceContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: moderateScale(4) 
  },
  locationContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    gap: moderateScale(4) 
  },
  infoText: { 
    fontSize: scaleFont(12), 
    color: '#C97B84', 
    fontWeight: '500',
    flexShrink: 1,
  },
  tagsContainer: { 
    gap: moderateScale(6) 
  },
  tagsRow: { 
    flexDirection: 'row', 
    gap: moderateScale(6), 
    flexWrap: 'wrap' 
  },
  tag: { 
    backgroundColor: '#F0E4E0', 
    paddingHorizontal: moderateScale(12), 
    paddingVertical: moderateScale(6), 
    borderRadius: moderateScale(12) 
  },
  tagText: { 
    fontSize: scaleFont(11), 
    color: '#C97B84', 
    fontWeight: '500' 
  },
});

export default Homescreen;