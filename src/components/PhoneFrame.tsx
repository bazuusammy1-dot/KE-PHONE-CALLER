import React, { useState, useEffect } from 'react';
import { Phone, Users, Grid, Mail, Wifi, Battery, BatteryCharging, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeTab: 'recents' | 'contacts' | 'dialer' | 'voicemail';
  setActiveTab: (tab: 'recents' | 'contacts' | 'dialer' | 'voicemail') => void;
  network: string;
  battery: number;
  unheardVoicemailsCount: number;
  missedCallsCount: number;
  isCallScreenOpen: boolean;
  activeCallStatus?: string;
  activeCallDuration?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  activeTab,
  setActiveTab,
  network,
  battery,
  unheardVoicemailsCount,
  missedCallsCount,
  isCallScreenOpen,
  activeCallStatus,
  activeCallDuration,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderBatteryIcon = () => {
    let color = 'bg-emerald-500';
    if (battery <= 20) color = 'bg-red-500 animate-pulse';
    else if (battery <= 50) color = 'bg-amber-400';

    return (
      <div className="flex items-center space-x-0.5">
        <span className="text-[9px] font-mono font-bold text-slate-300">{battery}%</span>
        <div className="w-5.5 h-3 border border-slate-600 rounded p-0.5 flex items-center relative">
          <div
            className={`h-full rounded-xs transition-all ${color}`}
            style={{ width: `${battery}%` }}
          />
          <div className="absolute right-[-2.5px] top-[3.5px] w-0.5 h-1 bg-slate-600 rounded-r-sm" />
        </div>
      </div>
    );
  };

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="phone_wrapper" className="relative mx-auto w-[360px] h-[740px] bg-slate-950/45 backdrop-blur-2xl rounded-[50px] p-3 border-4 border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden select-none">
      {/* Outer Glare Highlight */}
      <div className="absolute inset-0 border-[3px] border-white/10 rounded-[46px] pointer-events-none z-50" />

      {/* Dynamic Notch / Dynamic Island */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none transition-all duration-300">
        {isCallScreenOpen && activeCallStatus === 'connected' ? (
          // Expanded Dynamic Island for active call
          <div className="h-6 px-3 rounded-full bg-slate-950/90 backdrop-blur-md flex items-center space-x-2 border border-white/10 shadow-lg scale-105 transition-all">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-300 tracking-wider">
              ON CALL • {formatDuration(activeCallDuration || 0)}
            </span>
          </div>
        ) : isCallScreenOpen && activeCallStatus === 'ringing' ? (
          // Pulsing Dynamic Island for incoming call
          <div className="h-6 px-3 rounded-full bg-slate-950/90 backdrop-blur-md flex items-center space-x-2 border border-red-500/20 shadow-lg scale-105 transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[8px] font-extrabold text-red-400 tracking-widest uppercase">
              Incoming call
            </span>
          </div>
        ) : (
          // Compact Dynamic Island
          <div className="w-24 h-5 rounded-full bg-slate-950/95 border border-white/5" />
        )}
      </div>

      {/* Phone Screen Canvas Container */}
      <div id="phone_screen" className="flex-1 bg-slate-950/30 backdrop-blur-2xl rounded-[38px] overflow-hidden flex flex-col relative z-10 border border-white/10">
        
        {/* Status Bar */}
        <div id="phone_status_bar" className="h-10 px-6 pt-2 flex justify-between items-center bg-white/[0.01] backdrop-blur-md text-white text-[11px] font-semibold z-30 relative border-b border-white/5 select-none">
          <div className="flex items-center space-x-1">
            <span>{timeStr}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {network !== 'No Service' ? (
              <div className="flex items-center space-x-0.5">
                <Signal size={10} className="text-slate-300" />
                <span className="text-[9px] font-bold uppercase">{network}</span>
              </div>
            ) : (
              <span className="text-[9px] font-bold text-red-500 uppercase">No Service</span>
            )}
            {renderBatteryIcon()}
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 relative min-h-0 bg-transparent">
          {children}
        </div>

        {/* Bottom Tab Navigation Bar */}
        {!isCallScreenOpen && (
          <div id="phone_nav_bar" className="absolute bottom-0 inset-x-0 h-16 bg-slate-950/40 border-t border-white/10 flex justify-around items-center z-30 pb-2 backdrop-blur-xl">
            
            {/* Recents Tab */}
            <button
              onClick={() => setActiveTab('recents')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative ${
                activeTab === 'recents' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Phone size={20} className={activeTab === 'recents' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
                {missedCallsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full border border-slate-950 flex items-center justify-center min-w-[14px]">
                    {missedCallsCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold mt-1 tracking-wide">Recents</span>
            </button>

            {/* Contacts Tab */}
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative ${
                activeTab === 'contacts' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users size={20} className={activeTab === 'contacts' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
              <span className="text-[9px] font-bold mt-1 tracking-wide">Contacts</span>
            </button>

            {/* Dialer Tab */}
            <button
              onClick={() => setActiveTab('dialer')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative ${
                activeTab === 'dialer' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid size={20} className={activeTab === 'dialer' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
              <span className="text-[9px] font-bold mt-1 tracking-wide">Keypad</span>
            </button>

            {/* Voicemail Tab */}
            <button
              onClick={() => setActiveTab('voicemail')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative ${
                activeTab === 'voicemail' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Mail size={20} className={activeTab === 'voicemail' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
                {unheardVoicemailsCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-blue-400 rounded-full border border-slate-950" />
                )}
              </div>
              <span className="text-[9px] font-bold mt-1 tracking-wide">Voicemail</span>
            </button>
          </div>
        )}

        {/* iPhone home indicator line */}
        <div className="h-1.5 bg-slate-950/40 flex items-center justify-center pb-1">
          <div className="w-28 h-1 bg-white/30 rounded-full" />
        </div>

      </div>
    </div>
  );
};
