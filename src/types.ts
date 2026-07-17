export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarColor: string; // Tailwind class, e.g., 'from-pink-500 to-rose-600'
  isFavorite: boolean;
}

export type CallType = 'incoming' | 'outgoing' | 'missed';

export interface CallRecord {
  id: string;
  type: CallType;
  contactId?: string;
  callerName: string;
  callerNumber: string;
  timestamp: string; // ISO string
  duration?: number; // in seconds
  voicemailText?: string;
  voicemailDuration?: number;
  voicemailPlayed?: boolean;
}

export type CallStatus = 'idle' | 'ringing' | 'dialing' | 'connected' | 'disconnected' | 'voicemail';

export interface ActiveCall {
  type: 'incoming' | 'outgoing';
  callerName: string;
  callerNumber: string;
  status: CallStatus;
  startTime?: number; // timestamp
  duration: number; // in seconds
  isMuted: boolean;
  isSpeaker: boolean;
  showKeypad: boolean;
  scriptId?: string;
  currentNodeId?: string;
}

export interface ScriptOption {
  text: string;
  nextNodeId: string;
  action?: 'hangup' | 'voicemail' | 'add_contact' | 'custom';
}

export interface ScriptNode {
  id: string;
  text: string;
  options: ScriptOption[];
  isVoicemailTrigger?: boolean;
}

export interface CallingScript {
  id: string;
  title: string;
  callerName: string;
  callerNumber: string;
  avatarColor: string;
  initialNodeId: string;
  nodes: Record<string, ScriptNode>;
}
