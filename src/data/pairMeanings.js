// Mock database of tarot pair meanings
// This will be replaced with your actual data later

export const generatePairMeaning = (card1, card2) => {
  const meanings = [
    "This powerful combination suggests a time of transformation and new beginnings. The energy between these cards creates a dynamic that encourages you to embrace change while staying grounded in your values.",
    "Together, these cards speak to the balance between intuition and action. Trust your inner wisdom while taking practical steps toward your goals.",
    "This pairing indicates a period of emotional growth and spiritual awakening. Pay attention to the messages your heart is sending you.",
    "The combination of these energies suggests that success comes through patience and perseverance. Your efforts are building toward something meaningful.",
    "These cards together represent the harmony between your conscious and unconscious mind. Meditation and reflection will bring clarity.",
    "This powerful duo speaks to the importance of relationships and partnerships in your current journey. Collaboration will lead to success.",
    "The energy of this combination encourages you to break free from limiting beliefs and embrace your true potential.",
    "Together, these cards suggest that material and spiritual abundance are within reach. Align your actions with your highest values.",
  ];

  return {
    id: `${card1.id}-${card2.id}`,
    card1,
    card2,
    meaning: meanings[Math.floor(Math.random() * meanings.length)],
    keywords: ["transformation", "balance", "growth", "harmony", "potential"],
    theme: "Personal Development",
    isPremium: Math.random() > 0.7, // 30% chance of being premium
  };
};

export const samplePairs = [
  {
    id: "0-21",
    card1: { id: 0, name: "The Fool" },
    card2: { id: 21, name: "The World" },
    meaning: "The journey from beginning to completion. This powerful combination represents the full cycle of experience, suggesting that you are both at the start of something new and nearing the completion of a major life chapter.",
    keywords: ["completion", "new beginnings", "cycles", "achievement"],
    theme: "Life Cycles",
    isPremium: false,
  },
  {
    id: "6-23",
    card1: { id: 6, name: "The Lovers" },
    card2: { id: 23, name: "Two of Cups" },
    meaning: "A deeply harmonious connection in love and relationships. This pairing indicates a soul-deep bond, whether in romance, friendship, or partnership. Emotional fulfillment and mutual understanding are highlighted.",
    keywords: ["love", "harmony", "connection", "partnership"],
    theme: "Relationships",
    isPremium: false,
  },
  {
    id: "1-36",
    card1: { id: 1, name: "The Magician" },
    card2: { id: 36, name: "Ace of Wands" },
    meaning: "Pure creative potential and manifestation power. You have all the tools and energy needed to bring your ideas into reality. This is a time for bold action and confident creation.",
    keywords: ["manifestation", "creativity", "power", "action"],
    theme: "Creation & Manifestation",
    isPremium: true,
  },
];

export const curatedPairs = [
  {
    id: "curated-1",
    title: "The Seeker's Journey",
    card1: { id: 9, name: "The Hermit" },
    card2: { id: 17, name: "The Star" },
    meaning: "After a period of introspection and soul-searching, you emerge with renewed hope and clarity. The Hermit's wisdom combined with The Star's inspiration creates a powerful foundation for spiritual growth and healing.",
    keywords: ["wisdom", "hope", "healing", "spiritual growth"],
    theme: "Spiritual Development",
    specialInterpretation: "This combination often appears when you've completed a significant period of inner work and are ready to share your light with the world.",
  },
  {
    id: "curated-2",
    title: "The Creative Fire",
    card1: { id: 3, name: "The Empress" },
    card2: { id: 48, name: "Queen of Wands" },
    meaning: "Feminine creative power at its peak. This pairing speaks to abundant creativity, nurturing leadership, and the ability to bring beautiful things into the world through passionate dedication.",
    keywords: ["creativity", "abundance", "leadership", "passion"],
    theme: "Creative Expression",
    specialInterpretation: "When these queens appear together, they signal a time of extraordinary creative fertility and the power to inspire others.",
  },
];