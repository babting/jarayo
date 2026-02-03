export interface VoiceNote {
  id: string;
  timestamp: string; // ISO string for sorting
  transcript: string;
}

export interface DiaryEntry {
  id: string; // Primary Key: YYYY-MM-DD format to ensure uniqueness per day
  date: string; // ISO string
  babyAgeWeeks: number;
  
  // Aggregated Content
  babyContent: string;
  title: string;
  mood: 'happy' | 'calm' | 'sleepy' | 'playful';
  
  // Collections
  voiceNotes: VoiceNote[];
  gallery: string[]; // Array of image URLs (Base64 or external)
  
  // The main cover image (usually the latest generated one)
  mainImageUrl: string;
}

export interface BabyProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
}

export interface DailyQuestion {
  id: string;
  text: string;
  theme: string;
  date: string; // YYYY-MM-DD string
}