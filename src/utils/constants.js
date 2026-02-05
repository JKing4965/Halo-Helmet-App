export const THEME = {
  primary: '#0f4c81',
  accent: '#6ec6ff',
  bg: '#f8fafc',
  text: '#1e293b',
  danger: '#ef4444',
  warning: '#f59e0b',
  neutral: '#cbd5e1',
};

export const LOBE_STATS = {
  'Frontal': { impacts: 12, maxForce: 68, risk: 'High' },
  'Temporal': { impacts: 4, maxForce: 32, risk: 'Med' },
  'Parietal Left': { impacts: 1, maxForce: 12, risk: 'Low' },
  'Parietal Right': { impacts: 0, maxForce: 0, risk: 'None' },
  'Occipital': { impacts: 0, maxForce: 0, risk: 'None' },
  'Cerebellum': { impacts: 0, maxForce: 0, risk: 'None' },
};

export const MOCK_FRIENDS = [
  { 
    id: 1, 
    name: "Alex S.", 
    status: "Snowboarding - 2h ago", 
    resortId: 'jackson',
    risk: "Low", 
    avatar: "AS",
    lastActive: "Today, 2:30 PM",
    recentImpacts: { count: 2, maxForce: 15 },
    impactDetails: [
      { id: 101, zone: 'Frontal', gForce: 15 },
      { id: 102, zone: 'Parietal Left', gForce: 10 }
    ],
    location: null 
  },
  { 
    id: 2, 
    name: "Jordan M.", 
    status: "Snowboarding - Live", 
    resortId: 'bryce',
    risk: "Med", 
    avatar: "JM",
    lastActive: "Now",
    recentImpacts: { count: 8, maxForce: 35 },
    impactDetails: [
      { id: 201, zone: 'Frontal', gForce: 35 },
      { id: 202, zone: 'Temporal', gForce: 25 },
      { id: 203, zone: 'Frontal', gForce: 20 },
      { id: 204, zone: 'Occipital', gForce: 15 }
    ],
    location: { lat: 38.8166, lng: -78.7627 } // Bryce Resort
  },
  { 
    id: 3, 
    name: "Casey R.", 
    status: "Skiing - 1d ago", 
    resortId: 'aspen',
    risk: "Low", 
    avatar: "CR",
    lastActive: "Yesterday, 4:00 PM",
    recentImpacts: { count: 0, maxForce: 0 },
    impactDetails: [],
    location: null
  },
  { 
    id: 4, 
    name: "Taylor K.", 
    status: "Skiing - Live", 
    resortId: 'whistler',
    risk: "High", 
    avatar: "TK",
    lastActive: "Now",
    recentImpacts: { count: 15, maxForce: 62 },
    impactDetails: [
      { id: 401, zone: 'Frontal', gForce: 62 },
      { id: 402, zone: 'Frontal', gForce: 55 },
      { id: 403, zone: 'Temporal', gForce: 40 },
      { id: 404, zone: 'Parietal Right', gForce: 30 }
    ],
    location: { lat: 50.1163, lng: -122.9574 } // Whistler Blackcomb
  },
  { 
    id: 5, 
    name: "Riley P.", 
    status: "Snowboarding - 3d ago", 
    resortId: 'mammoth',
    risk: "Low", 
    avatar: "RP",
    lastActive: "Oct 20, 11:00 AM",
    recentImpacts: { count: 1, maxForce: 10 },
    impactDetails: [
      { id: 501, zone: 'Cerebellum', gForce: 10 }
    ],
    location: null
  },
  { 
    id: 6, 
    name: "Morgan L.", 
    status: "Skiing - Live", 
    resortId: 'vail',
    risk: "Low", 
    avatar: "ML",
    lastActive: "Now",
    recentImpacts: { count: 3, maxForce: 18 },
    impactDetails: [
      { id: 601, zone: 'Temporal', gForce: 18 },
      { id: 602, zone: 'Frontal', gForce: 12 }
    ],
    location: { lat: 39.6403, lng: -106.3742 } // Vail
  }
];

export const MOCK_HISTORY = [
  { 
    id: 101, 
    date: "2023-10-24", 
    type: "Snowboarding", 
    resortId: 'bryce',
    duration: "1h 15m", 
    maxForce: 45, 
    impacts: 12, 
    risk: "Low",
    impactDetails: [
      { id: 1, time: "10:15 AM", zone: "Frontal", gForce: 15, lat: 38.8160, lng: -78.7630 },
      { id: 2, time: "10:18 AM", zone: "Parietal Left", gForce: 22, lat: 38.8162, lng: -78.7625 },
      { id: 3, time: "10:25 AM", zone: "Occipital", gForce: 10, lat: 38.8165, lng: -78.7620 },
      { id: 4, time: "10:32 AM", zone: "Frontal", gForce: 45, lat: 38.8170, lng: -78.7618 },
      { id: 5, time: "10:35 AM", zone: "Temporal", gForce: 18, lat: 38.8172, lng: -78.7622 },
      { id: 6, time: "10:40 AM", zone: "Cerebellum", gForce: 12, lat: 38.8175, lng: -78.7628 },
      { id: 7, time: "10:45 AM", zone: "Parietal Right", gForce: 28, lat: 38.8178, lng: -78.7632 },
      { id: 8, time: "10:50 AM", zone: "Frontal", gForce: 30, lat: 38.8180, lng: -78.7635 },
      { id: 9, time: "11:05 AM", zone: "Occipital", gForce: 14, lat: 38.8185, lng: -78.7640 },
      { id: 10, time: "11:12 AM", zone: "Temporal", gForce: 20, lat: 38.8188, lng: -78.7642 },
      { id: 11, time: "11:20 AM", zone: "Cerebellum", gForce: 11, lat: 38.8190, lng: -78.7645 },
      { id: 12, time: "11:28 AM", zone: "Frontal", gForce: 35, lat: 38.8192, lng: -78.7648 }
    ]
  },
  { 
    id: 102, 
    date: "2023-10-22", 
    type: "Snowboarding", 
    resortId: 'whistler',
    duration: "2h 30m", 
    maxForce: 82, 
    impacts: 3, 
    risk: "High",
    impactDetails: [
      { id: 13, time: "14:20 PM", zone: "Frontal", gForce: 82, lat: 38.8155, lng: -78.7620 },
      { id: 14, time: "14:45 PM", zone: "Temporal", gForce: 65, lat: 38.8168, lng: -78.7635 },
      { id: 15, time: "15:10 PM", zone: "Parietal Left", gForce: 40, lat: 38.8182, lng: -78.7615 }
    ]
  },
  { 
    id: 103, 
    date: "2023-10-20", 
    type: "Skiing", 
    resortId: 'vail',
    duration: "4h 00m", 
    maxForce: 12, 
    impacts: 0, 
    risk: "None",
    impactDetails: []
  },
];