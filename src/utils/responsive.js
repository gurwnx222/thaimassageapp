import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference - iPhone 11 Pro/X)
const baseWidth = 375;
const baseHeight = 812;

/**
 * Scales a value relative to screen width
 */
export const scaleWidth = (size) => {
  return (SCREEN_WIDTH / baseWidth) * size;
};

/**
 * Scales a value relative to screen height
 */
export const scaleHeight = (size) => {
  return (SCREEN_HEIGHT / baseHeight) * size;
};

/**
 * Scales font size with pixel ratio consideration
 */
export const scaleFont = (size) => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scale - less aggressive scaling
 * Good for padding, margins, and UI elements
 */
export const moderateScale = (size, factor = 0.5) => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Get responsive card dimensions
 */
export const getCardDimensions = () => {
  const cardWidth = SCREEN_WIDTH * 0.9; // 90% of screen width
  const maxCardWidth = 400; // Max width for tablets
  const finalWidth = Math.min(cardWidth, maxCardWidth);
  
  // Maintain aspect ratio ~1.65
  const cardHeight = finalWidth * 1.65;
  const maxCardHeight = SCREEN_HEIGHT * 0.7; // Max 70% of screen height
  
  return {
    width: finalWidth,
    height: Math.min(cardHeight, maxCardHeight),
  };
};

/**
 * Check if device is tablet
 */
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  return (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) ||
         (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920));
};

/**
 * Check if device is small (iPhone SE, small Android)
 */
export const isSmallDevice = () => {
  return SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 667;
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };