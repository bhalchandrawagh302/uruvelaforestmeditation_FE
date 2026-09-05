import { Course, DanaMealSlot, AllocatedDanaItem, DhammaTalk } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-oct-2026',
    year: '2026',
    fromDate: 'Oct 15',
    toDate: 'Oct 26',
    rawStartDate: '2026-10-15',
    rawEndDate: '2026-10-26',
    status: 'open',
    teacher: 'Venerable Sujato Bhikkhu',
    language: 'English & Hindi',
    availableSeats: 14,
  },
  {
    id: 'course-nov-2026',
    year: '2026',
    fromDate: 'Nov 12',
    toDate: 'Nov 23',
    rawStartDate: '2026-11-12',
    rawEndDate: '2026-11-23',
    status: 'upcoming',
    teacher: 'Ajahn Kalyano',
    language: 'English & Marathi',
    availableSeats: 30,
  },
  {
    id: 'course-dec-2026',
    year: '2026',
    fromDate: 'Dec 05',
    toDate: 'Dec 16',
    rawStartDate: '2026-12-05',
    rawEndDate: '2026-12-16',
    status: 'upcoming',
    teacher: 'Sayadaw U Thila',
    language: 'English & Hindi',
    availableSeats: 35,
  },
  {
    id: 'course-jan-2027',
    year: '2027',
    fromDate: 'Jan 10',
    toDate: 'Jan 21',
    rawStartDate: '2027-01-10',
    rawEndDate: '2027-01-21',
    status: 'upcoming',
    teacher: 'Venerable Sujato Bhikkhu',
    language: 'English & Hindi',
    availableSeats: 35,
  },
  {
    id: 'course-feb-2027',
    year: '2027',
    fromDate: 'Feb 07',
    toDate: 'Feb 18',
    rawStartDate: '2027-02-07',
    rawEndDate: '2027-02-18',
    status: 'upcoming',
    teacher: 'Sayadaw U Thila',
    language: 'English & Hindi',
    availableSeats: 35,
  }
];

// Initial Dana calendar layout matching Image 17.png exact structure
// October 2026 (starts on Thursday with 4 empty leading days for Sun/Mon/Tue/Wed)
export const INITIAL_OCT_DANA_SLOTS: DanaMealSlot[] = [
  // Sun, Mon, Tue, Wed empty offsets
  { day: 0, dateStr: '', breakfastBooked: false, lunchBooked: false, isEmpty: true },
  { day: 0, dateStr: '', breakfastBooked: false, lunchBooked: false, isEmpty: true },
  { day: 0, dateStr: '', breakfastBooked: false, lunchBooked: false, isEmpty: true },
  { day: 0, dateStr: '', breakfastBooked: false, lunchBooked: false, isEmpty: true },
  // 1: Both booked
  { day: 1, dateStr: '2026-10-01', breakfastBooked: true, breakfastDonor: 'The Smith Family', lunchBooked: true, lunchDonor: 'The Smith Family' },
  // 2: Breakfast available, Lunch booked
  { day: 2, dateStr: '2026-10-02', breakfastBooked: false, lunchBooked: true, lunchDonor: 'Anonymous' },
  // 3: Both available
  { day: 3, dateStr: '2026-10-03', breakfastBooked: false, lunchBooked: false },
  // 4: Breakfast booked, Lunch available
  { day: 4, dateStr: '2026-10-04', breakfastBooked: true, breakfastDonor: 'Jane Doe', lunchBooked: false },
  // 5: Both booked
  { day: 5, dateStr: '2026-10-05', breakfastBooked: true, breakfastDonor: 'Patil Parivar', lunchBooked: true, lunchDonor: 'Patil Parivar' },
  // 6: Both available
  { day: 6, dateStr: '2026-10-06', breakfastBooked: false, lunchBooked: false },
  // 7: Breakfast available, Lunch booked
  { day: 7, dateStr: '2026-10-07', breakfastBooked: false, lunchBooked: true, lunchDonor: 'Sharma Family' },
  // 8: Both booked
  { day: 8, dateStr: '2026-10-08', breakfastBooked: true, breakfastDonor: 'Devotees of Bodh Gaya', lunchBooked: true, lunchDonor: 'Devotees of Bodh Gaya' },
  // 9: Both available
  { day: 9, dateStr: '2026-10-09', breakfastBooked: false, lunchBooked: false },
  // 10: Both available
  { day: 10, dateStr: '2026-10-10', breakfastBooked: false, lunchBooked: false },
  // 11: Breakfast booked, Lunch available
  { day: 11, dateStr: '2026-10-11', breakfastBooked: true, breakfastDonor: 'Rao Family', lunchBooked: false },
  // 12: Both booked
  { day: 12, dateStr: '2026-10-12', breakfastBooked: true, breakfastDonor: 'Kadam Family', lunchBooked: true, lunchDonor: 'Kadam Family' },
  // 13: Both available
  { day: 13, dateStr: '2026-10-13', breakfastBooked: false, lunchBooked: false },
  // 14: Breakfast available, Lunch booked
  { day: 14, dateStr: '2026-10-14', breakfastBooked: false, lunchBooked: true, lunchDonor: 'Deshmukh Family' },
  // 15: Both booked
  { day: 15, dateStr: '2026-10-15', breakfastBooked: true, breakfastDonor: 'Anand & Suman', lunchBooked: true, lunchDonor: 'Anand & Suman' },
  // 16: Both available
  { day: 16, dateStr: '2026-10-16', breakfastBooked: false, lunchBooked: false },
  // 17: Breakfast booked, Lunch available
  { day: 17, dateStr: '2026-10-17', breakfastBooked: true, breakfastDonor: 'Vandana V.', lunchBooked: false },
  // 18: Both available
  { day: 18, dateStr: '2026-10-18', breakfastBooked: false, lunchBooked: false },
  // 19: Both booked
  { day: 19, dateStr: '2026-10-19', breakfastBooked: true, breakfastDonor: 'Pali Study Circle', lunchBooked: true, lunchDonor: 'Pali Study Circle' },
  // 20: Both available
  { day: 20, dateStr: '2026-10-20', breakfastBooked: false, lunchBooked: false },
  // 21: Both available
  { day: 21, dateStr: '2026-10-21', breakfastBooked: false, lunchBooked: false },
  // 22: Breakfast available, Lunch booked
  { day: 22, dateStr: '2026-10-22', breakfastBooked: false, lunchBooked: true, lunchDonor: 'Chakraborty Parivar' },
  // 23: Both booked
  { day: 23, dateStr: '2026-10-23', breakfastBooked: true, breakfastDonor: 'Bhikshu Sangha Wellwishers', lunchBooked: true, lunchDonor: 'Bhikshu Sangha Wellwishers' },
  // 24: Both available
  { day: 24, dateStr: '2026-10-24', breakfastBooked: false, lunchBooked: false },
  // 25: Breakfast booked, Lunch available
  { day: 25, dateStr: '2026-10-25', breakfastBooked: true, breakfastDonor: 'Nalini Joshi', lunchBooked: false },
  // 26: Both booked
  { day: 26, dateStr: '2026-10-26', breakfastBooked: true, breakfastDonor: 'Retreat Closing Dana', lunchBooked: true, lunchDonor: 'Retreat Closing Dana' },
  // 27: Both available
  { day: 27, dateStr: '2026-10-27', breakfastBooked: false, lunchBooked: false },
  // 28: Both available
  { day: 28, dateStr: '2026-10-28', breakfastBooked: false, lunchBooked: false },
  // 29: Breakfast available, Lunch booked
  { day: 29, dateStr: '2026-10-29', breakfastBooked: false, lunchBooked: true, lunchDonor: 'Dr. Suresh Verma' },
  // 30: Both available
  { day: 30, dateStr: '2026-10-30', breakfastBooked: false, lunchBooked: false },
  // 31: Both booked
  { day: 31, dateStr: '2026-10-31', breakfastBooked: true, breakfastDonor: 'Monastery Sangha', lunchBooked: true, lunchDonor: 'Monastery Sangha' },
];

export const INITIAL_ALLOCATED_LIST: AllocatedDanaItem[] = [
  {
    id: 'dana-1',
    dateDisplay: 'Oct 1, 2026',
    meal: 'Breakfast & Lunch',
    donor: 'The Smith Family',
    occasion: 'Ancestral blessings and peace',
    status: 'confirmed'
  },
  {
    id: 'dana-2',
    dateDisplay: 'Oct 2, 2026',
    meal: 'Lunch',
    donor: 'Anonymous',
    occasion: 'Gratitude for the Dhamma',
    status: 'confirmed'
  },
  {
    id: 'dana-3',
    dateDisplay: 'Oct 4, 2026',
    meal: 'Breakfast',
    donor: 'Jane Doe',
    occasion: 'In memory of loved ones',
    status: 'confirmed'
  },
  {
    id: 'dana-4',
    dateDisplay: 'Oct 5, 2026',
    meal: 'Breakfast & Lunch',
    donor: 'Patil Parivar',
    occasion: 'Family health and merit generation',
    status: 'confirmed'
  },
  {
    id: 'dana-5',
    dateDisplay: 'Oct 7, 2026',
    meal: 'Lunch',
    donor: 'Sharma Family',
    occasion: 'Birthday Dana',
    status: 'confirmed'
  },
  {
    id: 'dana-6',
    dateDisplay: 'Oct 8, 2026',
    meal: 'Breakfast & Lunch',
    donor: 'Devotees of Bodh Gaya',
    occasion: 'Vassa Offering',
    status: 'confirmed'
  }
];

export const DHAMMA_TALKS_LIST: DhammaTalk[] = [
  {
    id: 'talk-1',
    title: 'Mindfulness of Breathing (Anapanasati)',
    paliTitle: 'आनापानसति सुत्त',
    speaker: 'Venerable Sujato Bhikkhu',
    duration: '42 min',
    category: 'Meditation Technique',
  },
  {
    id: 'talk-2',
    title: 'The Nature of Impermanence (Anicca)',
    paliTitle: 'अनिच्च लक्खण',
    speaker: 'Ajahn Kalyano',
    duration: '38 min',
    category: 'Dhamma Reflections',
  },
  {
    id: 'talk-3',
    title: 'Gentle Bell Chant & Loving-Kindness (Metta)',
    paliTitle: 'मेत्ता भावना',
    speaker: 'Monastery Sangha',
    duration: '25 min',
    category: 'Chanting & Chimes',
  },
  {
    id: 'talk-4',
    title: 'Overcoming Hindrances in Solitude',
    paliTitle: 'नीवरण पहान',
    speaker: 'Sayadaw U Thila',
    duration: '50 min',
    category: 'Practical Wisdom',
  }
];

// Multilingual UI strings for EN, HI, MR
export const TRANSLATIONS = {
  en: {
    siteTitle: 'Mahabodhi Meditation Centre',
    siteSubtitle: 'Sīla • Samādhi • Paññā',
    navDhammaTalks: 'Dhamma Talks',
    navRetreats: 'Retreats',
    navMonasticLife: 'About',
    navSanghaDana: 'Sangha Dana',
    navLibrary: 'Library',
    navSupport: 'Support',
    navContact: 'Contact',
    navPrivacy: 'Privacy Policy',
    navVisitUs: 'Visit Us',
    navAccessibility: 'Accessibility',
    copyright: '© 2026 Sati Monastery. Digital Zen by Design.',
    
    // Home screen
    homePill: 'URUVELA FOREST MEDITATION VIHARA',
    homeHeroTitle: 'A Path to Stillness',
    homeHeroSubtitle: 'Discover peace within. Join our forest sanctuary for silent retreats, teachings, and a supportive community dedicated to the practice of mindfulness.',
    btnBeginJourney: 'Begin Your Journey',
    homeEngageTitle: 'Engage with the Practice',
    homeCardVisitTitle: 'Visit the Vihara',
    homeCardVisitDesc: 'Find directions, visiting hours, and guidelines for day guests.',
    homeCardVisitLink: 'PLAN YOUR VISIT',
    homeCardDanaTitle: 'Sangha Dana',
    homeCardDanaDesc: 'Offer a meal dana (breakfast or lunch) to the monastics.',
    homeCardDanaLink: 'BOOK DANA',
    homeCardSupportTitle: 'Support the Sangha',
    homeCardSupportDesc: 'Offer Dana to support the monastics and the upkeep of the forest sanctuary.',
    homeCardSupportLink: 'OFFER DANA',
    homeCardCourseTitle: '10-Day Vipassana Course',
    homeCardCourseDesc: 'An intensive residential course in the tradition of Sayagyi U Ba Khin.',
    homeCardCourseLink: 'LEARN MORE',
    
    // Courses screen
    coursesTitle: '10-Day Vipassana Courses',
    coursesDesc: 'A dedicated period of silence and meditation. Courses are offered strictly on a donation basis to ensure the teachings remain accessible to all who seek them.',
    shareWhatsApp: 'Share via WhatsApp',
    thYear: 'Year',
    thFromDate: 'From Date',
    thToDate: 'To Date',
    thAction: 'Action',
    btnRegister: 'Register For Course',
    btnUpcoming: 'Upcoming',
    btnNotOpen: 'Registration Not Yet Open',
    statusCancelled: 'Cancelled',
    
    // Registration screen
    regTitle: '10-Day Vipassana Course Registration',
    regSubtitle: 'Please complete this form mindfully. The information provided will help us prepare for your stay at Uruvela Forest Vihara.',
    profilePhoto: 'Candidate Profile Photo (Selfie)',
    uploadPhotoPrompt: 'Upload a clear front-facing selfie or passport-style photo',
    aadharPhoto: 'Aadhaar Card Photo / Document',
    uploadAadharPrompt: 'Upload front side of Aadhaar card for identity verification',
    dragOrClick: 'Click or drop photo here',
    arrivalDate: 'Arrival Date',
    departureDate: 'Departure Date',
    fullName: 'Full Name',
    fatherName: "Father's Name",
    dob: 'Date of Birth',
    phone: 'Phone',
    age: 'Age',
    gender: 'Gender',
    genderSelect: 'Select',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    emergencyContact: 'Emergency Contact',
    emailAddress: 'Email Address',
    aadharPan: 'Aadhar / PAN No.',
    previousCourses: 'Previous Courses Done',
    address: 'Address',
    streetAddress: 'Street Address',
    city: 'City',
    state: 'State',
    country: 'Country',
    zipCode: 'Zip Code',
    illnessLabel: 'Any Illness (Physical or Mental)',
    illnessPlaceholder: "Please describe any ongoing health conditions, medications, or dietary restrictions. If none, write 'None'.",
    btnSubmitRegistration: 'SUBMIT REGISTRATION',
    
    // Sangha Dana screen
    danaHeroTitle: 'SANGHA DANA',
    danaHeroSubtitle: 'You and your family can offer a meal dana.',
    btnBookDate: 'BOOK A DATE',
    danaReservationTitle: 'SANGHA DANA RESERVATION',
    legendAllocated: 'Allocated / Booked',
    legendAvailable: 'Open / Available',
    allocatedDanaList: 'Allocated dana list',
    thMeal: 'Meal',
    thDonor: 'Family/Donor',
    thOccasion: 'Dedication / Occasion',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    breakfastAndLunch: 'Breakfast & Lunch',
    
    // About screen
    aboutMainHeading: 'A Refuge for Mindful Practice in the Heart of Nature.',
    aboutSubHeading: 'प्रकृति के हृदय में ध्यान का एक आश्रय।',
    aboutMonasteryName: 'Uruvela Forest Meditation Vihara',
    aboutHistoryTitle: 'Our History',
    aboutHistoryHindi: 'हमारा इतिहास',
    aboutLineageTitle: 'Lineage',
    aboutLineageHindi: 'परंपरा',
  },
  hi: {
    siteTitle: 'सती सेंक्चुअरी',
    siteSubtitle: 'उरुवेला वन विहार',
    navDhammaTalks: 'धम्म देशना',
    navRetreats: 'विपश्यना शिविर',
    navMonasticLife: 'संन्यासी जीवन',
    navSanghaDana: 'संघ दान',
    navLibrary: 'पुस्तकालय',
    navSupport: 'सहयोग',
    navContact: 'संपर्क',
    navPrivacy: 'गोपनीयता नीति',
    navVisitUs: 'आगमन',
    navAccessibility: 'सुलभता',
    copyright: '© २०२६ सती मॉनेस्ट्री। डिजिटल ज़ेन डिज़ाइन।',
    
    // Home screen
    homePill: 'उरुवेला वन विपश्यना विहार',
    homeHeroTitle: 'स्थिरता का एक मार्ग',
    homeHeroSubtitle: 'भीतर की शांति की खोज करें। मौन शिविरों, धम्म देशनाओं और सचेतन साधना को समर्पित एक सहायक समुदाय के लिए हमारे वन आश्रम से जुड़ें।',
    btnBeginJourney: 'अपनी साधना यात्रा आरंभ करें',
    homeEngageTitle: 'साधना से जुड़ें',
    homeCardVisitTitle: 'विहार आगमन',
    homeCardVisitDesc: 'मार्ग निर्देश, दर्शन समय, और दैनिक आगंतुकों के दिशा-निर्देश प्राप्त करें।',
    homeCardVisitLink: 'आगमन योजना बनाएं',
    homeCardDanaTitle: 'संघ दान',
    homeCardDanaDesc: 'संन्यासियों को प्रातराश या मध्याह्न भोजन दान अर्पित करें।',
    homeCardDanaLink: 'दान तिथि चुनें',
    homeCardSupportTitle: 'संघ का सहयोग',
    homeCardSupportDesc: 'संन्यासियों और वन आश्रम के संरक्षण हेतु स्वेच्छा दान अर्पित करें।',
    homeCardSupportLink: 'दान अर्पित करें',
    homeCardCourseTitle: '१० दिवसीय विपश्यना शिविर',
    homeCardCourseDesc: 'सयागी उ बा खिन की परंपरा में एक गहन आवासीय विपश्यना शिविर।',
    homeCardCourseLink: 'अधिक जानें',
    
    // Courses screen
    coursesTitle: '१० दिवसीय विपश्यना शिविर',
    coursesDesc: 'मौन और गहन ध्यान का एक समर्पित काल। यह शिक्षाएं सभी साधकों के लिए सुलभ रहें, इसलिए शिविर पूर्णतः स्वेच्छा दान पर आधारित हैं।',
    shareWhatsApp: 'व्हाट्सएप पर साझा करें',
    thYear: 'वर्ष',
    thFromDate: 'आरंभ तिथि',
    thToDate: 'समापन तिथि',
    thAction: 'पंजीकरण',
    btnRegister: 'पंजीकरण करें',
    btnUpcoming: 'आगामी',
    btnNotOpen: 'पंजीकरण अभी खुला नहीं है',
    statusCancelled: 'रद्द',
    
    // Registration screen
    regTitle: '१० दिवसीय विपश्यना शिविर पंजीकरण',
    regSubtitle: 'कृपया इस प्रपत्र को सचेतन भाव से भरें। दी गई जानकारी से उरुवेला वन विहार में आपके आवास की समुचित व्यवस्था में सहायता मिलेगी।',
    profilePhoto: 'उम्मीदवार प्रोफ़ाइल फ़ोटो (सेल्फ़ी)',
    uploadPhotoPrompt: 'पहचान हेतु स्पष्ट सेल्फ़ी या पासपोर्ट फ़ोटो अपलोड करें',
    aadharPhoto: 'आधार कार्ड फ़ोटो / दस्तावेज़',
    uploadAadharPrompt: 'पहचान सत्यापन हेतु आधार कार्ड की फ़ोटो अपलोड करें',
    dragOrClick: 'फ़ोटो चुनें या यहाँ खींचें',
    arrivalDate: 'आगमन तिथि',
    departureDate: 'प्रस्थान तिथि',
    fullName: 'पूरा नाम',
    fatherName: 'पिता का नाम',
    dob: 'जन्म तिथि',
    phone: 'फ़ोन नंबर',
    age: 'आयु',
    gender: 'लिंग',
    genderSelect: 'चुनें',
    genderMale: 'पुरुष',
    genderFemale: 'महिला',
    genderOther: 'अन्य',
    emergencyContact: 'आपातकालीन संपर्क',
    emailAddress: 'ईमेल पता',
    aadharPan: 'आधार / पैन नंबर',
    previousCourses: 'पूर्व किए गए शिविर',
    address: 'पता',
    streetAddress: 'सड़क / मोहल्ला',
    city: 'शहर',
    state: 'राज्य',
    country: 'देश',
    zipCode: 'पिन कोड',
    illnessLabel: 'कोई शारीरिक या मानसिक व्याधि',
    illnessPlaceholder: "कृपया किसी भी स्वास्थ्य स्थिति, औषधि या आहार प्रतिबंध का उल्लेख करें। यदि कुछ नहीं है, तो 'कोई नहीं' लिखें।",
    btnSubmitRegistration: 'पंजीकरण जमा करें',
    
    // Sangha Dana screen
    danaHeroTitle: 'संघ दान',
    danaHeroSubtitle: 'आप और आपका परिवार भोजन दान अर्पित कर सकते हैं।',
    btnBookDate: 'तिथि चुनें',
    danaReservationTitle: 'संघ दान आरक्षण',
    legendAllocated: 'आरक्षित / बुक किया गया',
    legendAvailable: 'उपलब्ध / रिक्त',
    allocatedDanaList: 'आरक्षित दान सूची',
    thMeal: 'भोजन',
    thDonor: 'दानदाता / परिवार',
    thOccasion: 'संकल्प / अवसर',
    breakfast: 'प्रातराश (नाश्ता)',
    lunch: 'मध्याह्न भोजन',
    breakfastAndLunch: 'प्रातराश और मध्याह्न भोजन',
    
    // About screen
    aboutMainHeading: 'प्रकृति के हृदय में ध्यान का एक आश्रय।',
    aboutSubHeading: 'A Refuge for Mindful Practice in the Heart of Nature.',
    aboutMonasteryName: 'उरुवेला वन विपश्यना विहार',
    aboutHistoryTitle: 'हमारा इतिहास',
    aboutHistoryHindi: 'Our History',
    aboutLineageTitle: 'परंपरा व वंश',
    aboutLineageHindi: 'Lineage',
  },
  mr: {
    siteTitle: 'सती सँक्चुअरी',
    siteSubtitle: 'उरुवेला वन विहार',
    navDhammaTalks: 'धम्म देशना',
    navRetreats: 'विपश्यना शिबीर',
    navMonasticLife: 'संन्यासी जीवन',
    navSanghaDana: 'संघ दान',
    navLibrary: 'ग्रंथालय',
    navSupport: 'सहकार्य',
    navContact: 'संपर्क',
    navPrivacy: 'गोपनीयता धोरण',
    navVisitUs: 'भेट द्या',
    navAccessibility: 'सुलभता',
    copyright: '© २०२६ सती मॉनेस्ट्री। डिजिटल झेन डिझाईन.',
    
    // Home screen
    homePill: 'उरुवेला वन ध्यान विहार',
    homeHeroTitle: 'शांततेचा एक मार्ग',
    homeHeroSubtitle: 'अंतर्मनातील शांतीचा शोध घ्या. मौन शिबिरे, धम्म उपदेश आणि सजगतेच्या साधनेला समर्पित असलेल्या आमच्या वन आश्रमात सहभागी व्हा.',
    btnBeginJourney: 'तुमचा साधना प्रवास सुरू करा',
    homeEngageTitle: 'साधनेशी जोडा',
    homeCardVisitTitle: 'विहार भेट',
    homeCardVisitDesc: 'मार्गदर्शन, भेटीची वेळ आणि अभ्यागतांसाठी नियमावली पहा.',
    homeCardVisitLink: 'भेटीचे नियोजन करा',
    homeCardDanaTitle: 'संघ दान',
    homeCardDanaDesc: 'संन्याशांना सकाळचा नाश्ता किंवा दुपारचे भोजन दान अर्पण करा.',
    homeCardDanaLink: 'दान तारीख निवडा',
    homeCardSupportTitle: 'संघाला सहकार्य',
    homeCardSupportDesc: 'संन्यासी आणि वन आश्रमाच्या देखभालीसाठी ऐच्छिक दान अर्पण करा.',
    homeCardSupportLink: 'दान अर्पण करा',
    homeCardCourseTitle: '१० दिवसांचे विपश्यना शिबीर',
    homeCardCourseDesc: 'सयागी उ बा खिन यांच्या परंपरेतील एक सखोल निवासी विपश्यना शिबीर.',
    homeCardCourseLink: 'अधिक माहिती',
    
    // Courses screen
    coursesTitle: '१० दिवसांचे विपश्यना शिबीर',
    coursesDesc: 'मौन आणि ध्यानाचा एक समर्पित काळ. धम्माची शिकवण सर्वांपर्यंत पोहोचावी म्हणून हे शिबीर पूर्णपणे ऐच्छिक दानावर आधारित आहे.',
    shareWhatsApp: 'व्हॉट्सअॅपवर शेअर करा',
    thYear: 'वर्ष',
    thFromDate: 'सुरुवात तारीख',
    thToDate: 'समाप्ती तारीख',
    thAction: 'नोंदणी',
    btnRegister: 'नोंदणी करा',
    btnUpcoming: 'लवकरच',
    btnNotOpen: 'नोंदणी अजून सुरू झालेली नाही',
    statusCancelled: 'रद्द',
    
    // Registration screen
    regTitle: '१० दिवसांच्या विपश्यना शिबिराची नोंदणी',
    regSubtitle: 'कृपया हा अर्ज सजगतेने भरा. दिलेल्या माहितीमुळे उरुवेला वन विहारमध्ये आपल्या वास्तव्याची योग्य सोय करता येईल.',
    profilePhoto: 'उमेदवार प्रोफाइल फोटो (सेल्फी)',
    uploadPhotoPrompt: 'ओळखीसाठी स्पष्ट सेल्फी किंवा पासपोर्ट फोटो अपलोड करा',
    aadharPhoto: 'आधार कार्ड फोटो / कागदपत्र',
    uploadAadharPrompt: 'ओळख पडताळणीसाठी आधार कार्डचा फोटो अपलोड करा',
    dragOrClick: 'फोटो निवडा',
    arrivalDate: 'आगमन तारीख',
    departureDate: 'प्रस्थान तारीख',
    fullName: 'पूर्ण नाव',
    fatherName: 'वडिलांचे नाव',
    dob: 'जन्मतारीख',
    phone: 'फोन नंबर',
    age: 'वय',
    gender: 'लिंग',
    genderSelect: 'निवडा',
    genderMale: 'पुरुष',
    genderFemale: 'स्त्री',
    genderOther: 'इतर',
    emergencyContact: 'आपत्कालीन संपर्क',
    emailAddress: 'ईमेल पत्ता',
    aadharPan: 'आधार / पॅन क्र.',
    previousCourses: 'यापूर्वी केलेली शिबिरे',
    address: 'पत्ता',
    streetAddress: 'गल्ली / घर क्र.',
    city: 'शहर',
    state: 'राज्य',
    country: 'देश',
    zipCode: 'पिन कोड',
    illnessLabel: 'कोणताही शारीरिक किंवा मानसिक आजार',
    illnessPlaceholder: "कृपया सध्याची प्रकृती, औषधे किंवा आहारासंबंधी माहिती लिहा. काही नसल्यास 'काही नाही' असे लिहा.",
    btnSubmitRegistration: 'नोंदणी सादर करा',
    
    // Sangha Dana screen
    danaHeroTitle: 'संघ दान',
    danaHeroSubtitle: 'तुम्ही आणि तुमचे कुटुंब भोजन दान अर्पण करू शकता.',
    btnBookDate: 'तारीख बुक करा',
    danaReservationTitle: 'संघ दान आरक्षण',
    legendAllocated: 'आरक्षित / बुक केलेले',
    legendAvailable: 'उपलब्ध / मोकळे',
    allocatedDanaList: 'आरक्षित दानाची यादी',
    thMeal: 'भोजन',
    thDonor: 'दानदाते / कुटुंब',
    thOccasion: 'संकल्प / प्रसंग',
    breakfast: 'सकाळचा नाश्ता',
    lunch: 'दुपारचे भोजन',
    breakfastAndLunch: 'नाश्ता आणि दुपारचे भोजन',
    
    // About screen
    aboutMainHeading: 'निसर्गाच्या कुशीत साधनेचे एक शांत आश्रयस्थान.',
    aboutSubHeading: 'A Refuge for Mindful Practice in the Heart of Nature.',
    aboutMonasteryName: 'उरुवेला वन ध्यान विहार',
    aboutHistoryTitle: 'आमचा इतिहास',
    aboutHistoryHindi: 'Our History',
    aboutLineageTitle: 'परंपरा',
    aboutLineageHindi: 'Lineage',
  }
};
