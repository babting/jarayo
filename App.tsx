import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from './components/Navigation';
import RecordingView from './components/RecordingView';
import CalendarModal from './components/CalendarModal';
import { generateDailyQuestion, transformToBabyPerspective, generateDiaryIllustration } from './services/geminiService';
import { DiaryEntry, BabyProfile, DailyQuestion, VoiceNote } from './types';
import { Sparkles, Loader2, Settings, Image as ImageIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, LayoutGrid, BookOpen, Plus, Clock, Heart } from 'lucide-react';
import { storage } from './utils/storage';

// --- Mock Data Setup ---
const DEFAULT_PROFILE: BabyProfile = {
  name: "여름이",
  birthDate: "2024-01-01",
};

// --- Demo Data for Preview ---
const DEMO_ENTRY: DiaryEntry = {
  id: '2024-01-29', 
  date: '2024-01-29T14:30:00.000Z',
  babyAgeWeeks: 4,
  voiceNotes: [
    { id: 'v1', timestamp: '2024-01-29T10:00:00.000Z', transcript: "오늘 우리 아기가 뒤집기를 시도하려고 낑낑거리는 모습이 너무 귀여웠다." },
    { id: 'v2', timestamp: '2024-01-29T14:30:00.000Z', transcript: "비록 성공은 못했지만 노력하는 모습에 감동받았어. 사랑해 우리 아가." }
  ],
  babyContent: "오늘 나는 세상을 거꾸로 뒤집어보고 싶어서 몸을 이리저리 비틀어봤어요! \n\n아직은 내 몸이 마음대로 움직이지 않지만, 옆에서 '영차 영차' 응원해줘서 힘이 났답니다. \n\n언젠가는 꼭 성공해서 깜짝 놀라게 해줄 거예요!",
  title: "영차! 세상을 뒤집을 꿈",
  mood: 'playful',
  mainImageUrl: "https://picsum.photos/seed/baby_demo_29/800/800",
  gallery: [
    "https://picsum.photos/seed/baby_demo_29/800/800",
    "https://picsum.photos/seed/baby_extra_1/800/800"
  ]
};

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
  const weeks = calculateWeeks(profile.birthDate);
  const days = calculateDays(profile.birthDate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onBgSelect(e.target.files[0]);
    }
  };

  const currentBg = bgImage || `https://picsum.photos/seed/baby${weeks}/800/1000`;

  // Determine the display text
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
          <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Bell size={18} fill="currentColor" className="text-white/90" />
          </button>
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

// 2. Diary View (Refactored: Fairytale Aesthetic)
const DiaryView: React.FC<{ 
    entries: DiaryEntry[], 
    loading: boolean, 
    onAddGalleryImage: (entryId: string, file: File) => void 
}> = ({ entries, loading, onAddGalleryImage }) => {
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [currentIndex, setCurrentIndex] = useState(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entries.length > 0) {
      setCurrentIndex(0);
    }
  }, [entries.length]);

  const handlePrevDay = () => {
    if (currentIndex < entries.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleNextDay = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleGridClick = (index: number) => {
    setCurrentIndex(index);
    setViewMode('single');
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

  if (entries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-paper pt-safe pb-32 opacity-40">
        <p className="font-medium text-lg text-stone-600">아직 기록된 이야기가 없어요.</p>
        <p className="text-sm mt-2 text-stone-400">홈에서 오늘의 질문에 답해보세요.</p>
      </div>
    );
  }

  const currentEntry = entries[currentIndex];

  return (
    <div className="h-full flex flex-col bg-[#F3F0EB]/50 pt-safe pb-28">
      {/* View Switcher - Absolute Top Right */}
      <div className="absolute top-safe right-6 z-10 py-4">
        <div className="bg-[#F3F0EB] p-1 rounded-full flex items-center shadow-sm border border-white/50">
          <button 
            onClick={() => setViewMode('single')}
            className={`p-2 rounded-full transition-all ${viewMode === 'single' ? 'bg-white shadow-sm text-rose-500' : 'text-stone-400'}`}
          >
            <BookOpen size={16} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-rose-500' : 'text-stone-400'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'single' ? (
        <div className="flex-1 overflow-y-auto no-scrollbar pt-20">
          
          {/* Header Navigation Pill */}
          <div className="flex justify-center mb-8 px-6 mt-2">
            <div className="bg-[#FDFBF7] px-6 py-3 rounded-full flex items-center gap-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] border border-white">
                <button 
                  onClick={handlePrevDay} 
                  disabled={currentIndex >= entries.length - 1}
                  className="text-stone-300 hover:text-stone-500 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 text-stone-600 font-bold text-sm tracking-wide">
                   <CalendarIcon size={16} className="text-rose-400 mb-0.5" />
                   <span>{formatDate(currentEntry.date)}</span>
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
            {/* Title Section */}
            <div className="mb-6">
                <p className="text-[#A8A19A] text-[10px] font-extrabold tracking-[0.2em] mb-2 uppercase">Today's Story</p>
                <h2 className="text-[28px] font-bold text-[#2D2A26] leading-tight break-keep">
                    {currentEntry.title}
                </h2>
            </div>

            {/* Main Image Card */}
            <div className="bg-white p-3 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-stone-50 mb-8 animate-fade-enter">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-stone-100">
                    <img 
                        src={currentEntry.mainImageUrl} 
                        alt="Diary cover" 
                        className="w-full h-full object-cover"
                    />
                    {/* Floating Date Badge */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Heart size={10} className="text-rose-400 fill-rose-400" />
                        <span className="text-[10px] font-bold text-stone-500 tracking-tight">{formatDateShort(currentEntry.date)} 기록</span>
                    </div>
                </div>
            </div>

            {/* Baby Content */}
            <div className="px-2 mb-10">
                <p className="text-stone-600 leading-8 text-[16px] whitespace-pre-line font-medium text-justify">
                    {currentEntry.babyContent}
                </p>
            </div>

            {/* Mom's Voice Timeline */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4 px-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
                   <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Mom's Voice Timeline</h3>
                </div>
                
                <div className="bg-white rounded-3xl p-6 border border-[#F3F0EB] shadow-sm">
                    <div className="space-y-6">
                    {currentEntry.voiceNotes.map((note, index) => (
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
                    ))}
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <ImageIcon size={14} className="text-stone-400" />
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Today's Gallery</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* Add Button */}
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
                        onChange={(e) => handleGalleryUpload(e, currentEntry.id)} 
                        className="hidden" 
                        accept="image/*" 
                    />

                    {/* Images */}
                    {currentEntry.gallery.map((imgUrl, idx) => (
                        <div key={idx} className="aspect-square rounded-[1.5rem] overflow-hidden bg-white shadow-sm border border-stone-50">
                            <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grid Mode - Card/Polaroid Style */
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-20 animate-fade-enter">
           <div className="grid grid-cols-2 gap-4 pb-10">
              {entries.map((entry, idx) => (
                <button 
                  key={entry.id} 
                  onClick={() => handleGridClick(idx)}
                  className="bg-white rounded-[1.8rem] p-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] border border-stone-50 flex flex-col gap-3 group text-left transition-transform active:scale-95"
                >
                  <div className="relative aspect-square w-full rounded-[1.4rem] overflow-hidden bg-stone-100">
                     <img 
                       src={entry.mainImageUrl} 
                       alt={entry.title} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                     />
                     {/* Badge Top Left */}
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
      )}
    </div>
  );
};

// 3. Profile View (Settings)
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
                <p className="text-sm text-stone-500 font-medium">우리 아기와 함께한 시간</p>
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
  const [currentTab, setCurrentTab] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profile, setProfile] = useState<BabyProfile>(DEFAULT_PROFILE);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [homeBgImage, setHomeBgImage] = useState<string | null>(null);
  
  // Daily Question State
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestion | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // Recording State
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);
  const [processingDiary, setProcessingDiary] = useState(false);

  // Check if today has an entry
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
                setEntries([DEMO_ENTRY]);
            }

            if (savedBg) setHomeBgImage(savedBg);
        } catch (e) {
            console.error("Failed to load initial data", e);
            setEntries([DEMO_ENTRY]);
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
    setIsRecordingOpen(false);
    setCurrentTab('diary');
    setProcessingDiary(true);

    try {
      const todayId = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const nowIso = new Date().toISOString();
      const weeks = calculateWeeks(profile.birthDate);
      
      // Find if today's entry exists
      const existingEntryIndex = entries.findIndex(e => e.id === todayId);
      const existingEntry = existingEntryIndex !== -1 ? entries[existingEntryIndex] : null;

      // Create new voice note
      const newVoiceNote: VoiceNote = {
          id: Date.now().toString(),
          timestamp: nowIso,
          transcript: transcript
      };

      // Combine transcripts for AI
      const previousTranscripts = existingEntry ? existingEntry.voiceNotes.map(v => v.transcript) : [];
      const allTranscripts = [...previousTranscripts, transcript];
      const combinedText = allTranscripts.join('\n\n');

      // 1. Generate/Update Text Content (Aggregated)
      const generated = await transformToBabyPerspective(combinedText, profile.name, weeks);
      
      const textContent = generated.babyContent || "무슨 말을 했는지 잘 모르겠지만, 사랑한다는 건 알아요.";
      const mood = (generated.mood as any) || 'happy';
      
      // 2. Generate NEW Illustration for this specific moment
      // We generate a new image every time to capture the latest mood/story
      const illustrationUrl = await generateDiaryIllustration(textContent, mood);
      
      let updatedEntries = [...entries];

      if (existingEntry) {
          // Update existing entry
          const updatedEntry: DiaryEntry = {
              ...existingEntry,
              // Update content with new aggregated story
              babyContent: textContent,
              title: generated.title || existingEntry.title,
              mood: mood,
              // Add new voice note
              voiceNotes: [...existingEntry.voiceNotes, newVoiceNote],
              // Add new image to gallery
              gallery: [...existingEntry.gallery, illustrationUrl],
              // Update main cover to the latest image
              mainImageUrl: illustrationUrl
          };
          updatedEntries[existingEntryIndex] = updatedEntry;
      } else {
          // Create new entry
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

  return (
    <div className="flex justify-center bg-stone-200 min-h-screen font-sans">
      <div className="w-full max-w-md bg-white h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col">
        
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {currentTab === 'home' && (
            <div className="flex-1 h-full">
              <HomeView 
                profile={profile}
                dailyQuestion={dailyQuestion}
                loadingQuestion={loadingQuestion}
                hasEntryToday={hasEntryToday}
                onOpenRecorder={() => setIsRecordingOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                bgImage={homeBgImage}
                onBgSelect={handleBgSelect}
              />
            </div>
          )}
          {currentTab === 'diary' && (
            <div className="flex-1 h-full">
              <DiaryView 
                entries={entries} 
                loading={processingDiary} 
                onAddGalleryImage={handleAddGalleryImage}
              />
            </div>
          )}

          {isSettingsOpen && (
             <ProfileView 
                profile={profile} 
                setProfile={handleProfileUpdate} 
                onBack={() => setIsSettingsOpen(false)}
             />
          )}
        </main>

        {isRecordingOpen && dailyQuestion && (
          <RecordingView 
            question={hasEntryToday ? "오늘도 이야기를 들려주어서 고마워, 나한테 더 해주고 싶은 말이 있어?" : dailyQuestion.text}
            onConfirm={handleRecordingConfirm}
            onCancel={() => setIsRecordingOpen(false)}
          />
        )}

        {!isSettingsOpen && !isRecordingOpen && (
           <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
        )}
      </div>
    </div>
  );
};

export default App;