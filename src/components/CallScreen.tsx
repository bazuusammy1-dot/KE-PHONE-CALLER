import React, { useEffect, useState, useRef } from 'react';
import { ActiveCall, CallStatus, ScriptOption, Contact } from '../types';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Video, Grid, Users, Disc, UserPlus } from 'lucide-react';
import { audio } from '../lib/audio';
import { CALLING_SCRIPTS } from '../lib/scripts';

interface CallScreenProps {
  activeCall: ActiveCall;
  contacts: Contact[];
  onAcceptCall: () => void;
  onDeclineCall: () => void;
  onHangUpCall: () => void;
  onSelectScriptOption: (option: ScriptOption) => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  activeCall,
  contacts,
  onAcceptCall,
  onDeclineCall,
  onHangUpCall,
  onSelectScriptOption,
  onToggleMute,
  onToggleSpeaker,
  onAddContact,
}) => {
  const [showSaveOverlay, setShowSaveOverlay] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [callTimer, setCallTimer] = useState(0);
  const [showKeypadGrid, setShowKeypadGrid] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [dialogueText, setDialogueText] = useState<string>('');
  const [dialogueOptions, setDialogueOptions] = useState<ScriptOption[]>([]);
  const [isCallerSpeaking, setIsCallerSpeaking] = useState(false);
  
  const timerIntervalRef = useRef<any>(null);
  const speechTimeoutRef = useRef<any>(null);

  // Sound effects based on status changes
  useEffect(() => {
    if (activeCall.status === 'ringing') {
      audio.startRingtone();
    } else if (activeCall.status === 'dialing') {
      audio.startDialingTone();
    } else if (activeCall.status === 'connected') {
      audio.stopRingtone();
      audio.stopDialingTone();
      audio.playConnectChirp();

      // Start duration timer
      setCallTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);

      // Trigger initial script dialogues if script is bound
      if (activeCall.scriptId) {
        loadScriptNode(activeCall.scriptId, activeCall.currentNodeId || 'start');
      }
    } else if (activeCall.status === 'voicemail') {
      audio.stopRingtone();
      audio.stopDialingTone();
      
      // Start duration timer
      setCallTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);

      if (activeCall.scriptId) {
        loadScriptNode(activeCall.scriptId, activeCall.currentNodeId || 'voicemail_node');
      }
    } else if (activeCall.status === 'disconnected') {
      audio.stopRingtone();
      audio.stopDialingTone();
      audio.stopSpeaking();
      audio.playDisconnectBeeps();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [activeCall.status, activeCall.scriptId]);

  // Sync script nodes if they change via outside trigger or options
  useEffect(() => {
    if (activeCall.status === 'connected' && activeCall.scriptId && activeCall.currentNodeId) {
      loadScriptNode(activeCall.scriptId, activeCall.currentNodeId);
    }
  }, [activeCall.currentNodeId]);

  const loadScriptNode = (scriptId: string, nodeId: string) => {
    const script = CALLING_SCRIPTS[scriptId];
    if (!script) return;

    const node = script.nodes[nodeId];
    if (!node) return;

    // Set text and clear options while speaking
    setDialogueText(node.text);
    setDialogueOptions([]);
    setIsCallerSpeaking(true);
    audio.stopSpeaking();

    // Read dialogue out loud using Web Speech API synthesis
    audio.speakText(node.text, () => {
      setIsCallerSpeaking(false);
      setDialogueOptions(node.options);
    });
  };

  const handleOptionClick = (option: ScriptOption) => {
    onSelectScriptOption(option);
  };

  const handleDialDTMF = (key: string) => {
    audio.playDTMF(key, 150);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const contactMatch = contacts.find(
    (c) => c.phone.replace(/\D/g, '') === activeCall.callerNumber.replace(/\D/g, '')
  );
  const resolvedName = contactMatch ? contactMatch.name : activeCall.callerName;
  const resolvedAvatarGradient = contactMatch
    ? contactMatch.avatarColor
    : (activeCall.scriptId ? CALLING_SCRIPTS[activeCall.scriptId]?.avatarColor : 'from-indigo-500 to-purple-600');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSaveContactInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;

    const gradients = [
      'from-red-400 to-pink-500',
      'from-orange-400 to-amber-500',
      'from-emerald-400 to-teal-500',
      'from-blue-400 to-indigo-500',
      'from-purple-400 to-fuchsia-500',
      'from-cyan-400 to-blue-500',
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    onAddContact({
      name: saveName.trim(),
      phone: activeCall.callerNumber,
      email: 'no-email@phone.app',
      avatarColor: randomGradient,
      isFavorite: false,
    });

    setShowSaveOverlay(false);
    setSaveName('');
  };

  return (
    <div id="call_screen" className="absolute inset-0 bg-slate-950/45 backdrop-blur-2xl text-white flex flex-col justify-between p-6 select-none z-40 animate-fade-in font-sans">
      {/* Top Header - Caller details */}
      <div className="flex flex-col items-center pt-8 text-center">
        {/* Status indicator badge */}
        <div className="mb-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <span className={`w-2 h-2 rounded-full ${
            activeCall.status === 'connected' ? 'bg-emerald-500 animate-pulse' :
            activeCall.status === 'ringing' ? 'bg-amber-400 animate-ping' :
            activeCall.status === 'dialing' ? 'bg-blue-400 animate-pulse' :
            activeCall.status === 'voicemail' ? 'bg-red-500 animate-pulse' :
            'bg-slate-500'
          }`} />
          <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-300">
            {activeCall.status === 'ringing' && 'Incoming Call'}
            {activeCall.status === 'dialing' && 'Calling...'}
            {activeCall.status === 'connected' && 'Connected'}
            {activeCall.status === 'voicemail' && 'Recording Voicemail'}
            {activeCall.status === 'disconnected' && 'Call Ended'}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          {resolvedName}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-slate-400 font-medium">
            {activeCall.status === 'connected' || activeCall.status === 'voicemail'
              ? formatTimer(callTimer)
              : activeCall.callerNumber}
          </p>
          {!contactMatch && activeCall.callerNumber !== '🔒 PRIVATE NUMBER' && (
            <button
              onClick={() => setShowSaveOverlay(true)}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              + Save
            </button>
          )}
        </div>
      </div>

      {/* Main Center Area: Avatar, Dialogue script, or DTMF keypad */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 px-2 min-h-0">
        {activeCall.status === 'ringing' || activeCall.status === 'dialing' || activeCall.status === 'disconnected' ? (
          // Avatar for standard alert modes
          <div className="relative">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-tr ${resolvedAvatarGradient} flex items-center justify-center text-4xl font-bold text-white shadow-2xl relative z-10 border border-white/20`}>
              {getInitials(resolvedName)}
            </div>
            {activeCall.status === 'ringing' && (
              <>
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping z-0 scale-125" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping z-0 scale-150" style={{ animationDuration: '3s' }}></div>
              </>
            )}
          </div>
        ) : activeCall.status === 'connected' || activeCall.status === 'voicemail' ? (
          <div className="w-full h-full flex flex-col justify-between items-center space-y-4">
            {/* Custom Interactive Scripts view or Mock Face Call View */}
            {videoActive ? (
              // Simulated FaceTime/Video Call layout
              <div className="w-full flex-1 bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden relative shadow-inner flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-2 border border-white/10 animate-bounce">
                    <Video size={24} className="text-blue-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium font-mono">Connecting to camera uplink...</span>
                </div>
                
                {/* Simulated self preview card */}
                <div className="absolute bottom-3 right-3 w-20 h-28 bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                  <span className="text-[9px] text-slate-500 text-center uppercase font-bold tracking-wider">User</span>
                </div>
              </div>
            ) : showKeypadGrid ? (
              // Mini Keypad Dial During Call
              <div className="w-full max-w-xs p-4 bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/10">
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleDialDTMF(key)}
                      className="w-11 h-11 rounded-full bg-white/[0.05] hover:bg-white/10 text-white font-semibold text-lg flex items-center justify-center transition-transform active:scale-90 border border-white/5"
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowKeypadGrid(false)}
                  className="text-xs text-blue-400 font-semibold text-center w-full mt-3 block"
                >
                  Hide Keypad
                </button>
              </div>
            ) : (
              // Interactive Dialogue Box for Conversation Trees
              <div className="w-full flex-1 flex flex-col justify-center space-y-4">
                {/* Caller dialogue subtitles */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 rounded-3xl relative shadow-xl flex-1 flex flex-col justify-center items-center text-center">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-blue-500 shadow-md">
                    Live Call Audio
                  </div>
                  
                  {isCallerSpeaking && (
                    <div className="flex space-x-1 items-center justify-center mb-3">
                      <span className="w-1.5 h-3 bg-blue-400 rounded-full animate-pulse" />
                      <span className="w-1.5 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1.5 h-3.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  )}

                  <p className="text-[15px] font-medium text-slate-200 leading-relaxed max-h-[140px] overflow-y-auto w-full italic px-2">
                    "{dialogueText || 'Connecting speech engine...'}"
                  </p>
                </div>

                {/* User Responses selector */}
                {dialogueOptions.length > 0 && (
                  <div className="space-y-2 w-full animate-slide-up">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                      Choose Your Response:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {dialogueOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(opt)}
                          className="w-full bg-white/[0.04] hover:bg-blue-600/60 border border-white/10 hover:border-blue-500/30 text-slate-200 hover:text-white p-3 rounded-2xl text-xs font-semibold text-left transition-all hover:translate-x-1 shadow-md"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Bottom Actions Bar */}
      <div className="pb-8">
        {activeCall.status === 'ringing' ? (
          // Incoming Call Buttons: Red Decline & Green Accept
          <div className="flex justify-around items-center max-w-xs mx-auto animate-slide-up">
            <button
              onClick={onDeclineCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-90 duration-100">
                <PhoneOff size={24} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-300">Decline</span>
            </button>

            <button
              onClick={onAcceptCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-90 duration-100 animate-pulse">
                <Phone size={24} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-300">Answer</span>
            </button>
          </div>
        ) : (
          // Connected / Dialing: Standard Action controls + Red Hangup Button
          <div className="space-y-6 max-w-sm mx-auto">
            {/* Actions grid: Mute, Speaker, Keypad, FaceTime */}
            {(activeCall.status === 'connected' || activeCall.status === 'voicemail') && (
              <div className="grid grid-cols-4 gap-4 justify-items-center">
                <button
                  onClick={onToggleMute}
                  className={`flex flex-col items-center gap-1.5 transition-colors ${
                    activeCall.isMuted ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mute Voice"
                >
                  <div className={`p-3 rounded-full border transition-all ${
                    activeCall.isMuted ? 'bg-blue-600/30 border-blue-500/40 shadow-lg' : 'bg-white/[0.04] border-white/10'
                  }`}>
                    {activeCall.isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </div>
                  <span className="text-[10px] font-medium">Mute</span>
                </button>

                <button
                  onClick={onToggleSpeaker}
                  className={`flex flex-col items-center gap-1.5 transition-colors ${
                    activeCall.isSpeaker ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Speakerphone"
                >
                  <div className={`p-3 rounded-full border transition-all ${
                    activeCall.isSpeaker ? 'bg-blue-600/30 border-blue-500/40 shadow-lg' : 'bg-white/[0.04] border-white/10'
                  }`}>
                    <Volume2 size={18} />
                  </div>
                  <span className="text-[10px] font-medium">Speaker</span>
                </button>

                <button
                  onClick={() => {
                    setShowKeypadGrid(!showKeypadGrid);
                    setVideoActive(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 transition-colors ${
                    showKeypadGrid ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Show Dial Keypad"
                >
                  <div className={`p-3 rounded-full border transition-all ${
                    showKeypadGrid ? 'bg-blue-600/30 border-blue-500/40 shadow-lg' : 'bg-white/[0.04] border-white/10'
                  }`}>
                    <Grid size={18} />
                  </div>
                  <span className="text-[10px] font-medium">Keypad</span>
                </button>

                <button
                  onClick={() => {
                    setVideoActive(!videoActive);
                    setShowKeypadGrid(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 transition-colors ${
                    videoActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Simulate Camera Stream"
                >
                  <div className={`p-3 rounded-full border transition-all ${
                    videoActive ? 'bg-blue-600/30 border-blue-500/40 shadow-lg' : 'bg-white/[0.04] border-white/10'
                  }`}>
                    <Video size={18} />
                  </div>
                  <span className="text-[10px] font-medium">FaceTime</span>
                </button>
              </div>
            )}

            {/* Centered Red Hang up button */}
            <div className="flex justify-center">
              <button
                onClick={onHangUpCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-90 duration-100 cursor-pointer"
                title="Hang up"
              >
                <PhoneOff size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline Save Contact Overlay */}
      {showSaveOverlay && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in font-sans">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xs p-5 shadow-2xl animate-scale-up">
            <h3 className="text-sm font-bold text-white mb-1">Save to Contacts</h3>
            <p className="text-xs text-slate-400 mb-4">Number: {activeCall.callerNumber}</p>
            <form onSubmit={handleSaveContactInline} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contact Name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveOverlay(false)}
                  className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/[0.05] text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
