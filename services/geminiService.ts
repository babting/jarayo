import { DiaryEntry, StoryBook } from "../types";

// --- MOCK DATA SERVICES (DEMO MODE) ---

// Mock Questions List
const MOCK_QUESTIONS = [
  { text: "오늘 나를 보면서 가장 웃음이 났던 순간은 언제야?", theme: "Joy" },
  { text: "내가 잠들었을 때 내 얼굴을 보며 무슨 생각을 했어?", theme: "Love" },
  { text: "오늘 나에게 해주고 싶었던 말은 뭐야?", theme: "Communication" },
  { text: "우리가 함께한 오늘 하루 중 가장 기억에 남는 소리는 뭐야?", theme: "Memory" },
  { text: "오늘 나를 안아줄 때 내 심장 소리가 들렸어?", theme: "Connection" }
];

// Mock Storybook Cover Images (Whimsical/Fairytale Style)
const STORYBOOK_COVERS = [
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop", // Cloud Castle
    "https://images.unsplash.com/photo-1503023345313-0f0261c96ed5?q=80&w=1000&auto=format&fit=crop", // Starry Night Camping
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop", // Forest Path
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop", // Green Magic
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000&auto=format&fit=crop"  // Deep Night Sky
];

// 1. Generate Daily Question (Mock)
export const generateDailyQuestion = async (babyName: string, weeks: number): Promise<{ text: string; theme: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const randomIndex = Math.floor(Math.random() * MOCK_QUESTIONS.length);
  const selected = MOCK_QUESTIONS[randomIndex];

  return {
    text: selected.text.replace("나", `${babyName}(이)`), 
    theme: selected.theme
  };
};

// 2. Transform Text to Baby Perspective (Mock)
export const transformToBabyPerspective = async (
  combinedParentInput: string,
  babyName: string,
  weeks: number
): Promise<Partial<DiaryEntry>> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    title: `${babyName}와(과) 함께한 따뜻한 하루`,
    babyContent: `(데모 모드) 오늘 엄마/아빠가 나에게 이런 말을 해주었어요: "${combinedParentInput.slice(0, 30)}..." \n\n비록 내가 모든 말을 이해할 수는 없었지만, 따뜻한 목소리와 눈빛만으로도 충분히 사랑받고 있다는 걸 느낄 수 있었답니다. 내일도 나랑 많이 놀아주세요!`,
    mood: 'happy',
  };
};

// 3. Generate Illustration (Mock - Stable 2D/Soft Style URLs)
export const generateDiaryIllustration = async (storyText: string, mood: string = 'happy'): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Reliable Unsplash IDs for "Soft/Childhood/Illustration-vibe"
  const storyImages = [
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df4?q=80&w=800&auto=format&fit=crop", // Soft toys (Duck)
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800&auto=format&fit=crop", // Starry Night
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop", // Forest
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800&auto=format&fit=crop"  // Toys
  ];
  
  return storyImages[Math.floor(Math.random() * storyImages.length)];
};

// 4. Generate Monthly Storybook (Mock - 3rd Person Perspective with Gender)
export const generateMonthlyStorybook = async (entries: DiaryEntry[], babyName: string, gender: 'boy' | 'girl'): Promise<StoryBook> => {
  await new Promise(resolve => setTimeout(resolve, 3000));

  const role = gender === 'boy' ? '왕자' : '공주';
  
  // Select a random cover image from the Storybook collection
  const randomCover = STORYBOOK_COVERS[Math.floor(Math.random() * STORYBOOK_COVERS.length)];

  return {
    title: `${babyName} ${role}님과 첫 번째 계절`,
    coverImage: randomCover, 
    generatedDate: new Date().toISOString(),
    content: `옛날 아주 먼 옛날, 사랑스러운 ${babyName} ${role}님이 살고 있었습니다.\n\n${role}님은 매일매일 새로운 모험을 떠났어요. 어느 날은 거대한 물의 왕국(욕조)에서 첨벙첨벙 물장구를 치며 오리 친구들과 회의를 했고, 또 어느 날은 꿈나라 여행을 떠나 달님과 숨바꼭질을 했답니다.\n\n${role}님이 울음을 터뜨릴 때면 거인(엄마, 아빠)들이 나타나 따뜻한 품으로 감싸주었어요. 그 품은 세상에서 가장 안전한 성벽이었죠.\n\n"응애!" 하고 외치는 소리는 왕국을 다스리는 힘찬 명령이었고, 방긋 웃는 미소는 온 세상을 밝히는 태양과 같았습니다.\n\n${babyName} ${role}님은 무럭무럭 자라나, 이제 막 뒤집기라는 엄청난 마법을 익히기 시작했답니다. 앞으로 펼쳐질 ${role}님의 모험은 또 어떤 이야기로 채워질까요?`
  };
};