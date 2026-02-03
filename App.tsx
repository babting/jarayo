import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import RecordingView from './components/RecordingView';
import CalendarModal from './components/CalendarModal';
import { generateDailyQuestion, transformToBabyPerspective, generateDiaryIllustration, generateMonthlyStorybook } from './services/geminiService';
import { DiaryEntry, BabyProfile, DailyQuestion, VoiceNote, StoryBook } from './types';
import { Sparkles, Loader2, Image as ImageIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutGrid, BookOpen, Plus, Clock, Heart, Search, Wand2, RefreshCw, X, Crown, Play, Pause, ArrowRight, CheckCircle2 } from 'lucide-react';
import { storage } from './utils/storage';

// --- Mock Data Setup ---
const DEFAULT_PROFILE: BabyProfile = {
  name: "쑥쑥이",
  birthDate: "2025-01-25",
  gender: 'boy'
};

// --- Updated Demo Data (Stable URLs) ---
const DEMO_ENTRIES: DiaryEntry[] = [
  {
    id: '2024-01-29', 
    date: '2024-01-29T14:30:00.000Z',
    babyAgeWeeks: 4,
    voiceNotes: [
      { id: 'v1', timestamp: '2024-01-29T14:30:00.000Z', transcript: "우리 아가, 오늘 목욕하면서 오리 인형 보고 방긋 웃었지? 그 미소가 엄마에겐 비타민이야." },
      { id: 'v2', timestamp: '2024-01-29T14:35:00.000Z', transcript: "따뜻한 물이 좋았는지 발장구 치는 모습이 마치 인어공주 같았어. 사랑해." }
    ],
    babyContent: "오늘 나는 거대한 물의 왕국으로 모험을 떠났어요! 첨벙첨벙! 내가 발을 구를 때마다 투명한 보석들이 공중으로 튀어 올랐답니다. \n\n둥둥 떠다니는 노란 오리 친구는 나에게 다가와 비밀 이야기를 속삭여 주었어요. '너는 물의 요정이니?' 하고 묻는 것 같았죠. 하얀 구름 같은 거품들이 내 몸을 포근하게 감싸주었고, 나는 그 속에서 마음껏 헤엄쳤어요. \n\n마지막에 거인(엄마/아빠)이 커다란 수건으로 나를 감싸주었을 때는, 마치 따뜻한 구름 속에 안긴 기분이었답니다.",
    title: "첨벙첨벙! 물의 왕국 탐험",
    mood: 'happy',
    mainImageUrl: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=800&auto=format&fit=crop", // Bubbles/Pool
    gallery: [] 
  },
  {
    id: '2024-01-27', 
    date: '2024-01-27T09:00:00.000Z',
    babyAgeWeeks: 4,
    voiceNotes: [
       { id: 'v3', timestamp: '2024-01-27T09:10:00.000Z', transcript: "날씨가 좋아서 산책 나왔어. 초록색 나무들이 춤추는 거 보이지? 우리 아가도 기분이 좋은가 보네." }
    ],
    babyContent: "내 눈앞에 거대한 초록색 거인이 나타났어요! 엄마는 그걸 '나무'라고 불렀지만, 나는 알아요. 그건 바람과 춤추는 요정들의 집이라는 걸요. \n\n수많은 초록 손바닥들이 나에게 인사를 건네며 사락사락 노래를 불렀어요. 나뭇잎 사이로 쏟아지는 햇살 조각들은 마치 반짝이는 가루 같아서 잡으려고 손을 뻗었지만, 어느새 내 뺨에 닿아 따뜻한 뽀뽀를 남기고 사라졌답니다. \n\n세상은 참 신기하고 아름다운 색깔들로 가득 차 있어요. 나는 오늘 초록색 친구와 가장 친해진 것 같아요.",
    title: "초록 거인과의 만남",
    mood: 'calm',
    mainImageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop", // Green Forest
    gallery: []
  },
  {
    id: '2024-01-25', 
    date: '2024-01-25T20:00:00.000Z',
    babyAgeWeeks: 3,
    voiceNotes: [
        { id: 'v4', timestamp: '2024-01-25T20:05:00.000Z', transcript: "우리 아가 오늘 하루도 고생 많았어. 좋은 꿈 꾸고 푹 자렴. 세상에서 제일 사랑해." }
    ],
    babyContent: "눈꺼풀이 점점 무거워져요. 어두운 밤이 찾아오자 세상은 고요한 마법에 걸렸어요. 엄마의 심장 소리가 쿵, 쿵, 쿵... 세상에서 가장 편안한 자장가 같아요. \n\n나는 이제 보들보들한 이불 배를 타고 꿈의 바다로 항해를 떠날 거예요. 저기 하늘에서 달님이 은은한 등불을 비춰주고 있네요. \n\n별들이 쏟아지는 은하수 미끄럼틀을 타고 내려가면, 꿈속 친구들이 나를 기다리고 있겠죠? 내일 아침 해님이 '안녕!' 하고 깨울 때까지, 나는 아주 긴 여행을 다녀올 거예요.",
    title: "은하수 미끄럼틀 여행",
    mood: 'sleepy',
    mainImageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800&auto=format&fit=crop", // Night Sky
    gallery: []
  }
];

// --- Helper Functions ---
const calculateWeeks = (birthDate: string) => {
  const start = new Date(birthDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
};

const calculateDays = (birthDate: string) => {
  const start = new Date(birthDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days + 1; // D+1 starts from birth date
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${month}월 ${day}일 (${weekDay})`;
};

const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
};

const formatDateDot = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}. ${day}.`;
}

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

// --- Sub-Components ---

// 0. Toast Component
const Toast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => {
  return (
    <div className={`absolute bottom-28 left-1/2 transform -translate-x-1/2 z-[200] pointer-events-none transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-stone-800/90 backdrop-blur-md text-white px-6 py-3.5 rounded-full shadow-xl flex items-center gap-2.5">
        <CheckCircle2 size={18} className="text-green-400" />
        <span className="text-sm font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
};

// 1. Clock Component
const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-white/90 text-sm font-medium tracking-wide">
      {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
    </span>
  );
};

// 2. Home View
const HomeView: React.FC<{
  profile: BabyProfile;
  dailyQuestion: DailyQuestion | null;
  loadingQuestion: boolean;
  hasEntryToday: boolean;
  onOpenRecorder: () => void;
  onOpenSettings: () => void;
  bgImage: string | null;
  onBgSelect: (file: File) => void;
}> = ({ profile, dailyQuestion, loadingQuestion, hasEntryToday, onOpenRecorder, onOpenSettings, bgImage, onBgSelect }) => {
  const days = calculateDays(profile.birthDate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onBgSelect(e.target.files[0]);
    }
  };

  const DEFAULT_BG = "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200&auto=format&fit=crop"; 
  const currentBg = bgImage || DEFAULT_BG;

  const displayText = hasEntryToday
    ? "오늘도 이야기를 들려주어서 고마워,\n나한테 더 해주고 싶은 말이 있어?"
    : dailyQuestion?.text;

  return (
    <div className="relative h-full flex flex-col bg-stone-100">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />

      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-safe pb-4 mt-8 flex justify-between items-start pointer-events-none">
        <button 
          onClick={onOpenSettings} 
          className="flex flex-col items-start pointer-events-auto group"
        >
          <span className="text-rose-350 text-sm font-bold mb-0.5 tracking-tight group-hover:text-rose-200 transition-colors">
            {profile.name}
          </span>
          <span className="text-3xl font-serif italic font-bold text-white tracking-tight text-shadow-sm group-hover:text-white/90 transition-colors">
            D+{days}
          </span>
        </button>

        <div className="flex items-center gap-3 mt-1 pointer-events-auto">
          <DigitalClock />
        </div>
      </header>

      <div 
        className="absolute top-0 left-0 w-full h-[75%] z-0 cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <img 
          src={currentBg} 
          alt="Baby mood" 
          className="w-full h-full object-cover mask-image-b transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-stone-100"></div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[1px]">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2 border border-white/20">
            <ImageIcon size={16} />
            <span>배경 변경하기</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-28 pointer-events-none">
        <div className="bg-white/50 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/40 transform transition-all pointer-events-auto">
          <div className="flex items-center space-x-2 mb-4 text-rose-500">
            <Sparkles size={14} fill="currentColor" className="text-rose-500" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase opacity-100">Today's Question</span>
          </div>
          
          <div className="min-h-[60px] flex items-center justify-center mb-4">
            {loadingQuestion ? (
              <Loader2 className="animate-spin text-stone-500" />
            ) : (
              <p className="text-lg font-bold leading-relaxed text-center text-stone-900 break-keep drop-shadow-sm whitespace-pre-line">
                {displayText}
              </p>
            )}
          </div>

          <button 
            onClick={onOpenRecorder}
            className="w-full bg-[#2D2A26] text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-stone-800/20 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>답장하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Storybook View
const StorybookView: React.FC<{
  book: StoryBook;
  onClose: () => void;
  onRegenerate: () => void;
  onOrder: () => void;
}> = ({ book, onClose, onRegenerate, onOrder }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(book.content);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-[#FDFBF7] flex flex-col animate-fade-enter">
       <div className="flex-none px-6 pt-safe pb-2 flex items-center justify-between h-[52px] z-10 bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0">
          <div className="flex items-center gap-1 flex-1 min-w-0">
              <button 
                onClick={onClose} 
                className="p-1 -ml-1 rounded-full hover:bg-stone-100 transition-colors text-stone-600 shrink-0"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="font-serif font-bold text-base text-ink truncate flex-1">{book.title}</h2>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto no-scrollbar pb-10 bg-[#FDFBF7]">
          <div className="relative w-full aspect-[4/3] bg-stone-200 shadow-sm mb-6">
             <img 
                src={book.coverImage} 
                alt="Book Cover" 
                className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             <div className="absolute bottom-6 left-6 right-20 text-white">
                 <h1 className="text-2xl font-serif font-bold leading-tight drop-shadow-lg">
                     {book.title}
                 </h1>
             </div>
             <button 
                 onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                 className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg hover:bg-white/30 transition-all active:scale-95"
             >
                 {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
             </button>
          </div>

          <div className="px-6 prose prose-stone max-w-none relative">
             <p className="text-stone-700 leading-[1.8] text-[15px] font-serif text-justify whitespace-pre-line first-letter:text-4xl first-letter:font-serif first-letter:text-rose-400 first-letter:mr-2 first-letter:float-left">
                 {book.content}
             </p>
          </div>
          
          <div className="mt-12 flex items-center justify-center mb-8">
             <div className="w-16 h-[1px] bg-stone-300"></div>
             <div className="mx-3 text-stone-300 text-[10px] font-serif italic">The End</div>
             <div className="w-16 h-[1px] bg-stone-300"></div>
          </div>
       </div>

       <div className="flex-none p-6 bg-white border-t border-stone-100 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
          <button 
             onClick={onRegenerate}
             className="flex-1 py-4 rounded-xl border border-stone-200 flex items-center justify-center gap-2 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors"
          >
             <RefreshCw size={18} />
             <span>다시 만들기</span>
          </button>
          <button 
             onClick={onOrder}
             className="flex-[2] py-4 rounded-xl bg-[#2D2A26] hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
             <span>동화책 주문하기</span>
             <ArrowRight size={18} />
          </button>
       </div>
    </div>
  );
};

// 4. Order View
const OrderView: React.FC<{
  book: StoryBook;
  entries: DiaryEntry[];
  onClose: () => void;
  onConfirmOrder: () => void;
}> = ({ book, entries, onClose, onConfirmOrder }) => {
  const [coverType, setCoverType] = useState<'hard' | 'soft'>('hard');
  const [paperType, setPaperType] = useState('rendezvous');

  const papers = [
      { id: 'rendezvous', name: '랑데부 190g (고급지)', desc: '표면 감촉이 부드럽고 잉크 발색이 탁월' },
      { id: 'montblanc', name: '몽블랑 160g (내추럴)', desc: '종이 본연의 결이 살아있는 따뜻한 질감' },
      { id: 'arte', name: '아르떼 210g (프리미엄)', desc: '도톰한 두께감과 깊이 있는 색감 표현' }
  ];

  return (
    <div className="absolute inset-0 z-[120] bg-[#F7F7F5] flex flex-col animate-fade-enter font-sans">
      <div className="flex-none px-6 pt-safe h-14 flex items-center justify-center relative bg-[#F7F7F5] z-10">
        <button onClick={onClose} className="absolute left-6 p-2 -ml-2 text-stone-600">
           <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-bold text-stone-800">동화책 만들기</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-6">
        <div className="flex justify-center mb-10 mt-2">
            <div className="relative w-48 aspect-[3/4] rounded-r-md rounded-l-sm shadow-[10px_10px_30px_rgba(0,0,0,0.15),_2px_0_5px_rgba(0,0,0,0.1)] bg-white transform rotate-y-12">
                 <img src={book.coverImage} className="w-full h-full object-cover rounded-r-md rounded-l-sm opacity-90" />
                 <div className="absolute inset-0 bg-white/40 rounded-r-md"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent rounded-r-md"></div>
                 <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                     <p className="text-[8px] font-serif text-amber-500 tracking-widest mb-1 font-bold">SPECIAL EDITION</p>
                     <h2 className="text-lg font-serif font-bold text-stone-800 leading-tight mb-2 break-keep">{book.title}</h2>
                     <p className="text-[8px] text-stone-400 font-serif">Omniscient Baby View Storybook</p>
                 </div>
                 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/20 to-transparent rounded-l-sm"></div>
            </div>
        </div>

        <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-stone-800">수록될 이야기</h3>
                <span className="text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-medium">총 {entries.length}편</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                {entries.map((entry) => (
                    <div key={entry.id} className="flex-none w-24">
                        <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2 border border-stone-100">
                            <img src={entry.mainImageUrl} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-1 font-medium">{entry.title}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="mb-8">
            <h3 className="font-bold text-stone-800 mb-3">커버 종류</h3>
            <div className="flex gap-3">
                <button 
                    onClick={() => setCoverType('hard')}
                    className={`flex-1 p-4 rounded-2xl border-2 text-left relative transition-all ${coverType === 'hard' ? 'border-[#F4B942] bg-[#FFFCF5]' : 'border-transparent bg-white'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-stone-800 text-sm">하드커버</span>
                        {coverType === 'hard' ? (
                            <div className="w-5 h-5 rounded-full border-[5px] border-[#F4B942] bg-white shrink-0"></div>
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-stone-200 bg-transparent shrink-0"></div>
                        )}
                    </div>
                    <p className="text-[10px] text-stone-500 leading-relaxed break-keep">오랫동안 간직해 주는 튼튼한 고급 양장 제본</p>
                </button>
                <button 
                    onClick={() => setCoverType('soft')}
                    className={`flex-1 p-4 rounded-2xl border-2 text-left relative transition-all ${coverType === 'soft' ? 'border-[#F4B942] bg-[#FFFCF5]' : 'border-transparent bg-white'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-stone-800 text-sm">소프트커버</span>
                        {coverType === 'soft' ? (
                            <div className="w-5 h-5 rounded-full border-[5px] border-[#F4B942] bg-white shrink-0"></div>
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-stone-200 bg-transparent shrink-0"></div>
                        )}
                    </div>
                    <p className="text-[10px] text-stone-500 leading-relaxed break-keep">가볍고 부드러운 PUR 무선 제본</p>
                </button>
            </div>
        </div>

        <div className="mb-8">
             <h3 className="font-bold text-stone-800 mb-3">종이 재질</h3>
             <div className="space-y-3">
                 {papers.map((paper) => (
                     <button
                        key={paper.id}
                        onClick={() => setPaperType(paper.id)}
                        className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${paperType === paper.id ? 'border-[#F4B942] bg-[#FFFCF5]' : 'border-transparent bg-white'}`}
                     >
                        <div className="text-left">
                            <p className="text-sm font-bold text-stone-800">{paper.name}</p>
                            <p className="text-[10px] text-stone-400">{paper.desc}</p>
                        </div>
                        {paperType === paper.id ? (
                            <div className="w-5 h-5 rounded-full border-[5px] border-[#F4B942] bg-white"></div>
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-stone-200 bg-transparent"></div>
                        )}
                     </button>
                 ))}
             </div>
        </div>
      </div>

      <div className="flex-none p-6 pb-safe pt-2 bg-gradient-to-t from-[#F7F7F5] to-[#F7F7F5]/0">
          <button 
            className="w-full bg-[#2D2A26] text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
            onClick={onConfirmOrder}
          >
              <span>동화책 주문하기</span>
              <ArrowRight size={16} />
          </button>
      </div>
    </div>
  )
}

// 5. Diary View
const DiaryView: React.FC<{ 
    entries: DiaryEntry[], 
    loading: boolean, 
    onAddGalleryImage: (entryId: string, file: File) => void,
    onCreateBook: () => void,
    bookOrderStatus: 'idle' | 'processing'
}> = ({ entries, loading, onAddGalleryImage, onCreateBook, bookOrderStatus }) => {
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    entry.babyContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.date.includes(searchQuery)
  );

  const displayEntries = viewMode === 'grid' ? filteredEntries : entries;

  const handlePrevDay = () => {
    if (currentIndex < displayEntries.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleNextDay = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleGridClick = (entryId: string) => {
    const index = entries.findIndex(e => e.id === entryId);
    if (index !== -1) {
        setCurrentIndex(index);
        setViewMode('single');
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>, entryId: string) => {
    if (e.target.files && e.target.files[0]) {
      onAddGalleryImage(entryId, e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-paper pt-safe pb-32">
        <div className="relative">
             <div className="absolute inset-0 bg-rose-200 blur-xl opacity-50 rounded-full animate-pulse"></div>
             <Loader2 className="animate-spin text-rose-500 w-10 h-10 relative z-10" />
        </div>
        <div className="text-center space-y-2 mt-6">
          <p className="text-stone-600 font-bold text-lg animate-pulse">오늘의 이야기를 엮고 있어요...</p>
          <p className="text-stone-400 text-sm">여러분의 추억을 그림책으로 만들고 있어요</p>
        </div>
      </div>
    );
  }

  const isEmpty = displayEntries.length === 0;

  return (
    <div className="h-full flex flex-col bg-[#F3F0EB]/50 pt-safe pb-28">
      <div className="px-6 pt-4 pb-2 flex gap-3 z-20 items-center justify-end min-h-[58px]">
        {viewMode === 'grid' ? (
          <div className="flex-1 relative group animate-fade-in">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="text-stone-400 group-focus-within:text-rose-400 transition-colors" size={16}/>
             </div>
             <input
               className="w-full bg-white rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium shadow-sm border border-stone-100 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all placeholder-stone-300 text-stone-600"
               placeholder="추억 검색하기..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
        ) : (
          <div className="flex-1"></div> 
        )}
        
        <div className="bg-white p-1 rounded-2xl flex items-center shadow-sm border border-stone-100 shrink-0 h-[42px]">
          <button 
            onClick={() => setViewMode('single')}
            className={`w-9 h-full rounded-xl flex items-center justify-center transition-all ${viewMode === 'single' ? 'bg-rose-100 text-rose-500' : 'text-stone-300 hover:text-stone-400'}`}
          >
            <BookOpen size={18} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`w-9 h-full rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-rose-100 text-rose-500' : 'text-stone-300 hover:text-stone-400'}`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {isEmpty ? (
         <div className="flex-1 flex flex-col items-center justify-center opacity-50 px-6 text-center">
            <BookOpen size={48} className="text-stone-300 mb-4" strokeWidth={1} />
            <p className="font-medium text-lg text-stone-600">
               {searchQuery && viewMode === 'grid' ? "검색된 이야기가 없어요." : "아직 기록된 이야기가 없어요."}
            </p>
            {!searchQuery && <p className="text-sm mt-2 text-stone-400">홈에서 오늘의 질문에 답해보세요.</p>}
         </div>
      ) : (
        <>
          {viewMode === 'single' ? (
            <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
              <div className="flex justify-center mb-8 px-6 mt-2">
                <div className="bg-[#FDFBF7] px-6 py-3 rounded-full flex items-center gap-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] border border-white">
                    <button 
                      onClick={handlePrevDay} 
                      disabled={currentIndex >= displayEntries.length - 1}
                      className="text-stone-300 hover:text-stone-500 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 text-stone-600 font-bold text-sm tracking-wide">
                      <CalendarIcon size={16} className="text-rose-400 mb-0.5" />
                      <span>{formatDate(displayEntries[currentIndex].date)}</span>
                    </div>
                    <button 
                      onClick={handleNextDay} 
                      disabled={currentIndex <= 0}
                      className="text-stone-300 hover:text-stone-500 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                </div>
              </div>

              <div className="px-6 pb-10">
                <div className="mb-6">
                    <p className="text-[#A8A19A] text-[10px] font-extrabold tracking-[0.2em] mb-2 uppercase">Today's Story</p>
                    <h2 className="text-[28px] font-bold text-[#2D2A26] leading-tight break-keep">
                        {displayEntries[currentIndex].title}
                    </h2>
                </div>

                <div className="bg-white p-3 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-stone-50 mb-8 animate-fade-enter">
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-stone-100">
                        <img 
                            src={displayEntries[currentIndex].mainImageUrl} 
                            alt="Diary cover" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Heart size={10} className="text-rose-400 fill-rose-400" />
                            <span className="text-[10px] font-bold text-stone-500 tracking-tight">{formatDateShort(displayEntries[currentIndex].date)} 기록</span>
                        </div>
                    </div>
                </div>

                <div className="px-2 mb-10">
                    <p className="text-stone-600 leading-8 text-[16px] whitespace-pre-line font-medium text-justify">
                        {displayEntries[currentIndex].babyContent}
                    </p>
                </div>

                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 px-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Voice Timeline</h3>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 border border-[#F3F0EB] shadow-sm">
                        <div className="space-y-6">
                        {displayEntries[currentIndex].voiceNotes.length > 0 ? (
                            displayEntries[currentIndex].voiceNotes.map((note) => (
                                <div key={note.id} className="relative pl-6 border-l-[1.5px] border-stone-100 last:border-0 pb-1">
                                    <div className="absolute -left-[5px] top-0.5 w-2.5 h-2.5 rounded-full bg-white border-[2.5px] border-rose-200"></div>
                                    <span className="text-[10px] font-bold text-stone-300 flex items-center gap-1 mb-1.5 uppercase tracking-wide">
                                        <Clock size={10} />
                                        {formatTime(note.timestamp)}
                                    </span>
                                    <p className="text-stone-600 text-sm leading-6">
                                        "{note.transcript}"
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-stone-400 text-sm italic">기록된 음성이 없어요.</p>
                        )}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <ImageIcon size={14} className="text-stone-400" />
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Today's Gallery</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => galleryInputRef.current?.click()}
                            className="aspect-square rounded-[1.5rem] bg-white border-2 border-dashed border-stone-100 flex flex-col items-center justify-center text-stone-300 hover:border-rose-200 hover:text-rose-300 transition-all hover:bg-rose-50/50"
                        >
                            <Plus size={24} strokeWidth={1.5} />
                            <span className="text-[10px] font-bold mt-2 tracking-widest">ADD PHOTO</span>
                        </button>
                        <input 
                            type="file" 
                            ref={galleryInputRef} 
                            onChange={(e) => handleGalleryUpload(e, displayEntries[currentIndex].id)} 
                            className="hidden" 
                            accept="image/*" 
                        />

                        {displayEntries[currentIndex].gallery.map((imgUrl, idx) => (
                            <div key={idx} className="aspect-square rounded-[1.5rem] overflow-hidden bg-white shadow-sm border border-stone-50">
                                <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          ) : (
            <>
                <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 animate-fade-enter">
                  <div className="grid grid-cols-2 gap-4 pb-24">
                      {displayEntries.map((entry) => (
                        <button 
                          key={entry.id} 
                          onClick={() => handleGridClick(entry.id)}
                          className="bg-white rounded-[1.8rem] p-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] border border-stone-50 flex flex-col gap-3 group text-left transition-transform active:scale-95"
                        >
                          <div className="relative aspect-square w-full rounded-[1.4rem] overflow-hidden bg-stone-100">
                            <img 
                              src={entry.mainImageUrl} 
                              alt={entry.title} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                                <span className="text-[10px] font-bold text-stone-600 tracking-tight">{formatDateDot(entry.date)}</span>
                            </div>
                          </div>
                          
                          <div className="px-1 pb-1">
                            <h4 className="text-[13px] font-bold text-[#2D2A26] leading-snug line-clamp-1 mb-1.5">
                                {entry.title}
                            </h4>
                            <p className="text-[11px] text-[#9CA3AF] line-clamp-2 leading-relaxed font-medium">
                                {entry.babyContent}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                <button 
                    disabled={bookOrderStatus === 'processing'}
                    onClick={bookOrderStatus === 'processing' ? undefined : onCreateBook}
                    className={`absolute bottom-28 right-6 text-white pl-5 pr-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(251,113,133,0.4)] flex items-center gap-2.5 z-30 transition-transform active:scale-95 hover:shadow-lg animate-fade-in border border-white/20 ${bookOrderStatus === 'processing' ? 'bg-stone-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`}
                >
                    <Wand2 size={20} className="text-white" />
                    <span className="font-bold text-sm tracking-wide">{bookOrderStatus === 'processing' ? '동화책 제작중' : '동화책 만들기'}</span>
                </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

// 6. Profile View (Settings)
const ProfileView: React.FC<{ 
  profile: BabyProfile; 
  setProfile: (p: BabyProfile) => void;
  onBack: () => void;
}> = ({ profile, setProfile, onBack }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateSelect = (date: string) => {
    setProfile({ ...profile, birthDate: date });
  };

  return (
    <div className="h-full px-6 pt-safe bg-white z-50 absolute inset-0 animate-fade-enter">
      <div className="flex items-center gap-4 mb-8 mt-8">
         <button onClick={onBack} className="p-2 -ml-2 hover:bg-stone-100 rounded-full">
            <ChevronLeft size={24} />
         </button>
         <h1 className="text-2xl font-bold text-ink">설정</h1>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-500">아기 이름 (태명)</label>
          <input 
            type="text" 
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full text-xl font-bold border-b-2 border-stone-100 py-3 focus:outline-none focus:border-rose-400 bg-transparent transition-colors placeholder-stone-200"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-stone-500">성별</label>
          <div className="flex gap-4">
            <button 
                onClick={() => setProfile({...profile, gender: 'boy'})}
                className={`flex-1 py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    profile.gender === 'boy' 
                    ? 'border-blue-200 bg-blue-50 text-blue-500 shadow-sm' 
                    : 'border-stone-50 bg-stone-50 text-stone-300 hover:border-blue-100'
                }`}
            >
                <Crown size={24} fill={profile.gender === 'boy' ? 'currentColor' : 'none'} />
                <span className="text-sm font-bold">왕자님</span>
            </button>
            <button 
                onClick={() => setProfile({...profile, gender: 'girl'})}
                className={`flex-1 py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    profile.gender === 'girl' 
                    ? 'border-rose-200 bg-rose-50 text-rose-500 shadow-sm' 
                    : 'border-stone-50 bg-stone-50 text-stone-300 hover:border-rose-100'
                }`}
            >
                <Crown size={24} fill={profile.gender === 'girl' ? 'currentColor' : 'none'} />
                <span className="text-sm font-bold">공주님</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-500">태어난 날</label>
          <div 
             onClick={() => setIsCalendarOpen(true)}
             className="w-full flex items-center justify-between border-b-2 border-stone-100 py-3 cursor-pointer hover:border-rose-400 transition-colors group"
          >
             <span className="text-xl font-medium text-ink">{profile.birthDate}</span>
             <CalendarIcon size={20} className="text-stone-300 group-hover:text-rose-400" />
          </div>
        </div>

        <div className="pt-8">
           <div className="bg-stone-50 rounded-2xl p-6 flex items-center gap-5 border border-stone-100">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center font-bold text-lg">
                D
              </div>
              <div>
                <p className="text-lg font-bold text-stone-800">D+{calculateDays(profile.birthDate)}</p>
                <p className="text-sm text-stone-500 font-medium">우리 {profile.name} {profile.gender === 'boy' ? '왕자' : '공주'}님과 함께한 시간</p>
              </div>
           </div>
        </div>
      </div>

      {isCalendarOpen && (
        <CalendarModal 
          currentDate={profile.birthDate} 
          onSelect={handleDateSelect} 
          onClose={() => setIsCalendarOpen(false)} 
        />
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'diary' | 'record' | 'settings' | 'storybook' | 'order'>('home');

  const [profile, setProfile] = useState<BabyProfile>(DEFAULT_PROFILE);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [homeBgImage, setHomeBgImage] = useState<string | null>(null);
  
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestion | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const [processingDiary, setProcessingDiary] = useState(false);

  const [storyBook, setStoryBook] = useState<StoryBook | null>(null);
  const [isGeneratingBook, setIsGeneratingBook] = useState(false);
  
  const [bookOrderStatus, setBookOrderStatus] = useState<'idle' | 'processing'>('idle');

  const [toast, setToast] = useState<{message: string; visible: boolean}>({message: '', visible: false});

  const todayId = new Date().toLocaleDateString('en-CA');
  const hasEntryToday = entries.some(e => e.id === todayId);

  useEffect(() => {
    const initData = async () => {
        try {
            const savedProfile = await storage.loadProfile();
            const savedEntries = await storage.loadEntries();
            const savedBg = await storage.loadBgImage();

            if (savedProfile) setProfile(savedProfile);
            
            if (savedEntries && savedEntries.length > 0) {
                setEntries(savedEntries);
            } else {
                setEntries(DEMO_ENTRIES);
            }

            if (savedBg) setHomeBgImage(savedBg);
        } catch (e) {
            console.error("Failed to load initial data", e);
            setEntries(DEMO_ENTRIES);
        }
    };
    initData();
  }, []);

  useEffect(() => {
    const init = async () => {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const savedQuestion = await storage.loadDailyQuestion();
      
      if (savedQuestion && savedQuestion.date === todayStr) {
        setDailyQuestion(savedQuestion);
        return;
      }

      setLoadingQuestion(true);
      const weeks = calculateWeeks(profile.birthDate);
      const q = await generateDailyQuestion(profile.name, weeks);
      
      const newQuestion: DailyQuestion = { 
        id: Date.now().toString(), 
        text: q.text, 
        theme: q.theme,
        date: todayStr 
      };

      setDailyQuestion(newQuestion);
      await storage.saveDailyQuestion(newQuestion);
      setLoadingQuestion(false);
    };

    init();
  }, [profile.name, profile.birthDate]);

  const handleProfileUpdate = async (newProfile: BabyProfile) => {
    setProfile(newProfile);
    await storage.saveProfile(newProfile);
  };

  const handleBgSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        setHomeBgImage(dataUrl);
        await storage.saveBgImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryImage = (entryId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        
        const updatedEntries = entries.map(entry => {
            if (entry.id === entryId) {
                return { ...entry, gallery: [...entry.gallery, dataUrl] };
            }
            return entry;
        });
        
        setEntries(updatedEntries);
        await storage.saveEntries(updatedEntries);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRecordingConfirm = async (transcript: string) => {
    setCurrentView('diary');
    setProcessingDiary(true);

    try {
      const todayId = new Date().toLocaleDateString('en-CA');
      const nowIso = new Date().toISOString();
      const weeks = calculateWeeks(profile.birthDate);
      
      const existingEntryIndex = entries.findIndex(e => e.id === todayId);
      const existingEntry = existingEntryIndex !== -1 ? entries[existingEntryIndex] : null;

      const newVoiceNote: VoiceNote = {
          id: Date.now().toString(),
          timestamp: nowIso,
          transcript: transcript
      };

      const previousTranscripts = existingEntry ? existingEntry.voiceNotes.map(v => v.transcript) : [];
      const allTranscripts = [...previousTranscripts, transcript];
      const combinedText = allTranscripts.join('\n\n');

      const generated = await transformToBabyPerspective(combinedText, profile.name, weeks);
      
      const textContent = generated.babyContent || "무슨 말을 했는지 잘 모르겠지만, 사랑한다는 건 알아요.";
      const mood = (generated.mood as any) || 'happy';
      
      const illustrationUrl = await generateDiaryIllustration(textContent, mood);
      
      let updatedEntries = [...entries];

      if (existingEntry) {
          const updatedEntry: DiaryEntry = {
              ...existingEntry,
              babyContent: textContent,
              title: generated.title || existingEntry.title,
              mood: mood,
              voiceNotes: [...existingEntry.voiceNotes, newVoiceNote],
              gallery: [...existingEntry.gallery, illustrationUrl],
              mainImageUrl: illustrationUrl
          };
          updatedEntries[existingEntryIndex] = updatedEntry;
      } else {
          const newEntry: DiaryEntry = {
            id: todayId,
            date: nowIso,
            babyAgeWeeks: weeks,
            voiceNotes: [newVoiceNote],
            babyContent: textContent,
            title: generated.title || "사랑의 기록",
            mood: mood,
            mainImageUrl: illustrationUrl,
            gallery: [illustrationUrl]
          };
          updatedEntries = [newEntry, ...entries];
      }

      setEntries(updatedEntries);
      await storage.saveEntries(updatedEntries);

    } catch (e) {
      console.error(e);
      alert("일기를 생성하는 도중 오류가 발생했습니다.");
    } finally {
      setProcessingDiary(false);
    }
  };

  const handleCreateBook = async () => {
    setStoryBook(null);
    setIsGeneratingBook(true);
    try {
       const book = await generateMonthlyStorybook(entries, profile.name, profile.gender);
       setStoryBook(book);
       setCurrentView('storybook');
    } catch (e) {
       console.error(e);
       alert("동화책 생성 중 오류가 발생했습니다.");
    } finally {
       setIsGeneratingBook(false);
    }
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleOrderConfirm = () => {
    setBookOrderStatus('processing');
    setCurrentView('diary');
    setStoryBook(null);
    showToast("동화책 주문이 완료되었습니다.");
  };

  // Determine which tab is active for the navigation bar
  const activeTab = currentView === 'diary' ? 'diary' : 'home';
  const showNavigation = ['home', 'diary'].includes(currentView);

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView 
            profile={profile}
            dailyQuestion={dailyQuestion}
            loadingQuestion={loadingQuestion}
            hasEntryToday={hasEntryToday}
            onOpenRecorder={() => setCurrentView('record')}
            onOpenSettings={() => setCurrentView('settings')}
            bgImage={homeBgImage}
            onBgSelect={handleBgSelect}
          />
        );
      case 'diary':
        return (
          <DiaryView 
            entries={entries} 
            loading={processingDiary} 
            onAddGalleryImage={handleAddGalleryImage}
            onCreateBook={handleCreateBook}
            bookOrderStatus={bookOrderStatus}
          />
        );
      case 'settings':
        return (
           <ProfileView 
              profile={profile} 
              setProfile={handleProfileUpdate} 
              onBack={() => setCurrentView('home')}
           />
        );
      case 'record':
        return dailyQuestion ? (
            <RecordingView 
              question={hasEntryToday ? "오늘도 이야기를 들려주어서 고마워, 나한테 더 해주고 싶은 말이 있어?" : dailyQuestion.text}
              onConfirm={handleRecordingConfirm}
              onCancel={() => setCurrentView('home')}
            />
          ) : null;
      case 'storybook':
        return storyBook ? (
             <StorybookView 
                book={storyBook} 
                onClose={() => setCurrentView('diary')}
                onRegenerate={handleCreateBook}
                onOrder={() => setCurrentView('order')}
             />
           ) : null;
      case 'order':
        return storyBook ? (
            <OrderView 
              book={storyBook}
              entries={entries}
              onClose={() => setCurrentView('storybook')}
              onConfirmOrder={handleOrderConfirm}
            />
           ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center bg-stone-200 min-h-screen font-sans">
      <div className="w-full max-w-md bg-white h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col">
        
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <div className="flex-1 h-full">
            {renderContent()}
          </div>

          {isGeneratingBook && (
            <div className="absolute inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center flex-col text-white animate-fade-in">
                 <Loader2 className="animate-spin mb-4 text-rose-300" size={48} />
                 <p className="font-bold text-lg">{profile.name} {profile.gender === 'boy' ? '왕자님' : '공주님'}의 이야기를 엮는 중...</p>
                 <p className="text-sm opacity-80 mt-2">잠시만 기다려주세요</p>
            </div>
          )}

          <Toast message={toast.message} visible={toast.visible} />
        </main>

        {showNavigation && (
           <Navigation 
             activeTab={activeTab} 
             onTabChange={(tab) => setCurrentView(tab as any)} 
           />
        )}
      </div>
    </div>
  );
};

export default App;