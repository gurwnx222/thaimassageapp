"use client"

import { useState, useRef, useEffect } from "react"
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
  Image,
  ActivityIndicator,
  Alert,
} from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import { useLanguage } from "../context/LanguageContext"
import BottomNav from "../component/BottomNav"
import AppTourGuide from "./AppTourGuide"
import { setupBookingListeners, navigateToChat } from "../utils/bookingSocket"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

// Responsive scaling functions
const scale = (size) => (SCREEN_WIDTH / 375) * size
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor
const scaleFont = (size) => {
  const scaledSize = (SCREEN_WIDTH / 375) * size
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize))
}

// Card dimensions that adapt to screen
const getCardWidth = () => {
  const cardWidth = SCREEN_WIDTH * 0.88
  return Math.min(cardWidth, 400)
}

const getCardHeight = () => {
  const cardWidth = getCardWidth()
  const idealHeight = cardWidth * 1.65
  const maxHeight = SCREEN_HEIGHT * 0.68
  return Math.min(idealHeight, maxHeight)
}

const CARD_WIDTH = getCardWidth()
const CARD_HEIGHT = getCardHeight()
const SWIPE_THRESHOLD = scale(100)
const CARD_RAISE = verticalScale(40)

// IMPORTANT: Update this to your actual backend URL
// ⚠️ WARNING: localhost won't work on physical devices!
// For Android emulator: use "http://10.0.2.2:3000"
// For physical device: use your computer's IP (e.g., "http://192.168.x.x:3000")
// Find your IP: Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
const API_BASE_URL = "http://192.168.18.47:3000"

const Homescreen = ({ navigation }) => {
  const { currentLanguage, t, formatText, translateDynamic } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationType, setNotificationType] = useState("booking")
  const [userName, setUserName] = useState("User")
  const [translatedUserName, setTranslatedUserName] = useState("User")
  const [translatedStudios, setTranslatedStudios] = useState([])
  const [notificationButtonLayout, setNotificationButtonLayout] = useState(null)
  const [cardLayout, setCardLayout] = useState(null)
  const [studios, setStudios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [firebaseUID, setFirebaseUID] = useState(null)
  const [bookingInProgress, setBookingInProgress] = useState(false)

  const position = useRef(new Animated.ValueXY()).current
  const cardOpacity = useRef(new Animated.Value(1)).current
  const notificationButtonRef = useRef(null)
  const cardRef = useRef(null)

  // Refs to store current studios data to avoid closure issues
  const studiosRef = useRef(studios)
  const translatedStudiosRef = useRef(translatedStudios)
  const currentIndexRef = useRef(currentIndex)

  // Update refs when state changes
  useEffect(() => {
    studiosRef.current = studios
  }, [studios])

  useEffect(() => {
    translatedStudiosRef.current = translatedStudios
  }, [translatedStudios])

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Setup booking socket listeners
  useEffect(() => {
    if (!firebaseUID) return

    const socket = setupBookingListeners(firebaseUID, {
      onBookingAccepted: async ({ bookingId, booking, conversationId }) => {
        console.log("✅ Booking accepted:", bookingId, conversationId)
        console.log("📋 Booking data:", booking)
        
        // Extract salon owner ID from booking data
        // The booking object might have salonOwnerId in different places
        const salonOwnerId = booking?.salonOwnerId || 
                            booking?.reciever?.salonOwnerID || 
                            booking?.salonOwnerID || 
                            null;
        
        console.log("👤 Extracted salonOwnerId:", salonOwnerId)
        
        Alert.alert(
          t("home.bookingAccepted") || "Booking Accepted!",
          t("home.bookingAcceptedMessage") || "Your booking request has been accepted. Would you like to open chat?",
          [
            {
              text: t("home.openChat") || "Open Chat",
              onPress: async () => {
                // Navigate to chat
                try {
                  console.log("🚀 Opening chat with:", { conversationId, salonOwnerId })
                  await navigateToChat(
                    navigation,
                    conversationId,
                    salonOwnerId,
                    booking?.salonOwnerName || "Salon Owner"
                  )
                  console.log("✅ Navigation to chat completed")
                } catch (error) {
                  console.error("❌ Error navigating to chat:", error)
                  Alert.alert(
                    t("alerts.error") || "Error",
                    error.message || "Failed to open chat. Please try again later."
                  )
                }
              },
            },
            {
              text: t("home.ok") || "OK",
              style: "cancel",
            },
          ]
        )
      },
      onBookingRejected: ({ bookingId, booking }) => {
        console.log("❌ Booking rejected:", bookingId)
        Alert.alert(
          t("home.bookingRejected") || "Booking Rejected",
          t("home.bookingRejectedMessage") || "Your booking request has been rejected."
        )
      },
      onChatRoomCreated: ({ conversationId, bookingId, salonOwnerId, salonOwnerName }) => {
        console.log("💬 Chat room created:", conversationId)
        // Show notification and offer to open chat
        Alert.alert(
          t("home.chatRoomCreated") || "Chat Room Created",
          t("home.chatRoomCreatedMessage") || "A chat room has been created for your booking. Would you like to open it?",
          [
            {
              text: t("home.openChat") || "Open Chat",
              onPress: async () => {
                try {
                  await navigateToChat(
                    navigation,
                    conversationId,
                    salonOwnerId,
                    salonOwnerName || "Salon Owner"
                  )
                } catch (error) {
                  console.error("Error navigating to chat:", error)
                  Alert.alert(
                    t("alerts.error") || "Error",
                    "Failed to open chat. Please try again later."
                  )
                }
              },
            },
            {
              text: t("home.later") || "Later",
              style: "cancel",
            },
          ]
        )
      },
      onBookingStatusUpdate: ({ bookingId, status, booking }) => {
        console.log("📬 Booking status updated:", bookingId, status)
        // Update local state if needed
      },
    })

    return () => {
      // Cleanup listeners when component unmounts or firebaseUID changes
      if (socket) {
        socket.off("booking_status_update")
        socket.off("chat_room_created")
        socket.off("booking_notification")
      }
    }
  }, [firebaseUID, navigation, t])

  // Define tour steps
  const tourSteps = [
    {
      title: "Welcome! ",
      description: "Let us show you how to find the perfect massage studio.",
      icon: "logo",
      tooltipPosition: {
        top: verticalScale(150),
        left: moderateScale(20),
        right: moderateScale(20),
      },
    },
    {
      title: "Swipe Cards",
      description: "Swipe right to book or swipe left to skip and see the next studio.",
      icon: "gesture-swipe",
      targetPosition: cardLayout,
      showSwipeDemo: true,
      tooltipPosition: {
        top: verticalScale(100),
        left: moderateScale(20),
        right: moderateScale(20),
      },
      arrowDirection: "bottom",
    },
    {
      title: "Notifications",
      description: "Check your booking confirmations here.",
      icon: "bell",
      targetPosition: notificationButtonLayout,
      tooltipPosition: {
        top: notificationButtonLayout ? notificationButtonLayout.top + moderateScale(70) : verticalScale(150),
        left: moderateScale(20),
        right: moderateScale(20),
      },
      arrowDirection: "top",
    },
    {
      title: "Chat",
      description: "Message parlors directly to ask questions.",
      icon: "chat",
      tooltipPosition: {
        bottom: moderateScale(160),
        left: moderateScale(20),
        right: moderateScale(20),
      },
    },
    {
      title: "Profile",
      description: "Access your bookings and account settings.",
      icon: "account",
      tooltipPosition: {
        bottom: moderateScale(160),
        left: moderateScale(20),
        right: moderateScale(20),
      },
    },
  ]

  useEffect(() => {
    initializeScreen()
  }, [])

  // Initialize card animations when currentIndex changes
  useEffect(() => {
    // Reset position for new current card
    position.setValue({ x: 0, y: 0 })

    // Fade in new card smoothly
    cardOpacity.setValue(0)
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [currentIndex])

  const initializeScreen = async () => {
    await fetchUserName()
    await fetchRecommendations()
    setTimeout(() => {
      measureNotificationButton()
      measureCard()
    }, 500)
  }

  // Fetch Firebase UID and user name
  const fetchUserName = async () => {
    try {
      const currentUser = auth().currentUser
      if (currentUser) {
        setFirebaseUID(currentUser.uid)
        const userDoc = await firestore().collection("Useraccount").doc(currentUser.uid).get()

        if (userDoc.exists) {
          const userData = userDoc.data()
          setUserName(userData?.name || "User")
        }
      }
    } catch (error) {
      // Error fetching user name
    }
  }

  // Convert score to rating: supports 0-1 (matchScore) and 0-100 (score)
  const convertScoreToRating = (score) => {
    if (!score && score !== 0) return 0
    // If score looks like 0..1 (float), scale to 0..5
    if (score <= 1) return score * 5
    // If score looks like 0..100
    if (score <= 100) return ((score || 0) / 100) * 5
    return Math.min(((score || 0) / 100) * 5, 5)
  }

  // Format location object to string
  const formatLocation = (location) => {
    if (!location) return "Location unavailable"

    if (typeof location === "string") return location

    // Handle structured location object
    const parts = []
    if (location.streetAddress) parts.push(location.streetAddress)
    if (location.city) parts.push(location.city)
    if (location.province) parts.push(location.province)

    return parts.join(", ") || "Location unavailable"
  }

  // Fetch recommendations from backend (maps API response to UI model)
  const fetchRecommendations = async () => {
    const startTime = Date.now()
    try {
      console.log("🔄 Fetching recommendations...")
      setLoading(true)
      setError(null)

      const currentUser = auth().currentUser
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      const uid = currentUser.uid
      // For now static coords; you can replace with geolocation later
      const latitude = 24.8607
      const longitude = 67.0011

      const url = `${API_BASE_URL}/api/v1/recommendations/${uid}?limit=20&latitude=${latitude}&longitude=${longitude}`
      console.log("🌐 Fetching from:", url)
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const fetchTime = Date.now() - startTime
      console.log(`⏱️ Fetch took ${fetchTime}ms, status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📥 Received recommendations data:", data)

      // The API docs show data.recommendations array where each item can either:
      // - be a flat salon-like object (with _id, salonName, ownerId, etc.)
      // - or an object that includes `salon` nested object (older shape)
      // Handle both shapes robustly:
      if (data.success && (data.recommendations || data.data || data.recommendation)) {
        const items = data.recommendations || data.data || data.recommendation

        if (!Array.isArray(items) || items.length === 0) {
          console.warn("⚠️ No recommendations in response")
          setError("No recommendations available. Try making some bookings first!")
          setStudios([])
          setLoading(false)
          return
        }

        console.log(`✅ Found ${items.length} recommendations`)

        // Log first recommendation to see structure
        if (items.length > 0) {
          console.log("📋 Sample recommendation structure:", JSON.stringify(items[0], null, 2))
        }

        // Filter out recommendations without ownerId (required for booking)
        const validItems = items.filter((rec) => {
          const salon = rec.salon || rec
          const hasOwnerId = rec.ownerId || salon.ownerId || salon.owner?._id || salon.salonOwnerId
          if (!hasOwnerId) {
            console.warn("⚠️ Recommendation missing ownerId:", {
              recKeys: Object.keys(rec),
              salonKeys: salon ? Object.keys(salon) : "no salon",
              recOwnerId: rec.ownerId,
              salonOwnerId: salon?.ownerId,
              salonOwner: salon?.owner
            })
          }
          return !!hasOwnerId
        })
        
        console.log(`✅ Filtered to ${validItems.length} valid recommendations with ownerId`)

        const transformedStudios = validItems.map((rec, index) => {
          // rec may be { salon: {...}, score, reasons } OR may be salon-like directly
          // The recommendations API returns ownerId at both top level and nested in salon
          const salon = rec.salon || rec
          const salonId = salon._id || salon.salonId || salon.id || rec._id || index

          // Extract ownerId - check both top level and nested, handle various formats
          let ownerId = null
          // Try top-level ownerId first (recommendations API provides this)
          const ownerIdSource = rec.ownerId || salon.ownerId || salon.owner?._id

          if (ownerIdSource) {
            if (typeof ownerIdSource === "object") {
              // If it's an object (MongoDB ObjectId), try to get _id or convert to string
              ownerId = ownerIdSource._id || ownerIdSource.toString() || String(ownerIdSource)
            } else {
              // If it's a string or other primitive, convert to string
              ownerId = String(ownerIdSource)
            }
          }

          // priceRange may be string like "$$" or numeric - try to extract digits if present
          let price = 0
          try {
            if (typeof salon.priceRange === "string") {
              const parsed = salon.priceRange.replace(/\D/g, "")
              price = parsed ? parseInt(parsed, 10) : 0
            } else if (typeof salon.priceRange === "number") {
              price = salon.priceRange
            } else if (salon.price) {
              price = Number(salon.price) || 0
            }
          } catch (e) {
            price = 0
          }

          const matchScore = rec.matchScore ?? rec.score ?? rec.match ?? 0 // could be 0..1 or 0..100
          // If matchScore looks like 0..1 keep it; convertScoreToRating handles both
          const rating = convertScoreToRating(matchScore)

          const studioObj = {
            id: salonId,
            name: salon.salonName || salon.salonName || salon.name || "Unknown Studio",
            price: price,
            rating: rating,
            location: formatLocation(salon.location || rec.location),
            services: salon.typesOfMassages || salon.typesOfMassage || salon.types || salon.services || [],
            imageUrl: salon.salonImage || salon.imageUrl || salon.salonImageUrl || null,
            score: matchScore,
            reasons: rec.reasons || [],
            isSubscribed: salon.isSubscribed || false,
            ownerId: ownerId,
          }
          
          if (!ownerId) {
            console.warn(`⚠️ Studio "${studioObj.name}" (${salonId}) has no ownerId!`)
          } else {
            console.log(`✅ Studio "${studioObj.name}" has ownerId: ${ownerId}`)
          }
          
          return studioObj
        })

        setStudios(transformedStudios)
        console.log(`✅ Loaded ${transformedStudios.length} studios`)
        // Reset to first card when new data is loaded
        setCurrentIndex(0)

        if (transformedStudios.length === 0) {
          setError("No recommendations available. Try making some bookings first!")
        }
      } else {
        console.error("❌ Invalid response format:", data)
        throw new Error("Invalid response format")
      }
    } catch (err) {
      console.error("❌ Error fetching recommendations:", err)
      setError(err.message || "Failed to load recommendations")

      // Keep a minimal fallback to allow UI to render in dev, but prefer real data.
      setStudios([
        {
          id: "fallback-1",
          name: "Zen Thai Studio",
          price: 99,
          rating: 4.5,
          location: "Watthana, Bangkok",
          services: ["Aromatherapy", "Oil massage", "Foot massage"],
          imageUrl: null,
          ownerId: null,
        },
      ])
    } finally {
      const totalTime = Date.now() - startTime
      console.log(`⏱️ Total loading time: ${totalTime}ms`)
      setLoading(false)
    }
  }

  // Translate user name
  useEffect(() => {
    const translateName = async () => {
      if (userName && userName !== "User") {
        if (currentLanguage === "th") {
          const translated = await translateDynamic(userName)
          setTranslatedUserName(translated)
        } else {
          setTranslatedUserName(userName)
        }
      } else {
        setTranslatedUserName(userName)
      }
    }
    translateName()
  }, [userName, currentLanguage])

  // Translate studios
  useEffect(() => {
    const translateStudios = async () => {
      if (studios.length === 0) {
        setTranslatedStudios([])
        return
      }

      if (currentLanguage === "th" && studios.length > 0) {
        try {
          const translated = await Promise.all(
            studios.map(async (studio) => {
              if (!studio) return studio
              return {
                ...studio,
                name: await translateDynamic(studio.name || ""),
                location: await translateDynamic(studio.location || ""),
                services: await Promise.all((studio.services || []).map((service) => translateDynamic(service || ""))),
              }
            }),
          )
          // Only set translated studios if we got all of them
          if (translated.length === studios.length) {
            setTranslatedStudios(translated)
          } else {
            // Fallback to original studios if translation incomplete
            setTranslatedStudios(studios)
          }
        } catch (error) {
          // Fallback to original studios on error
          setTranslatedStudios(studios)
        }
      } else {
        setTranslatedStudios(studios)
      }
    }
    translateStudios()
  }, [currentLanguage, studios, translateDynamic])

  const measureNotificationButton = () => {
    if (notificationButtonRef.current) {
      notificationButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setNotificationButtonLayout({
          top: pageY,
          left: pageX,
          width: width,
          height: height,
          borderRadius: moderateScale(12),
        })
      })
    }
  }

  const measureCard = () => {
    if (cardRef.current) {
      cardRef.current.measure((x, y, width, height, pageX, pageY) => {
        setCardLayout({
          top: pageY,
          left: pageX,
          width: width,
          height: height,
          borderRadius: moderateScale(48),
        })
      })
    }
  }

  // Enhanced PanResponder for smooth Tinder-like swiping
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.2 })
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // swipe right -> booking
          swipeRight()
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // swipe left -> skip
          swipeLeft()
        } else {
          resetPosition()
        }
      },
    }),
  ).current

  const swipeRight = async () => {
    const currentIndexValue = currentIndexRef.current

    // Use refs to get latest values
    const currentStudios = studiosRef.current
    const currentTranslatedStudios = translatedStudiosRef.current
    const currentIndexValueRef = currentIndexRef.current

    // Use studios as source of truth to ensure data exists
    const studiosToUse =
      currentTranslatedStudios.length > 0 &&
        currentTranslatedStudios.length === currentStudios.length
        ? currentTranslatedStudios
        : currentStudios

    const currentStudio = studiosToUse[currentIndexValueRef]

    if (!currentStudio) {
      Alert.alert("Error", "No studio data available for booking")
      return
    }

    // Set booking in progress
    setBookingInProgress(true)

    try {
      console.log("📤 Sending booking request for studio:", currentStudio.name || currentStudio.id)
      
      // Send booking request to server BEFORE animating
      const bookingResult = await sendBookingRequest(currentStudio)

      console.log("📥 Booking result:", bookingResult)

      if (bookingResult?.success) {
        // Show success notification
        setNotificationType("booking")
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 2000)
        
        // Animate card out after successful booking
        Animated.parallel([
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: 0 },
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Advance to next card
          nextCard()
          setBookingInProgress(false)
        })
      } else {
        // Show error notification - DON'T advance card
        const errorMessage = bookingResult?.error?.error || 
                            bookingResult?.error?.message || 
                            bookingResult?.error || 
                            "Failed to send booking request. Please try again."
        
        console.error("❌ Booking failed:", errorMessage)
        
        Alert.alert(
          "Booking Failed",
          errorMessage,
          [{ text: "OK" }]
        )
        setBookingInProgress(false)
      }
    } catch (error) {
      console.error("❌ Booking error:", error)
      Alert.alert(
        "Booking Error",
        error.message || "An unexpected error occurred. Please try again.",
        [{ text: "OK" }]
      )
      setBookingInProgress(false)
    }
  }

  const swipeLeft = () => {
    // Animate current card out with opacity
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Advance to next card (this will trigger useEffect to animate new card in)
      nextCard()
    })
  }

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const nextCard = () => {
    // Use refs to get the latest values (avoid closure issues)
    const currentStudios = studiosRef.current
    const currentIndexValue = currentIndexRef.current

    // Always check against studios (source of truth) for length
    if (currentStudios.length === 0) {
      return
    }

    // Check if we've reached the last card
    if (currentIndexValue >= currentStudios.length - 1) {
      // Last card - optionally reload recommendations
      Alert.alert("No more studios", "Would you like to reload recommendations?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reload",
          onPress: () => {
            setCurrentIndex(0)
            fetchRecommendations()
          },
        },
      ])
    } else {
      // Ensure next index is valid
      const nextIndex = currentIndexValue + 1
      if (nextIndex < currentStudios.length) {
        setCurrentIndex(nextIndex)
      }
    }
  }

  const handleTourComplete = () => {
    // Tour completed
  }

  const renderBackgroundCards = () => (
    <View style={[styles.backgroundCardsContainer, { transform: [{ translateY: -CARD_RAISE }] }]}>
      <View style={[styles.backgroundCard, styles.thirdCard]}>
        <LinearGradient colors={["#FFFFFF", "#EDCFC9"]} style={styles.backgroundCardInner} />
      </View>
      <View style={[styles.backgroundCard, styles.secondCard]}>
        <LinearGradient colors={["#FFFFFF", "#EDCFC9"]} style={styles.backgroundCardInner} />
      </View>
      <View style={[styles.backgroundCard, styles.firstCard]}>
        <LinearGradient colors={["#FFFFFF", "#EDCFC9"]} style={styles.backgroundCardInner} />
      </View>
    </View>
  )

  const renderCard = (studio, index) => {
    // Don't render cards that have already been swiped
    if (index < currentIndex) {
      return null
    }

    // Only render the current card
    if (index !== currentIndex) {
      return null
    }

    // Get the actual studio data - use source of truth (studios) if studio param is undefined
    const actualStudio = studio || studios[index] || (translatedStudios.length > 0 && translatedStudios.length === studios.length ? translatedStudios[index] : null)

    // Safety check: ensure studio exists and has required data
    if (!actualStudio) {
      return null
    }

    const combinedTransforms = [...position.getTranslateTransform(), { translateY: -CARD_RAISE }]

    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ["-10deg", "0deg", "10deg"],
      extrapolate: "clamp",
    })

    const likeOpacity = position.x.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: "clamp",
    })

    const nopeOpacity = position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    })

    // Ensure services array has at least 3 items for UI
    const services = actualStudio.services || []
    const displayServices = [services[0] || "Massage", services[1] || "Therapy", services[2] || "Relaxation"]

    return (
      <Animated.View
        key={`${actualStudio.id}-${currentIndex}`}
        ref={index === currentIndex ? cardRef : null}
        style={[
          styles.cardContainer,
          {
            transform: [...combinedTransforms, { rotate }],
            opacity: cardOpacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient colors={["#FFFFFF", "#EDCFC9"]} style={styles.card}>
          {/* Swipe indicators */}
          <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
            <View style={styles.likeBadge}>
              <Icon name="check" size={moderateScale(28)} color="#4CAF50" />
              <Text style={styles.likeText}>LIKE</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.nopeIndicator, { opacity: nopeOpacity }]}>
            <View style={styles.nopeBadge}>

            </View>
          </Animated.View>

          <View style={styles.imageContainer}>
            {actualStudio.imageUrl ? (
              <Image source={{ uri: actualStudio.imageUrl }} style={styles.studioImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.placeholderContent}>

                </View>
              </View>
            )}
            <View style={styles.ratingBadge}>
              <Icon name="star" size={moderateScale(16)} color="#FDB022" />
              <Text style={styles.ratingText}>{formatText((actualStudio.rating || 0).toFixed(1))}</Text>
            </View>
            {actualStudio.isSubscribed && (
              <View style={styles.subscribedBadge}>
                <Icon name="check-decagram" size={moderateScale(16)} color="#FFFFFF" />
                <Text style={styles.subscribedText}>Premium</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.studioName} numberOfLines={1}>
              {actualStudio.name}
            </Text>
            <View style={styles.infoRow}>
              <View style={styles.priceContainer}>
                <Icon name="currency-usd" size={moderateScale(16)} color="#C97B84" />
                <Text style={styles.infoText}>
                  {t("home.from")} ${formatText((actualStudio.price || 0).toString())}
                </Text>
              </View>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={moderateScale(16)} color="#C97B84" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {actualStudio.location}
                </Text>
              </View>
            </View>
            <View style={styles.tagsContainer}>
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {displayServices[0]}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {displayServices[1]}
                  </Text>
                </View>
              </View>
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {displayServices[2]}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }

  // Use translated studios only if they're fully ready and match the studios length
  // This prevents empty cards when translation is in progress
  const studiosToRender =
    translatedStudios.length > 0 &&
      translatedStudios.length === studios.length
      ? translatedStudios
      : studios

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#EDE2E0" />
        <ActivityIndicator size="large" color="#D96073" />

      </View>
    )
  }

  // Error state
  if (error && studios.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#EDE2E0" />
        <Icon name="alert-circle-outline" size={moderateScale(64)} color="#C97B84" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRecommendations}>
          <Text style={styles.retryButtonText}>{t("home.retry") || "Retry"}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDE2E0" />

      <AppTourGuide tourSteps={tourSteps} onComplete={handleTourComplete} />

      <View style={styles.header}>
        <View style={styles.userBadge}>
          <Image source={require("../assets/png.png")} style={styles.userLogo} resizeMode="contain" />
          <Text style={styles.userName} numberOfLines={1}>
            Hi
          </Text>
        </View>
        <TouchableOpacity
          ref={notificationButtonRef}
          style={styles.notificationButton}
          onPress={() => navigation.navigate("notifications")}
        >
          <Icon name="bell-outline" size={moderateScale(22)} color="#D96073" />
        </TouchableOpacity>
      </View>

      {showNotification && notificationType === "booking" && (
        <Animated.View style={styles.notification}>
          <Icon
            name="check-circle"
            size={moderateScale(20)}
            color="#D96073"
            style={styles.notificationIcon}
          />
          <Text style={styles.notificationText}>
            {t("home.bookingRequestSent") || "Booking request sent!"}
          </Text>
        </Animated.View>
      )}

      <View style={styles.cardsContainer}>
        {renderBackgroundCards()}
        {studiosToRender.length > 0 && currentIndex < studiosToRender.length ? (
          studiosToRender.map((s, i) => renderCard(s, i))
        ) : (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>No more cards to display</Text>
          </View>
        )}
      </View>

      {/* Action Buttons
      {studiosToRender.length > 0 && currentIndex < studiosToRender.length && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.skipButton, bookingInProgress && styles.buttonDisabled]}
            onPress={swipeLeft}
            activeOpacity={0.7}
            disabled={bookingInProgress}
          >

       
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.bookButton, bookingInProgress && styles.buttonDisabled]}
            onPress={swipeRight}
            activeOpacity={0.7}
            disabled={bookingInProgress}
          >
            {bookingInProgress ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>

              </>
            )}
          </TouchableOpacity>
        </View>
      )} */}

      <BottomNav navigation={navigation} active="home" bottomOffset={moderateScale(12)} />
    </View>
  )
}

/**
 * Send booking request for a studio.
 * - Uses auth().currentUser for userId.
 * - Tries to use studio.ownerId if available. If not, fetches salon details from /salons/{salonId} (the backend now includes ownerId).
 */
const sendBookingRequest = async (studio) => {
  try {
    console.log("🔍 Starting booking request for studio:", JSON.stringify(studio, null, 2))
    console.log("🔍 Studio ownerId:", studio.ownerId)
    console.log("🔍 Studio keys:", Object.keys(studio))
    
    if (!studio) {
      console.error("❌ No studio provided")
      return { success: false, error: "No studio information provided" }
    }

    const currentUser = auth().currentUser
    if (!currentUser) {
      console.error("❌ No authenticated user")
      return { success: false, error: "You must be logged in to make a booking" }
    }
    const firebaseUID = currentUser.uid
    console.log("👤 User UID:", firebaseUID)

    // Determine salonId from studio
    const salonId = studio.id || studio._id || studio.salonId
    if (!salonId) {
      console.error("❌ No salon ID found in studio:", studio)
      return { success: false, error: "Salon ID is missing. Please try another salon." }
    }
    console.log("🏢 Salon ID:", salonId)

    // Fetch user profile data from Firestore
    let userName = ""
    let userEmail = ""

    try {
      const userDoc = await firestore().collection("Useraccount").doc(firebaseUID).get()

      if (userDoc.exists) {
        const userData = userDoc.data()
        userName = userData?.name || currentUser.displayName || "User"
        userEmail = userData?.email || currentUser.email || ""
      } else {
        // Fallback to auth user data
        userName = currentUser.displayName || "User"
        userEmail = currentUser.email || ""
      }
    } catch (error) {
      // Fallback to auth user data
      userName = currentUser.displayName || "User"
      userEmail = currentUser.email || ""
    }

    if (!userEmail) {
      console.error("❌ No user email found")
      return { success: false, error: "User email is required. Please update your profile." }
    }
    console.log("📧 User email:", userEmail)

    // Determine ownerId: prefer studio.ownerId, else fetch salon details from backend
    let salonOwnerId = studio.ownerId || null
    console.log("🔍 Initial salonOwnerId from studio:", salonOwnerId)

    if (!salonOwnerId) {
      console.log("🔍 Fetching salon owner ID from backend...")
      console.log("🌐 API_BASE_URL:", API_BASE_URL)
      console.log("🌐 Fetching from:", `${API_BASE_URL}/api/v1/salons/${salonId}/with-owner`)
      
      // Try the /with-owner endpoint first as it populates ownerId
      try {
        const salonWithOwnerResponse = await fetch(`${API_BASE_URL}/api/v1/salons/${salonId}/with-owner`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("📥 /with-owner response status:", salonWithOwnerResponse.status)

        if (salonWithOwnerResponse.ok) {
          const salonJson = await salonWithOwnerResponse.json()
          console.log("📥 /with-owner response data:", JSON.stringify(salonJson, null, 2))
          const salon = salonJson.data || salonJson
          console.log("📥 Extracted salon object:", JSON.stringify(salon, null, 2))

          // Extract ownerId - handle various formats (can be object if populated)
          if (salon?.ownerId) {
            if (typeof salon.ownerId === "object") {
              // If it's an object (populated owner), try to get _id or toString()
              salonOwnerId = salon.ownerId._id || salon.ownerId.toString() || String(salon.ownerId)
            } else {
              // If it's a string or other primitive, convert to string
              salonOwnerId = String(salon.ownerId)
            }
            console.log("✅ Found owner ID from /with-owner:", salonOwnerId)
          } else {
            console.warn("⚠️ No ownerId in /with-owner response. Salon keys:", Object.keys(salon))
          }
        } else {
          const errorText = await salonWithOwnerResponse.text().catch(() => "Could not read error")
          console.warn("⚠️ /with-owner endpoint returned:", salonWithOwnerResponse.status, errorText)
        }
      } catch (err) {
        console.error("❌ Error fetching from /with-owner:", err.message)
        console.error("❌ Full error:", err)
      }

      // If still no ownerId, try regular endpoint as fallback
      if (!salonOwnerId) {
        console.log("🔍 Trying regular salon endpoint...")
        try {
          const salonResponse = await fetch(`${API_BASE_URL}/api/v1/salons/${salonId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          console.log("📥 Regular endpoint response status:", salonResponse.status)

          if (salonResponse.ok) {
            const salonJson = await salonResponse.json()
            console.log("📥 Regular endpoint response data:", JSON.stringify(salonJson, null, 2))
            const salon = salonJson.data || salonJson
            console.log("📥 Extracted salon from regular endpoint:", JSON.stringify(salon, null, 2))

            // Extract ownerId - handle various formats
            if (salon?.ownerId) {
              if (typeof salon.ownerId === "object") {
                salonOwnerId = salon.ownerId._id || salon.ownerId.toString() || String(salon.ownerId)
              } else {
                salonOwnerId = String(salon.ownerId)
              }
              console.log("✅ Found owner ID from regular endpoint:", salonOwnerId)
            } else {
              console.warn("⚠️ No ownerId in regular endpoint response. Salon keys:", Object.keys(salon))
              // Try alternative field names
              if (salon.owner) {
                salonOwnerId = salon.owner._id || salon.owner.toString() || String(salon.owner)
                console.log("✅ Found owner ID from salon.owner:", salonOwnerId)
              } else if (salon.salonOwnerId) {
                salonOwnerId = String(salon.salonOwnerId)
                console.log("✅ Found owner ID from salon.salonOwnerId:", salonOwnerId)
              }
            }
          } else {
            const errorText = await salonResponse.text().catch(() => "Could not read error")
            console.warn("⚠️ Regular salon endpoint returned:", salonResponse.status, errorText)
          }
        } catch (err) {
          console.error("❌ Error fetching from regular endpoint:", err.message)
          console.error("❌ Full error:", err)
        }
      }
    } else {
      // Convert ownerId to string if it's not already
      salonOwnerId = typeof salonOwnerId === "object"
        ? (salonOwnerId._id || salonOwnerId.toString() || String(salonOwnerId))
        : String(salonOwnerId)
      console.log("✅ Using owner ID from studio:", salonOwnerId)
    }

    if (!salonOwnerId) {
      console.error("❌ Could not find salonOwnerId after all attempts")
      console.error("❌ Studio object:", JSON.stringify(studio, null, 2))
      console.error("❌ Salon ID used:", salonId)
      console.error("❌ API_BASE_URL:", API_BASE_URL)
      
      // Check if using localhost (won't work on physical devices)
      if (API_BASE_URL.includes("localhost")) {
        return {
          success: false,
          error: {
            error: "Network Error: localhost won't work on physical devices",
            message: "Please update API_BASE_URL to use your computer's IP address (e.g., http://192.168.x.x:3000). Check console for details."
          }
        }
      }
      
      return {
        success: false,
        error: {
          error: "Salon owner information is missing. This salon may not be properly configured.",
          message: "Unable to send booking request. Please try another salon or contact support. Check console for details."
        }
      }
    }

    // Prepare booking data according to backend API requirements
    // Default to 1 hour from now for requestedDateTime
    const requestedDateTime = new Date()
    requestedDateTime.setHours(requestedDateTime.getHours() + 1)

    const bookingData = {
      salonId: salonId,
      salonOwnerId: salonOwnerId, // Note: backend expects salonOwnerId, not ownerId
      firebaseUID: firebaseUID, // Note: backend expects firebaseUID, not userId
      name: userName,
      email: userEmail,
      requestedDateTime: requestedDateTime.toISOString(),
      durationMinutes: 60, // Default 60 minutes
      // Optional fields
      age: 0, // Can be updated later if user provides this info
      weightKg: 0, // Can be updated later if user provides this info
    }

    console.log("📤 Sending booking data:", bookingData)
    console.log("🌐 API URL:", `${API_BASE_URL}/api/v1/bookings/create-booking`)

    const bookingResponse = await fetch(`${API_BASE_URL}/api/v1/bookings/create-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })

    console.log("📥 Booking response status:", bookingResponse.status)

    if (bookingResponse.ok) {
      const result = await bookingResponse.json()
      console.log("✅ Booking successful:", result)
      return { success: true, data: result }
    } else {
      let errorText = null
      let errorJson = null
      try {
        errorText = await bookingResponse.text()
        console.error("❌ Booking error response:", errorText)
        try {
          errorJson = JSON.parse(errorText)
        } catch {
          // If parsing fails, errorJson stays null and we use errorText
        }
      } catch (err) {
        console.error("❌ Error reading response:", err)
      }

      return { 
        success: false, 
        error: errorJson || errorText || `Server error: ${bookingResponse.status}` 
      }
    }
  } catch (error) {
    console.error("❌ Booking request exception:", error)
    return { 
      success: false, 
      error: error.message || "Network error. Please check your connection and try again." 
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE2E0",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(20),
  },
  loadingText: {
    marginTop: moderateScale(16),
    fontSize: scaleFont(16),
    color: "#3D2C2C",
    fontWeight: "600",
  },
  errorText: {
    marginTop: verticalScale(16),
    marginBottom: moderateScale(24),
    fontSize: scaleFont(16),
    color: "#C97B84",
    textAlign: "center",
    paddingHorizontal: moderateScale(32),
  },
  retryButton: {
    backgroundColor: "#D96073",
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(24),
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFont(16),
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingTop: verticalScale(50),
    paddingBottom: moderateScale(16),
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDCFC9",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(10),
    maxWidth: SCREEN_WIDTH * 0.6,
    gap: moderateScale(8),
  },
  userLogo: {
    width: moderateScale(28),
    height: moderateScale(28),
  },
  userName: {
    fontSize: scaleFont(15),
    fontWeight: "600",
    color: "#3D2C2C",
    flexShrink: 1,
  },
  notificationButton: {
    width: moderateScale(46),
    height: moderateScale(46),
    backgroundColor: "#EDCFC9",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8BEC3",
    marginHorizontal: moderateScale(40),
    marginTop: moderateScale(8),
    marginBottom: moderateScale(8),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(20),
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationIcon: {
    marginRight: moderateScale(10),
  },
  notificationText: {
    fontSize: scaleFont(14),
    color: "#D96073",
    fontWeight: "600",
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: verticalScale(20),
  },
  backgroundCardsContainer: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: "center",
  },
  backgroundCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  backgroundCardInner: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(48),
    borderWidth: 1.5,
    borderColor: "#E5D7D3",
  },
  firstCard: {
    transform: [{ translateX: moderateScale(6) }],
    zIndex: 3,
  },
  secondCard: {
    transform: [{ translateX: moderateScale(12) }],
    zIndex: 2,
  },
  thirdCard: {
    transform: [{ translateX: moderateScale(18) }],
    zIndex: 1,
  },
  cardContainer: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: "center",
    zIndex: 10,
    shadowColor: "#9E6B62",
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.5,
    shadowRadius: moderateScale(12),
    elevation: 12,
  },
  card: {
    flex: 1,
    borderRadius: moderateScale(48),
    overflow: "hidden",
  },
  likeIndicator: {
    position: "absolute",
    top: moderateScale(40),
    right: moderateScale(30),
    zIndex: 100,
    transform: [{ rotate: "15deg" }],
  },
  nopeIndicator: {
    position: "absolute",
    top: moderateScale(40),
    left: moderateScale(30),
    zIndex: 100,
    transform: [{ rotate: "-15deg" }],
  },
  likeBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nopeBadge: {


    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  likeText: {
    fontSize: scaleFont(12),
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: moderateScale(2),
  },
  nopeText: {
    fontSize: scaleFont(12),
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: moderateScale(2),
  },
  imageContainer: {
    height: "67%",
    backgroundColor: "#E8DDD8",
    borderRadius: moderateScale(38),
    margin: moderateScale(10),
    overflow: "hidden",
    position: "relative",
  },
  studioImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#D4C4BC",
  },
  placeholderContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: scaleFont(15),
    color: "#9B8B8B",
    marginTop: moderateScale(8),
  },
  ratingBadge: {
    position: "absolute",
    top: moderateScale(12),
    right: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(50),
    gap: moderateScale(4),
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  ratingText: {
    fontSize: scaleFont(12),
    fontWeight: "700",
    color: "#3D2C2C",
  },
  subscribedBadge: {
    position: "absolute",
    top: moderateScale(12),
    left: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D96073",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(50),
    gap: moderateScale(4),
  },
  subscribedText: {
    fontSize: scaleFont(11),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(4),
    paddingBottom: moderateScale(12),
  },
  studioName: {
    fontSize: scaleFont(19),
    fontWeight: "700",
    color: "#3D2C2C",
    marginBottom: moderateScale(10),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(10),
    gap: moderateScale(16),
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: moderateScale(4),
  },
  infoText: {
    fontSize: scaleFont(12),
    color: "#C97B84",
    fontWeight: "500",
    flexShrink: 1,
  },
  tagsContainer: {
    gap: moderateScale(6),
  },
  tagsRow: {
    flexDirection: "row",
    gap: moderateScale(6),
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#F6C5BB80",
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(12),
  },
  tagText: {
    fontSize: scaleFont(11),
    color: "#C97B84",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(100),
    paddingTop: moderateScale(20),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(30),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: moderateScale(140),
    gap: moderateScale(8),
  },
  skipButton: {
    backgroundColor: "#F69DAB",
  },
  bookButton: {
    backgroundColor: "#D96073",
  },
  skipButtonText: {
    fontSize: scaleFont(16),
    color: "#FFFFFF",
    fontWeight: "700",
  },
  bookButtonText: {
    fontSize: scaleFont(16),
    color: "#FFFFFF",
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})

export default Homescreen