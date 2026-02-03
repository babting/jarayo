import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, X, Check, ChevronLeft, Keyboard } from 'lucide-react';

// --- Type Definitions for Web Speech API ---
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
// -------------------------------------------

interface RecordingViewProps {
  onConfirm: (text: string) => void;
  onCancel: () => void;
  question: string;
}

const RecordingView: React.FC<RecordingViewProps> = ({ onConfirm, onCancel, question }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionCtor) {
        const recognitionInstance = new SpeechRecognitionCtor();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'ko-KR';

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript((prev) => prev + " " + finalTranscript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    } else {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      onCancel();
    }
  }, [onCancel]);

  useEffect(() => {
    if (isListening) {
      timerRef.current = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-[#FDF6F0] h-[100dvh] overflow-hidden animate-fade-enter">
      {/* CSS for Blob Animation */}
      <style>{`
        @keyframes blob-bounce {
          0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: scale(1); }
          25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; transform: scale(1.05); }
          50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; transform: scale(1); }
          75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; transform: scale(1.05); }
          100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: scale(1); }
        }
        .animate-blob-custom {
          animation: blob-bounce 6s infinite ease-in-out;
        }
      `}</style>

      {/* Header - Fixed Height */}
      <div className="flex-none relative z-10 flex justify-between items-center px-6 pt-safe pb-4 h-24">
        <button onClick={onCancel} className="p-2 -ml-2 text-stone-600">
          <ChevronLeft size={28} />
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">AI Voice Note</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content - Flexible */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative z-10 w-full px-6">
        <div className="flex flex-col items-center space-y-4 md:space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">
                {isListening ? "듣고 있어요..." : "대기 중"}
                </h2>
                <p className="text-stone-400 text-sm font-medium">Listening...</p>
            </div>

            {/* Blob Visualizer - Responsive Size */}
            <div className="relative w-56 h-56 md:w-80 md:h-80 flex items-center justify-center shrink-0">
                <div 
                    className={`w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] shadow-[0_20px_50px_rgba(139,92,246,0.3)] transition-all duration-500 ease-in-out ${isListening ? 'animate-blob-custom opacity-100' : 'opacity-80 scale-90 rounded-full'}`}
                ></div>
            </div>
            
            {/* Timer */}
            <div className="bg-white/60 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm flex items-center gap-3 shrink-0">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-violet-500 animate-pulse' : 'bg-stone-300'}`} />
                <span className="font-mono text-xl text-stone-700 font-bold tracking-wider">{formatTime(timer)}</span>
            </div>
        </div>

        {/* Real-time Transcript - Scrollable Area */}
        <div className="mt-6 md:mt-10 w-full flex-1 min-h-[80px] overflow-y-auto text-center px-2 no-scrollbar">
            {transcript ? (
               <p className="text-lg font-medium text-stone-700 leading-relaxed break-keep animate-fade-in">
                 "{transcript}"
               </p>
            ) : (
               <p className="text-stone-400 text-sm">
                 {isListening ? "말씀해 주시면 텍스트로 변환됩니다." : "버튼을 눌러 답변을 시작하세요."}
               </p>
            )}
        </div>
      </div>

      {/* Footer Controls - Fixed Height */}
      <div className="flex-none relative z-10 pb-safe px-10 pt-4 flex justify-between items-end h-32 md:h-40">
         {/* Cancel Button */}
         <div className="flex flex-col items-center gap-2 mb-4">
            <button 
              onClick={onCancel} 
              className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 hover:bg-stone-50 transition-colors"
            >
                <X size={24} />
            </button>
            <span className="text-[10px] font-bold text-stone-400 uppercase">Cancel</span>
         </div>

         {/* Record/Stop Button (Center, Larger) */}
         <div className="flex flex-col items-center gap-4 mb-6">
            <button 
                onClick={toggleListening} 
                className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 active:scale-95 ${
                    isListening 
                    ? 'bg-[#8B5CF6] shadow-violet-300' 
                    : 'bg-stone-800 shadow-stone-400 hover:bg-black'
                }`}
            >
                {isListening ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}
            </button>
         </div>

         {/* Save Button */}
         <div className="flex flex-col items-center gap-2 mb-4">
            <button 
                onClick={() => onConfirm(transcript)} 
                disabled={!transcript}
                className={`w-14 h-14 rounded-full shadow-sm flex items-center justify-center transition-all ${
                    transcript 
                    ? 'bg-[#E8DCC4] text-[#5C5446] hover:bg-[#E0D0B0]' 
                    : 'bg-white text-stone-200 cursor-not-allowed'
                }`}
            >
                <Check size={24} />
            </button>
            <span className={`text-[10px] font-bold uppercase transition-colors ${transcript ? 'text-[#8C8476]' : 'text-stone-300'}`}>Save</span>
         </div>
      </div>
    </div>
  );
};

export default RecordingView;