import React, { useState, useEffect, useRef } from 'react';
import { CallRecord, Contact } from '../types';
import { Play, Pause, Trash2, MailOpen, Volume2, Clock, Calendar } from 'lucide-react';
import { audio } from '../lib/audio';

interface VoicemailListProps {
  logs: CallRecord[];
  contacts: Contact[];
  onDeleteVoicemail: (id: string) => void;
  onMarkPlayed: (id: string) => void;
  onAddNumberToContacts: (number: string, name?: string) => void;
}

export const VoicemailList: React.FC<VoicemailListProps> = ({
  logs,
  contacts,
  onDeleteVoicemail,
  onMarkPlayed,
  onAddNumberToContacts,
}) => {
  const voicemails = logs.filter((log) => log.voicemailText);
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const timerRef = useRef<any>(null);

  const getResolvedName = (number: string, fallbackName: string) => {
    const contact = contacts.find(
      (c) => c.phone.replace(/\D/g, '') === number.replace(/\D/g, '')
    );
    return {
      name: contact ? contact.name : fallbackName || 'Unknown Sender',
      isSaved: !!contact,
    };
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handlePlayToggle = (voicemail: CallRecord) => {
    if (activePlayId === voicemail.id) {
      // Pause
      audio.stopSpeaking();
      setActivePlayId(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else {
      // Start Play
      audio.stopSpeaking();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      onMarkPlayed(voicemail.id);
      setActivePlayId(voicemail.id);
      setPlaybackProgress(0);

      // Play Beep first, then Speak
      audio.playConnectChirp();
      
      const duration = voicemail.voicemailDuration || 10; // in seconds
      let elapsed = 0;

      // Animate progress bar
      timerRef.current = setInterval(() => {
        elapsed += 0.1;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setPlaybackProgress(progress);
        
        if (elapsed >= duration) {
          clearInterval(timerRef.current);
          setActivePlayId(null);
          setPlaybackProgress(0);
        }
      }, 100);

      audio.speakText(voicemail.voicemailText || '', () => {
        clearInterval(timerRef.current);
        setActivePlayId(null);
        setPlaybackProgress(0);
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      audio.stopSpeaking();
    };
  }, []);

  return (
    <div id="voicemail_tab" className="flex flex-col h-full bg-transparent text-white select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold font-sans">Voicemail</h1>
      </div>

      {/* Voicemails List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-thin scrollbar-thumb-slate-800">
        {voicemails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <MailOpen size={40} className="stroke-1 mb-2 text-slate-600" />
            <p className="text-sm">Voicemail box is empty</p>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {voicemails.map((vm) => {
              const isActive = activePlayId === vm.id;
              const resolved = getResolvedName(vm.callerNumber, vm.callerName);
              return (
                <div
                  key={vm.id}
                  className={`border transition-all rounded-2xl overflow-hidden ${
                    isActive
                      ? 'bg-white/[0.04] border-blue-500/30 shadow-lg shadow-blue-500/5'
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Summary row */}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">
                          {resolved.name}
                        </span>
                        {!vm.voicemailPlayed && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" title="New voicemail"></span>
                        )}
                        {!resolved.isSaved && vm.callerNumber !== '🔒 PRIVATE NUMBER' && (
                          <button
                            onClick={() => onAddNumberToContacts(vm.callerNumber, vm.callerName)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full transition-colors ml-1.5"
                            title="Add to Contacts"
                          >
                            + Save
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{vm.callerNumber}</div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-xs text-slate-400 font-medium">{formatDate(vm.timestamp)}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{formatTime(vm.timestamp)}</span>
                    </div>
                  </div>

                  {/* Body expansion containing transcript and playback */}
                  <div className="bg-white/[0.01] border-t border-white/5 p-4 space-y-3">
                    {/* Transcription section */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                        <Volume2 size={10} className="text-blue-500" />
                        Transcription
                      </div>
                      <p className="text-xs text-slate-300 italic font-sans leading-relaxed">
                        "{vm.voicemailText}"
                      </p>
                    </div>

                    {/* Progress Slider (Only when active) */}
                    {isActive && (
                      <div className="space-y-1">
                        <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-100 ease-linear"
                            style={{ width: `${playbackProgress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>0:{(Math.round((playbackProgress / 100) * (vm.voicemailDuration || 10)) % 60).toString().padStart(2, '0')}</span>
                          <span>0:{vm.voicemailDuration || 10}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions panel */}
                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={() => handlePlayToggle(vm)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-600/80 hover:bg-blue-500 border border-blue-500/30 text-white shadow-md'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Pause size={14} fill="currentColor" /> Pause Voicemail
                          </>
                        ) : (
                          <>
                            <Play size={14} fill="currentColor" /> Listen Voicemail
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (isActive) {
                            audio.stopSpeaking();
                            setActivePlayId(null);
                          }
                          onDeleteVoicemail(vm.id);
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                        title="Delete Voicemail"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
