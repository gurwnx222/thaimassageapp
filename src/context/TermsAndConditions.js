import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  PixelRatio,
  StatusBar,
  SafeAreaView,
} from 'react-native';

const { width:  SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const scaleFont = (size) => {
  const scaledSize = (SCREEN_WIDTH / 375) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

const TermsAndConditions = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms and Conditions</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content - FIXED */}
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            bounces={true}
          >
            {/* Section 1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Zero-Tolerance Policy for Illegal Activities</Text>
              <Text style={styles.paragraph}>Luci. xyz is a wellness and professional massage booking platform.  Any illegal activity—whether committed on, through, or connected to the platform—is strictly prohibited. </Text>
              <Text style={styles.paragraph}>Illegal activities include, but are not limited to: </Text>
              <Text style={styles.bulletPoint}>• Human trafficking or sex trafficking</Text>
              <Text style={styles.bulletPoint}>• Prostitution, solicitation, or any form of commercial sexual activity</Text>
              <Text style={styles.bulletPoint}>• Child exploitation, abuse, or endangerment</Text>
              <Text style={styles.bulletPoint}>• Harassment, stalking, or threats</Text>
              <Text style={styles.bulletPoint}>• Fraud, identity theft, or impersonation</Text>
              <Text style={styles.bulletPoint}>• Money laundering</Text>
              <Text style={styles.bulletPoint}>• Distribution of illegal drugs or controlled substances</Text>
              <Text style={styles.bulletPoint}>• Violations of local or national labor laws</Text>
              <Text style={styles.bulletPoint}>• Any conduct that violates Thai, U.S., or international law</Text>
              <Text style={styles.warningText}>Any user found engaging in or attempting to engage in illegal activities will be permanently banned, reported to relevant authorities, and may face legal consequences. </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. No Adult Services Clause</Text>
              <Text style={styles.paragraph}>Luci.xyz is a professional wellness and massage service platform, not an adult, escort, or sexual-service marketplace. </Text>
              <Text style={styles.paragraph}>The following are strictly prohibited:</Text>
              <Text style={styles.bulletPoint}>• Requests for sexual favors</Text>
              <Text style={styles.bulletPoint}>• Offering sexual services</Text>
              <Text style={styles.bulletPoint}>• Inappropriate touching or sexual misconduct</Text>
              <Text style={styles.bulletPoint}>• Sending sexual messages or photos</Text>
              <Text style={styles.bulletPoint}>• Suggestive or sexual communication with therapists or clients</Text>
              <Text style={styles.bulletPoint}>• Attempting to meet for sexual purposes using the platform</Text>
              <Text style={styles.warningText}>Any violation will result in: </Text>
              <Text style={styles.bulletPoint}>• Immediate and permanent account termination</Text>
              <Text style={styles.bulletPoint}>• Notification to appropriate legal authorities</Text>
            </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Mandatory User Compliance</Text>
              <Text style={styles.paragraph}>By using Luci.xyz, users agree to:</Text>
              <Text style={styles.bulletPoint}>• Act respectfully and professionally toward all therapists, clients, and staff</Text>
              <Text style={styles.bulletPoint}>• Follow all safety guidelines and instructions provided</Text>
              <Text style={styles.bulletPoint}>• Use the platform only for legal wellness and massage-related purposes</Text>
              <Text style={styles.bulletPoint}>• Provide accurate information during registration</Text>
              <Text style={styles.bulletPoint}>• Not create multiple accounts to evade bans or restrictions</Text>
              <Text style={styles.warningText}>Failure to comply may result in:</Text>
              <Text style={styles. bulletPoint}>• Account suspension or termination</Text>
              <Text style={styles.bulletPoint}>• Legal action</Text>
              <Text style={styles.bulletPoint}>• Reporting to law enforcement</Text>
              <Text style={styles.bulletPoint}>• Forfeiture of any refunds or benefits</Text>
            </View>

            {/* Section 4 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Therapist Safety Protection Clause</Text>
              <Text style={styles.paragraph}>Luci.xyz places a high priority on the safety of all therapists and service providers. </Text>
              <Text style={styles.paragraph}>Users are prohibited from:</Text>
              <Text style={styles.bulletPoint}>• Inviting therapists into unsafe environments</Text>
              <Text style={styles.bulletPoint}>• Blocking exits, locking rooms, or restricting movement</Text>
              <Text style={styles.bulletPoint}>• Filming or recording therapists without permission</Text>
              <Text style={styles.bulletPoint}>• Making any physical advances</Text>
              <Text style={styles.bulletPoint}>• Attempting to contact therapists outside the app for inappropriate reasons</Text>
              <Text style={styles.warningText}>Violation will result in permanent account deletion and legal escalation.</Text>
            </View>

            {/* Section 5 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Client Safety Protection Clause</Text>
              <Text style={styles.paragraph}>Therapists and wellness providers on Luci.xyz must: </Text>
              <Text style={styles.bulletPoint}>• Maintain professionalism</Text>
              <Text style={styles.bulletPoint}>• Provide services within their certified skill areas</Text>
              <Text style={styles.bulletPoint}>• Follow Thai wellness and massage regulations</Text>
              <Text style={styles.bulletPoint}>• Avoid inappropriate touching, communication, or requests</Text>
              <Text style={styles.bulletPoint}>• Not contact clients outside the platform without permission</Text>
              <Text style={styles.warningText}>Violations will result in removal from the platform and may trigger legal action.</Text>
            </View>

            {/* Section 6 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Disclaimer of Liability</Text>
              <Text style={styles.paragraph}>Luci.xyz is a platform, not the employer of therapists or service providers. </Text>
              <Text style={styles.paragraph}>We are not responsible for: </Text>
              <Text style={styles.bulletPoint}>• Misconduct by users or service providers</Text>
              <Text style={styles.bulletPoint}>• Injuries or health issues arising from misuse of services</Text>
              <Text style={styles.bulletPoint}>• Loss, theft, or damage of property during appointments</Text>
              <Text style={styles.bulletPoint}>• Any agreements or communications made outside the platform</Text>
              <Text style={styles.bulletPoint}>• Actions taken by individuals who misuse or violate the Terms</Text>
              <Text style={styles.paragraph}>However, Luci.xyz will cooperate fully with law enforcement when required.</Text>
            </View>

            {/* Section 7 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Identity Verification Clause</Text>
              <Text style={styles.paragraph}>To protect user safety: </Text>
              <Text style={styles.bulletPoint}>• Luci.xyz may require identity verification</Text>
              <Text style={styles.bulletPoint}>• Users may be asked to submit ID or additional documents</Text>
              <Text style={styles.bulletPoint}>• Users who fail or refuse verification may be suspended</Text>
              <Text style={styles.paragraph}>This is necessary to prevent fraud, trafficking, and unsafe behavior.</Text>
            </View>

            {/* Section 8 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Reporting & Enforcement</Text>
              <Text style={styles.paragraph}>Users can report misconduct through the in-app safety tools. </Text>
              <Text style={styles.paragraph}>Luci.xyz will:</Text>
              <Text style={styles.bulletPoint}>• Investigate all reports</Text>
              <Text style={styles.bulletPoint}>• Take action at our discretion</Text>
              <Text style={styles.bulletPoint}>• Cooperate with international anti-trafficking organizations</Text>
              <Text style={styles.bulletPoint}>• Remove any user who poses a threat to the community</Text>
              <Text style={styles.paragraph}>We retain the right to restrict services at any time.</Text>
            </View>

            {/* Section 9 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Agreement to These Terms</Text>
              <Text style={styles.paragraph}>By creating an account, accessing the platform, or using any feature of Luci.xyz, users confirm they fully agree to all the above terms.</Text>
              <Text style={styles.finalStatement}>Continued use of the platform signifies full acceptance. </Text>
            </View>

            {/* Bottom spacing */}
            <View style={{ height: moderateScale(20) }} />
          </ScrollView>

          {/* Footer Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex:  1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#EDE2E0',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    height:  SCREEN_HEIGHT * 0.9,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal:  moderateScale(24),
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(16),
    borderBottomWidth:  1,
    borderBottomColor: 'rgba(93, 74, 93, 0.2)',
    backgroundColor: '#EDE2E0',
  },
  modalTitle: {
    fontSize:  scaleFont(20),
    fontWeight: 'bold',
    color: '#2D1B47',
    flex: 1,
  },
  closeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(217, 96, 115, 0.15)',
    justifyContent: 'center',
    alignItems:  'center',
  },
  closeButtonText: {
    fontSize: scaleFont(20),
    color: '#D96073',
    fontWeight: 'bold',
  },
  modalContent: {
    flex:  1,
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(16),
  },
  section: {
    marginBottom: moderateScale(24),
  },
  sectionTitle: {
    fontSize:  scaleFont(16),
    fontWeight: '700',
    color: '#2D1B47',
    marginBottom: moderateScale(10),
    lineHeight: scaleFont(22),
  },
  paragraph: {
    fontSize: scaleFont(14),
    color: '#5D4A5D',
    lineHeight: scaleFont(20),
    marginBottom: moderateScale(8),
    fontWeight: '400',
  },
  bulletPoint: {
    fontSize: scaleFont(13),
    color: '#5D4A5D',
    lineHeight: scaleFont(20),
    marginBottom: moderateScale(5),
    marginLeft: moderateScale(4),
    fontWeight: '400',
  },
  warningText: {
    fontSize: scaleFont(14),
    color: '#D96073',
    fontWeight: '600',
    lineHeight: scaleFont(20),
    marginTop: moderateScale(6),
    marginBottom: moderateScale(6),
  },
  finalStatement: {
    fontSize: scaleFont(14),
    color: '#2D1B47',
    fontWeight: '600',
    lineHeight: scaleFont(20),
    marginTop: moderateScale(6),
    fontStyle: 'italic',
  },
  modalFooter: {
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(20),
    borderTopWidth: 1,
    borderTopColor: 'rgba(93, 74, 93, 0.2)',
    backgroundColor: '#EDE2E0',
  },
  acceptButton: {
    width: '100%',
    height: moderateScale(50),
    backgroundColor: '#D96073',
    borderRadius:  moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#262628',
    shadowOffset: {
      width: 0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
    elevation: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(16),
    fontWeight: '700',
  },
});

export default TermsAndConditions;