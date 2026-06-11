import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Common
    home: 'Home',
    calculator: 'Calculator',
    examCalendar: 'Exam Calendar',
    notifications: 'Notifications',
    requests: 'Requests',
    aiAssistant: 'AI Assistant',
    qpAnalyzer: 'QP Analyzer',
    
    // Landing
    tagline: 'Your Complete VTU Study Companion',
    description: 'Access study materials, track exams, and connect with fellow VTU students',
    openVault: 'Open Vault',
    noSignup: 'No sign-up required • Instant access',
    
    // Features
    studyMaterials: 'Study Materials',
    examTracking: 'Exam Tracking',
    aiHelp: 'AI Study Help',
    resourceSharing: 'Resource Sharing',
    
    // Calculator
    sgpaCalculator: 'SGPA Calculator',
    cgpaCalculator: 'CGPA Calculator',
    subjectName: 'Subject Name',
    credits: 'Credits',
    marks: 'Marks',
    grade: 'Grade',
    addSubject: 'Add Subject',
    calculate: 'Calculate',
    yourSGPA: 'Your SGPA',
    yourCGPA: 'Your CGPA',
    
    // Notifications
    vtuNotifications: 'VTU Notifications',
    syncUpdates: 'Sync VTU Updates',
    viewOnVTU: 'View on VTU Website',
    markRead: 'Mark as Read',
    
    // Common actions
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    noData: 'No data available',
  },
  
  kn: {
    // Common
    home: 'ಮುಖಪುಟ',
    calculator: 'ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    examCalendar: 'ಪರೀಕ್ಷಾ ಕ್ಯಾಲೆಂಡರ್',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    requests: 'ವಿನಂತಿಗಳು',
    aiAssistant: 'AI ಸಹಾಯಕ',
    qpAnalyzer: 'ಪ್ರಶ್ನೆಪತ್ರ ವಿಶ್ಲೇಷಕ',
    
    // Landing
    tagline: 'ನಿಮ್ಮ ಸಂಪೂರ್ಣ VTU ಅಧ್ಯಯನ ಸಹಚರ',
    description: 'ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳನ್ನು ಪ್ರವೇಶಿಸಿ, ಪರೀಕ್ಷೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಸಹ VTU ವಿದ್ಯಾರ್ಥಿಗಳೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ',
    openVault: 'ವಾಲ್ಟ್ ತೆರೆಯಿರಿ',
    noSignup: 'ಸೈನ್-ಅಪ್ ಅಗತ್ಯವಿಲ್ಲ • ತತ್‌ಕ್ಷಣದ ಪ್ರವೇಶ',
    
    // Features
    studyMaterials: 'ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳು',
    examTracking: 'ಪರೀಕ್ಷಾ ಟ್ರ್ಯಾಕಿಂಗ್',
    aiHelp: 'AI ಅಧ್ಯಯನ ಸಹಾಯ',
    resourceSharing: 'ಸಂಪನ್ಮೂಲ ಹಂಚಿಕೆ',
    
    // Calculator
    sgpaCalculator: 'SGPA ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    cgpaCalculator: 'CGPA ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    subjectName: 'ವಿಷಯದ ಹೆಸರು',
    credits: 'ಕ್ರೆಡಿಟ್‌ಗಳು',
    marks: 'ಅಂಕಗಳು',
    grade: 'ದರ್ಜೆ',
    addSubject: 'ವಿಷಯ ಸೇರಿಸಿ',
    calculate: 'ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
    yourSGPA: 'ನಿಮ್ಮ SGPA',
    yourCGPA: 'ನಿಮ್ಮ CGPA',
    
    // Notifications
    vtuNotifications: 'VTU ಅಧಿಸೂಚನೆಗಳು',
    syncUpdates: 'VTU ನವೀಕರಣಗಳನ್ನು ಸಿಂಕ್ ಮಾಡಿ',
    viewOnVTU: 'VTU ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ',
    markRead: 'ಓದಿದಂತೆ ಗುರುತಿಸಿ',
    
    // Common actions
    submit: 'ಸಲ್ಲಿಸಿ',
    cancel: 'ರದ್ದುಗೊಳಿಸಿ',
    close: 'ಮುಚ್ಚಿ',
    save: 'ಉಳಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    search: 'ಹುಡುಕಿ',
    filter: 'ಫಿಲ್ಟರ್',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    noData: 'ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ',
  },
  
  hi: {
    // Common
    home: 'होम',
    calculator: 'कैलकुलेटर',
    examCalendar: 'परीक्षा कैलेंडर',
    notifications: 'सूचनाएं',
    requests: 'अनुरोध',
    aiAssistant: 'AI सहायक',
    qpAnalyzer: 'प्रश्न पत्र विश्लेषक',
    
    // Landing
    tagline: 'आपका संपूर्ण VTU अध्ययन साथी',
    description: 'अध्ययन सामग्री तक पहुंचें, परीक्षाओं को ट्रैक करें और साथी VTU छात्रों से जुड़ें',
    openVault: 'वॉल्ट खोलें',
    noSignup: 'साइन-अप की आवश्यकता नहीं • तत्काल पहुंच',
    
    // Features
    studyMaterials: 'अध्ययन सामग्री',
    examTracking: 'परीक्षा ट्रैकिंग',
    aiHelp: 'AI अध्ययन सहायता',
    resourceSharing: 'संसाधन साझाकरण',
    
    // Calculator
    sgpaCalculator: 'SGPA कैलकुलेटर',
    cgpaCalculator: 'CGPA कैलकुलेटर',
    subjectName: 'विषय का नाम',
    credits: 'क्रेडिट',
    marks: 'अंक',
    grade: 'ग्रेड',
    addSubject: 'विषय जोड़ें',
    calculate: 'गणना करें',
    yourSGPA: 'आपका SGPA',
    yourCGPA: 'आपका CGPA',
    
    // Notifications
    vtuNotifications: 'VTU सूचनाएं',
    syncUpdates: 'VTU अपडेट सिंक करें',
    viewOnVTU: 'VTU वेबसाइट पर देखें',
    markRead: 'पढ़ा हुआ चिह्नित करें',
    
    // Common actions
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा उपलब्ध नहीं',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('vtuVaultLanguage') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('vtuVaultLanguage', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
