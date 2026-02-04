import { BabyProfile, DiaryEntry, DailyQuestion } from "../types";

const KEYS = {
  PROFILE: 'obv_profile',
  ENTRIES: 'obv_entries',
  BG_IMAGE: 'obv_bg_image',
  DAILY_QUESTION: 'obv_daily_question'
};

export const storage = {
  saveProfile: (profile: BabyProfile) => {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile to localStorage", e);
    }
  },
  
  loadProfile: async (): Promise<BabyProfile | null> => {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load profile from localStorage", e);
      return null;
    }
  },

  saveEntries: (entries: DiaryEntry[]) => {
    try {
      localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save entries to localStorage. Quota might be exceeded.", e);
    }
  },

  loadEntries: async (): Promise<DiaryEntry[]> => {
    try {
      const data = localStorage.getItem(KEYS.ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load entries from localStorage", e);
      return [];
    }
  },

  saveBgImage: (dataUrl: string) => {
    try {
      localStorage.setItem(KEYS.BG_IMAGE, dataUrl);
    } catch (e) {
      console.error("Failed to save bg image to localStorage", e);
    }
  },

  loadBgImage: async (): Promise<string | null> => {
    try {
      return localStorage.getItem(KEYS.BG_IMAGE);
    } catch (e) {
      return null;
    }
  },

  saveDailyQuestion: (question: DailyQuestion) => {
    try {
      localStorage.setItem(KEYS.DAILY_QUESTION, JSON.stringify(question));
    } catch (e) {
      console.error("Failed to save daily question", e);
    }
  },

  loadDailyQuestion: async (): Promise<DailyQuestion | null> => {
    try {
      const data = localStorage.getItem(KEYS.DAILY_QUESTION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
};