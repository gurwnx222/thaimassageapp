import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const Homescreeen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

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
    }
  ];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      nextCard();
    });
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      nextCard();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % studios.length);
    position.setValue({ x: 0, y: 0 });
  };

  const renderBackgroundCards = () => {
    return (
      <View style={styles.backgroundCardsContainer}>
        {/* Third card - furthest back */}
        <View style={[styles.backgroundCard, styles.thirdCard]}>
          <LinearGradient
            colors={['#FFFFFF', '#EDCFC9']}
            locations={[0.5607, 1.0494]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backgroundCardInner}
          />
        </View>
        
        {/* Second card - middle */}
        <View style={[styles.backgroundCard, styles.secondCard]}>
          <LinearGradient
            colors={['#FFFFFF', '#EDCFC9']}
            locations={[0.5607, 1.0494]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backgroundCardInner}
          />
        </View>
        
        {/* First background card - closest to main card */}
        <View style={[styles.backgroundCard, styles.firstCard]}>
          <LinearGradient
            colors={['#FFFFFF', '#EDCFC9']}
            locations={[0.5607, 1.0494]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backgroundCardInner}
          />
        </View>
      </View>
    );
  };

  const renderCard = (studio, index) => {
    if (index < currentIndex) return null;
    
    const isCurrentCard = index === currentIndex;

    if (isCurrentCard) {
      return (
        <Animated.View
          key={studio.id}
          style={[
            styles.cardContainer,
            {
              transform: position.getTranslateTransform(),
            },
          ]}
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={['#FFFFFF', '#EDCFC9']}
            locations={[0.5607, 1.0494]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Studio Image */}
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <View style={styles.placeholderContent}>
                  <Text style={styles.placeholderText}>Studio Image</Text>
                </View>
              </View>
              
              {/* Rating Badge */}
              <View style={styles.ratingBadge}>
                <Icon name="star" size={16} color="#FDB022" />
                <Text style={styles.ratingText}>{studio.rating}</Text>
              </View>
            </View>

            {/* Studio Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.studioName}>{studio.name}</Text>

              {/* Price and Location */}
              <View style={styles.infoRow}>
                <View style={styles.priceContainer}>
                  <Icon name="currency-usd" size={16} color="#C97B84" />
                  <Text style={styles.infoText}>from ${studio.price}</Text>
                </View>
                <View style={styles.locationContainer}>
                  <MaterialIcons name="location-on" size={16} color="#C97B84" />
                  <Text style={styles.infoText}>{studio.location}</Text>
                </View>
              </View>

              {/* Service Tags */}
              <View style={styles.tagsContainer}>
                <View style={styles.tagsRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{studio.services[0]}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{studio.services[1]}</Text>
                  </View>
                </View>
                <View style={styles.tagsRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{studio.services[2]}</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E5D7D3" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userBadge}>
          <Icon name="hand-wave" size={20} color="#D4A59A" />
          <Text style={styles.userName}>Luci</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={22} color="#C97B84" />
        </TouchableOpacity>
      </View>

      {/* Booking Notification */}
      {showNotification && (
        <View style={styles.notification}>
          <Icon name="check" size={18} color="#C97B84" style={styles.checkIcon} />
          <Text style={styles.notificationText}>Booking request sent</Text>
        </View>
      )}

      {/* Cards */}
      <View style={styles.cardsContainer}>
        {/* Background cards - 3 card borders with gradient */}
        {renderBackgroundCards()}
        
        {/* Main card */}
        {studios.map((studio, index) => renderCard(studio, index))}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
          <View style={styles.navButtonActive}>
            <Icon name="home" size={20} color="#C97B84" />
            <Text style={styles.navTextActive}>Home</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={20} color="#C97B84" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
          <Icon name="account-outline" size={22} color="#C97B84" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5D7D3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E4E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D2C2C',
  },
  notificationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F0E4E0',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8C4CC',
    marginHorizontal: 70,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  checkIcon: {
    marginRight: 8,
  },
  notificationText: {
    fontSize: 15,
    color: '#C97B84',
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCardsContainer: {
    position: 'absolute',
    width: 348,
    height: 573,
    alignSelf: 'center',
  },
  backgroundCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundCardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    borderWidth: 1.5,
    borderColor: '#E5D7D3',
  },
  firstCard: {
    transform: [{ translateX: 8 }],
    zIndex: 3,
  },
  secondCard: {
    transform: [{ translateX: 16 }],
    zIndex: 2,
  },
  thirdCard: {
    transform: [{ translateX: 24 }],
    zIndex: 1,
  },
  cardContainer: {
    position: 'absolute',
    width: 348,
    height: 573,
    alignSelf: 'center',
    zIndex: 10,
    shadowColor: '#9E6B62',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  card: {
    flex: 1,
    borderRadius: 56,
    overflow: 'hidden',
  },
  imageContainer: {
    height: '67%',
    backgroundColor: '#E8DDD8',
    borderRadius: 44,
    margin: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D4C4BC',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9B8B8B',
  },
  ratingBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D2C2C',
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 16,
  },
  studioName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3D2C2C',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#C97B84',
    fontWeight: '500',
  },
  tagsContainer: {
    gap: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0E4E0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 12,
    color: '#C97B84',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#3D3D3D',
    marginHorizontal: 60,
    marginBottom: 26,
    paddingVertical: 14,
    borderRadius: 28,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8C4CC',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
  },
  navTextActive: {
    fontSize: 13,
    color: '#C97B84',
    fontWeight: '600',
  },
});

export default Homescreeen;