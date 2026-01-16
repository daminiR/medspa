import { RedditProspect } from '@/types/reddit';

// Mock Reddit prospect data
export const mockRedditProspects: RedditProspect[] = [
  {
    id: 'reddit-1',
    subreddit: 'aesthetics',
    title: 'Looking for advice on Botox treatments',
    snippet: 'Has anyone here tried Botox for forehead lines? I\'m considering it but worried about looking frozen...',
    originalText: 'Has anyone here tried Botox for forehead lines? I\'m considering it but worried about looking frozen. What was your experience? Any recommendations on how many units?',
    url: 'https://reddit.com/r/aesthetics/comments/abc123',
    score: 42,
    ageHours: 2,
    status: 'new',
  },
  {
    id: 'reddit-2',
    subreddit: 'SkincareAddiction',
    title: 'Recommendations for dark spots',
    snippet: 'I have some stubborn dark spots from old acne. Has anyone tried IPL or laser treatments? Worth it?',
    originalText: 'I have some stubborn dark spots from old acne. Has anyone tried IPL or laser treatments? Worth it? My dermatologist mentioned chemical peels too but I\'m not sure which is better.',
    url: 'https://reddit.com/r/SkincareAddiction/comments/def456',
    score: 127,
    ageHours: 5,
    status: 'new',
  },
  {
    id: 'reddit-3',
    subreddit: 'plasticsurgery',
    title: 'Non-surgical options for jaw contouring?',
    snippet: 'I\'m interested in defining my jawline but don\'t want surgery. What are the best non-surgical options?',
    originalText: 'I\'m interested in defining my jawline but don\'t want surgery. What are the best non-surgical options? I\'ve heard about Kybella and jawline filler but not sure which is better or if there are other options.',
    url: 'https://reddit.com/r/plasticsurgery/comments/ghi789',
    score: 89,
    ageHours: 8,
    status: 'drafted',
    draftResponse: 'Great question! For non-surgical jawline contouring, there are several effective options:\n\n1. Kybella: FDA-approved for reducing submental fat (double chin). Usually requires 2-4 treatments.\n\n2. Jawline filler: Can add definition and structure. Results are immediate and last 12-18 months.\n\n3. PDO threads: Provides lift and stimulates collagen production.\n\nThe best option depends on your specific anatomy and goals. A consultation with a qualified provider can help determine which treatment (or combination) would work best for you.',
    generatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: 'reddit-4',
    subreddit: 'medical_aesthetics',
    title: 'Microneedling vs PRP - which is better?',
    snippet: 'Trying to decide between microneedling and PRP for fine lines. Has anyone done both? Which gave better results?',
    originalText: 'Trying to decide between microneedling and PRP for fine lines. Has anyone done both? Which gave better results? My provider mentioned combining them but that sounds expensive.',
    url: 'https://reddit.com/r/medical_aesthetics/comments/jkl012',
    score: 56,
    ageHours: 12,
    status: 'approved',
    draftResponse: 'Both microneedling and PRP are excellent treatments, and combining them often yields the best results!\n\nMicroneedling alone: Creates micro-injuries to stimulate collagen production. Great for texture, fine lines, and scarring.\n\nPRP (Platelet-Rich Plasma): Uses your own blood\'s growth factors to enhance healing and rejuvenation.\n\nCombined treatment: Microneedling + PRP (often called "Vampire Facial") maximizes results by using your body\'s healing factors while the channels are open. While it is more expensive, many find the enhanced results worth it.\n\nTypically recommend a series of 3-4 treatments spaced 4-6 weeks apart for optimal results.',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    approvedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: 'reddit-5',
    subreddit: 'aesthetics',
    title: 'First time getting lip filler - nervous!',
    snippet: 'Getting my first lip filler appointment next week. Any tips? What should I expect?',
    originalText: 'Getting my first lip filler appointment next week. Any tips? What should I expect? I\'m so nervous about looking overdone or unnatural. Also how long does swelling last?',
    url: 'https://reddit.com/r/aesthetics/comments/mno345',
    score: 203,
    ageHours: 3,
    status: 'posted',
    draftResponse: 'Congrats on taking the step! Here are some tips for your first lip filler experience:\n\nBefore:\n- Avoid blood thinners (aspirin, ibuprofen) 24-48 hours before\n- Stay hydrated\n- Arrive with clean, makeup-free lips\n\nDuring:\n- Communicate your goals clearly - "natural enhancement" is totally valid!\n- Good providers start conservative - you can always add more\n\nAfter:\n- Swelling peaks at 24-48 hours, subsides within a week\n- Apply ice packs (20 min on, 20 min off)\n- Sleep elevated\n- Avoid intense exercise for 24-48 hours\n\nRemember: Hyaluronic acid fillers are reversible, so if you\'re unhappy, they can be dissolved. Choose an experienced injector and communicate your desired look clearly!',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 'reddit-6',
    subreddit: 'beauty',
    title: 'How often should you get Botox touch-ups?',
    snippet: 'I got Botox 3 months ago and it\'s starting to wear off. Is this normal? How often do you get it done?',
    originalText: 'I got Botox 3 months ago and it\'s starting to wear off. Is this normal? How often do you get it done? My provider said every 3-4 months but wondering if that\'s typical.',
    url: 'https://reddit.com/r/beauty/comments/pqr678',
    score: 78,
    ageHours: 6,
    status: 'skipped',
    skippedAt: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
  },
];

// In-memory store for Reddit prospects (in production, use database)
// This is shared across all API routes
export let redditProspects: RedditProspect[] = [...mockRedditProspects];

// Generate AI draft response (mock function)
export function generateDraftResponse(prospect: RedditProspect): string {
  // In production, this would call an AI API
  // For now, return a template-based response
  return `Thank you for your question about ${prospect.title.toLowerCase()}!\n\nThis is a great topic. [AI would generate detailed, helpful response here based on the context]\n\nIf you have more questions or want to discuss your specific situation, feel free to reach out!`;
}
