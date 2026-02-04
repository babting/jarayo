import { GoogleGenAI } from "@google/genai";
import { DiaryEntry, StoryBook } from "../types";

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fallback image (Soft watercolor style) in case of API failure
// Replaced with a reliable Unsplash ID for a soft abstract texture
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80";

// Optimized Style Prompt for Gemini Nano Banana (gemini-2.5-flash-image)
// Updated to "Children's Storybook Style" as requested.
const ILLUSTRATION_STYLE = "High-quality children's storybook illustration style. Soft watercolor textures mixed with colored pencil outlines. Whimsical, dreamy, and warm atmosphere. Flat 2D perspective, no photorealism, no 3D rendering. Pastel color palette with a paper texture background. Artistic and emotive.";

// --- Demo Data for Storybook ---
// Content expanded by 3x and images replaced with verified working URLs
const DEMO_STORYBOOKS = [
  {
    titleTemplate: "{name}의 꿈나라 모험",
    contentTemplate: "어느 깊은 밤, 창문 틈으로 달빛 요정이 살금살금 들어왔어요. 요정은 곤히 잠든 {name}의 코끝을 간지럽히며 속삭였죠. \"나랑 같이 은하수 미끄럼틀 타러 갈래?\"\n\n{name}(은)는 솜사탕처럼 폭신한 구름을 타고 밤하늘로 둥실 떠올랐어요. 그곳에는 반짝반짝 빛나는 별님들이 '안녕?' 하고 인사를 건넸답니다. {name}(은)는 별님들과 숨바꼭질도 하고, 달님 무릎에 앉아 옛날이야기도 들었어요. 은하수 미끄럼틀은 정말 길고 반짝거렸는데, 슝~ 하고 내려올 때마다 별똥별이 쏟아져 내리는 것 같았죠.\n\n한참을 신나게 놀다 보니 어느새 아침이 밝아오고 있었어요. 햇님이 \"이제 일어날 시간이야!\" 하며 윙크를 보냈죠. {name}(은)는 꿈나라 친구들에게 손을 흔들며 포근한 침대로 돌아왔답니다. \"내일 또 만나!\" {name}의 입가에는 행복한 미소가 번졌어요. 사랑받는 아이의 꿈속 세상은 언제나 이렇게 따뜻하고 신비로운 모험으로 가득하답니다.",
    coverImage: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&w=800&q=80" // Starry Night
  },
  {
    titleTemplate: "숲속 친구들과의 숨바꼭질",
    contentTemplate: "초록색 거인 나무들이 춤추는 신비한 숲속에 {name}(이)가 놀러 왔어요. 나뭇잎 사이로 따스한 햇살이 쏟아지고, 바람은 살랑살랑 노래를 불렀죠. \"얘들아, {name}(이)가 왔어!\" 다람쥐가 도토리를 굴리며 외쳤어요.\n\n숲속 친구들은 {name}(와)과 함께 숨바꼭질을 하기로 했어요. \"꼭꼭 숨어라 머리카락 보인다!\" 토끼가 술래가 되었죠. {name}(은)는 커다란 알록달록 버섯 우산 아래에 쏙 숨어서 키득키득 웃음을 참았어요. 지나가던 나비가 {name}의 콧잔등에 앉아 간지럼을 태우는 바람에 그만 \"에취!\" 하고 재채기를 하고 말았답니다.\n\n\"찾았다!\" 친구들이 모두 달려와 {name}(을)를 안아주었어요. 숲속은 까르르 웃음소리로 가득 찼죠. 집으로 돌아가는 길, 새들은 {name}(을)를 위해 고운 목소리로 자장가를 불러주었답니다. 자연 속에서 {name}(은)는 매일매일 더 사랑스러운 아이로 자라나고 있어요.",
    coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80" // Forest
  },
  {
    titleTemplate: "보글보글 목욕탕 항해",
    contentTemplate: "따뜻한 물이 가득 찬 하얀 욕조는 {name}에게 거대한 바다와 같았어요. 오늘은 {name}(이)가 용감한 선장이 되어 모험을 떠나는 날이랍니다! \"모두 탑승하세요! 출발!\" {name} 선장의 명령에 노란 오리 선원들이 꽥꽥 대답했어요.\n\n{name}(이)가 고사리 같은 손으로 물장구를 치자, 하얀 거품 파도가 일렁이며 솟아올랐어요. 비누 방울들이 공중으로 둥실둥실 떠오르며 무지개 빛깔로 반짝였죠. \"와아, 보석이다!\" {name}(은)는 방울을 잡으려고 손을 뻗으며 꺄르르 웃었어요. 가끔 물방울이 얼굴에 튀어도 울지 않아요. 용감한 선장이니까요!\n\n긴 항해를 마치고 돌아올 시간, 거인 아빠가 커다란 수건으로 {name}(을)를 감싸 안아주었어요. 마치 포근한 구름 속에 들어온 것처럼 따뜻하고 부드러웠죠. 뽀송뽀송해진 {name}(은)는 오늘도 사랑이라는 항구에 무사히 도착했답니다.",
    coverImage: "https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=800&q=80" // Duck/Bath
  },
  {
    titleTemplate: "{name}와 마법의 정원",
    contentTemplate: "창문 너머로 달콤하고 향긋한 꽃내음이 불어왔어요. {name}(은)는 나비를 따라 아장아장 마법의 정원으로 걸음마를 시작했죠. 그곳은 세상의 모든 색깔들이 모여 춤을 추는 곳이었어요. 빨간 튤립은 노래를 부르고, 노란 민들레 홀씨들은 하늘로 둥실둥실 날아다녔죠.\n\n\"안녕, 꼬마 친구?\" 잎사귀 뒤에 숨어있던 빨간 무당벌레가 {name}에게 인사를 건넸어요. {name}(은)는 신기한 듯 눈을 동그랗게 뜨고 작고 예쁜 친구를 바라보았답니다. 부드러운 꽃잎을 만져보기도 하고, 흙냄새를 킁킁 맡아보기도 했어요. 모든 것이 {name}에게는 새롭고 신기한 선물 같았죠.\n\n따스한 햇살이 {name}의 머리를 부드럽게 쓰다듬어 주었어요. 마치 \"사랑해\"라고 속삭이는 것 같았죠. 마법의 정원에서 {name}(은)는 자연의 축복을 받으며, 꽃보다 더 예쁜 아이로 무럭무럭 자라고 있답니다.",
    coverImage: "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=800&q=80" // Garden/Flowers
  }
];

// 1. Generate Daily Question (using Gemini 3 Flash for Text)
export const generateDailyQuestion = async (babyName: string, weeks: number): Promise<{ text: string; theme: string }> => {
  try {
    const prompt = `
      You are a cute ${weeks}-week-old baby named "${babyName}".
      Ask your parents a short, touching, or funny question about today.
      Themes: Love, Curiosity, Sleep, Play, Food.
      
      Output strictly a JSON object with:
      - "text": The question in Korean (informal, cute tone).
      - "theme": One English word representing the mood (e.g., Love, Joy).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const data = JSON.parse(response.text || '{}');
    return { 
      text: data.text || `${babyName}(이)는 오늘 엄마 아빠랑 무엇을 하고 싶었을까요?`, 
      theme: data.theme || "Love" 
    };
  } catch (e) {
    console.error("Question generation failed", e);
    return { text: "오늘 저를 보며 가장 행복했던 순간은 언제인가요?", theme: "Love" };
  }
};

// 2. Transform Text to Baby Perspective (using Gemini 3 Flash for Text)
export const transformToBabyPerspective = async (
  combinedParentInput: string,
  babyName: string,
  weeks: number
): Promise<Partial<DiaryEntry>> => {
  try {
    const prompt = `
      You are "${babyName}", a ${weeks}-week-old baby.
      Rewrite the following parents' voice note log from YOUR perspective (First person '나').
      
      Parents' Input: "${combinedParentInput}"
      
      Guidelines:
      - Use cute, imaginative, and sensory-focused language (sounds, smells, touch).
      - Interpret ordinary events as magical adventures (e.g., bath -> water kingdom, dad -> giant).
      - Style: Pure, lovely, emotional, like a fairytale.
      - Output strictly a JSON object with:
        - "title": A creative title for the diary.
        - "babyContent": The rewritten story (3-4 sentences, Korean).
        - "mood": One of ['happy', 'calm', 'sleepy', 'playful'].
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      title: data.title || "나의 하루",
      babyContent: data.babyContent || "오늘도 사랑받아서 행복해요.",
      mood: data.mood || 'happy'
    };
  } catch (e) {
    console.error("Text transformation failed", e);
    return { 
      title: "사랑스러운 하루", 
      babyContent: "기억은 안 나지만 기분 좋은 하루였어요.", 
      mood: 'happy' 
    };
  }
};

// 3. Generate Illustration (using Gemini 2.5 Flash Image / Nano Banana)
export const generateDiaryIllustration = async (storyText: string, mood: string = 'happy'): Promise<string> => {
  try {
    // Explicitly using 'gemini-2.5-flash-image' (Nano Banana)
    // Updated prompt to match the "Storybook" format the user liked.
    const prompt = `Draw a page from a children's storybook based on this text: "${storyText}". 
    Mood: ${mood}. 
    Style: ${ILLUSTRATION_STYLE}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return FALLBACK_IMAGE;
  } catch (e) {
    console.error("Image generation failed", e);
    return FALLBACK_IMAGE;
  }
};

// 4. Generate Monthly Storybook (MOCK DATA Implementation)
export const generateMonthlyStorybook = async (entries: DiaryEntry[], babyName: string, gender: 'boy' | 'girl'): Promise<StoryBook> => {
  // Use mock data randomly instead of API call
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2s delay for "processing" feel

  const randomIndex = Math.floor(Math.random() * DEMO_STORYBOOKS.length);
  const demoData = DEMO_STORYBOOKS[randomIndex];

  const title = demoData.titleTemplate.replace(/\{name\}/g, babyName);
  const content = demoData.contentTemplate.replace(/\{name\}/g, babyName);

  return {
    title: title,
    coverImage: demoData.coverImage,
    content: content,
    generatedDate: new Date().toISOString()
  };
};