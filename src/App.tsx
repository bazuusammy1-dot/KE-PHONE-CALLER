import { useState, useEffect, useRef } from 'react';
import { Contact, CallRecord, ActiveCall, ScriptOption } from './types';
import { PhoneFrame } from './components/PhoneFrame';
import { ControlPanel } from './components/ControlPanel';
import { Dialer } from './components/Dialer';
import { ContactsList } from './components/ContactsList';
import { Recents } from './components/Recents';
import { VoicemailList } from './components/VoicemailList';
import { CallScreen } from './components/CallScreen';
import { CALLING_SCRIPTS } from './lib/scripts';
import { audio } from './lib/audio';
import { Smartphone, Sparkles, Volume2 } from 'lucide-react';

const SEEDED_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Mom ❤️',
    phone: '(555) 019-9482',
    email: 'mom@family.com',
    avatarColor: 'from-pink-400 to-rose-500',
    isFavorite: true,
  },
  {
    id: 'c2',
    name: 'Director Vance',
    phone: '🔒 PRIVATE NUMBER',
    email: 'vance@agency.gov',
    avatarColor: 'from-slate-800 to-zinc-950',
    isFavorite: true,
  },
  {
    id: 'c3',
    name: 'Sarah Jenkins (DeepMind)',
    phone: '+44 20 7608 0000',
    email: 'sjenkins@google.com',
    avatarColor: 'from-blue-600 to-indigo-700',
    isFavorite: false,
  },
  {
    id: 'c4',
    name: 'Tony (Pizza Delivery)',
    phone: '(555) 492-1033',
    email: 'tony@pizzapalace.net',
    avatarColor: 'from-amber-500 to-orange-600',
    isFavorite: false,
  },
  {
    id: 'c5',
    name: 'Spam Risk (Robocall)',
    phone: '(800) 999-0123',
    email: 'unsubscribed@telemarket.com',
    avatarColor: 'from-red-500 to-orange-500',
    isFavorite: false,
  }
];

const SEEDED_LOGS: CallRecord[] = [
  {
    id: 'log1',
    type: 'missed',
    contactId: 'c1',
    callerName: 'Mom ❤️',
    callerNumber: '(555) 019-9482',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // Yesterday
  },
  {
    id: 'log2',
    type: 'incoming',
    contactId: 'c4',
    callerName: 'Tony (Pizza Delivery)',
    callerNumber: '(555) 492-1033',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    duration: 82,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'recents' | 'contacts' | 'dialer' | 'voicemail'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>(SEEDED_CONTACTS);
  const [logs, setLogs] = useState<CallRecord[]>(SEEDED_LOGS);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // Status Bar State
  const [network, setNetwork] = useState('5G');
  const [battery, setBattery] = useState(92);

  // Ref to hold call state for auto-divert timer
  const activeCallRef = useRef<ActiveCall | null>(null);
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  // Timers
  const callDurationIntervalRef = useRef<any>(null);
  const ringingTimeoutRef = useRef<any>(null);
  const disconnectTimeoutRef = useRef<any>(null);

  // Auto-divert ringing to voicemail if unanswered
  useEffect(() => {
    if (activeCall?.status === 'ringing') {
      if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
      
      ringingTimeoutRef.current = setTimeout(() => {
        if (activeCallRef.current?.status === 'ringing') {
          handleDivertToVoicemail();
        }
      }, 15000); // 15 seconds of ringing then voicemail
    } else {
      if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    }
    return () => {
      if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    };
  }, [activeCall?.status]);

  // Outgoing call connecting simulation
  useEffect(() => {
    if (activeCall?.status === 'dialing') {
      const connectTimer = setTimeout(() => {
        if (activeCallRef.current?.status === 'dialing') {
          handleConnectOutgoingCall();
        }
      }, 35000 / 10); // 3.5 seconds to pick up
      return () => clearTimeout(connectTimer);
    }
  }, [activeCall?.status]);

  // Tick call duration
  useEffect(() => {
    if (activeCall?.status === 'connected' || activeCall?.status === 'voicemail') {
      callDurationIntervalRef.current = setInterval(() => {
        setActiveCall((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            duration: prev.duration + 1,
          };
        });
      }, 1000);
    } else {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
    }
    return () => {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
    };
  }, [activeCall?.status]);

  const findScriptByNumber = (num: string) => {
    const norm = num.replace(/\D/g, '');
    if (norm.includes('0199482') || norm === '5550199482') return 'mom';
    if (norm.includes('76080000') || norm === '442076080000') return 'deepmind';
    if (norm.includes('4921033') || norm === '5554921033') return 'pizza';
    if (norm.includes('9990123') || norm === '8009990123') return 'spam';
    if (norm === '111' || num.toLowerCase().includes('private')) return 'agent';
    return null;
  };

  // 1. Placing Outgoing Call
  const handleCallNumber = (number: string, resolvedName?: string) => {
    audio.stopSpeaking();
    audio.stopRingtone();
    audio.stopDialingTone();

    // Match name in contacts
    const matchedContact = contacts.find(
      (c) => c.phone.replace(/\D/g, '') === number.replace(/\D/g, '')
    );
    const name = resolvedName || matchedContact?.name || 'Unknown';
    const scriptId = findScriptByNumber(number);

    setActiveCall({
      type: 'outgoing',
      callerName: name,
      callerNumber: number,
      status: 'dialing',
      duration: 0,
      isMuted: false,
      isSpeaker: false,
      showKeypad: false,
      scriptId: scriptId || undefined,
      currentNodeId: scriptId ? 'start' : undefined,
    });
  };

  const handleConnectOutgoingCall = () => {
    setActiveCall((prev) => {
      if (!prev) return null;
      
      // If no script matched, bind a standard "Echo system" script dynamically
      let finalScriptId = prev.scriptId;
      let finalNodeId = prev.currentNodeId;

      if (!finalScriptId) {
        // Fallback generic voice response
        finalScriptId = 'spam'; // fallback using existing spam structure or mock custom script
        finalNodeId = 'start';
      }

      return {
        ...prev,
        status: 'connected',
        startTime: Date.now(),
        scriptId: finalScriptId,
        currentNodeId: finalNodeId,
      };
    });
  };

  // 2. Triggering Incoming Call (from outside)
  const handleTriggerIncomingCall = (
    scriptId: string,
    customData?: { name: string; number: string; text: string }
  ) => {
    // Hang up any active call first
    handleImmediateHangup();

    if (scriptId === 'custom' && customData) {
      setActiveCall({
        type: 'incoming',
        callerName: customData.name,
        callerNumber: customData.number,
        status: 'ringing',
        duration: 0,
        isMuted: false,
        isSpeaker: false,
        showKeypad: false,
        scriptId: 'custom', // special marker
        currentNodeId: 'custom_start',
      });

      // Inject custom script into memory dynamically
      CALLING_SCRIPTS['custom'] = {
        id: 'custom',
        title: 'Custom Call',
        callerName: customData.name,
        callerNumber: customData.number,
        avatarColor: 'from-teal-500 to-emerald-600',
        initialNodeId: 'custom_start',
        nodes: {
          custom_start: {
            id: 'custom_start',
            text: customData.text,
            options: [
              { text: 'Hello! Nice to hear from you.', nextNodeId: 'custom_end' },
              { text: 'Sorry, I am busy. Gotta go!', nextNodeId: 'custom_hang', action: 'hangup' }
            ],
          },
          custom_end: {
            id: 'custom_end',
            text: 'I totally understand! Thank you for testing out this gorgeous phone app simulator. Have an amazing day!',
            options: [
              { text: 'End Call', nextNodeId: 'hangup', action: 'hangup' }
            ],
          },
          custom_hang: {
            id: 'custom_hang',
            text: 'No problem! Talk later. Goodbye!',
            options: [
              { text: 'Hangup', nextNodeId: 'hangup', action: 'hangup' }
            ],
          }
        },
      };
    } else {
      const script = CALLING_SCRIPTS[scriptId];
      if (!script) return;

      setActiveCall({
        type: 'incoming',
        callerName: script.callerName,
        callerNumber: script.callerNumber,
        status: 'ringing',
        duration: 0,
        isMuted: false,
        isSpeaker: false,
        showKeypad: false,
        scriptId: script.id,
        currentNodeId: script.initialNodeId,
      });
    }
  };

  // 3. Answering Incoming Call
  const handleAcceptCall = () => {
    setActiveCall((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'connected',
        startTime: Date.now(),
      };
    });
  };

  // 4. Declining Incoming Call -> Divert to Voicemail!
  const handleDeclineCall = () => {
    handleDivertToVoicemail();
  };

  const handleDivertToVoicemail = () => {
    setActiveCall((prev) => {
      if (!prev) return null;
      
      // If the active script supports voicemail, trigger it
      const hasVoicemailNode = prev.scriptId && CALLING_SCRIPTS[prev.scriptId]?.nodes['voicemail_node'];
      
      if (prev.scriptId && prev.scriptId !== 'custom') {
        return {
          ...prev,
          status: 'voicemail',
          currentNodeId: hasVoicemailNode ? 'voicemail_node' : prev.currentNodeId,
        };
      } else {
        // Custom script or unknown caller gets diverted directly to simple voicemail log
        setTimeout(() => {
          handleRecordVoicemailLog(
            prev.callerName,
            prev.callerNumber,
            'Hey there! I tried calling you but missed you. Give me a ring back when you can. Bye!'
          );
          handleHangUpCall();
        }, 500);
        return prev;
      }
    });
  };

  // Handle auto-voicemail transcription recording on active voicemail nodes
  useEffect(() => {
    if (activeCall?.status === 'voicemail' && activeCall.scriptId) {
      const script = CALLING_SCRIPTS[activeCall.scriptId];
      const currentNode = activeCall.currentNodeId ? script?.nodes[activeCall.currentNodeId] : null;

      if (currentNode && (currentNode.isVoicemailTrigger || activeCall.currentNodeId === 'voicemail_node')) {
        // Record voicemail into log history after they finish speaking
        const voicemailText = currentNode.text;
        
        const voiceRecordTimer = setTimeout(() => {
          handleRecordVoicemailLog(
            activeCall.callerName,
            activeCall.callerNumber,
            voicemailText,
            activeCall.scriptId
          );
          handleHangUpCall();
        }, voicemailText.length * 55 + 1000); // Wait for speaking to finish, then hang up

        return () => clearTimeout(voiceRecordTimer);
      }
    }
  }, [activeCall?.status, activeCall?.currentNodeId]);

  const handleRecordVoicemailLog = (name: string, number: string, text: string, scriptId?: string) => {
    const contact = contacts.find((c) => c.phone === number);
    const newLog: CallRecord = {
      id: `vm_${Date.now()}`,
      type: 'missed',
      contactId: contact?.id,
      callerName: name,
      callerNumber: number,
      timestamp: new Date().toISOString(),
      voicemailText: text,
      voicemailDuration: Math.max(5, Math.round(text.split(' ').length * 0.6)),
      voicemailPlayed: false,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // 5. Hanging Up Call (Transition Screen)
  const handleHangUpCall = () => {
    if (!activeCall) return;

    audio.stopSpeaking();
    audio.stopRingtone();
    audio.stopDialingTone();

    // Log call in recents list
    let finalType: 'incoming' | 'outgoing' | 'missed' = activeCall.type;
    
    if (activeCall.status === 'ringing') {
      finalType = 'missed';
    }

    const matchedContact = contacts.find(
      (c) => c.phone.replace(/\D/g, '') === activeCall.callerNumber.replace(/\D/g, '')
    );

    // Only log if not already recorded as voicemail
    const isVoicemailCall = activeCall.status === 'voicemail';
    
    if (!isVoicemailCall) {
      const newLog: CallRecord = {
        id: `log_${Date.now()}`,
        type: finalType,
        contactId: matchedContact?.id,
        callerName: activeCall.callerName,
        callerNumber: activeCall.callerNumber,
        timestamp: new Date().toISOString(),
        duration: activeCall.status === 'connected' ? activeCall.duration : undefined,
      };
      setLogs((prev) => [newLog, ...prev]);
    }

    setActiveCall((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'disconnected',
      };
    });

    // Close call overlay after beep finishes
    if (disconnectTimeoutRef.current) clearTimeout(disconnectTimeoutRef.current);
    disconnectTimeoutRef.current = setTimeout(() => {
      setActiveCall(null);
    }, 1500);
  };

  const handleImmediateHangup = () => {
    audio.stopSpeaking();
    audio.stopRingtone();
    audio.stopDialingTone();
    setActiveCall(null);
    if (disconnectTimeoutRef.current) clearTimeout(disconnectTimeoutRef.current);
  };

  // Choose dialogue script responses
  const handleSelectScriptOption = (option: ScriptOption) => {
    if (!activeCall) return;

    if (option.action === 'hangup') {
      // Speak final line and hang up
      const script = CALLING_SCRIPTS[activeCall.scriptId!];
      const node = script?.nodes[option.nextNodeId];
      if (node) {
        audio.stopSpeaking();
        audio.speakText(node.text, () => {
          handleHangUpCall();
        });
        setActiveCall((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentNodeId: option.nextNodeId,
          };
        });
      } else {
        handleHangUpCall();
      }
    } else if (option.action === 'voicemail') {
      setActiveCall((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'voicemail',
          currentNodeId: option.nextNodeId,
        };
      });
    } else {
      // Move to next dialog script node
      setActiveCall((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentNodeId: option.nextNodeId,
        };
      });
    }
  };

  // Contacts operations
  const [prefilledContact, setPrefilledContact] = useState<{ name: string; phone: string } | null>(null);

  const handleAddContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: `c_${Date.now()}`,
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  const handleEditContact = (id: string, updatedFields: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const handleAddNumberToContacts = (num: string, name: string = '') => {
    setPrefilledContact({ name, phone: num });
    setActiveTab('contacts');
  };

  // Call Logs operations
  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleMarkVoicemailPlayed = (id: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, voicemailPlayed: true } : l))
    );
  };

  // Toggles
  const handleToggleMute = () => {
    setActiveCall((prev) => {
      if (!prev) return null;
      const nextMuted = !prev.isMuted;
      if (nextMuted) {
        audio.stopSpeaking();
      } else {
        // Resume script voice if speaking
        if (prev.scriptId && prev.currentNodeId) {
          const script = CALLING_SCRIPTS[prev.scriptId];
          const node = script?.nodes[prev.currentNodeId];
          if (node) audio.speakText(node.text);
        }
      }
      return { ...prev, isMuted: nextMuted };
    });
  };

  const handleToggleSpeaker = () => {
    setActiveCall((prev) => {
      if (!prev) return null;
      return { ...prev, isSpeaker: !prev.isSpeaker };
    });
  };

  const unheardVoicemailsCount = logs.filter((l) => l.voicemailText && !l.voicemailPlayed).length;
  const missedCallsCount = logs.filter((l) => l.type === 'missed' && !l.voicemailText).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start lg:justify-center p-4 lg:p-8 selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none" />

      {/* Decorative Title Header */}
      <div className="text-center mb-8 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-3 shadow-inner">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-[11px] font-bold text-blue-300 tracking-wider uppercase">Interactive Web Synth Call Simulator</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          AetherPhone Calling App
        </h1>
        <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
          Experience full telephonic fidelity with a built-in sound synthesizer, contact manager, real-time audio dialogues, and automated script characters.
        </p>
      </div>

      {/* Main Workspace Frame */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12 relative z-10">
        
        {/* Physical Phone Model */}
        <div className="relative">
          <PhoneFrame
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            network={network}
            battery={battery}
            unheardVoicemailsCount={unheardVoicemailsCount}
            missedCallsCount={missedCallsCount}
            isCallScreenOpen={activeCall !== null}
            activeCallStatus={activeCall?.status}
            activeCallDuration={activeCall?.duration}
          >
            {/* Tab content screens */}
            {!activeCall && activeTab === 'contacts' && (
              <ContactsList
                contacts={contacts}
                onCallContact={(num, name) => handleCallNumber(num, name)}
                onAddContact={handleAddContact}
                onEditContact={handleEditContact}
                onDeleteContact={handleDeleteContact}
                onToggleFavorite={handleToggleFavorite}
                prefilledContact={prefilledContact}
                clearPrefilledContact={() => setPrefilledContact(null)}
              />
            )}

            {!activeCall && activeTab === 'dialer' && (
              <Dialer
                onCallNumber={(num) => handleCallNumber(num)}
                onAddNumberToContacts={handleAddNumberToContacts}
              />
            )}

            {!activeCall && activeTab === 'recents' && (
              <Recents
                logs={logs}
                contacts={contacts}
                onCallNumber={(num, name) => handleCallNumber(num, name)}
                onClearLogs={handleClearLogs}
                onDeleteLog={handleDeleteLog}
                onAddNumberToContacts={handleAddNumberToContacts}
              />
            )}

            {!activeCall && activeTab === 'voicemail' && (
              <VoicemailList
                logs={logs}
                contacts={contacts}
                onDeleteVoicemail={handleDeleteLog}
                onMarkPlayed={handleMarkVoicemailPlayed}
                onAddNumberToContacts={handleAddNumberToContacts}
              />
            )}

            {/* Calling Screen Overlay */}
            {activeCall && (
              <CallScreen
                activeCall={activeCall}
                contacts={contacts}
                onAcceptCall={handleAcceptCall}
                onDeclineCall={handleDeclineCall}
                onHangUpCall={handleHangUpCall}
                onSelectScriptOption={handleSelectScriptOption}
                onToggleMute={handleToggleMute}
                onToggleSpeaker={handleToggleSpeaker}
                onAddContact={handleAddContact}
              />
            )}
          </PhoneFrame>
        </div>

        {/* Dashboard Controller Cockpit */}
        <ControlPanel
          contacts={contacts}
          onTriggerIncomingCall={handleTriggerIncomingCall}
          network={network}
          setNetwork={setNetwork}
          battery={battery}
          setBattery={setBattery}
        />

      </div>

      {/* Decorative footer */}
      <div className="mt-12 text-center text-slate-600 text-[10px] tracking-widest uppercase font-semibold">
        AetherPhone Mobile Labs • Crafted in Cloud Sandbox Mode
      </div>

    </div>
  );
}
