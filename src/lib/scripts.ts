import { CallingScript } from '../types';

export const CALLING_SCRIPTS: Record<string, CallingScript> = {
  agent: {
    id: 'agent',
    title: 'Secret Agent Mission',
    callerName: 'Director Vance',
    callerNumber: '🔒 PRIVATE NUMBER',
    avatarColor: 'from-slate-800 to-zinc-950',
    initialNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: 'Agent, we have an urgent situation. A quantum server breach has been detected in Sector 4. Do you accept this mission?',
        options: [
          { text: 'Affirmative. What are my coordinates?', nextNodeId: 'coordinates' },
          { text: 'Sorry, I think you have the wrong operative.', nextNodeId: 'wrong_number' },
          { text: 'How did you get this secure line?', nextNodeId: 'secure_line' }
        ]
      },
      coordinates: {
        id: 'coordinates',
        text: 'Uploading GPS nodes to your neural uplink now. You have 4 minutes to retrieve the database before self-destruct triggers. Will you require backup?',
        options: [
          { text: 'No backup needed. I operate alone.', nextNodeId: 'lone_wolf' },
          { text: 'Send Alpha Team to secure the perimeter.', nextNodeId: 'alpha_team' }
        ]
      },
      lone_wolf: {
        id: 'lone_wolf',
        text: 'Understood. Classic lone wolf. Godspeed, Agent. Over and out.',
        options: [
          { text: 'End Secure Call', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      alpha_team: {
        id: 'alpha_team',
        text: 'Alpha Team is inbound to your location. Keep your head down and secure the mainframe. Good luck.',
        options: [
          { text: 'End Secure Call', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      wrong_number: {
        id: 'wrong_number',
        text: 'Wrong operative? Impossible, this channel is biometrically locked to your device... Wait, unless... the database has already been compromised! Disregard!',
        options: [
          { text: 'Wait! Hello?', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      secure_line: {
        id: 'secure_line',
        text: 'We control the satellites, Agent. Now, focus: the mainframe is decrypting. We need your security token key. Do you have it?',
        options: [
          { text: 'Yes, it is 8-4-0-9-1.', nextNodeId: 'token_entered' },
          { text: 'No, I left the token in my other suit.', nextNodeId: 'no_token' }
        ]
      },
      token_entered: {
        id: 'token_entered',
        text: 'Token verified! Access granted. Decryption stopped. Outstanding work, Agent. You have saved the grid. Returning to shadows.',
        options: [
          { text: 'Mission Accomplished', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      no_token: {
        id: 'no_token',
        text: 'Left it in your other suit?! Agent, this is not a rehearsal! We are going to backup voicemail protocol. Leave your report after the beep.',
        options: [
          { text: 'Go to Voicemail', nextNodeId: 'voicemail_node', action: 'voicemail' }
        ],
        isVoicemailTrigger: true
      },
      voicemail_node: {
        id: 'voicemail_node',
        text: 'Vance here. Since you failed to provide the encryption token, Sector 4 has initiated lockdown. Please leave a safe house contact address after the signal tone... *BEEP*',
        options: [],
        isVoicemailTrigger: true
      }
    }
  },
  mom: {
    id: 'mom',
    title: 'Mom ❤️',
    callerName: 'Mom ❤️',
    callerNumber: '(555) 019-9482',
    avatarColor: 'from-pink-400 to-rose-500',
    initialNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: 'Hi sweetie! I was just thinking about you. Did you eat dinner yet? And did you wear that warm jacket I got you?',
        options: [
          { text: 'Yes Mom, I ate healthy and I am wearing the jacket!', nextNodeId: 'happy_mom' },
          { text: 'Not yet Mom, I am busy building a React app right now!', nextNodeId: 'app_mom' },
          { text: 'Mom, I am literally in a meeting, can I call you back?', nextNodeId: 'busy_mom' }
        ]
      },
      happy_mom: {
        id: 'happy_mom',
        text: 'Oh, thank goodness! You always make me so proud. When are you coming to visit? Your Aunt Susan keeps asking about you.',
        options: [
          { text: 'I can visit this weekend!', nextNodeId: 'visit_weekend' },
          { text: 'I am a bit busy this month, Mom.', nextNodeId: 'visit_busy' }
        ]
      },
      visit_weekend: {
        id: 'visit_weekend',
        text: 'Wonderful! I will bake your favorite chocolate chip cookies. Love you so much, honey! See you Friday!',
        options: [
          { text: 'Love you too Mom, bye!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      visit_busy: {
        id: 'visit_busy',
        text: 'Oh... well, I know you are working very hard to buy a big house. Just do not forget your mother. Drink lots of water, okay? Love you!',
        options: [
          { text: 'I won\'t forget, love you too!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      app_mom: {
        id: 'app_mom',
        text: 'A React app? Is that like the Facebooks? That is so wonderful, my child is a computer genius! But please do not look at the screen too long, it ruins your eyes.',
        options: [
          { text: 'I\'ll take a break soon, I promise.', nextNodeId: 'happy_mom' },
          { text: 'It\'s fine Mom, screens are better now.', nextNodeId: 'happy_mom' }
        ]
      },
      busy_mom: {
        id: 'busy_mom',
        text: 'Oh, look at you, so busy and important! Okay, okay, I will let you go. But call me back or I will call your landlord! Bye-bye!',
        options: [
          { text: 'Bye Mom!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      }
    }
  },
  deepmind: {
    id: 'deepmind',
    title: 'Google DeepMind HR',
    callerName: 'Sarah Jenkins (DeepMind)',
    callerNumber: '+44 20 7608 0000',
    avatarColor: 'from-blue-600 to-indigo-700',
    initialNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: 'Hello, am I speaking with the lead developer of this incredible phone applet? My name is Sarah, calling from Google DeepMind recruitment in London.',
        options: [
          { text: 'Yes, this is they! How can I help you?', nextNodeId: 'proud_dev' },
          { text: 'Who is this? Is this a sales pitch?', nextNodeId: 'skeptical_dev' }
        ]
      },
      proud_dev: {
        id: 'proud_dev',
        text: 'Fabulous! We reviewed your portfolio—especially your audio synthesizer and phone calling system. It is brilliant. We want to offer you a Senior AI Engineering role working on Gemini 4.0. Are you interested?',
        options: [
          { text: 'Absolutely! I would love to join DeepMind!', nextNodeId: 'accept_offer' },
          { text: 'What is the compensation package like?', nextNodeId: 'ask_comp' },
          { text: 'No thanks, I prefer freelance agent coding.', nextNodeId: 'decline_offer' }
        ]
      },
      skeptical_dev: {
        id: 'skeptical_dev',
        text: 'Not a sales pitch at all! I am a Principal Recruiter at DeepMind. We are scouting elite talent who understand React, low-latency audio synthesis, and modular UI flow. Are you open to a career transition?',
        options: [
          { text: 'Ah, I see! Yes, let\'s talk.', nextNodeId: 'proud_dev' },
          { text: 'I am not interested at this time, thank you.', nextNodeId: 'decline_offer' }
        ]
      },
      accept_offer: {
        id: 'accept_offer',
        text: 'Magnificent! I will draft the offer letter right away. It includes a signing bonus, stock options, and your choice of custom mechanical keyboards. Let\'s schedule onboarding on Monday!',
        options: [
          { text: 'Amazing, look forward to it!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      ask_comp: {
        id: 'ask_comp',
        text: 'We offer an extremely competitive base salary, matching pension, equity stock units, free organic meals cooked by gourmet chefs, and unlimited barista coffee. Does that meet your expectations?',
        options: [
          { text: 'That sounds perfect. Count me in!', nextNodeId: 'accept_offer' },
          { text: 'I will need to review the formal document first.', nextNodeId: 'accept_offer' }
        ]
      },
      decline_offer: {
        id: 'decline_offer',
        text: 'Ah, a true independent spirit. I completely respect that. If you ever change your mind, this secure line is always open. Keep building incredible things! Goodbye.',
        options: [
          { text: 'Thank you, Sarah. Goodbye!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      }
    }
  },
  pizza: {
    id: 'pizza',
    title: 'Pizza Courier',
    callerName: 'Tony (Pizza Delivery)',
    callerNumber: '(555) 492-1033',
    avatarColor: 'from-amber-500 to-orange-600',
    initialNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: 'Yo, it\'s Tony. I\'m outside your building with the extra large double-cheese pineapple pizza and garlic knots. But the buzzer is just making a weird clicking sound. Can you let me in?',
        options: [
          { text: 'Awesome! I\'ll come down right now to grab it.', nextNodeId: 'coming_down' },
          { text: 'Uh, I didn\'t order any pizza. Must be the wrong address.', nextNodeId: 'wrong_address' },
          { text: 'Pineapple pizza? Gross, absolutely not mine.', nextNodeId: 'pineapple_hate' }
        ]
      },
      coming_down: {
        id: 'coming_down',
        text: 'Sweet, I\'m standing by the red scooter under the streetlight. It\'s freezing out here, so hurry down! See ya!',
        options: [
          { text: 'Be right there!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      wrong_address: {
        id: 'wrong_address',
        text: 'Wait, is this apartment 4B? The slip says "4B, extra pineapple, paid online." No? Oh man, I\'m at 144 Oak Street, is that not your place?',
        options: [
          { text: 'No, I live at 144 Pine Street!', nextNodeId: 'pine_street' },
          { text: 'Nope, wrong street. Good luck finding it!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      pine_street: {
        id: 'pine_street',
        text: 'Oh crap! Pine Street! I always mix up Oak and Pine. That\'s just two blocks away. Keep your phone handy, I\'m riding over now!',
        options: [
          { text: 'Great, see you in 2 minutes!', nextNodeId: 'coming_down' }
        ]
      },
      pineapple_hate: {
        id: 'pineapple_hate',
        text: 'Whoa, whoa, don\'t shoot the messenger! Pineapple and ham is a classic combo! Sweet and savory! Anyway, someone ordered it. If it\'s not yours, I\'m gonna have to eat it myself. Take care!',
        options: [
          { text: 'Enjoy the pizza! Bye.', nextNodeId: 'hangup', action: 'hangup' }
        ]
      }
    }
  },
  spam: {
    id: 'spam',
    title: 'Car Warranty Spam',
    callerName: 'Spam Risk (Robocall)',
    callerNumber: '(800) 999-0123',
    avatarColor: 'from-red-500 to-orange-500',
    initialNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        text: 'CONGRATULATIONS! This is an urgent notification regarding your vehicle\'s factory warranty. Our records indicate your coverage is about to expire. Press 1 to speak to a specialist.',
        options: [
          { text: '[Press 1] Speak to a specialist', nextNodeId: 'specialist' },
          { text: '[Hang up] End call immediately', nextNodeId: 'hangup', action: 'hangup' },
          { text: 'I don\'t even own a car!', nextNodeId: 'no_car' }
        ]
      },
      specialist: {
        id: 'specialist',
        text: 'Thank you for holding. My name is Kevin. To extend your warranty, can you confirm the make and model of your vehicle, and your credit card number?',
        options: [
          { text: 'It\'s a 1998 rusty tricycle, and my card number is 4242-NO-WAY.', nextNodeId: 'troll' },
          { text: 'Please remove me from your calling list!', nextNodeId: 'remove_list' }
        ]
      },
      no_car: {
        id: 'no_car',
        text: 'An outstanding balance has been noted... wait, did you say no car? Our records show you own a beautiful hoverboard. We can warranty that too for only $49 a month!',
        options: [
          { text: 'This is a scam. I\'m hanging up.', nextNodeId: 'hangup', action: 'hangup' },
          { text: 'Tell me more about hoverboard warranties...', nextNodeId: 'specialist' }
        ]
      },
      troll: {
        id: 'troll',
        text: '*Sigh*... Sir/Ma\'am, we are a professional warranty corporation. If you are not going to take your hoverboard safety seriously, I will mark your record as "High Risk." Good day!',
        options: [
          { text: 'Haha, bye Kevin!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      },
      remove_list: {
        id: 'remove_list',
        text: 'Your request has been placed in our system queue. Processing takes 90 business days. During this time, you may receive up to 400 additional friendly courtesy calls. Goodbye!',
        options: [
          { text: 'What?! No!', nextNodeId: 'hangup', action: 'hangup' }
        ]
      }
    }
  }
};
