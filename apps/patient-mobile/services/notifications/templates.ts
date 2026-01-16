/**
 * Notification Templates
 *
 * Predefined notification templates for consistent messaging
 */

export const notificationTemplates = {
  appointment: {
    reminder24h: (serviceName: string, time: string) => ({
      title: 'Appointment Tomorrow',
      body: `Your appointment is tomorrow at ${time}`,
    }),
    reminder2h: (serviceName: string, time: string) => ({
      title: 'Appointment Soon',
      body: `See you soon! Your appointment starts at ${time}`,
    }),
    confirmed: (serviceName: string, time: string) => ({
      title: 'Appointment Confirmed',
      body: `Your appointment is confirmed for ${time}`,
    }),
  },
  messages: {
    newMessage: (senderName: string) => ({
      title: `New Message from ${senderName}`,
      body: 'You have a new message. Tap to reply.',
    }),
  },
  rewards: {
    pointsEarned: (points: number) => ({
      title: 'Points Earned!',
      body: `You earned ${points} points. Great job!`,
    }),
    rewardAvailable: (rewardName: string) => ({
      title: 'New Reward Available',
      body: `${rewardName} is now available`,
    }),
  },
  referral: {
    referralSignup: (referredName: string, bonusPoints: number) => ({
      title: 'Referral Successful!',
      body: `${referredName} joined! You earned ${bonusPoints} bonus points.`,
    }),
  },
  promotion: {
    discount: (amount: string | number) => ({
      title: 'Special Offer',
      body: `${amount} off your next service. Limited time!`,
    }),
    flash: (title: string) => ({
      title: 'Flash Deal!',
      body: title,
    }),
  },
  system: {
    review: (serviceName: string) => ({
      title: 'How Was Your Visit?',
      body: `We would love to hear about your ${serviceName} experience!`,
    }),
    beforeAfter: () => ({
      title: 'Your Photos are Ready',
      body: 'View your before and after photos in the Photos section',
    }),
  },
};

export function getNotificationTemplate(
  type: string,
  templateName: string,
  ...args: any[]
): { title: string; body: string } | null {
  const templates: any = notificationTemplates;
  try {
    if (templates[type] && templates[type][templateName]) {
      return templates[type][templateName](...args);
    }
  } catch (error) {
    console.error(`Error getting notification template: ${type}.${templateName}`, error);
  }
  return null;
}
