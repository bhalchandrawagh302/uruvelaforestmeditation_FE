export interface SanghaDanaMealSlot {
  mealType: 'Breakfast' | 'Lunch';
  time: string;
  isAllocated: boolean;
  status: 'Confirmed' | 'Pending' | 'Available' | 'Cancelled';
  sponsorName?: string;
  contactPhone?: string;
  email?: string;
  dedication?: string;
  bookedOn?: string;
  attendeesCount?: number;
  dietaryNotes?: string;
}

export interface SanghaDanaDaySchedule {
  id: string;
  dateStr: string; // e.g. "Oct 15, 2026" or "September 1, 2026"
  dayOfWeek: string; // e.g. "Sunday"
  rawDate: string; // "2026-10-15" or "2026-09-01"
  status: 'Allocated' | 'Partially Allocated' | 'Open';
  breakfast: SanghaDanaMealSlot;
  lunch: SanghaDanaMealSlot;
  adminNotes: Array<{
    id: string;
    text: string;
    author: string;
    date: string;
  }>;
  auditTrail: Array<{
    id: string;
    action: string;
    actor: string;
    timestamp: string;
  }>;
}

export const INITIAL_DANA_SCHEDULES: SanghaDanaDaySchedule[] = [
  {
    id: 'dana-2026-09-01',
    dateStr: 'September 1, 2026',
    dayOfWeek: 'Tuesday',
    rawDate: '2026-09-01',
    status: 'Partially Allocated',
    breakfast: {
      mealType: 'Breakfast',
      time: '07:00 AM - 08:30 AM',
      isAllocated: true,
      status: 'Confirmed',
      sponsorName: 'Upasika Silva Family',
      contactPhone: '+94 77 891 4321',
      email: 'silva.family@dhamma.org',
      dedication: 'In loving memory of our late father, Mr. D.P. Silva. May he share in these merits.',
      bookedOn: 'Aug 15, 2026, 14:30',
      attendeesCount: 5,
      dietaryNotes: 'Strict vegetarian, no onion/garlic (Sattvic)',
    },
    lunch: {
      mealType: 'Lunch',
      time: '11:00 AM - 12:30 PM',
      isAllocated: false,
      status: 'Available',
    },
    adminNotes: [
      {
        id: 'n1',
        text: 'Expect extra attendees for breakfast (+5). Arrange additional seating in the main hall.',
        author: 'Rev. Kassapa',
        date: 'Aug 20',
      }
    ],
    auditTrail: [
      {
        id: 'a1',
        action: 'Breakfast Booking Confirmed',
        actor: 'Admin User',
        timestamp: 'Aug 16, 2026, 09:15',
      },
      {
        id: 'a2',
        action: 'Breakfast Request Received',
        actor: 'System',
        timestamp: 'Aug 15, 2026, 14:30',
      },
      {
        id: 'a3',
        action: 'Schedule Created',
        actor: 'System',
        timestamp: 'Jan 01, 2026',
      }
    ]
  },
  {
    id: 'dana-2026-10-15',
    dateStr: 'Oct 15, 2026',
    dayOfWeek: 'Thursday',
    rawDate: '2026-10-15',
    status: 'Allocated',
    breakfast: {
      mealType: 'Breakfast',
      time: '07:00 AM - 08:30 AM',
      isAllocated: true,
      status: 'Confirmed',
      sponsorName: 'The Siriwardena Family',
      contactPhone: '+94 71 234 5678',
      email: 'siriwardena@mail.lk',
      dedication: 'For the well-being and health of all venerable Sangha members.',
      bookedOn: 'Sep 10, 2026, 10:15',
      attendeesCount: 4,
    },
    lunch: {
      mealType: 'Lunch',
      time: '11:00 AM - 12:30 PM',
      isAllocated: true,
      status: 'Confirmed',
      sponsorName: 'Colombo Dhamma Circle',
      contactPhone: '+94 11 987 6543',
      email: 'colombo.circle@sangha.org',
      dedication: 'In honor of the Vassa rain retreat Sangha.',
      bookedOn: 'Sep 12, 2026, 15:40',
      attendeesCount: 8,
    },
    adminNotes: [
      {
        id: 'n1',
        text: 'Colombo Dhamma Circle will bring fresh coconut water and herbal tea for afternoon.',
        author: 'Bhikkhu Ananda',
        date: 'Oct 10',
      }
    ],
    auditTrail: [
      {
        id: 'a1',
        action: 'Lunch Dana Allocated to Colombo Dhamma Circle',
        actor: 'Admin User',
        timestamp: 'Sep 12, 2026, 16:00',
      },
      {
        id: 'a2',
        action: 'Breakfast Booking Confirmed',
        actor: 'Admin User',
        timestamp: 'Sep 10, 2026, 11:00',
      },
      {
        id: 'a3',
        action: 'Schedule Created',
        actor: 'System',
        timestamp: 'Jan 01, 2026',
      }
    ]
  },
  {
    id: 'dana-2026-10-16',
    dateStr: 'Oct 16, 2026',
    dayOfWeek: 'Friday',
    rawDate: '2026-10-16',
    status: 'Partially Allocated',
    breakfast: {
      mealType: 'Breakfast',
      time: '07:00 AM - 08:30 AM',
      isAllocated: true,
      status: 'Confirmed',
      sponsorName: 'Anonymous Donor',
      contactPhone: '+91 98 450 9988',
      email: 'anonymous@merit.org',
      dedication: 'May all beings be free from suffering and abide in peace.',
      bookedOn: 'Sep 20, 2026, 08:20',
      attendeesCount: 2,
    },
    lunch: {
      mealType: 'Lunch',
      time: '11:00 AM - 12:30 PM',
      isAllocated: false,
      status: 'Available',
    },
    adminNotes: [],
    auditTrail: [
      {
        id: 'a1',
        action: 'Breakfast Request Received',
        actor: 'System',
        timestamp: 'Sep 20, 2026, 08:20',
      },
      {
        id: 'a2',
        action: 'Schedule Created',
        actor: 'System',
        timestamp: 'Jan 01, 2026',
      }
    ]
  },
  {
    id: 'dana-2026-10-17',
    dateStr: 'Oct 17, 2026',
    dayOfWeek: 'Saturday',
    rawDate: '2026-10-17',
    status: 'Open',
    breakfast: {
      mealType: 'Breakfast',
      time: '07:00 AM - 08:30 AM',
      isAllocated: false,
      status: 'Available',
    },
    lunch: {
      mealType: 'Lunch',
      time: '11:00 AM - 12:30 PM',
      isAllocated: false,
      status: 'Available',
    },
    adminNotes: [],
    auditTrail: [
      {
        id: 'a1',
        action: 'Schedule Created',
        actor: 'System',
        timestamp: 'Jan 01, 2026',
      }
    ]
  },
  {
    id: 'dana-2026-10-18',
    dateStr: 'Oct 18, 2026',
    dayOfWeek: 'Sunday',
    rawDate: '2026-10-18',
    status: 'Allocated',
    breakfast: {
      mealType: 'Breakfast',
      time: '07:00 AM - 08:30 AM',
      isAllocated: true,
      status: 'Confirmed',
      sponsorName: 'Metta Society',
      contactPhone: '+91 22 8877 6655',
      email: 'info@mettasociety.in',
      dedication: 'Offering with sincere gratitude to all resident monastics.',
      bookedOn: 'Sep 25, 2026, 11:30',
      attendeesCount: 6,
    },
    lunch: {
      mealType: 'Lunch',
      time: '11:00 AM - 12:30 PM',
      isAllocated: true,
      status: 'Confirmed',
      sponsorName: 'Metta Society',
      contactPhone: '+91 22 8877 6655',
      email: 'info@mettasociety.in',
      dedication: 'Full day meal offering dedicated to peace across the globe.',
      bookedOn: 'Sep 25, 2026, 11:30',
      attendeesCount: 6,
    },
    adminNotes: [
      {
        id: 'n1',
        text: 'Metta Society will provide warm ginger congee and steamed vegetables.',
        author: 'Steward Raman',
        date: 'Oct 12',
      }
    ],
    auditTrail: [
      {
        id: 'a1',
        action: 'Breakfast & Lunch Bookings Confirmed',
        actor: 'Admin User',
        timestamp: 'Sep 26, 2026, 09:00',
      },
      {
        id: 'a2',
        action: 'Schedule Created',
        actor: 'System',
        timestamp: 'Jan 01, 2026',
      }
    ]
  },
  {
    id: 'dana-2026-10-19',
    dateStr: 'Oct 19, 2026',
    dayOfWeek: 'Monday',
    rawDate: '2026-10-19',
    status: 'Open',
    breakfast: {
      mealType: 'Breakfast',
      time: '07:00 AM - 08:30 AM',
      isAllocated: false,
      status: 'Available',
    },
    lunch: {
      mealType: 'Lunch',
      time: '11:00 AM - 12:30 PM',
      isAllocated: false,
      status: 'Available',
    },
    adminNotes: [],
    auditTrail: [
      {
        id: 'a1',
        action: 'Schedule Created',
        actor: 'System',
        timestamp: 'Jan 01, 2026',
      }
    ]
  },
  {
    id: 'dana-2026-10-20',
    dateStr: 'Oct 20, 2026',
    dayOfWeek: 'Tuesday',
    rawDate: '2026-10-20',
    status: 'Partially Allocated',
    breakfast: {
      mealType: 'Breakfast',
      time: '07:00 AM - 08:30 AM',
      isAllocated: false,
      status: 'Available',
    },
    lunch: {
      mealType: 'Lunch',
      time: '11:00 AM - 12:30 PM',
      isAllocated: true,
      status: 'Confirmed',
      sponsorName: 'Deshmukh Family',
      contactPhone: '+91 98220 41002',
      email: 'deshmukh.family@pune.org',
      dedication: 'In memory of ancestors and blessing for family wellbeing.',
      bookedOn: 'Sep 28, 2026, 14:15',
      attendeesCount: 4,
    },
    adminNotes: [],
    auditTrail: [
      {
        id: 'a1',
        action: 'Lunch Dana Confirmed',
        actor: 'Admin User',
        timestamp: 'Sep 29, 2026, 10:00',
      },
      {
        id: 'a2',
        action: 'Schedule Created',
        actor: 'System',
        timestamp: 'Jan 01, 2026',
      }
    ]
  }
];
