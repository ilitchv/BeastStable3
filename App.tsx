import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import Header from './components/Header';
import DatePicker from './components/DatePicker';
import TrackSelector from './components/TrackSelector';
import ActionsPanel from './components/ActionsPanel';
import PlaysTable from './components/PlaysTable';
import TotalDisplay from './components/TotalDisplay';
import OcrModal from './components/OcrModal';
import WizardModal from './components/WizardModal';
import TicketModal from './components/TicketModal';
import ValidationErrorModal from './components/ValidationErrorModal'; // Import the new modal
import { interpretTicketImage as geminiInterpret } from './services/geminiService';
import { fileToBase64, calculateRowTotal, getTodayDateString, determineGameMode } from './utils/helpers';
import { MAX_PLAYS } from './constants';
import type { Play, OcrResult, WizardPlay } from './types';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [plays, setPlays] = useState<Play[]>([]);
    const [selectedTracks, setSelectedTracks] = useState<string[]>(['New York Mid Day', 'Venezuela']);
    const [selectedDates, setSelectedDates] = useState<string[]>([getTodayDateString()]);
    const [selectedPlayIds, setSelectedPlayIds] = useState<number[]>([]);

    const [isOcrModalOpen, setOcrModalOpen] = useState(false);
    const [isWizardModalOpen, setWizardModalOpen] = useState(false);
    const [isTicketModalOpen, setTicketModalOpen] = useState(false);
    const [isErrorModalOpen, setErrorModalOpen] = useState(false); // State for the new error modal
    const [validationErrors, setValidationErrors] = useState<string[]>([]); // State to hold error messages
    
    // Load state from localStorage on initial render
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
        } else { // Check for system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                setTheme('light');
            }
        }

        const savedStateJSON = localStorage.getItem('beastReaderState');
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                setPlays(savedState.plays || []);
                setSelectedTracks(savedState.selectedTracks || ['New York Mid Day', 'Venezuela']);
                setSelectedDates(savedState.selectedDates || [getTodayDateString()]);
            } catch (error) {
                console.error("Failed to parse saved state:", error);
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave = {
            plays,
            selectedTracks,
            selectedDates,
        };
        localStorage.setItem('beastReaderState', JSON.stringify(stateToSave));
    }, [plays, selectedTracks, selectedDates]);


    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    const addPlay = useCallback(() => {
        if (plays.length >= MAX_PLAYS) {
            alert(`Maximum of ${MAX_PLAYS} plays reached.`);
            return;
        }
        const newPlay: Play = {
            id: Date.now() + Math.random(),
            betNumber: '',
            gameMode: '-',
            straightAmount: null,
            boxAmount: null,
            comboAmount: null,
        };
        setPlays(prev => [...prev, newPlay]);
    }, [plays.length]);

    const deletePlay = useCallback((id: number) => {
        setPlays(prev => prev.filter(p => p.id !== id));
        setSelectedPlayIds(prev => prev.filter(playId => playId !== id));
    }, []);
    
    const deleteSelectedPlays = useCallback(() => {
        setPlays(prev => prev.filter(p => !selectedPlayIds.includes(p.id)));
        setSelectedPlayIds([]);
    }, [selectedPlayIds]);

    const updatePlay = useCallback((id: number, field: keyof Play, value: string | number | null) => {
        setPlays(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    }, []);

    const handleOcrAddPlays = useCallback((ocrPlays: OcrResult[]) => {
        const newPlays: Play[] = ocrPlays.map((p, i) => ({
            id: Date.now() + Math.random() + i,
            betNumber: p.betNumber,
            gameMode: determineGameMode(p.betNumber, selectedTracks), // Automatically determine game mode
            straightAmount: p.straightAmount,
            boxAmount: p.boxAmount,
            comboAmount: p.comboAmount,
        }));
        setPlays(prev => [...prev, ...newPlays].slice(0, MAX_PLAYS));
    }, [selectedTracks]);
    
    const handleWizardAddPlays = useCallback((wizardPlays: WizardPlay[]) => {
        const newPlays: Play[] = wizardPlays.map((p, i) => ({
            id: Date.now() + Math.random() + i,
            betNumber: p.betNumber,
            gameMode: p.gameMode,
            straightAmount: p.straight,
            boxAmount: p.box,
            comboAmount: p.combo
        }));
        setPlays(prev => [...prev, ...newPlays].slice(0, MAX_PLAYS));
    }, []);

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset everything? All plays will be cleared.")) {
            setPlays([]);
            setSelectedTracks(['New York Mid Day', 'Venezuela']);
            setSelectedDates([getTodayDateString()]);
            setSelectedPlayIds([]);
            localStorage.removeItem('beastReaderState');
        }
    };
    
    const getValidationErrors = (): string[] => {
        const errors: string[] = [];
        plays.forEach((p, index) => {
            const hasWager = (p.straightAmount ?? 0) > 0 || (p.boxAmount ?? 0) > 0 || (p.comboAmount ?? 0) > 0;
            if (p.betNumber.trim() === '') {
                errors.push(`Play #${index + 1}: Bet number is missing.`);
            }
            if (p.gameMode === '-') {
                errors.push(`Play #${index + 1}: Game mode is invalid. Check the bet number.`);
            }
            if (!hasWager) {
                errors.push(`Play #${index + 1}: At least one wager amount (Straight, Box, or Combo) is required.`);
            }
        });
        return errors;
    };

    const handleGenerateTicket = () => {
        const errors = getValidationErrors();
        if (errors.length > 0) {
            setValidationErrors(errors);
            setErrorModalOpen(true);
            return;
        }
        setTicketModalOpen(true);
    };

    const baseTotal = plays.reduce((acc, play) => acc + calculateRowTotal(play.betNumber, play.gameMode, play.straightAmount, play.boxAmount, play.comboAmount), 0);
    const trackMultiplier = Math.max(1, selectedTracks.filter(t => t !== 'Venezuela').length);
    const dateMultiplier = Math.max(1, selectedDates.length);
    const grandTotal = baseTotal * trackMultiplier * dateMultiplier;
    
    const isTicketGenerationDisabled = selectedDates.length === 0 || selectedTracks.length === 0 || plays.length === 0;

    return (
        <div className={`min-h-screen ${theme}`}>
            <div className="container mx-auto p-2 sm:p-4 max-w-7xl space-y-4">
                <Header theme={theme} toggleTheme={toggleTheme} />
                
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1 space-y-4">
                       <DatePicker selectedDates={selectedDates} onDatesChange={setSelectedDates} />
                       <TrackSelector selectedTracks={selectedTracks} onSelectionChange={setSelectedTracks} selectedDates={selectedDates} />
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <ActionsPanel
                            onAddPlay={addPlay}
                            onDeleteSelected={deleteSelectedPlays}
                            onReset={handleReset}
                            onOpenOcr={() => setOcrModalOpen(true)}
                            onOpenWizard={() => setWizardModalOpen(true)}
                            onGenerateTicket={handleGenerateTicket}
                            isTicketGenerationDisabled={isTicketGenerationDisabled}
                        />
                        <PlaysTable 
                            plays={plays} 
                            updatePlay={updatePlay} 
                            deletePlay={deletePlay} 
                            selectedTracks={selectedTracks}
                            selectedPlayIds={selectedPlayIds}
                            onSelectionChange={setSelectedPlayIds}
                        />
                        <TotalDisplay 
                            baseTotal={baseTotal}
                            trackMultiplier={trackMultiplier}
                            dateMultiplier={dateMultiplier}
                            grandTotal={grandTotal}
                        />
                    </div>
                </main>
            </div>

            <OcrModal 
                isOpen={isOcrModalOpen} 
                onClose={() => setOcrModalOpen(false)} 
                onAddPlays={handleOcrAddPlays}
                interpretTicketImage={geminiInterpret}
                fileToBase64={fileToBase64}
            />
            <WizardModal
                isOpen={isWizardModalOpen}
                onClose={() => setWizardModalOpen(false)}
                onAddPlays={handleWizardAddPlays}
                selectedTracks={selectedTracks}
            />
             <TicketModal
                isOpen={isTicketModalOpen}
                onClose={() => setTicketModalOpen(false)}
                plays={plays}
                selectedTracks={selectedTracks}
                grandTotal={grandTotal}
                selectedDates={selectedDates}
            />
            <ValidationErrorModal
                isOpen={isErrorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                errors={validationErrors}
            />
        </div>
    );
};

export default App;