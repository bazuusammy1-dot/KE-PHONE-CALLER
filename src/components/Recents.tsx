import React, { useState } from 'react';
import { CallRecord, Contact } from '../types';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Info, Trash2, Clock, Calendar, UserPlus } from 'lucide-react';

interface RecentsProps {
  logs: CallRecord[];
  contacts: Contact[];
  onCallNumber: (number: string, name: string) => void;
  onClearLogs: () => void;
  onDeleteLog: (id: string) => void;
  onAddNumberToContacts: (number: string, name?: string) => void;
}

export const Recents: React.FC<RecentsProps> = ({ logs, contacts, onCallNumber, onClearLogs, onDeleteLog, onAddNumberToContacts }) => {
  const [filter, setFilter] = useState<'all' | 'missed'>('all');
  const [selectedLog, setSelectedLog] = useState<CallRecord | null>(null);

  const getResolvedNameAndAvatar = (number: string, fallbackName: string) => {
    const contact = contacts.find(
      (c) => c.phone.replace(/\D/g, '') === number.replace(/\D/g, '')
    );
    return {
      name: contact ? contact.name : fallbackName || 'Unknown Caller',
      isSaved: !!contact,
      avatarColor: contact ? contact.avatarColor : null,
    };
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'missed') {
      return log.type === 'missed';
    }
    return true;
  });

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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div id="recents_tab" className="flex flex-col h-full bg-transparent text-white select-none">
      {/* Header */}
      <div className="p-4 flex flex-col border-b border-white/10">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold font-sans">Recents</h1>
          {logs.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all call history?')) {
                  onClearLogs();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white/[0.02] border border-white/5 p-0.5 rounded-xl w-full">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white/10 text-white shadow border border-white/5'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All Calls
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'missed'
                ? 'bg-red-500/20 text-red-400 shadow border border-red-500/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Missed
          </button>
        </div>
      </div>

      {/* Recents List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Clock size={40} className="stroke-1 mb-2 text-slate-600" />
            <p className="text-sm">No recent calls</p>
          </div>
        ) : (
          <div className="space-y-1 mt-3">
            {filteredLogs.map((log) => {
              const isMissed = log.type === 'missed';
              const resolved = getResolvedNameAndAvatar(log.callerNumber, log.callerName);
              return (
                <div
                  key={log.id}
                  onClick={() => onCallNumber(log.callerNumber, resolved.name)}
                  className="flex items-center justify-between p-3.5 hover:bg-white/[0.04] rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Call Type Icon */}
                    <div className={`p-2.5 rounded-xl ${
                      log.type === 'incoming' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.type === 'outgoing' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {log.type === 'incoming' && <PhoneIncoming size={16} />}
                      {log.type === 'outgoing' && <PhoneOutgoing size={16} />}
                      {log.type === 'missed' && <PhoneMissed size={16} />}
                    </div>

                    <div>
                      {/* Name or Number */}
                      <div className={`font-semibold text-[15px] leading-snug ${isMissed ? 'text-red-400' : 'text-slate-200'}`}>
                        {resolved.name}
                      </div>
                      
                      {/* Subtitle details */}
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span>{log.callerNumber}</span>
                        <span>•</span>
                        <span>{formatTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Timings */}
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-medium text-slate-500 mr-1">
                      {formatDate(log.timestamp)}
                    </span>
                    {!resolved.isSaved && log.callerNumber !== '🔒 PRIVATE NUMBER' && (
                      <button
                        onClick={() => onAddNumberToContacts(log.callerNumber, log.callerName)}
                        className="p-1.5 rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                        title="Add to Contacts"
                      >
                        <UserPlus size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-white/[0.08] transition-colors"
                      title="Call Log Details"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Details Dialog */}
      {selectedLog && (() => {
        const resolvedSelected = getResolvedNameAndAvatar(selectedLog.callerNumber, selectedLog.callerName);
        return (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex items-center justify-center p-4">
            <div className="bg-slate-900/85 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-up">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-400" />
                Call Details
              </h2>

              <div className="space-y-3.5 mb-6 font-sans">
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-slate-500">Contact</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {resolvedSelected.name}
                    </span>
                    {!resolvedSelected.isSaved && selectedLog.callerNumber !== '🔒 PRIVATE NUMBER' && (
                      <button
                        onClick={() => {
                          onAddNumberToContacts(selectedLog.callerNumber, selectedLog.callerName);
                          setSelectedLog(null);
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full transition-colors"
                        title="Add to Contacts"
                      >
                        <UserPlus size={11} /> Save
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-slate-500">Number</span>
                  <span className="text-sm font-medium text-slate-200">{selectedLog.callerNumber}</span>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-slate-500">Call Type</span>
                  <span className={`text-sm font-bold capitalize ${
                    selectedLog.type === 'incoming' ? 'text-emerald-400' :
                    selectedLog.type === 'outgoing' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {selectedLog.type}
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-slate-500">Date & Time</span>
                  <span className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-500" />
                    {formatDate(selectedLog.timestamp)} at {formatTime(selectedLog.timestamp)}
                  </span>
                </div>

                {selectedLog.type !== 'missed' && selectedLog.duration && (
                  <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-500">Duration</span>
                    <span className="text-sm font-medium text-slate-200">
                      {formatDuration(selectedLog.duration)}
                    </span>
                  </div>
                )}

                {selectedLog.voicemailText && (
                  <div className="bg-white/[0.03] border border-white/5 p-3.5 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Transcribed Voicemail</span>
                    <p className="text-sm text-slate-300 italic">"{selectedLog.voicemailText}"</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    onDeleteLog(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-xs font-semibold text-red-400 flex-1 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Entry
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/5 text-xs font-semibold text-slate-300 flex-1 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
