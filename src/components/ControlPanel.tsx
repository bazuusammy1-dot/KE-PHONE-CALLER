import React, { useState, useEffect } from 'react';
import { CALLING_SCRIPTS } from '../lib/scripts';
import { Play, Calendar, Zap, Wifi, Battery, VolumeX, Volume2, HelpCircle } from 'lucide-react';
import { audio } from '../lib/audio';
import { Contact } from '../types';

interface ControlPanelProps {
  onTriggerIncomingCall: (scriptId: string, customData?: { name: string; number: string; text: string }) => void;
  network: string;
  setNetwork: (val: string) => void;
  battery: number;
  setBattery: (val: number) => void;
  contacts: Contact[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onTriggerIncomingCall,
  network,
  setNetwork,
  battery,
  setBattery,
  contacts,
}) => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>('agent');
  const [customName, setCustomName] = useState('John Doe');
  const [customNumber, setCustomNumber] = useState('(555) 123-4567');
  const [customText, setCustomText] = useState('Hello there! Can you hear me?');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Scheduled call state
  const [scheduleSeconds, setScheduleSeconds] = useState(5);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (countdown !== null) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
      } else {
        // Trigger call!
        triggerCall();
        setCountdown(null);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const triggerCall = () => {
    if (isCustomMode) {
      onTriggerIncomingCall('custom', {
        name: customName || 'Unknown',
        number: customNumber || '🔒 PRIVATE',
        text: customText || 'Hello!',
      });
    } else {
      onTriggerIncomingCall(selectedScriptId);
    }
  };

  const handleScheduleCall = () => {
    setCountdown(scheduleSeconds);
  };

  const handleToggleSound = () => {
    audio.isMuted = !audio.isMuted;
    // Simple state re-render trigger
    setBattery((prev) => prev);
  };

  return (
    <div id="simulator_controls" className="w-full lg:w-[420px] bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 select-none font-sans text-white h-fit">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-yellow-400 animate-pulse" />
          <h2 className="text-xl font-bold tracking-tight">Simulator Dashboard</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Control calls, networks, and battery configurations. Use this panel to trigger simulated call events to the phone app on the left.
        </p>
      </div>

      {/* Audio Mute toggle */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Browser Synthesis Audio</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Tones, Ringtone & Interactive Voices</p>
        </div>
        <button
          onClick={handleToggleSound}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            audio.isMuted
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {audio.isMuted ? (
            <>
              <VolumeX size={14} /> Muted
            </>
          ) : (
            <>
              <Volume2 size={14} /> Enabled
            </>
          )}
        </button>
      </div>

      {/* Interactive Trigger Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incoming Call Triggers</h3>

        {/* Script vs Custom selector tabs */}
        <div className="flex bg-white/[0.02] border border-white/5 p-0.5 rounded-xl">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isCustomMode ? 'bg-white/10 text-white shadow-md border border-white/5' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Character Scripts
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isCustomMode ? 'bg-white/10 text-white shadow-md border border-white/5' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Custom Call
          </button>
        </div>

        {isCustomMode ? (
          // Custom Trigger Settings
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3 animate-fade-in font-sans">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                <span>Load Contact Profile</span>
                <span className="text-[9px] text-slate-600 font-medium">Optional</span>
              </label>
              <select
                onChange={(e) => {
                  const selectedContactId = e.target.value;
                  if (!selectedContactId) return;
                  const contact = contacts.find((c) => c.id === selectedContactId);
                  if (contact) {
                    setCustomName(contact.name);
                    setCustomNumber(contact.phone);
                  }
                  e.target.value = ''; // Reset select after load
                }}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="" className="bg-slate-900 text-slate-500">-- Choose saved contact --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Caller Name</label>
              <input
                id="custom_trigger_name"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Caller Number</label>
              <input
                id="custom_trigger_number"
                type="text"
                value={customNumber}
                onChange={(e) => setCustomNumber(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Initial Saying Subtitles</label>
              <textarea
                id="custom_trigger_text"
                rows={2}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        ) : (
          // Character Script Dropdown
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Character</label>
              <select
                id="script_selector"
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                className="w-full bg-slate-950/90 border border-white/10 text-xs text-white rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {Object.values(CALLING_SCRIPTS).map((script) => (
                  <option key={script.id} value={script.id} className="bg-slate-950">
                    {script.title} — ({script.callerName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Trigger Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            id="trigger_call_now"
            onClick={triggerCall}
            disabled={countdown !== null}
            className={`py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              countdown !== null
                ? 'bg-white/[0.02] text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-white hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]'
            }`}
          >
            <Play size={13} fill="currentColor" /> Trigger Now
          </button>

          <button
            id="schedule_call_btn"
            onClick={handleScheduleCall}
            disabled={countdown !== null}
            className={`py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/20 transition-all ${
              countdown !== null
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-white/[0.02] text-slate-300 hover:bg-white/[0.04] active:scale-[0.98]'
            }`}
          >
            <Calendar size={13} />
            {countdown !== null ? `Ringing in ${countdown}s` : `Delay ${scheduleSeconds}s`}
          </button>
        </div>

        {/* Delay Slider */}
        {countdown === null && (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
            <span>Delay Timer:</span>
            <div className="flex items-center gap-2">
              <input
                id="delay_slider"
                type="range"
                min="3"
                max="30"
                value={scheduleSeconds}
                onChange={(e) => setScheduleSeconds(parseInt(e.target.value))}
                className="w-24 accent-blue-500 cursor-pointer"
              />
              <span className="font-mono text-slate-300 font-bold">{scheduleSeconds}s</span>
            </div>
          </div>
        )}
      </div>

      {/* Network & Battery Controls */}
      <div className="space-y-4 border-t border-white/10 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Configuration</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Signal Level selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Wifi size={11} className="text-blue-500" />
              Signal Mode
            </label>
            <select
              id="signal_selector"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-slate-950/90 border border-white/10 text-xs text-slate-300 rounded-xl px-2.5 py-2 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="5G" className="bg-slate-950">5G Network</option>
              <option value="LTE" className="bg-slate-950">LTE Network</option>
              <option value="Wi-Fi" className="bg-slate-950">Wi-Fi Connection</option>
              <option value="No Service" className="bg-slate-950">No Service</option>
            </select>
          </div>

          {/* Battery Level selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 justify-between">
              <span className="flex items-center gap-1">
                <Battery size={11} className="text-emerald-500" />
                Battery
              </span>
              <span className="font-mono text-slate-300 font-bold">{battery}%</span>
            </label>
            <input
              id="battery_slider"
              type="range"
              min="1"
              max="100"
              value={battery}
              onChange={(e) => setBattery(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-white/[0.02] border border-white/5 rounded-lg appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Tips section */}
      <div className="border-t border-white/10 pt-5 text-slate-400">
        <div className="flex items-start gap-2 bg-white/[0.01] p-3.5 rounded-2xl border border-white/5">
          <HelpCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed space-y-1.5">
            <p className="font-bold text-slate-300">How to use this Call Simulator:</p>
            <p>• Select any character script (like <b>Secret Agent</b> or <b>Mom</b>) and click <b>Trigger Now</b> to see the incoming call alert screen inside the phone.</p>
            <p>• Answer the call, read the live audio transcription, and pick interactive dialogue responses to shape the call ending!</p>
            <p>• Switch to the <b>Dialer</b> tab on the phone to type numbers and call out directly.</p>
            <p>• If you don't answer a call, the characters can actually leave a transcript in the <b>Voicemail</b> inbox!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
