import React from 'react';
import { Phone, Delete, UserPlus } from 'lucide-react';
import { audio } from '../lib/audio';

interface DialerProps {
  onCallNumber: (number: string) => void;
  onAddNumberToContacts: (number: string) => void;
}

export const Dialer: React.FC<DialerProps> = ({ onCallNumber, onAddNumberToContacts }) => {
  const [phoneNumber, setPhoneNumber] = React.useState('');

  const keys = [
    { label: '1', letters: ' ' },
    { label: '2', letters: 'A B C' },
    { label: '3', letters: 'D E F' },
    { label: '4', letters: 'G H I' },
    { label: '5', letters: 'J K L' },
    { label: '6', letters: 'M N O' },
    { label: '7', letters: 'P Q R S' },
    { label: '8', letters: 'T U V' },
    { label: '9', letters: 'W X Y Z' },
    { label: '*', letters: '' },
    { label: '0', letters: '+' },
    { label: '#', letters: '' },
  ];

  const handleKeyPress = (key: string) => {
    // Play actual dual-tone frequency
    audio.playDTMF(key, 180);
    setPhoneNumber((prev) => prev + key);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const handleCall = () => {
    if (phoneNumber.trim()) {
      onCallNumber(phoneNumber);
    }
  };

  return (
    <div id="dialer_tab" className="flex flex-col h-full bg-transparent text-white select-none pb-20 justify-between">
      {/* Number Display Area */}
      <div className="flex flex-col items-center justify-end flex-1 min-h-[140px] px-6 pb-4 pt-10">
        <div className="text-3xl font-light tracking-widest text-white text-center break-all max-h-[80px] overflow-y-auto w-full font-sans">
          {phoneNumber || <span className="text-slate-500/70 font-sans tracking-wide">Enter Number</span>}
        </div>
        
        {phoneNumber && (
          <div className="flex items-center space-x-4 mt-3 animate-fade-in">
            <button
              onClick={() => onAddNumberToContacts(phoneNumber)}
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/10 rounded-full transition-all"
            >
              <UserPlus size={14} />
              Add Contact
            </button>
            <button
              onClick={handleClear}
              className="text-slate-500 hover:text-slate-400 text-xs font-medium"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Grid Keypad */}
      <div className="px-8 max-w-sm mx-auto w-full">
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center">
          {keys.map((key) => (
            <button
              key={key.label}
              onClick={() => handleKeyPress(key.label)}
              className="w-16 h-16 rounded-full bg-white/[0.04] hover:bg-white/[0.12] active:bg-white/[0.2] text-white flex flex-col items-center justify-center transition-all duration-100 shadow-lg transform active:scale-95 border border-white/10"
            >
              <span className="text-2xl font-semibold leading-none">{key.label}</span>
              <span className="text-[9px] text-slate-400 tracking-wider font-medium mt-0.5 uppercase h-3">
                {key.letters}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Keys (Call, Backspace) */}
      <div className="px-8 mt-6 max-w-sm mx-auto w-full flex items-center justify-between">
        {/* Empty placeholder to keep layout centered */}
        <div className="w-16 h-16"></div>

        {/* Big Green Circular Call Button */}
        <button
          onClick={handleCall}
          disabled={!phoneNumber}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform active:scale-95 ${
            phoneNumber
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer hover:shadow-emerald-500/20 hover:shadow-xl'
              : 'bg-emerald-500/20 text-slate-500 cursor-not-allowed'
          }`}
          title="Place Call"
        >
          <Phone size={28} fill={phoneNumber ? 'currentColor' : 'none'} />
        </button>

        {/* Backspace Button */}
        <div className="w-16 h-16 flex items-center justify-center">
          {phoneNumber && (
            <button
              onClick={handleBackspace}
              className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Delete last digit"
            >
              <Delete size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
