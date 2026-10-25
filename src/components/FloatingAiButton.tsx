import React from 'react';
import { MessageSquareText } from 'lucide-react';

interface FloatingAiButtonProps {
  onClick: () => void;
}

export const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.98] text-white px-5 py-3 rounded-full shadow-lg shadow-teal-950/20 flex items-center gap-2.5 font-semibold text-sm transition-all cursor-pointer group hover:shadow-xl"
    >
      <MessageSquareText className="w-5 h-5 text-teal-200 group-hover:scale-110 transition-transform" />
      <span>AI Health Assistant</span>
    </button>
  );
};
