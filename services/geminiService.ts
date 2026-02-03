import { DiaryEntry, StoryBook } from "../types";

// --- MOCK DATA SERVICES ---

// Mock Questions List
const MOCK_QUESTIONS = [
  { text: "오늘 나를 보면서 가장 웃음이 났던 순간은 언제야?", theme: "Joy" },
  { text: "내가 잠들었을 때 내 얼굴을 보며 무슨 생각을 했어?", theme: "Love" },
  { text: "오늘 나에게 해주고 싶었던 말은 뭐야?", theme: "Communication" },
  { text: "우리가 함께한 오늘 하루 중 가장 기억에 남는 소리는 뭐야?", theme: "Memory" },
  { text: "오늘 나를 안아줄 때 내 심장 소리가 들렸어?", theme: "Connection" },
  { text: "오늘 내가 낸 소리 중에 가장 귀여웠던 소리는 뭐야?", theme: "Sound" },
  { text: "나랑 눈이 마주쳤을 때 어떤 기분이 들었어?", theme: "EyeContact" },
  { text: "오늘 나를 보면서 '아, 내가 부모구나' 하고 느꼈던 순간이 있어?", theme: "Parenthood" },
  { text: "내 작은 손을 잡았을 때 어떤 다짐을 했어?", theme: "Promise" },
  { text: "오늘 나와 함께한 시간 중 시간을 멈추고 싶었던 순간은?", theme: "Time" }
];

// Mock Storybook Cover Images (Whimsical/Fairytale Style)
const STORYBOOK_COVERS = [
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop", // Cloud Castle
    "https://images.unsplash.com/photo-1503023345313-0f0261c96ed5?q=80&w=1000&auto=format&fit=crop", // Starry Night Camping
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop", // Forest Path
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop", // Green Magic
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000&auto=format&fit=crop"  // Deep Night Sky
];

// --- KEYWORD MATCHING LOGIC ---

interface DiaryTemplate {
    keywords: string[];
    titleTemplate: (name: string) => string;
    contentTemplate: (input: string) => string;
    mood: 'happy' | 'calm' | 'sleepy' | 'playful';
}

const DIARY_TEMPLATES: DiaryTemplate[] = [
    {
        keywords: ['사랑', '좋아', '예뻐', '보물', '천사', '행복', '귀여', '하트'],
        titleTemplate: (name) => `${name}는(은) 사랑받는 아이`,
        contentTemplate: (input) => `오늘 엄마/아빠의 눈에서 하트가 뿅뿅 나오는 걸 봤어요! "${input}" 라고 말씀해주시는데, 그 목소리가 솜사탕처럼 달콤했답니다. 나는 그저 숨만 쉬고 있었을 뿐인데, 거인들은 나를 세상에서 제일 귀한 보물처럼 쳐다봐요. 이 따뜻한 기분이 '사랑'이라는 건가 봐요.`,
        mood: 'happy'
    },
    {
        keywords: ['목욕', '물', '씻', '첨벙', '오리', '샤워'],
        titleTemplate: (name) => `${name}의 물놀이 대모험`,
        contentTemplate: (input) => `오늘은 거대한 물의 왕국으로 여행을 떠났어요. "${input}" 하면서 따뜻한 물이 내 몸을 감싸주었죠. 물방울들이 톡톡 터지는 소리가 재미있는 음악 같았어요. 노란 오리 친구랑 인사도 하고, 뽀송뽀송한 수건에 싸여 나올 때는 구름 속에 들어가는 기분이었답니다.`,
        mood: 'playful'
    },
    {
        keywords: ['자자', '잘자', '꿈', '밤', '코', '졸려', '새벽'],
        titleTemplate: (name) => `꿈나라 여행을 떠나요`,
        contentTemplate: (input) => `눈꺼풀이 자꾸만 무거워지는 마법에 걸렸어요. 엄마/아빠가 "${input}" 하고 토닥여주시는 손길이 너무 편안해서, 나는 금세 꿈나라행 기차에 올라탔답니다. 달님이 창문 밖에서 나를 지켜보고, 별님들이 자장가를 불러주는 밤이에요. 내일 아침에 만나요!`,
        mood: 'sleepy'
    },
    {
        keywords: ['산책', '바람', '햇살', '나가', '꽃', '나무', '유모차'],
        titleTemplate: (name) => `${name}의 바깥세상 탐험`,
        contentTemplate: (input) => `오늘은 집 밖의 거대한 초록 세상으로 나갔어요! "${input}" 라는 말과 함께 얼굴에 닿는 살랑살랑한 바람이 간지러웠어요. 나뭇잎들이 춤추는 모습도 보고, 반짝이는 햇살 조각들도 만났답니다. 세상은 참 넓고 신기한 것들로 가득 차 있는 것 같아요.`,
        mood: 'calm'
    },
    {
        keywords: ['맘마', '우유', '배고파', '먹', '밥', '분유', '수유'],
        titleTemplate: (name) => `배가 빵빵, 기분이 최고`,
        contentTemplate: (input) => `꼬르륵 소리가 나자마자 맛있는 맘마 시간이 찾아왔어요. "${input}" 하시며 나를 안아주시는 품이 따뜻했어요. 배가 부르니까 기분이 날아갈 것 같아요. 트림을 끄억 하고 나면 거인들이 박수를 쳐주는데, 그게 왜 칭찬받을 일인지는 모르겠지만 아무튼 뿌듯해요!`,
        mood: 'happy'
    },
    {
        keywords: ['울', '속상', '아파', '눈물', '응애', '찡찡'],
        titleTemplate: (name) => `눈물이 뚝 그친 하루`,
        contentTemplate: (input) => `조금 속상해서 으앙 하고 울어버렸어요. 하지만 곧 따뜻한 품이 나를 안아주었죠. "${input}" 라고 달래주시는 목소리에 마음이 금방 편안해졌어요. 내 눈물을 닦아주는 손길에서 '괜찮아, 우리가 있잖아'라는 마음이 전해져 왔답니다.`,
        mood: 'calm'
    }
];

const DEFAULT_TEMPLATE: DiaryTemplate = {
    keywords: [],
    titleTemplate: (name) => `${name}와(과) 함께한 소중한 하루`,
    contentTemplate: (input) => `오늘도 엄마/아빠와 많은 이야기를 나누었어요. "${input}" 라고 말씀해주셨는데, 비록 모든 단어를 알아들을 순 없었지만 그 목소리의 온도는 정확히 느낄 수 있었답니다. 나를 바라보는 눈빛이 반짝반짝 빛나고 있었거든요. 내일도 나랑 많이 놀아주세요!`,
    mood: 'happy'
};


// 1. Generate Daily Question (Mock Only)
export const generateDailyQuestion = async (babyName: string, weeks: number): Promise<{ text: string; theme: string }> => {
  // Simulate slight delay for UX
  await new Promise(resolve => setTimeout(resolve, 800));

  const randomIndex = Math.floor(Math.random() * MOCK_QUESTIONS.length);
  const selected = MOCK_QUESTIONS[randomIndex];

  return {
    text: selected.text.replace("나", `${babyName}(이)`), 
    theme: selected.theme
  };
};

// 2. Transform Text to Baby Perspective (Keyword Matching)
export const transformToBabyPerspective = async (
  combinedParentInput: string,
  babyName: string,
  weeks: number
): Promise<Partial<DiaryEntry>> => {
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  let selectedTemplate = DEFAULT_TEMPLATE;
  
  // Find matching template based on keywords
  for (const template of DIARY_TEMPLATES) {
    if (template.keywords.some(keyword => combinedParentInput.includes(keyword))) {
        selectedTemplate = template;
        break; // Use the first matching template
    }
  }

  // Extract a snippet of the input for embedding
  const inputSnippet = combinedParentInput.length > 50 
    ? combinedParentInput.slice(0, 50) + "..." 
    : combinedParentInput;

  return {
    title: selectedTemplate.titleTemplate(babyName),
    babyContent: selectedTemplate.contentTemplate(inputSnippet),
    mood: selectedTemplate.mood,
  };
};

// 3. Generate Illustration (Mock - Mood based selection)
export const generateDiaryIllustration = async (storyText: string, mood: string = 'happy'): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const moodImages = {
      happy: [
        "https://images.unsplash.com/photo-1555252333-9f8e92e65df4?q=80&w=800&auto=format&fit=crop", // Toys/Duck
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop", // Family/Happy
      ],
      calm: [
         "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop", // Green
         "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop", // Forest
      ],
      sleepy: [
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800&auto=format&fit=crop", // Night Sky
        "https://images.unsplash.com/photo-1503023345313-0f0261c96ed5?q=80&w=1000&auto=format&fit=crop", // Camping/Night
      ],
      playful: [
        "https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800&auto=format&fit=crop", // Toys
        "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=800&auto=format&fit=crop", // Bubbles
      ]
  };
  
  const images = moodImages[mood as keyof typeof moodImages] || moodImages['happy'];
  return images[Math.floor(Math.random() * images.length)];
};

// 4. Generate Monthly Storybook (Mock)
export const generateMonthlyStorybook = async (entries: DiaryEntry[], babyName: string, gender: 'boy' | 'girl'): Promise<StoryBook> => {
  await new Promise(resolve => setTimeout(resolve, 3000));

  const role = gender === 'boy' ? '왕자' : '공주';
  const randomCover = STORYBOOK_COVERS[Math.floor(Math.random() * STORYBOOK_COVERS.length)];

  return {
    title: `${babyName} ${role}님과 첫 번째 계절`,
    coverImage: randomCover, 
    generatedDate: new Date().toISOString(),
    content: `옛날 아주 먼 옛날, 사랑스러운 ${babyName} ${role}님이 살고 있었습니다.\n\n${role}님은 매일매일 새로운 모험을 떠났어요. 어느 날은 거대한 물의 왕국(욕조)에서 첨벙첨벙 물장구를 치며 오리 친구들과 회의를 했고, 또 어느 날은 꿈나라 여행을 떠나 달님과 숨바꼭질을 했답니다.\n\n${role}님이 울음을 터뜨릴 때면 거인(엄마, 아빠)들이 나타나 따뜻한 품으로 감싸주었어요. 그 품은 세상에서 가장 안전한 성벽이었죠.\n\n"응애!" 하고 외치는 소리는 왕국을 다스리는 힘찬 명령이었고, 방긋 웃는 미소는 온 세상을 밝히는 태양과 같았습니다.\n\n${babyName} ${role}님은 무럭무럭 자라나, 이제 막 뒤집기라는 엄청난 마법을 익히기 시작했답니다. 앞으로 펼쳐질 ${role}님의 모험은 또 어떤 이야기로 채워질까요?`
  };
};