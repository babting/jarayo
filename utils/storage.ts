import { BabyProfile, DiaryEntry, DailyQuestion } from "../types";

const DB_NAME = 'OmniscientBabyViewDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

const KEYS = {
  PROFILE: 'obv_profile',
  ENTRIES: 'obv_entries',
  BG_IMAGE: 'obv_bg_image',
  DAILY_QUESTION: 'obv_daily_question'
};

// IDB Helper
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Check if indexedDB is available
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

const putData = async (key: string, value: any) => {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(`Failed to save ${key} to IndexedDB`, e);
  }
};

const getData = async (key: string) => {
  try {
    const db = await openDB();
    return new Promise<any>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(`Failed to load ${key} from IndexedDB`, e);
    return null;
  }
};

export const storage = {
  saveProfile: async (profile: BabyProfile) => {
    await putData(KEYS.PROFILE, profile);
  },
  
  loadProfile: async (): Promise<BabyProfile | null> => {
    return await getData(KEYS.PROFILE);
  },

  saveEntries: async (entries: DiaryEntry[]) => {
    await putData(KEYS.ENTRIES, entries);
  },

  loadEntries: async (): Promise<DiaryEntry[]> => {
    const data = await getData(KEYS.ENTRIES);
    return data || [];
  },

  saveBgImage: async (dataUrl: string) => {
    await putData(KEYS.BG_IMAGE, dataUrl);
  },

  loadBgImage: async (): Promise<string | null> => {
    return await getData(KEYS.BG_IMAGE);
  },

  saveDailyQuestion: async (question: DailyQuestion) => {
    await putData(KEYS.DAILY_QUESTION, question);
  },

  loadDailyQuestion: async (): Promise<DailyQuestion | null> => {
    return await getData(KEYS.DAILY_QUESTION);
  }
};
