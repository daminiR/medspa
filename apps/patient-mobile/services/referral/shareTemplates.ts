import { ShareMethod } from '@medical-spa/types';

/**
 * Share Templates Service
 * Generates pre-filled messages for different sharing methods
 */

export interface ShareTemplateOptions {
  referralCode: string;
  referrerName?: string;
  shareUrl: string;
  referrerReward?: number;
  refereeReward?: number;
}

/**
 * Get share message for specific method
 */
export function getShareMessage(method: ShareMethod, options: ShareTemplateOptions): string {
  const { referralCode, referrerName, shareUrl, referrerReward = 50, refereeReward = 50 } = options;

  const messages: Record<ShareMethod, string> = {
    SMS: `Hi! I've been getting amazing treatments at Luxe MedSpa and I think you'd love it too!

Use my referral code ${referralCode} to get $${refereeReward} off your first service (and I'll get a credit too!).

Book here: ${shareUrl}

Trust me, you won't regret it! 💜`,

    EMAIL: `Hi there!

I wanted to share something special with you. I've been going to Luxe MedSpa and the results have been incredible!

Here's what makes them amazing:
✨ Professional staff and medical experts
💆 Wide range of treatments (Botox, fillers, facials, and more)
🌟 Beautiful, relaxing environment
📸 Real, visible results

I have a referral code that'll get you $${refereeReward} off your first service: ${referralCode}

When you book using my code, I'll also earn a credit - so it's a win-win! They require a minimum $100 purchase, but trust me, you'll want to book more than that anyway.

Ready to glow? Book your appointment here: ${shareUrl}

Let me know when you book - I'd love to hear about your experience!

${referrerName || 'Your friend'}`,

    WHATSAPP: `Hey! 👋

Just had an amazing treatment at Luxe MedSpa and thought of you!

Use my code ${referralCode} for $${refereeReward} off your first visit 💝

${shareUrl}

You're going to love it! ✨`,

    INSTAGRAM: `Glowing thanks to @LuxeMedSpa ✨

Get $${refereeReward} off your first treatment with my code: ${referralCode}

Link in bio 💜

#MedSpa #SelfCare #GlowUp #LuxeLife #BeautyTreatment #SkinCare`,

    FACEBOOK: `I just had the most amazing experience at Luxe MedSpa! 🌟

If you've been thinking about trying any beauty treatments, now's the perfect time. Use my referral code ${referralCode} to get $${refereeReward} off your first service!

Whether it's Botox, fillers, facials, or any of their incredible treatments - you won't be disappointed. The staff is professional, the facility is beautiful, and the results speak for themselves.

Book your appointment: ${shareUrl}

Who's ready to treat themselves? 💆✨`,

    TWITTER: `Just discovered @LuxeMedSpa and I'm obsessed! 💜

Get $${refereeReward} off your first treatment with code: ${referralCode}

Professional staff, amazing results, and the best self-care experience.

${shareUrl}

#MedSpa #SelfCare #BeautyTreatment`,

    COPY: `Use my Luxe MedSpa referral code ${referralCode} for $${refereeReward} off! ${shareUrl}`,

    QR_CODE: `Scan this QR code to get $${refereeReward} off your first service at Luxe MedSpa! Use code: ${referralCode}`,
  };

  return messages[method];
}

/**
 * Get email subject line
 */
export function getEmailSubject(options: ShareTemplateOptions): string {
  const { refereeReward = 50 } = options;
  return `Get $${refereeReward} off at Luxe MedSpa!`;
}

/**
 * Get share title for social media
 */
export function getShareTitle(options: ShareTemplateOptions): string {
  return 'Join me at Luxe MedSpa!';
}

/**
 * Generate Instagram Story text overlay
 */
export function getInstagramStoryText(options: ShareTemplateOptions): string {
  const { referralCode, refereeReward = 50 } = options;
  return `Get $${refereeReward} off with code:\n${referralCode}\n\n@LuxeMedSpa`;
}

/**
 * Generate WhatsApp deep link
 */
export function getWhatsAppLink(message: string, phoneNumber?: string): string {
  const encodedMessage = encodeURIComponent(message);
  if (phoneNumber) {
    // Send to specific contact
    return `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
  }
  // Open share dialog
  return `whatsapp://send?text=${encodedMessage}`;
}

/**
 * Generate SMS deep link
 */
export function getSMSLink(message: string, phoneNumber?: string, isIOS: boolean = false): string {
  const encodedMessage = encodeURIComponent(message);
  const separator = isIOS ? '&' : '?';
  if (phoneNumber) {
    return `sms:${phoneNumber}${separator}body=${encodedMessage}`;
  }
  return `sms:${separator}body=${encodedMessage}`;
}

/**
 * Generate email mailto link
 */
export function getEmailLink(options: ShareTemplateOptions, recipientEmail?: string): string {
  const subject = encodeURIComponent(getEmailSubject(options));
  const body = encodeURIComponent(getShareMessage('EMAIL', options));
  
  if (recipientEmail) {
    return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  }
  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Generate Twitter intent link
 */
export function getTwitterLink(options: ShareTemplateOptions): string {
  const message = getShareMessage('TWITTER', options);
  const encodedMessage = encodeURIComponent(message);
  return `https://twitter.com/intent/tweet?text=${encodedMessage}`;
}

/**
 * Generate Facebook share link
 */
export function getFacebookLink(options: ShareTemplateOptions): string {
  const { shareUrl } = options;
  const encodedUrl = encodeURIComponent(shareUrl);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
}

/**
 * Get pre-filled templates for all methods
 */
export function getAllShareTemplates(options: ShareTemplateOptions) {
  return {
    SMS: {
      message: getShareMessage('SMS', options),
      link: getSMSLink(getShareMessage('SMS', options)),
    },
    EMAIL: {
      subject: getEmailSubject(options),
      message: getShareMessage('EMAIL', options),
      link: getEmailLink(options),
    },
    WHATSAPP: {
      message: getShareMessage('WHATSAPP', options),
      link: getWhatsAppLink(getShareMessage('WHATSAPP', options)),
    },
    INSTAGRAM: {
      caption: getShareMessage('INSTAGRAM', options),
      storyText: getInstagramStoryText(options),
    },
    FACEBOOK: {
      message: getShareMessage('FACEBOOK', options),
      link: getFacebookLink(options),
    },
    TWITTER: {
      message: getShareMessage('TWITTER', options),
      link: getTwitterLink(options),
    },
  };
}

/**
 * Get success messages for different share methods
 */
export function getShareSuccessMessage(method: ShareMethod): string {
  const messages: Record<ShareMethod, string> = {
    SMS: 'Message ready to send!',
    EMAIL: 'Email ready to send!',
    WHATSAPP: 'Opening WhatsApp...',
    INSTAGRAM: 'Message copied! Open Instagram to share.',
    FACEBOOK: 'Opening Facebook...',
    TWITTER: 'Opening Twitter...',
    COPY: 'Referral code copied to clipboard!',
    QR_CODE: 'QR code generated successfully!',
  };

  return messages[method];
}
