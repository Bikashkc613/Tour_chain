export type QuestStep = {
  id: string;
  title: string;
  description: string;
  type: "checkin" | "photo" | "quiz" | "distance" | "altitude";
  xp: number;
  icon: string;
  hint?: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  category: "exploration" | "culture" | "challenge" | "social" | "photography";
  difficulty: "easy" | "medium" | "hard" | "legendary";
  total_xp: number;
  badge: string;
  badge_name: string;
  steps: QuestStep[];
  region?: string;
  time_limit_days?: number;
};

export const QUESTS: Quest[] = [
  {
    id: "q-sunrise-hunter",
    title: "Sunrise Hunter",
    description: "Capture the magic of a Himalayan sunrise from a high vantage point",
    category: "photography",
    difficulty: "medium",
    total_xp: 800,
    badge: "🌅",
    badge_name: "Sunrise Hunter",
    region: "Annapurna",
    steps: [
      { id: "s1", title: "Reach Poon Hill", description: "Check in at Poon Hill viewpoint (3210m)", type: "checkin", xp: 200, icon: "📍" },
      { id: "s2", title: "Sunrise Photo", description: "Upload a photo of the sunrise over Annapurna", type: "photo", xp: 300, icon: "📸", hint: "Best time: 5:30–6:30 AM" },
      { id: "s3", title: "Share the Moment", description: "Share your sunrise photo on social media with #TourismChainNepal", type: "photo", xp: 300, icon: "🔗" },
    ],
  },
  {
    id: "q-altitude-ace",
    title: "Altitude Ace",
    description: "Conquer three checkpoints above 4000m in a single trek",
    category: "challenge",
    difficulty: "hard",
    total_xp: 1500,
    badge: "⛰️",
    badge_name: "Altitude Ace",
    steps: [
      { id: "s1", title: "First High Camp", description: "Check in at any checkpoint above 4000m", type: "checkin", xp: 400, icon: "🏕️" },
      { id: "s2", title: "Second Summit", description: "Check in at a second checkpoint above 4000m", type: "checkin", xp: 500, icon: "⛰️" },
      { id: "s3", title: "Triple Crown", description: "Check in at a third checkpoint above 4000m", type: "checkin", xp: 600, icon: "🏔️" },
    ],
  },
  {
    id: "q-culture-keeper",
    title: "Culture Keeper",
    description: "Immerse yourself in Nepal's rich cultural heritage along the trail",
    category: "culture",
    difficulty: "easy",
    total_xp: 600,
    badge: "🏛️",
    badge_name: "Culture Keeper",
    steps: [
      { id: "s1", title: "Visit a Monastery", description: "Check in at a monastery or temple checkpoint", type: "checkin", xp: 150, icon: "🕌" },
      { id: "s2", title: "Local Knowledge", description: "Answer 3 questions about Nepali culture correctly", type: "quiz", xp: 200, icon: "📚", hint: "Questions appear at cultural checkpoints" },
      { id: "s3", title: "Cultural Photo", description: "Upload a photo of a local cultural site or tradition", type: "photo", xp: 250, icon: "📸" },
    ],
  },
  {
    id: "q-social-trekker",
    title: "Social Trekker",
    description: "Build your trekking community and inspire others",
    category: "social",
    difficulty: "easy",
    total_xp: 500,
    badge: "🤝",
    badge_name: "Social Trekker",
    steps: [
      { id: "s1", title: "Refer a Friend", description: "Successfully refer a friend who signs up", type: "quiz", xp: 200, icon: "👥" },
      { id: "s2", title: "Share Achievement", description: "Share a trek completion on social media", type: "photo", xp: 150, icon: "📤" },
      { id: "s3", title: "DAO Voter", description: "Cast a vote on a DAO dispute", type: "quiz", xp: 150, icon: "⚖️" },
    ],
  },
  {
    id: "q-legendary-circuit",
    title: "Legendary Circuit",
    description: "Complete the full Annapurna Circuit — the ultimate Himalayan challenge",
    category: "challenge",
    difficulty: "legendary",
    total_xp: 5000,
    badge: "🦅",
    badge_name: "Himalayan Legend",
    time_limit_days: 21,
    region: "Annapurna",
    steps: [
      { id: "s1", title: "Besisahar Start",    description: "Check in at the circuit starting point",    type: "checkin", xp: 500,  icon: "🚀" },
      { id: "s2", title: "Manang Acclimatize", description: "Check in at Manang (3500m)",                type: "checkin", xp: 800,  icon: "🏕️" },
      { id: "s3", title: "Thorong La Pass",    description: "Cross Thorong La Pass (5416m)",             type: "checkin", xp: 1500, icon: "⛰️", hint: "Start before 6 AM to avoid afternoon winds" },
      { id: "s4", title: "Muktinath Temple",   description: "Visit the sacred Muktinath Temple",         type: "checkin", xp: 700,  icon: "🕌" },
      { id: "s5", title: "Circuit Complete",   description: "Finish at Nayapul and mint your NFT proof", type: "checkin", xp: 1500, icon: "🏆" },
    ],
  },
  {
    id: "q-explorer",
    title: "Nepal Explorer",
    description: "Trek in 3 different regions of Nepal",
    category: "exploration",
    difficulty: "hard",
    total_xp: 2000,
    badge: "🗺️",
    badge_name: "Nepal Explorer",
    steps: [
      { id: "s1", title: "First Region",  description: "Complete a trek in any region",          type: "checkin", xp: 500,  icon: "📍" },
      { id: "s2", title: "Second Region", description: "Complete a trek in a different region",   type: "checkin", xp: 700,  icon: "🗺️" },
      { id: "s3", title: "Third Region",  description: "Complete a trek in a third unique region", type: "checkin", xp: 800, icon: "🌏" },
    ],
  },
];

export const DIFFICULTY_CONFIG = {
  easy:      { color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200", label: "Easy" },
  medium:    { color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200",   label: "Medium" },
  hard:      { color: "text-orange-600",  bg: "bg-orange-50",   border: "border-orange-200",  label: "Hard" },
  legendary: { color: "text-purple-600",  bg: "bg-purple-50",   border: "border-purple-200",  label: "Legendary" },
};

export const CATEGORY_CONFIG = {
  exploration:  { icon: "🗺️", label: "Exploration" },
  culture:      { icon: "🏛️", label: "Culture" },
  challenge:    { icon: "⚡", label: "Challenge" },
  social:       { icon: "🤝", label: "Social" },
  photography:  { icon: "📸", label: "Photography" },
};
