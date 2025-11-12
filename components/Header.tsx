
import React from 'react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-light-card dark:bg-dark-card rounded-xl shadow-lg animate-fade-in">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">
        Beast Reader Lotto
      </h1>
      <button
        onClick={toggleTheme}
        className="w-12 h-12 rounded-full bg-light-surface dark:bg-dark-surface flex items-center justify-center text-yellow-400 dark:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-cyan focus:ring-offset-light-card dark:focus:ring-offset-dark-card transition-transform duration-300 ease-in-out hover:scale-110"
        aria-label="Toggle theme"
      >
        <div className="relative w-6 h-6">
           <svg className={`absolute inset-0 transition-all duration-500 ease-in-out ${theme === 'light' ? 'opacity-0 transform -rotate-90 scale-0' : 'opacity-100 transform rotate-0 scale-100'}`} data-lucide="moon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
           <svg className={`absolute inset-0 transition-all duration-500 ease-in-out ${theme === 'dark' ? 'opacity-0 transform rotate-90 scale-0' : 'opacity-100 transform rotate-0 scale-100'}`} data-lucide="sun" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </div>
      </button>
    </header>
  );
};

export default Header;
