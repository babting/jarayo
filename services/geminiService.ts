import { DiaryEntry } from "../types";

// --- MOCK DATA SERVICES (DEMO MODE) ---

// Mock Questions List
const MOCK_QUESTIONS = [
  { text: "오늘 나를 보면서 가장 웃음이 났던 순간은 언제야?", theme: "Joy" },
  { text: "내가 잠들었을 때 내 얼굴을 보며 무슨 생각을 했어?", theme: "Love" },
  { text: "오늘 나에게 해주고 싶었던 말은 뭐야?", theme: "Communication" },
  { text: "우리가 함께한 오늘 하루 중 가장 기억에 남는 소리는 뭐야?", theme: "Memory" },
  { text: "오늘 나를 안아줄 때 내 심장 소리가 들렸어?", theme: "Connection" }
];

// 1. Generate Daily Question (Mock)
export const generateDailyQuestion = async (babyName: string, weeks: number): Promise<{ text: string; theme: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const randomIndex = Math.floor(Math.random() * MOCK_QUESTIONS.length);
  const selected = MOCK_QUESTIONS[randomIndex];

  return {
    text: selected.text.replace("나", `${babyName}(이)`), // Personalize slightly
    theme: selected.theme
  };
};

// 2. Transform Text to Baby Perspective (Mock)
export const transformToBabyPerspective = async (
  combinedParentInput: string,
  babyName: string,
  weeks: number
): Promise<Partial<DiaryEntry>> => {
  // Simulate network delay (processing feeling)
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    title: `${babyName}와(과) 함께한 따뜻한 하루`,
    babyContent: `(데모 모드) 오늘 엄마/아빠가 나에게 이런 말을 해주었어요: "${combinedParentInput.slice(0, 30)}..." \n\n비록 내가 모든 말을 이해할 수는 없었지만, 따뜻한 목소리와 눈빛만으로도 충분히 사랑받고 있다는 걸 느낄 수 있었답니다. 내일도 나랑 많이 놀아주세요!`,
    mood: 'happy',
  };
};

// 3. Generate Illustration (Mock)
export const generateDiaryIllustration = async (storyText: string, mood: string = 'happy'): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return a random Picsum image to simulate a generated image
  // Adding a timestamp to ensure the image changes every time
  return `https://picsum.photos/seed/${Date.now()}/800/800`;
};
