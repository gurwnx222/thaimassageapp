import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import auth from '@react-native-firebase/auth';
// Import your existing BottomNav component
import BottomNav from '../component/BottomNav';

// Backend URL
const API_BASE_URL = 'https://luci-server-useast.duckdns.org';

const MessagesScreen = ({ navigation }) => {
  const { currentLanguage, t, formatText, translateDynamic } = useLanguage();
  const insets = useSafeAreaInsets();
  
  // Initialize with empty data - will be fetched from API
  const [currentBooking, setCurrentBooking] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [translatedCurrentBooking, setTranslatedCurrentBooking] = useState(null);
  const [translatedRecentChats, setTranslatedRecentChats] = useState([]);

  // Fetch conversations from API
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const firebaseUID = currentUser.uid;

      // Fetch conversations from backend API
      const response = await fetch(
        `${API_BASE_URL}/api/v1/conversations/${firebaseUID}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Set conversations/chats
        const conversations = data.conversations || data.chats || [];
        setRecentChats(conversations);

        // Set current booking if available
        if (data.currentBooking) {
          setCurrentBooking(data.currentBooking);
        } else {
          // Try to get current booking from the first accepted booking
          const acceptedBooking = conversations.find(
            (chat) => chat.status === 'accepted' || chat.bookingStatus === 'accepted'
          );
          if (acceptedBooking) {
            setCurrentBooking({
              id: acceptedBooking.id || acceptedBooking._id,
              name: acceptedBooking.salonName || acceptedBooking.name,
              time: acceptedBooking.appointmentTime || acceptedBooking.time,
              avatar: acceptedBooking.salonImage || acceptedBooking.avatar,
              conversationId: acceptedBooking.conversationId || acceptedBooking.id,
              receiverId: acceptedBooking.salonOwnerId || acceptedBooking.receiverId,
            });
          } else {
            setCurrentBooking(null);
          }
        }
      } else {
        setRecentChats([]);
        setCurrentBooking(null);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // On error, set empty arrays (user will see empty state)
      setRecentChats([]);
      setCurrentBooking(null);
    } finally {
      setLoading(false);
    }
  };

  // Translate current booking when language changes
  useEffect(() => {
    if (!currentBooking) {
      setTranslatedCurrentBooking(null);
      return;
    }

    const translateBooking = async () => {
      if (currentLanguage === 'th') {
        const translatedName = await translateDynamic(currentBooking.name);
        const translatedTime = await translateTime(currentBooking.time);
        
        setTranslatedCurrentBooking({
          ...currentBooking,
          name: translatedName,
          time: translatedTime,
        });
      } else {
        setTranslatedCurrentBooking(currentBooking);
      }
    };

    translateBooking();
  }, [currentLanguage, currentBooking]);

  // Translate recent chats when language changes
  useEffect(() => {
    const translateChats = async () => {
      if (recentChats.length === 0) {
        setTranslatedRecentChats([]);
        return;
      }

      if (currentLanguage === 'th') {
        const translated = await Promise.all(
          recentChats.map(async (chat) => {
            const translatedName = await translateDynamic(chat.name);
            const translatedMessage = await translateDynamic(chat.message);
            const translatedTime = await translateTime(chat.time);

            return {
              ...chat,
              name: translatedName,
              message: translatedMessage,
              time: translatedTime,
            };
          })
        );
        setTranslatedRecentChats(translated);
      } else {
        setTranslatedRecentChats(recentChats);
      }
    };

    translateChats();
  }, [currentLanguage, recentChats]);

  const translateTime = async (time) => {
    if (currentLanguage === 'th') {
      // Convert time format (e.g., "3:00 PM" to Thai format)
      const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
      const match = time.match(timeRegex);
      
      if (match) {
        const [_, hours, minutes, period] = match;
        const translatedHours = formatText(hours);
        const translatedMinutes = formatText(minutes);
        const translatedPeriod = period.toUpperCase() === 'AM' ? 'น.' : 'น.';
        
        return `${translatedHours}:${translatedMinutes} ${translatedPeriod}`;
      }
    }
    return time;
  };

  const handleChatPress = (chat) => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return;
    }

    // Navigate to chat screen
    navigation.navigate('chat', {
      conversationId: chat.conversationId || null,
      receiverId: chat.receiverId || chat.id,
      receiverName: chat.name,
      currentUserId: currentUser.uid,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDE5DD" />

      {/* Header */}
      <LinearGradient
        colors={['#DEAAB2', '#FFDDE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 16) }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('messages.header')}</Text>
          </View>
        </View>

        {/* Current Booking in Header */}
        {translatedCurrentBooking && (
          <View style={styles.currentBookingInHeader}>
            <Text style={styles.currentBookingLabel}>
              {t('messages.currentBooking')}
            </Text>
            <TouchableOpacity
              style={styles.currentBookingRow}
              onPress={() => handleChatPress(translatedCurrentBooking)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: translatedCurrentBooking.avatar }}
                style={styles.currentBookingAvatar}
              />
              <View style={styles.currentBookingTextContainer}>
                <Text style={styles.currentBookingName}>
                  {translatedCurrentBooking.name}
                </Text>
                <Text style={styles.currentBookingTime}>
                  {t('messages.at')} {translatedCurrentBooking.time}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recent Chats Section */}
        <View style={styles.recentChatsSection}>
          <Text style={styles.sectionTitle}>{t('messages.recentChats')}</Text>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('') || 'Loading...'}</Text>
            </View>
          ) : translatedRecentChats.length > 0 ? (
            translatedRecentChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatItem}
                onPress={() => handleChatPress(chat)}
                activeOpacity={0.7}
              >
                <View style={styles.chatAvatarContainer}>
                  {chat.avatar ? (
                    <Image source={{ uri: chat.avatar }} style={styles.chatAvatar} />
                  ) : (
                    <View style={[styles.chatAvatar, styles.avatarPlaceholder]}>
                      <Icon name="account" size={24} color="#D4A5B3" />
                    </View>
                  )}
                </View>
                <View style={styles.chatContent}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </View>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {chat.message}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="message-outline" size={64} color="#D4A5B3" />
              <Text style={styles.emptyText}>
                {t('') || 'No messages yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {t('') || 'Your conversations will appear here'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav navigation={navigation} active="messages" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE5DD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for bottom nav
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    shadowColor: '#D7B5BA',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 28,
    color: '#6B4C5C',
    fontWeight: '300',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4A2C3A',
    textAlign: 'center',
  },
  currentBookingInHeader: {
    paddingHorizontal: 4,
    marginTop: 8,
  },
  currentBookingLabel: {
    fontSize: 14,
    color: '#6B5B60',
    marginBottom: 8,
    fontWeight: '500',
  },
  currentBookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentBookingAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D4A5B3',
    marginRight: 12,
  },
  currentBookingTextContainer: {
    flex: 1,
  },
  currentBookingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A2C32',
    marginBottom: 2,
  },
  currentBookingTime: {
    fontSize: 13,
    color: '#6B5B60',
  },
  recentChatsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#6B5B60',
    marginBottom: 12,
    fontWeight: '500',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6EF',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chatAvatarContainer: {
    marginRight: 12,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D4A5B3',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A2C32',
  },
  chatTime: {
    fontSize: 12,
    color: '#9B8B8F',
  },
  chatMessage: {
    fontSize: 14,
    color: '#6B5B60',
  },
  avatarPlaceholder: {
    backgroundColor: '#F0E5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B5B60',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9B8B8F',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MessagesScreen;