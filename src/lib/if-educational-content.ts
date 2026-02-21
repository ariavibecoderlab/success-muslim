export interface EducationCard {
  id: string;
  title: string;
  summary: string;
  content: string;
  minLevel: number;
  maxLevel: number;
}

export const EDUCATION_CARDS: EducationCard[] = [
  {
    id: 'why-if', title: 'Why Intermittent Fasting?',
    summary: 'Science-backed benefits of time-restricted eating',
    content: 'Intermittent fasting triggers cellular repair processes, improves insulin sensitivity, and promotes fat burning. Studies show it can reduce inflammation by up to 40% and boost brain-derived neurotrophic factor (BDNF) for better cognitive function.',
    minLevel: 1, maxLevel: 11,
  },
  {
    id: 'blood-sugar', title: 'Blood Sugar & Insulin',
    summary: 'What happens to your blood sugar right now',
    content: 'After your last meal, blood sugar rises as nutrients are absorbed. Insulin is released to shuttle glucose into cells. As hours pass, blood sugar normalizes and insulin drops, signaling your body to start using stored energy.',
    minLevel: 1, maxLevel: 3,
  },
  {
    id: 'fat-burning', title: 'Entering Fat Burning Mode',
    summary: 'Your body is switching fuel sources',
    content: 'With glycogen stores depleted, your liver begins converting fatty acids into ketones — an efficient alternative fuel. This metabolic switch is the foundation of fat loss during fasting.',
    minLevel: 4, maxLevel: 6,
  },
  {
    id: 'autophagy', title: 'Autophagy: Cellular Cleanup',
    summary: 'Your cells are recycling damaged parts',
    content: 'Autophagy (literally "self-eating") is your body\'s way of cleaning house. Damaged proteins and organelles are broken down and recycled. This process is linked to longevity, cancer prevention, and reduced neurodegenerative disease risk.',
    minLevel: 7, maxLevel: 11,
  },
  {
    id: 'lemon-water', title: 'Can I Drink Lemon Water?',
    summary: 'What breaks an intermittent fast',
    content: 'Plain water, black coffee, and unsweetened tea generally don\'t break a fast. A small squeeze of lemon in water is fine. Anything with calories (milk, sugar, juice) will break your fast. Note: For Islamic fasting, nothing enters the body.',
    minLevel: 1, maxLevel: 11,
  },
  {
    id: 'beginner-tips', title: 'Tips for Beginners',
    summary: 'Make your fasting journey easier',
    content: 'Start with a 14:10 window and gradually extend. Stay hydrated. Keep busy during fasting hours. Break your fast with dates and water (Sunnah!). Avoid binge eating during your eating window.',
    minLevel: 1, maxLevel: 4,
  },
];

export interface FastingTip {
  text: string;
  islamic?: boolean;
}

export const FASTING_TIPS: FastingTip[] = [
  { text: 'Drink water or herbal tea to stay hydrated' },
  { text: 'Keep your mind off food with ibadah', islamic: true },
  { text: 'Avoid high-intensity workouts during extended fasts' },
  { text: 'Break your fast gently with dates and water', islamic: true },
  { text: 'Light walking can help manage hunger pangs' },
  { text: 'Make dua during your fast — the dua of a fasting person is never rejected', islamic: true },
];

export interface FastingFAQ {
  question: string;
  answer: string;
}

export const FASTING_FAQS: FastingFAQ[] = [
  { question: 'Can I drink water while IF fasting?', answer: 'Yes! Unlike religious fasting, intermittent fasting allows water, black coffee, and unsweetened tea. Staying hydrated is essential.' },
  { question: 'Does coffee break my fast?', answer: 'Black coffee without sugar or cream does not break an intermittent fast. It may even enhance fat burning. Add-ins like milk or sugar will break it.' },
  { question: 'What if I feel dizzy?', answer: 'Mild lightheadedness can occur, especially early on. Ensure adequate hydration and electrolytes. If symptoms persist, break your fast safely.' },
  { question: 'Can I exercise while fasting?', answer: 'Light to moderate exercise is fine. For intense workouts, consider training near the end of your fast or during your eating window.' },
  { question: 'Will fasting slow my metabolism?', answer: 'Short-term fasting (up to 72h) actually increases metabolic rate by 3.6-14%. It\'s prolonged caloric restriction, not fasting, that slows metabolism.' },
];

export interface FastingChallenge {
  id: string;
  title: string;
  description: string;
  targetHours: number;
  durationDays: number;
}

export const FASTING_CHALLENGES: FastingChallenge[] = [
  { id: '7day-50h', title: '7-Day Challenge', description: 'Fast 50 hours in 1 week', targetHours: 50, durationDays: 7 },
  { id: '14day-100h', title: '14-Day Challenge', description: 'Fast 100 hours in 2 weeks', targetHours: 100, durationDays: 14 },
  { id: '30day-ramadan', title: 'Ramadan Challenge', description: 'Complete 30 consecutive days', targetHours: 0, durationDays: 30 },
];

export function getCardsForLevel(level: number): EducationCard[] {
  return EDUCATION_CARDS.filter(c => level >= c.minLevel && level <= c.maxLevel);
}
