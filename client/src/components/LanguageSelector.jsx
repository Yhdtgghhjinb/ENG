import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-xs font-semibold text-slate-300 hidden sm:inline">{currentLang.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full right-0 mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.95))',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              minWidth: '160px',
            }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  language === lang.code ? 'bg-indigo-500/20' : 'hover:bg-white/5'
                }`}>
                <span className="text-lg">{lang.flag}</span>
                <span className={`text-sm font-semibold ${
                  language === lang.code ? 'text-indigo-300' : 'text-slate-300'
                }`}>
                  {lang.name}
                </span>
                {language === lang.code && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
