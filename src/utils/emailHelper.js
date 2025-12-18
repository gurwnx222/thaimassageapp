/**
 * EmailJS Helper for React Native
 * Uses fetch API instead of browser-specific code
 */

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_yuzsyur'; // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = 'template_i5thgga'; // Replace with your Template ID
const EMAILJS_PUBLIC_KEY = '_eO49ubhdCEmL__Bc'; // Replace with your Public Key
/**
 * Send OTP Email using EmailJS REST API
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    console.log('Sending OTP email to:', email);
    
    const templateParams = {
      to_email: email,
      otp: otp,
      app_name: 'Your App Name', // Change this to your app name
    };

    // Use EmailJS REST API endpoint
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:  EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      console.log('Email sent successfully');
      return { 
        success: true, 
        message:  'OTP sent successfully' 
      };
    } else {
      const errorText = await response.text();
      console.error('EmailJS API Error:', errorText);
      
      return { 
        success: false, 
        error: 'Failed to send verification email. Please try again.' 
      };
    }
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Handle network errors
    if (error. message.includes('Network')) {
      return { 
        success: false, 
        error: 'Network error. Please check your internet connection.' 
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to send verification email. Please try again.' 
    };
  }
};

/**
 * Send Welcome Email (Optional - for after verification)
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const templateParams = {
      to_email: email,
      user_name: name,
      app_name: 'Your App Name',
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id:  EMAILJS_SERVICE_ID,
        template_id: 'template_welcome', // Create this template in EmailJS
        user_id:  EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to send welcome email' };
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate EmailJS configuration
 */
export const validateEmailJSConfig = () => {
  if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === 'service_xxxxxxx') {
    console.error('❌ EmailJS Service ID not configured');
    return false;
  }
  
  if (! EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID === 'template_xxxxxxx') {
    console.error('❌ EmailJS Template ID not configured');
    return false;
  }
  
  if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'xxxxxxxxxxxxxxxxx') {
    console.error('❌ EmailJS Public Key not configured');
    return false;
  }
  
  console.log('✅ EmailJS configuration is valid');
  return true;
};