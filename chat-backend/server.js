const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin (optional - for Firestore access)
// Download serviceAccountKey.json from Firebase Console
// Project Settings → Service Accounts → Generate New Private Key
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.log('⚠️ Firebase Admin not initialized:', error. message);
}

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use:  'gmail', 'outlook', 'yahoo', etc.
  auth: {
    user: process.env. EMAIL_USER,     // Your email
    pass: process.env.EMAIL_PASSWORD, // Your app password
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send emails');
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OTP Email Service is running',
    timestamp: new Date().toISOString()
  });
});

// Send OTP Email endpoint
app.post('/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res. status(400).json({ 
        success: false, 
        error: 'Email and OTP are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex. test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    console.log(`📧 Sending OTP to: ${email}`);

    // Email HTML template
    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - Your OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding:  0;
            }
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background:  linear-gradient(135deg, #D96073 0%, #C54D61 100%);
              padding: 40px 30px;
              text-align:  center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              font-weight:  700;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #2D1B47;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .message {
              color: #7A6B7A;
              line-height: 1.8;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .otp-box {
              background:  linear-gradient(135deg, #EDE2E0 0%, #EDCFC9 100%);
              padding: 30px;
              text-align: center;
              border-radius: 12px;
              margin: 30px 0;
              border: 2px dashed #D96073;
            }
            .otp-label {
              font-size: 14px;
              color: #7A6B7A;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .otp-code {
              font-size: 42px;
              font-weight:  bold;
              color: #D96073;
              letter-spacing: 12px;
              font-family: 'Courier New', monospace;
              margin:  10px 0;
            }
            .validity {
              background-color: #FFF3E0;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #FF9800;
              margin: 20px 0;
            }
            .validity-text {
              color: #E65100;
              font-size:  14px;
              margin:  0;
              font-weight: 600;
            }
            .warning {
              background-color: #FFF3F3;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #D96073;
              margin: 20px 0;
            }
            .warning-text {
              color: #7A6B7A;
              font-size: 14px;
              margin: 0;
            }
            .footer {
              background-color: #F8F8F8;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #EEEEEE;
            }
            .footer-text {
              color: #8B7B8B;
              font-size:  13px;
              line-height: 1.6;
              margin:  5px 0;
            }
            .app-name {
              color: #D96073;
              font-weight: 700;
            }
            @media only screen and (max-width: 600px) {
              .email-container {
                margin: 20px 10px;
              }
              . content {
                padding: 30px 20px;
              }
              .otp-code {
                font-size: 36px;
                letter-spacing: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🔐 Email Verification</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hello! </p>
              
              <p class="message">
                Thank you for signing up with <span class="app-name">Your App Name</span>! 
                To complete your registration, please verify your email address using the code below: 
              </p>
              
              <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="validity">
                <p class="validity-text">⏰ This code will expire in 10 minutes</p>
              </div>
              
              <div class="warning">
                <p class="warning-text">
                  🔒 If you didn't request this code, please ignore this email. 
                  Your account security is important to us.
                </p>
              </div>
              
              <p class="message">
                Need help? Feel free to contact our support team. 
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">This is an automated email. Please do not reply.</p>
              <p class="footer-text">&copy; ${new Date().getFullYear()} <span class="app-name">Your App Name</span>. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text version (fallback)
      text: `
        Email Verification
        
        Hello!
        
        Thank you for signing up with Your App Name! 
        
        Your verification code is: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        © ${new Date().getFullYear()} Your App Name. All rights reserved.
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', info.messageId);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Handle specific errors
    let errorMessage = 'Failed to send email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed.  Check credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. ';
    } else if (error.responseCode === 550) {
      errorMessage = 'Invalid recipient email address.';
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message :  undefined,
    });
  }
});

// Verify OTP endpoint (optional - if you want backend verification)
app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and OTP are required' 
      });
    }

    // If using Firebase Admin
    if (admin.apps.length > 0) {
      const db = admin.firestore();
      const otpDoc = await db.collection('OTPVerification').doc(email).get();

      if (!otpDoc.exists) {
        return res.status(404).json({ 
          success: false, 
          error: 'OTP not found' 
        });
      }

      const otpData = otpDoc. data();
      const currentTime = new Date();
      const expirationTime = otpData.expiresAt. toDate();

      // Check expiration
      if (currentTime > expirationTime) {
        await db.collection('OTPVerification').doc(email).delete();
        return res.status(400).json({ 
          success: false, 
          error: 'OTP has expired' 
        });
      }

      // Check if already verified
      if (otpData.verified) {
        return res.status(400).json({ 
          success: false, 
          error: 'OTP already used' 
        });
      }

      // Verify OTP
      if (otpData.otp === otp) {
        await db.collection('OTPVerification').doc(email).update({
          verified: true,
          verifiedAt: admin.firestore. FieldValue.serverTimestamp(),
        });

        return res. status(200).json({ 
          success: true, 
          message: 'OTP verified successfully' 
        });
      } else {
        // Increment attempts
        await db.collection('OTPVerification').doc(email).update({
          attempts: admin.firestore.FieldValue. increment(1),
        });

        return res.status(400).json({ 
          success: false, 
          error: 'Invalid OTP' 
        });
      }
    } else {
      return res.status(501).json({ 
        success: false, 
        error: 'Verification not implemented' 
      });
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Verification failed' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OTP Email Service running on port ${PORT}`);
  console.log(`📧 Email user: ${process.env.EMAIL_USER}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});