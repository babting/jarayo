import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarModalProps {
  currentDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ currentDate, onSelect, onClose }) => {
  const [viewDate, setViewDate] = useState(currentDate ? new Date(currentDate) : new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startDay }, (_, i) => i);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    // Format YYYY-MM-DD manually to avoid timezone issues
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    onSelect(`${year}-${m}-${d}`);
    onClose();
  };

  const isSelected = (day: number) => {
    const d = new Date(currentDate);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-ink">
            {year}년 {month + 1}월
          </h3>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-stone-500" />
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <ChevronRight size={20} className="text-stone-500" />
            </button>
          </div>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-rose-400' : 'text-stone-400'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2">
          {padding.map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const selected = isSelected(day);
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`w-full aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all
                  ${selected 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105' 
                    : 'text-stone-700 hover:bg-stone-100'
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
            <button onClick={onClose} className="text-sm font-bold text-stone-400 py-2 px-6 rounded-full hover:bg-stone-100 transition-colors">
                닫기
            </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
